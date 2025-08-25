function BatchTextInput({ onAnalyze, loading }) {
  try {
    const [inputMode, setInputMode] = React.useState('individual'); // 'individual' or 'bulk'
    const [textEntries, setTextEntries] = React.useState(['']);
    const [bulkText, setBulkText] = React.useState('');
    const [error, setError] = React.useState('');

    const addTextEntry = () => {
      if (textEntries.length < 50) {
        setTextEntries([...textEntries, '']);
      }
    };

    const removeTextEntry = (index) => {
      if (textEntries.length > 1) {
        setTextEntries(textEntries.filter((_, i) => i !== index));
      }
    };

    const updateTextEntry = (index, value) => {
      const updated = [...textEntries];
      updated[index] = value;
      setTextEntries(updated);
    };

    const parseBulkText = (text) => {
      const entries = text
        .split(/\n+/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .slice(0, 50);
      return entries;
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      setError('');
      
      let validEntries = [];
      
      if (inputMode === 'bulk') {
        validEntries = parseBulkText(bulkText);
      } else {
        validEntries = textEntries.filter(text => text.trim());
      }
      
      if (validEntries.length === 0) {
        setError('Please enter at least one text entry.');
        return;
      }

      if (validEntries.length > 50) {
        setError('Maximum 50 entries allowed. Please reduce the number of entries.');
        return;
      }

      const texts = validEntries.map((text, index) => ({
        text: text.trim(),
        id: `batch_${Date.now()}_${index}`,
        source: 'manual_batch',
        entry_index: index + 1,
        timestamp: new Date().toISOString()
      }));

      onAnalyze(texts);
    };

    return (
      <div data-name="batch-text-input" data-file="components/BatchTextInput.js">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Batch Text Analysis (up to 50 entries)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setInputMode('individual')}
                className={`btn text-xs ${inputMode === 'individual' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Individual
              </button>
              <button
                type="button"
                onClick={() => setInputMode('bulk')}
                className={`btn text-xs ${inputMode === 'bulk' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Bulk Paste
              </button>
            </div>
          </div>

          {inputMode === 'bulk' ? (
            <div>
            <label className="block text-xl font-bold gradient-text mb-3">
              Batch Text Analysis
            </label>
            <p className="text-slate-600 mb-4 font-medium">Analyze up to 50 text entries simultaneously</p>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Paste your text entries here, one per line:&#10;First review or text entry&#10;Second review or text entry&#10;Third review or text entry&#10;..."
                rows={12}
                className="input-field resize-none"
                disabled={loading}
              />
              <div className="text-xs text-gray-500 mt-1">
                {parseBulkText(bulkText).length}/50 entries detected
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">
                  Individual Entries ({textEntries.length}/50)
                </span>
                <button
                  type="button"
                  onClick={addTextEntry}
                  disabled={textEntries.length >= 50}
                  className="btn btn-secondary text-xs disabled:opacity-50"
                >
                  <div className="icon-plus text-sm"></div>
                  Add Entry
                </button>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {textEntries.map((text, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <textarea
                        value={text}
                        onChange={(e) => updateTextEntry(index, e.target.value)}
                        placeholder={`Text entry ${index + 1}...`}
                        rows={3}
                        className="input-field resize-none text-sm"
                        disabled={loading}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTextEntry(index)}
                      disabled={textEntries.length === 1 || loading}
                      className="btn btn-secondary px-2 h-fit disabled:opacity-50"
                    >
                      <div className="icon-x text-sm"></div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading || (inputMode === 'bulk' ? !bulkText.trim() : textEntries.every(text => !text.trim()))}
            className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="icon-zap text-lg"></div>
            {loading ? 'Analyzing...' : `Analyze ${inputMode === 'bulk' ? parseBulkText(bulkText).length : textEntries.filter(t => t.trim()).length} Entries`}
          </button>
        </form>
      </div>
    );
  } catch (error) {
    console.error('BatchTextInput component error:', error);
    return null;
  }
}