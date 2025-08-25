const extractPdfText = async (file) => {
  try {
    // Simple PDF text extraction using built-in browser APIs
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to string and extract readable text
    let text = '';
    for (let i = 0; i < uint8Array.length; i++) {
      const char = String.fromCharCode(uint8Array[i]);
      if (char.match(/[a-zA-Z0-9\s\.,!?\-\(\)]/)) {
        text += char;
      }
    }
    
    // Clean up the extracted text
    text = text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\.,!?\-\(\)]/g, ' ')
      .trim();
    
    if (text.length < 10) {
      throw new Error('Unable to extract readable text from PDF. Please try a text-based PDF or convert to TXT format.');
    }
    
    return text;
  } catch (error) {
    throw new Error('PDF processing failed: ' + error.message);
  }
};

const parseFileContent = async (content, fileName, fileType) => {
  try {
    const timestamp = new Date().toISOString();
    const source = `file_${fileType.replace('/', '_')}`;
    
    // Split content into meaningful segments
    let segments = [];
    
    if (fileType.includes('csv') || fileName.toLowerCase().endsWith('.csv')) {
      // Parse CSV - each row as separate entry
      const lines = content.split('\n').filter(line => line.trim());
      segments = lines.map(line => line.replace(/^"(.*)"$/, '$1').trim());
    } else if (fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      // Parse PDF content - split by sentences and paragraphs
      const sentences = content.split(/[.!?]+/).filter(s => s.trim() && s.length > 15);
      segments = sentences.length > 0 ? sentences : [content];
    } else {
      // Parse text content - split by paragraphs and sentences
      const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());
      
      segments = paragraphs.flatMap(paragraph => {
        const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim() && s.length > 10);
        return sentences.length > 1 ? sentences : [paragraph];
      });
    }
    
    return segments
      .filter(text => text.trim() && text.length > 5)
      .slice(0, 50) // Process up to 50 reviews/entries per file
      .map((text, index) => ({
        text: text.trim(),
        id: `file_${Date.now()}_${index}`,
        source: source,
        file_name: fileName,
        entry_index: index + 1,
        timestamp: timestamp,
        metadata: {
          original_file: fileName,
          file_type: fileType,
          segment_type: fileType.includes('csv') ? 'row' : (fileType === 'application/pdf' ? 'sentence' : 'paragraph')
        }
      }));
  } catch (error) {
    console.error('Content parsing error:', error);
    throw error;
  }
};