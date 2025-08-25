const extractKeywords = (text, sentiment, template = null) => {
  try {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    const stopWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'are', 'as', 'was', 'were',
      'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
      'could', 'can', 'may', 'might', 'must', 'shall', 'this', 'that', 'these', 'those',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
      'my', 'your', 'his', 'her', 'its', 'our', 'their', 'in', 'on', 'at', 'by', 'for',
      'with', 'without', 'through', 'during', 'before', 'after', 'above', 'below', 'up',
      'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once'
    ]);
    
    const sentimentWords = getSentimentWords(sentiment);
    const templateKeywords = template && template.objectData && template.objectData.keywords 
      ? (Array.isArray(template.objectData.keywords) 
        ? template.objectData.keywords 
        : (typeof template.objectData.keywords === 'string' 
          ? template.objectData.keywords.split(',').map(k => k.trim())
          : [])
        ).map(k => k.toLowerCase())
      : [];
    
    // Filter and count word frequency
    const wordCount = {};
    words.forEach(word => {
      if (!stopWords.has(word) && word.length > 2) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
    
    // Prioritize sentiment-relevant and template-specific words
    const scoredWords = Object.entries(wordCount).map(([word, count]) => {
      let score = count;
      if (sentimentWords.includes(word)) {
        score += 3; // Boost sentiment-relevant words
      }
      if (templateKeywords.includes(word)) {
        score += 5; // Higher boost for template-specific words
      }
      return { word, score };
    });
    
    // Sort by score and return top keywords
    return scoredWords
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.word);
      
  } catch (error) {
    console.error('Keyword extraction error:', error);
    return ['text', 'analysis'];
  }
};

const getSentimentWords = (sentiment) => {
  const sentimentLexicon = {
    positive: [
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like',
      'happy', 'pleased', 'satisfied', 'perfect', 'awesome', 'brilliant', 'outstanding',
      'superb', 'magnificent', 'marvelous', 'terrific', 'fabulous', 'delightful',
      'impressive', 'remarkable', 'exceptional', 'beautiful', 'successful', 'effective'
    ],
    negative: [
      'bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'sad', 'angry',
      'frustrated', 'disappointed', 'worst', 'disgusting', 'pathetic', 'useless',
      'annoying', 'irritating', 'disappointing', 'unacceptable', 'poor', 'fail',
      'failed', 'broken', 'damaged', 'wrong', 'problem', 'issue', 'difficult'
    ],
    neutral: [
      'okay', 'fine', 'normal', 'average', 'standard', 'typical', 'regular',
      'common', 'usual', 'ordinary', 'basic', 'simple', 'plain', 'general'
    ]
  };
  
  return sentimentLexicon[sentiment.toLowerCase()] || [];
};