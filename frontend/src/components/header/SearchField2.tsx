import { Search } from 'lucide-react';
import React, { ChangeEvent, useState, useEffect, useRef } from 'react';
import { getEnhancedSearchSuggestions, EnhancedSearchSuggestionsResponse } from '@/utils/product/getEnhancedSearchSuggestions';

interface SearchField2Props {
  searchFieldPlaceholder: string;
  onSearchChange?: (query: string) => void;
  onSuggestionSelect?: (suggestion: string) => void;
  value?: string;
}

const SearchField2 = ({
  searchFieldPlaceholder,
  onSearchChange,
  onSuggestionSelect,
  value,
}: SearchField2Props) => {
  const isDisabled = !onSearchChange && !onSuggestionSelect || value === undefined;
  const [suggestions, setSuggestions] = useState<EnhancedSearchSuggestionsResponse | null>(null);
  const [filteredSuggestions, setFilteredSuggestions] = useState<{text: string, type: string}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch enhanced search suggestions on component mount
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const data = await getEnhancedSearchSuggestions();
        setSuggestions(data);
      } catch (error) {
        console.error('Failed to fetch enhanced search suggestions:', error);
      }
    };

    fetchSuggestions();
  }, []);

  // Filter suggestions based on input value with enhanced matching
  useEffect(() => {
    if (!suggestions || !value || value.length < 2) {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const searchTerm = value.toLowerCase().trim();
    const allSuggestions: {text: string, type: string, priority: number}[] = [];
    
    // Helper function to calculate match score
    const getMatchScore = (text: string, searchTerm: string): number => {
      const lowerText = text.toLowerCase();
      if (lowerText === searchTerm) return 100; // Exact match
      if (lowerText.startsWith(searchTerm)) return 90; // Starts with
      if (lowerText.includes(` ${searchTerm}`)) return 80; // Word boundary
      if (lowerText.includes(searchTerm)) return 70; // Contains
      
      // Fuzzy matching for individual words
      const words = lowerText.split(/\s+/);
      for (const word of words) {
        if (word.startsWith(searchTerm)) return 60;
        if (word.includes(searchTerm)) return 50;
      }
      
      return 0;
    };
    
    // Search in product names (highest priority)
    suggestions.productNames?.forEach(name => {
      const score = getMatchScore(name, searchTerm);
      if (score > 0) {
        allSuggestions.push({ text: name, type: 'product', priority: score + 20 });
      }
    });
    
    // Search in categories
    suggestions.categories?.forEach(category => {
      const score = getMatchScore(category, searchTerm);
      if (score > 0) {
        allSuggestions.push({ text: category, type: 'category', priority: score + 15 });
      }
    });
    
    // Search in tags
    suggestions.popularTags?.forEach(tag => {
      const score = getMatchScore(tag, searchTerm);
      if (score > 0) {
        allSuggestions.push({ text: tag, type: 'tag', priority: score + 10 });
      }
    });
    
    // Search in brands
    suggestions.brands?.forEach(brand => {
      const score = getMatchScore(brand, searchTerm);
      if (score > 0) {
        allSuggestions.push({ text: brand, type: 'brand', priority: score + 12 });
      }
    });
    
    // Search in keywords
    suggestions.keywords?.forEach(keyword => {
      const score = getMatchScore(keyword, searchTerm);
      if (score > 0) {
        allSuggestions.push({ text: keyword, type: 'keyword', priority: score + 5 });
      }
    });
    
    // Sort by priority and remove duplicates
    const uniqueSuggestions = new Map<string, {text: string, type: string, priority: number}>();
    
    allSuggestions.forEach(suggestion => {
      const existing = uniqueSuggestions.get(suggestion.text.toLowerCase());
      if (!existing || existing.priority < suggestion.priority) {
        uniqueSuggestions.set(suggestion.text.toLowerCase(), suggestion);
      }
    });
    
    // Convert to final format and limit results
    const filtered = Array.from(uniqueSuggestions.values())
      .sort((a, b) => b.priority - a.priority) // Sort by priority descending
      .slice(0, 10) // Limit to 10 suggestions
      .map(item => ({ text: item.text, type: item.type }));

    setFilteredSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setActiveSuggestionIndex(-1);
  }, [value, suggestions]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  const handleSuggestionClick = (suggestion: {text: string, type: string}) => {
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion.text);
    } else if (onSearchChange) {
      onSearchChange(suggestion.text);
    }
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeSuggestionIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[activeSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
        break;
    }
  };

  const handleInputFocus = () => {
    if (filteredSuggestions.length > 0 && value && value.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow click events on suggestions
    setTimeout(() => {
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }, 200);
  };

  return (
    <div className='flex-grow'>
      <label htmlFor='product-search' className='sr-only'>
        Search
      </label>
      <div className='relative'>
        <div className='absolute inset-y-0 left-0 flex items-center pl-4 sm:pl-3 pointer-events-none'>
          <Search className='w-5 h-5 sm:w-4 sm:h-4 text-vesoko_gray_600 dark:text-gray-400' />
        </div>
        <input
          ref={inputRef}
          type='text'
          id='product-search'
          className={`block w-full py-3 pl-12 text-base sm:text-sm sm:py-2 sm:pl-10 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-vesoko_primary focus:border-vesoko_primary focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-vesoko_primary dark:focus:border-vesoko_primary ${
            isDisabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          placeholder={`Search for ${searchFieldPlaceholder}`}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          value={value ?? ''}
          disabled={isDisabled}
          autoComplete='off'
        />
        
        {/* Suggestions dropdown */}
        {showSuggestions && !isDisabled && (
          <div 
            ref={suggestionsRef}
            className='absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto mt-1'
          >
            {filteredSuggestions.map((suggestion, index) => {
              // Choose icon and badge based on suggestion type
              const getSuggestionIcon = (type: string) => {
                switch(type) {
                  case 'product': return <Search className='w-3 h-3 text-vesoko_primary mr-2' />;
                  case 'category': return <Search className='w-3 h-3 text-blue-500 mr-2' />;
                  case 'tag': return <Search className='w-3 h-3 text-purple-500 mr-2' />;
                  case 'brand': return <Search className='w-3 h-3 text-orange-500 mr-2' />;
                  case 'keyword': return <Search className='w-3 h-3 text-gray-400 mr-2' />;
                  default: return <Search className='w-3 h-3 text-gray-400 mr-2' />;
                }
              };
              
              const getSuggestionBadge = (type: string) => {
                switch(type) {
                  case 'product': return <span className='ml-2 px-2 py-1 text-xs bg-vesoko_primary text-white rounded-full'>Product</span>;
                  case 'category': return <span className='ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full'>Category</span>;
                  case 'tag': return <span className='ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded-full'>Tag</span>;
                  case 'brand': return <span className='ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded-full'>Brand</span>;
                  case 'keyword': return null; // No badge for keywords to keep it clean
                  default: return null;
                }
              };
              
              return (
                <div
                  key={`${suggestion.text}-${suggestion.type}`}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                    index === activeSuggestionIndex ? 'bg-vesoko_background text-vesoko_secondary' : 'text-gray-900'
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setActiveSuggestionIndex(index)}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center flex-1'>
                      {getSuggestionIcon(suggestion.type)}
                      <span className='text-sm'>{suggestion.text}</span>
                    </div>
                    {getSuggestionBadge(suggestion.type)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchField2;
