import { Search } from 'lucide-react';
import React, { ChangeEvent, useState, useEffect, useRef } from 'react';
import { getSearchSuggestions, SearchSuggestionsResponse } from '@/utils/product/getSearchSuggestions';

interface SearchField2Props {
  searchFieldPlaceholder: string;
  onSearchChange?: (query: string) => void;
  value?: string;
}

const SearchField2 = ({
  searchFieldPlaceholder,
  onSearchChange,
  value,
}: SearchField2Props) => {
  const isDisabled = !onSearchChange || value === undefined;
  const [suggestions, setSuggestions] = useState<SearchSuggestionsResponse | null>(null);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch search suggestions on component mount
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const data = await getSearchSuggestions();
        setSuggestions(data);
      } catch (error) {
        console.error('Failed to fetch search suggestions:', error);
      }
    };

    fetchSuggestions();
  }, []);

  // Filter suggestions based on input value
  useEffect(() => {
    if (!suggestions || !value) {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = suggestions.suggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(value.toLowerCase())
      )
      .slice(0, 8); // Limit to 8 suggestions

    setFilteredSuggestions(filtered);
    setShowSuggestions(filtered.length > 0 && value.length > 0);
    setActiveSuggestionIndex(-1);
  }, [value, suggestions]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (onSearchChange) {
      onSearchChange(suggestion);
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
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                  index === activeSuggestionIndex ? 'bg-vesoko_background text-vesoko_secondary' : 'text-gray-900'
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setActiveSuggestionIndex(index)}
              >
                <div className='flex items-center'>
                  <Search className='w-3 h-3 text-gray-400 mr-2' />
                  <span className='text-sm'>{suggestion}</span>
                  {suggestions?.categories.includes(suggestion) && (
                    <span className='ml-2 px-2 py-1 text-xs bg-vesoko_background text-vesoko_secondary rounded-full'>Category</span>
                  )}
                  {suggestions?.popularTags.includes(suggestion) && (
                    <span className='ml-2 px-2 py-1 text-xs bg-vesoko_primary text-white rounded-full'>Tag</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {isDisabled && (
        <p className='text-xs text-yellow-600 mt-1'>
          This search works only on the home page.
        </p>
      )}
    </div>
  );
};

export default SearchField2;
