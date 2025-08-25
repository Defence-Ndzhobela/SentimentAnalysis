function Header({ apiStatus, onRefreshApi }) {
  try {
    return (
      <header className="glass-effect shadow-2xl border-b border-white/20" data-name="header" data-file="components/Header.js">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center floating-animation" 
                   style={{background: 'var(--gradient-success)'}}>
                <div className="icon-brain-circuit text-2xl text-white"></div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">
                  Sentiment Analysis System
                </h1>
                <p className="text-lg text-blue-200 font-medium">an interactive dashboard that analyzes sentiments</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <ApiStatus apiStatus={apiStatus} onRefresh={onRefreshApi} />
            </div>
          </div>
        </div>
      </header>
    );
  } catch (error) {
    console.error('Header component error:', error);
    return null;
  }
}
