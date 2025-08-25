function TemplateSelector({ templates, selectedTemplate, onTemplateChange }) {
  try {
    const getCategoryIcon = (category) => {
      const iconMap = {
        social_media: 'icon-messages-square',
        customer_reviews: 'icon-star',
        surveys: 'icon-clipboard-list',
        news_articles: 'icon-newspaper',
        product_reviews: 'icon-shopping-bag',
        general: 'icon-file-text'
      };
      return iconMap[category] || 'icon-file-text';
    };

    const getCategoryColor = (category) => {
      const colorMap = {
        social_media: 'bg-blue-100 text-blue-800',
        customer_reviews: 'bg-yellow-100 text-yellow-800',
        surveys: 'bg-green-100 text-green-800',
        news_articles: 'bg-purple-100 text-purple-800',
        product_reviews: 'bg-orange-100 text-orange-800',
        general: 'bg-gray-100 text-gray-800'
      };
      return colorMap[category] || 'bg-gray-100 text-gray-800';
    };

    return (
      <div data-name="template-selector" data-file="components/TemplateSelector.js">
        <div className="mb-6">
          <h2 className="text-2xl font-bold gradient-text mb-3">Analysis Templates</h2>
          <p className="text-slate-600 font-medium">Choose a specialized template for optimal analysis results</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {templates
            .sort((a, b) => {
              const order = ['customer_reviews', 'social_media', 'news_articles', 'surveys', 'product_reviews', 'general'];
              const aIndex = order.indexOf(a.objectData.category);
              const bIndex = order.indexOf(b.objectData.category);
              return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
            })
            .map((template) => (
            <div
              key={template.objectId}
              className={`border rounded-xl p-4 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                selectedTemplate?.objectId === template.objectId
                  ? 'border-indigo-400 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg'
                  : 'border-white/30 bg-white/20 hover:bg-white/30 backdrop-blur-sm'
              }`}
              onClick={() => onTemplateChange(template)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getCategoryColor(template.objectData.category)} shadow-md`}>
                  <div className={`${getCategoryIcon(template.objectData.category)} text-sm`}></div>
                </div>
                <h3 className="font-semibold text-slate-800 truncate">{template.objectData.name}</h3>
              </div>
            </div>
          ))}
        </div>

        {selectedTemplate && (
          <div className="p-4 bg-gradient-to-r from-indigo-100/80 to-purple-100/80 rounded-xl border border-indigo-200 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="icon-check-circle text-lg text-indigo-600"></div>
              <span className="font-semibold text-indigo-800">Active: {selectedTemplate.objectData.name}</span>
            </div>
            <p className="text-sm text-indigo-700 font-medium">
              Optimized for {selectedTemplate.objectData.category.replace('_', ' ')} analysis
            </p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('TemplateSelector component error:', error);
    return null;
  }
}