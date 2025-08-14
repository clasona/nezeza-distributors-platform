import React, { useState, useEffect, useRef } from 'react';
import { X, Plus } from 'lucide-react';
import { getSearchSuggestions } from '@/utils/product/getSearchSuggestions';

interface TagsInputProps {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
}

const TagsInput: React.FC<TagsInputProps> = ({
  label,
  tags,
  onChange,
  placeholder = 'Add a tag...',
  maxTags = 10,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch search suggestions for tags
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const data = await getSearchSuggestions();
        if (data) {
          // Combine categories and popular tags for suggestions
          setSuggestions([...data.categories, ...data.popularTags]);
        }
      } catch (error) {
        console.error('Failed to fetch tag suggestions:', error);
      }
    };

    fetchSuggestions();
  }, []);

  // Filter suggestions based on input
  const filteredSuggestions = suggestions
    .filter(suggestion => 
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(suggestion.toLowerCase())
    )
    .slice(0, 6);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      onChange([...tags, trimmedTag]);
      setInputValue('');
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(value.length > 0 && filteredSuggestions.length > 0);
    setActiveSuggestionIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestionIndex >= 0) {
        addTag(filteredSuggestions[activeSuggestionIndex]);
      } else if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault();
      setActiveSuggestionIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp' && showSuggestions) {
      e.preventDefault();
      setActiveSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
  };

  const handleInputFocus = () => {
    if (inputValue && filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }, 200);
  };

  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion);
  };

  return (
    <div className={`${className}`}>
      <label className="block text-sm font-medium mb-2 text-gray-700">
        {label}
        <span className="text-xs text-gray-500 ml-1">
          ({tags.length}/{maxTags} tags)
        </span>
      </label>
      
      {/* Tags Display */}
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1 text-sm bg-vesoko_background text-vesoko_secondary rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 p-0.5 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full"
              aria-label={`Remove ${tag} tag`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Input Field */}
      <div className="relative">
        <div className="flex">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={tags.length >= maxTags ? `Maximum ${maxTags} tags reached` : placeholder}
            disabled={tags.length >= maxTags}
            className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vesoko_primary focus:border-blue-500 outline-none placeholder:text-sm ${
              tags.length >= maxTags ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
          />
          {inputValue && tags.length < maxTags && (
            <button
              type="button"
              onClick={() => addTag(inputValue)}
              className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-vesoko_primary"
              aria-label="Add tag"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto mt-1"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                  index === activeSuggestionIndex ? 'bg-vesoko_background text-vesoko_secondary' : 'text-gray-900'
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setActiveSuggestionIndex(index)}
              >
                <div className="flex items-center">
                  <Plus className="w-3 h-3 text-gray-400 mr-2" />
                  <span className="text-sm">{suggestion}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help Text */}
      <p className="text-xs text-gray-500 mt-1">
        Press Enter to add a tag, or click on suggestions. Use relevant keywords to help customers find your product.
      </p>
    </div>
  );
};

export default TagsInput;
