import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Eye, Tag } from 'lucide-react';
import { FAQ, markFAQHelpful } from '@/utils/content/contentApi';
import { toast } from 'react-hot-toast';

interface FAQComponentProps {
  faqs: FAQ[];
  showCategories?: boolean;
  showUserTypes?: boolean;
  selectedCategory?: string;
  selectedUserType?: string;
}

const FAQComponent: React.FC<FAQComponentProps> = ({ 
  faqs, 
  showCategories = true, 
  showUserTypes = true,
  selectedCategory,
  selectedUserType
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleFeedback = async (id: string, helpful: boolean) => {
    if (feedbackGiven.has(id)) {
      toast.error('You have already provided feedback for this question');
      return;
    }

    try {
      await markFAQHelpful(id, helpful);
      setFeedbackGiven(prev => new Set([...prev, id]));
      toast.success(helpful ? 'Thank you for your feedback!' : 'Thank you for letting us know');
    } catch (error) {
      // Error already handled in the utility function
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      general: 'bg-vesoko_background text-vesoko_secondary',
      seller: 'bg-vesoko_green_100 text-green-800',
      shopper: 'bg-purple-100 text-purple-800',
      payments: 'bg-yellow-100 text-yellow-800',
      shipping: 'bg-indigo-100 text-indigo-800',
      returns: 'bg-red-100 text-red-800',
      account: 'bg-gray-100 text-gray-800',
      technical: 'bg-orange-100 text-orange-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getUserTypeColor = (userType: string) => {
    const colors: { [key: string]: string } = {
      all: 'bg-gray-100 text-gray-800',
      seller: 'bg-vesoko_primary text-white',
      shopper: 'bg-vesoko_primary text-white',
      wholesaler: 'bg-purple-600 text-white',
      retailer: 'bg-orange-600 text-white',
      manufacturer: 'bg-teal-600 text-white',
    };
    return colors[userType] || 'bg-gray-100 text-gray-800';
  };

  const filteredFAQs = faqs.filter(faq => {
    const categoryMatch = !selectedCategory || selectedCategory === 'all' || faq.category === selectedCategory;
    const userTypeMatch = !selectedUserType || selectedUserType === 'all' || faq.userType === selectedUserType || faq.userType === 'all';
    return categoryMatch && userTypeMatch;
  });

  const groupedFAQs = filteredFAQs.reduce((acc, faq) => {
    const key = showCategories ? faq.category : 'all';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(faq);
    return acc;
  }, {} as { [key: string]: FAQ[] });

  if (filteredFAQs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-lg text-gray-600">No FAQs found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedFAQs).map(([category, categoryFAQs]) => (
        <div key={category}>
          {showCategories && category !== 'all' && (
            <h3 className="text-2xl font-bold text-gray-900 mb-6 capitalize">
              {category} Questions
            </h3>
          )}
          
          <div className="space-y-4">
            {categoryFAQs.map((faq, index) => {
              const isExpanded = expandedItems.has(faq._id);
              const hasFeedback = feedbackGiven.has(faq._id);
              
              return (
                <div 
                  key={faq._id} 
                  className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div 
                    className="p-6 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => toggleExpanded(faq._id)}
                  >
                    <div className="flex-1 pr-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {faq.question}
                      </h4>
                      
                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {showCategories && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(faq.category)}`}>
                            {faq.category}
                          </span>
                        )}
                        {showUserTypes && faq.userType !== 'all' && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUserTypeColor(faq.userType)}`}>
                            {faq.userType}
                          </span>
                        )}
                        {faq.featured && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-vesoko_primary text-white">
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{faq.views} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{faq.helpfulCount} helpful</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-6 h-6 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-gray-100">
                      <div className="pt-4">
                        <div 
                          className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
                          dangerouslySetInnerHTML={{ 
                            __html: faq.answer.replace(/\n/g, '<br />') 
                          }}
                        />
                        
                        {/* Tags */}
                        {faq.tags && faq.tags.length > 0 && (
                          <div className="mt-6 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                              <Tag className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-500">Tags:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {faq.tags.map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Feedback */}
                        <div className="mt-6 pt-4 border-t border-gray-100">
                          <p className="text-sm text-gray-600 mb-3">Was this answer helpful?</p>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFeedback(faq._id, true);
                              }}
                              disabled={hasFeedback}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                hasFeedback 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : 'bg-vesoko_green_100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              <ThumbsUp className="w-4 h-4" />
                              Yes ({faq.helpfulCount})
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFeedback(faq._id, false);
                              }}
                              disabled={hasFeedback}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                hasFeedback 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                            >
                              <ThumbsDown className="w-4 h-4" />
                              No ({faq.notHelpfulCount})
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQComponent;
