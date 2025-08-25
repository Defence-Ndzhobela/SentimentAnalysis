function FileUpload({ onAnalyze, loading }) {
  try {
    const [dragActive, setDragActive] = React.useState(false);
    const [error, setError] = React.useState('');
    const fileInputRef = React.useRef(null);

    const handleFiles = async (files) => {
      setError('');
      const file = files[0];
      
      if (!file) return;
      
      const validTypes = ['text/plain', 'text/csv', 'application/csv', 'application/pdf'];
      const validExtensions = ['.txt', '.csv', '.pdf'];
      
      const hasValidType = validTypes.includes(file.type);
      const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      
      if (!hasValidType && !hasValidExtension) {
        setError('Please upload a valid TXT, CSV, or PDF file.');
        return;
      }

      try {
        let extractedText = '';
        
        if (file.type === 'application/pdf') {
          extractedText = await extractPdfText(file);
        } else {
          extractedText = await file.text();
        }
        
        const texts = await parseFileContent(extractedText, file.name, file.type);
        
        if (texts.length === 0) {
          setError('No readable text content found in file.');
          return;
        }

        onAnalyze(texts, true);
      } catch (err) {
        setError('Error processing file. Please try again.');
        console.error('File processing error:', err);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    };

    const handleDrag = (e) => {
      e.preventDefault();
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true);
      } else if (e.type === 'dragleave') {
        setDragActive(false);
      }
    };

    return (
      <div data-name="file-upload" data-file="components/FileUpload.js">
        <label className="block text-xl font-bold gradient-text mb-3">
          File Upload Analysis
        </label>
        <p className="text-slate-600 mb-4 font-medium">Upload PDF, CSV or TXT files with up to 50 entries</p>
        
        <div
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
            dragActive ? 'border-indigo-400 bg-gradient-to-br from-indigo-50 to-purple-50 scale-105' : 'border-white/40 bg-white/10 hover:bg-white/20 backdrop-blur-sm'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDrag}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onClick={() => !loading && fileInputRef.current?.click()}
        >
          <div className="icon-upload text-4xl text-indigo-400 mb-4"></div>
          <p className="text-lg font-semibold text-slate-700 mb-2">
            Drop files here or click to browse
          </p>
          <p className="text-sm text-slate-600 font-medium">
            Supports TXT, CSV, and PDF files (up to 50 entries per file)
          </p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.csv,.pdf"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={loading}
        />
        
        {error && (
          <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('FileUpload component error:', error);
    return null;
  }
}