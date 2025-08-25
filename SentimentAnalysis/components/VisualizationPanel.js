function VisualizationPanel({ results }) {
  try {
      const [chartType, setChartType] = React.useState('pie');
    const pieChartRef = React.useRef(null);
    const barChartRef = React.useRef(null);
    const lineChartRef = React.useRef(null);
    const chartInstanceRef = React.useRef(null);

    const getSentimentCounts = () => {
      const counts = { positive: 0, negative: 0, neutral: 0, mixed: 0, sarcastic: 0 };
      results.forEach(result => {
        const sentiment = result.sentiment.toLowerCase();
        if (counts.hasOwnProperty(sentiment)) {
          counts[sentiment]++;
        }
      });
      return counts;
    };

    const getConfidenceDistribution = () => {
      const ranges = { low: 0, medium: 0, high: 0 };
      results.forEach(result => {
        if (result.confidence < 0.6) ranges.low++;
        else if (result.confidence < 0.8) ranges.medium++;
        else ranges.high++;
      });
      return ranges;
    };

    const createPieChart = () => {
      const counts = getSentimentCounts();
      const ctx = pieChartRef.current?.getContext('2d');
      
      if (!ctx) return;

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new ChartJS(ctx, {
        type: 'pie',
        data: {
          labels: ['Positive', 'Negative', 'Neutral'],
          datasets: [{
            data: [counts.positive, counts.negative, counts.neutral],
            backgroundColor: ['#10b981', '#ef4444', '#6b7280'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: 'bottom'
            }
          }
        }
      });
    };

    const createBarChart = () => {
      const counts = getSentimentCounts();
      const ctx = barChartRef.current?.getContext('2d');
      
      if (!ctx) return;

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new ChartJS(ctx, {
        type: 'bar',
        data: {
          labels: ['Positive', 'Negative', 'Neutral'],
          datasets: [{
            label: 'Count',
            data: [counts.positive, counts.negative, counts.neutral],
            backgroundColor: ['#10b981', '#ef4444', '#6b7280'],
            borderRadius: 8,
            borderSkipped: false
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    };

    React.useEffect(() => {
      if (results.length === 0) return;

      if (chartType === 'pie') {
        createPieChart();
      } else {
        createBarChart();
      }

      return () => {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }
      };
    }, [results, chartType]);

    const counts = getSentimentCounts();
    const total = results.length;

    return (
      <div className="card" data-name="visualization-panel" data-file="components/VisualizationPanel.js">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h3 className="text-lg font-semibold">Sentiment Distribution</h3>
          <div className="flex gap-2 mt-2 sm:mt-0">
            <button
              onClick={() => setChartType('pie')}
              className={`btn ${chartType === 'pie' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <div className="icon-pie-chart text-lg"></div>
              Pie Chart
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`btn ${chartType === 'bar' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <div className="icon-bar-chart text-lg"></div>
              Bar Chart
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Statistics */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{counts.positive}</div>
                <div className="text-sm text-green-700">Positive</div>
                <div className="text-xs text-gray-500">
                  {total > 0 ? ((counts.positive / total) * 100).toFixed(1) : 0}%
                </div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{counts.negative}</div>
                <div className="text-sm text-red-700">Negative</div>
                <div className="text-xs text-gray-500">
                  {total > 0 ? ((counts.negative / total) * 100).toFixed(1) : 0}%
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{counts.neutral}</div>
                <div className="text-sm text-gray-700">Neutral</div>
                <div className="text-xs text-gray-500">
                  {total > 0 ? ((counts.neutral / total) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold text-blue-800">Total Analyzed</div>
              <div className="text-2xl font-bold text-blue-600">{total}</div>
            </div>
          </div>

          {/* Chart */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-xs">
              <canvas
                ref={pieChartRef}
                style={{ display: chartType === 'pie' ? 'block' : 'none' }}
              ></canvas>
              <canvas
                ref={barChartRef}
                style={{ display: chartType === 'bar' ? 'block' : 'none' }}
              ></canvas>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('VisualizationPanel component error:', error);
    return null;
  }
}
