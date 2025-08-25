const analyzeSentiments = async (texts, template = null) => {
  try {
    const results = [];
    
    for (const textObj of texts) {
      try {
        const result = await analyzeSingleText(textObj.text, template);
        results.push({
          ...textObj,
          sentiment: result.sentiment,
          confidence: result.confidence,
          keywords: extractKeywords(textObj.text, result.sentiment, template)
        });
      } catch (error) {
        console.error('Error analyzing text:', error);
        // Fallback analysis
        const fallbackResult = analyzeSentimentFallback(textObj.text, template);
        results.push({
          ...textObj,
          ...fallbackResult,
          keywords: extractKeywords(textObj.text, fallbackResult.sentiment, template)
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Batch analysis error:', error);
    throw error;
  }
};

const analyzeSingleText = async (text, template = null) => {
  try {
    // Try Hugging Face API first
    const apiResult = await analyzeWithHuggingFace(text);
    if (apiResult) {
      return {
        sentiment: mapHuggingFaceLabel(apiResult.label),
        confidence: apiResult.score,
        source: 'huggingface_api'
      };
    }
  } catch (error) {
    console.log('API unavailable, using local analysis:', error.message);
  }
  
  // Fallback to local analysis
  try {
    const localResult = analyzeSentimentFallback(text, template);
    return {
      ...localResult,
      source: 'local_fallback'
    };
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return {
      sentiment: 'Neutral',
      confidence: 0.6,
      source: 'error_fallback'
    };
  }
};

const analyzeWithHuggingFace = async (text) => {
  try {
    const response = await fetch('https://proxy-api.trickle-app.host/?url=https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer hf_demo_token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        inputs: text.substring(0, 500) // Limit text length for API
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result && result[0] && result[0].length > 0) {
      // Get the highest confidence prediction
      const prediction = result[0].reduce((max, current) => 
        current.score > max.score ? current : max
      );
      return prediction;
    }
    
    throw new Error('Invalid API response format');
  } catch (error) {
    throw error;
  }
};

const mapHuggingFaceLabel = (label) => {
  const labelMap = {
    'LABEL_0': 'Negative',
    'LABEL_1': 'Neutral', 
    'LABEL_2': 'Positive',
    'negative': 'Negative',
    'neutral': 'Neutral',
    'positive': 'Positive'
  };
  return labelMap[label] || 'Neutral';
};

const analyzeSentimentFallback = (text, template = null) => {
  let positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'happy', 'pleased', 'satisfied', 'perfect', 'awesome', 'brilliant', 'outstanding'];
  let negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'sad', 'angry', 'frustrated', 'disappointed', 'worst', 'disgusting', 'pathetic', 'useless'];
  
  // Add template-specific keywords
  if (template && template.objectData && template.objectData.keywords) {
    const templateKeywords = Array.isArray(template.objectData.keywords) 
      ? template.objectData.keywords 
      : (typeof template.objectData.keywords === 'string' 
        ? template.objectData.keywords.split(',').map(k => k.trim())
        : []);
    positiveWords = [...positiveWords, ...templateKeywords.filter(k => !negativeWords.includes(k))];
  }
  
  const words = text.toLowerCase().split(/\W+/);
  let positiveCount = 0;
  let negativeCount = 0;
  
  // Sarcasm indicators
  const sarcasticIndicators = ['really', 'sure', 'right', 'totally', 'absolutely', 'definitely', 'obviously'];
  let sarcasticCount = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
    if (sarcasticIndicators.includes(word)) sarcasticCount++;
  });
  
  let sentiment = 'Neutral';
  let confidence = 0.6;
  
  // Apply template weights if available
  const weights = template && template.objectData.sentiment_weights 
    ? JSON.parse(template.objectData.sentiment_weights) 
    : { positive: 1.0, negative: 1.0, neutral: 1.0, mixed: 1.0, sarcastic: 1.0 };
  
  // Multi-class classification logic
  const total = positiveCount + negativeCount;
  
  if (sarcasticCount > 0 && (positiveCount > 0 || negativeCount > 0)) {
    sentiment = 'Sarcastic';
    confidence = Math.min(0.8, 0.5 + sarcasticCount * 0.15) * (weights.sarcastic || 1.0);
  } else if (positiveCount > 0 && negativeCount > 0 && Math.abs(positiveCount - negativeCount) <= 1) {
    sentiment = 'Mixed';
    confidence = Math.min(0.8, 0.6 + total * 0.05) * (weights.mixed || 1.0);
  } else if (positiveCount > negativeCount) {
    sentiment = 'Positive';
    confidence = Math.min(0.9, (0.6 + (positiveCount - negativeCount) * 0.1) * weights.positive);
  } else if (negativeCount > positiveCount) {
    sentiment = 'Negative';
    confidence = Math.min(0.9, (0.6 + (negativeCount - positiveCount) * 0.1) * weights.negative);
  } else {
    confidence = confidence * weights.neutral;
  }
  
  return { sentiment, confidence };
};
