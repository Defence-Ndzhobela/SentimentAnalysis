class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">We're sorry, but something unexpected happened.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-black"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  try {
      const [results, setResults] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [currentView, setCurrentView] = React.useState('single');
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedTemplate, setSelectedTemplate] = React.useState(null);
    const [templates, setTemplates] = React.useState([]);
    const [inputMode, setInputMode] = React.useState('batch');
    const [analysisHistory, setAnalysisHistory] = React.useState([]);
    const [selectedForComparison, setSelectedForComparison] = React.useState([]);
    const [apiStatus, setApiStatus] = React.useState({
      status: 'checking',
      provider: 'Hugging Face Inference API',
      model: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
      lastChecked: null,
      rateLimitRemaining: null,
      responseTime: null
    });

    React.useEffect(() => {
      loadTemplates();
      checkApiStatus();
    }, []);

    const checkApiStatus = async () => {
      const startTime = Date.now();
      try {
        // Test API connectivity with a simple request
        const response = await fetch('https://proxy-api.trickle-app.host/?url=https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer hf_demo_token',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: "test" })
        });
        
        const responseTime = Date.now() - startTime;
        const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
        
        setApiStatus({
          status: response.ok ? 'online' : 'limited',
          provider: 'Hugging Face Inference API',
          model: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
          lastChecked: new Date().toISOString(),
          rateLimitRemaining: rateLimitRemaining || 'Unknown',
          responseTime: responseTime
        });
      } catch (error) {
        setApiStatus(prev => ({
          ...prev,
          status: 'offline',
          lastChecked: new Date().toISOString(),
          responseTime: Date.now() - startTime
        }));
      }
    };

    const loadTemplates = async () => {
      try {
        const response = await trickleListObjects('analysis_template', 50, true);
        setTemplates(response.items);
        // Set default template
        const defaultTemplate = response.items.find(t => t.objectData.is_default);
        if (defaultTemplate) {
          setSelectedTemplate(defaultTemplate);
        }
      } catch (err) {
        console.error('Error loading templates:', err);
      }
    };

    const handleAnalysis = async (texts, isFile = false) => {
      setLoading(true);
      setError('');
      
      try {
        const analysisResults = await analyzeSentiments(texts, selectedTemplate);
        setResults(analysisResults);
        
        // Add to analysis history
        const historyEntry = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          template: selectedTemplate?.objectData?.name || 'General',
          source: isFile ? 'file_upload' : 'batch_input',
          count: analysisResults.length,
          results: analysisResults
        };
        setAnalysisHistory(prev => [historyEntry, ...prev].slice(0, 10));
        
      } catch (err) {
        const errorMessage = handleAnalysisError(err);
        setError(errorMessage);
        console.error('Analysis error:', err);
      } finally {
        setLoading(false);
      }
    };

    const filteredResults = results.filter(result => {
      if (!searchTerm) return true;
      return result.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
             result.sentiment.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
      <div className="min-h-screen" data-name="app" data-file="app.js">
        <Header apiStatus={apiStatus} onRefreshApi={checkApiStatus} />
        
        <div className="container py-12">
          {/* Top Section - Templates and Input */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Left - Analysis Templates Grid */}
            <div className="card">
              <TemplateSelector 
                templates={templates}
                selectedTemplate={selectedTemplate}
                onTemplateChange={setSelectedTemplate}
              />
            </div>

            {/* Top Right - Text Input and File Upload */}
            <div className="space-y-6">
              <div className="card">
                <BatchTextInput onAnalyze={handleAnalysis} loading={loading} />
              </div>
              
              <div className="card">
                <FileUpload onAnalyze={handleAnalysis} loading={loading} />
              </div>
            </div>
          </div>

          {/* Bottom Section - Full Width Results */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-6">
              {/* Search and Export Options */}
              <div className="card">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="icon-search text-lg text-gray-400"></div>
                    <input
                      type="text"
                      placeholder="Search results..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field max-w-xs"
                    />
                  </div>
                  <ExportOptions results={filteredResults} />
                </div>
              </div>

              {/* Visualization Panel */}
              <VisualizationPanel results={filteredResults} />

              {/* Comparative Analysis */}
              {analysisHistory.length > 1 && (
                <ComparativeAnalysis 
                  history={analysisHistory} 
                  onCompare={setSelectedForComparison}
                />
              )}

              {/* Sentiment Explanation */}
              <SentimentExplainer results={filteredResults} />

              {/* Results Table */}
              <ResultsTable 
                results={filteredResults} 
                onSelectForComparison={setSelectedForComparison}
                selectedForComparison={selectedForComparison}
              />
            </div>
          )}

          {loading && (
            <div className="card text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Analyzing sentiment...</p>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);