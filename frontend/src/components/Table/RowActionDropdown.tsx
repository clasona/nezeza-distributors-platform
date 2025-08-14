import { MoreHorizontal, ChevronDown, Loader2 } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';

export interface ActionItem {
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  disabled?: boolean;
  loading?: boolean;
  divider?: boolean; // Add divider after this item
  onClick?: () => void;
  href?: string;
}

interface RowActionDropdownProps {
  actions: ActionItem[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'outlined';
  position?: 'left' | 'right';
  maxHeight?: string;
  dropdownId?: string; // Unique ID for managing multiple dropdowns
}

const RowActionDropdown = ({ 
  actions, 
  className = '',
  size = 'md',
  variant = 'default',
  position = 'right',
  maxHeight = 'max-h-96',
  dropdownId
}: RowActionDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      
      // Position dropdown to avoid overflow
      if (buttonRef.current && dropdownRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const dropdownRect = dropdownRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        let newStyle: React.CSSProperties = {};
        
        // Vertical positioning - prefer showing below first
        const spaceBelow = viewportHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;
        const dropdownHeight = dropdownRect.height || 200; // fallback height
        
        // Show above only if:
        // 1. Not enough space below for dropdown AND there's sufficient space above
        // 2. Otherwise prefer showing below
        const shouldShowAbove = 
          spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;
          
        if (shouldShowAbove) {
          newStyle.bottom = '100%';
          newStyle.top = 'auto';
          newStyle.marginBottom = '4px';
        } else {
          newStyle.top = '100%';
          newStyle.bottom = 'auto';
          newStyle.marginTop = '4px';
        }
        
        // Horizontal positioning
        if (position === 'left') {
          newStyle.left = '0';
          newStyle.right = 'auto';
        } else {
          newStyle.right = '0';
          newStyle.left = 'auto';
        }
        
        // Ensure dropdown doesn't go off-screen horizontally
        if (position === 'right' && buttonRect.right - dropdownRect.width < 0) {
          newStyle.left = '0';
          newStyle.right = 'auto';
        } else if (position === 'left' && buttonRect.left + dropdownRect.width > viewportWidth) {
          newStyle.right = '0';
          newStyle.left = 'auto';
        }
        
        setDropdownStyle(newStyle);
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, position]);

  // Close other dropdowns when this one opens
  useEffect(() => {
    if (isOpen && dropdownId) {
      // Dispatch custom event to notify other dropdowns to close
      window.dispatchEvent(new CustomEvent('closeOtherDropdowns', { detail: { exceptId: dropdownId } }));
    }
  }, [isOpen, dropdownId]);

  // Listen for close events from other dropdowns
  useEffect(() => {
    const handleCloseOthers = (event: CustomEvent) => {
      if (event.detail.exceptId !== dropdownId) {
        setIsOpen(false);
      }
    };

    window.addEventListener('closeOtherDropdowns', handleCloseOthers as EventListener);
    return () => window.removeEventListener('closeOtherDropdowns', handleCloseOthers as EventListener);
  }, [dropdownId]);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'h-8 w-8 text-sm';
      case 'lg': return 'h-12 w-12 text-lg';
      default: return 'h-10 w-10 text-base';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-transparent hover:bg-gray-100 border-none shadow-none';
      case 'outlined':
        return 'bg-white hover:bg-gray-50 border border-gray-300 shadow-sm';
      default:
        return 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md';
    }
  };

  const getActionVariantClasses = (actionVariant?: string) => {
    switch (actionVariant) {
      case 'primary':
        return 'text-vesoko_primary hover:bg-blue-50 hover:text-vesoko_primary_2';
      case 'secondary':
        return 'text-gray-600 hover:bg-gray-100 hover:text-gray-800';
      case 'danger':
        return 'text-vesoko_red_600 hover:bg-red-50 hover:text-vesoko_red_700';
      case 'success':
        return 'text-vesoko_primary hover:bg-green-50 hover:text-vesoko_green_800';
      case 'warning':
        return 'text-vesoko_primary_600 hover:bg-yellow-50 hover:text-yellow-700';
      default:
        return 'text-gray-700 hover:bg-gray-100 hover:text-gray-900';
    }
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleActionClick = (action: ActionItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (action.disabled || action.loading) return;
    
    if (action.onClick) {
      action.onClick();
    }
    setIsOpen(false);
  };

  // Filter out empty actions
  const validActions = actions.filter(action => action.label);
  
  if (validActions.length === 0) return null;

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        type='button'
        className={`
          inline-flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-vesoko_primary focus:ring-offset-1
          ${getSizeClasses()}
          ${getVariantClasses()}
        `}
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span className='sr-only'>Open actions menu</span>
        <MoreHorizontal className='w-5 h-5' />
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-10 bg-black bg-opacity-25 sm:hidden" />
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            absolute z-[100] min-w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1
            transform transition-all duration-200 ease-out
            ${maxHeight} overflow-y-auto
          `}
          style={{
            ...dropdownStyle,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}
          role="menu"
          aria-orientation="vertical"
        >
          {validActions.map((action, index) => {
            const isLastItem = index === validActions.length - 1;
            
            return (
              <React.Fragment key={`${action.label}-${index}`}>
                {'href' in action && action.href ? (
                  <Link
                    href={action.disabled ? '#' : action.href}
                    className={`
                      flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors duration-150
                      ${action.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                      ${getActionVariantClasses(action.variant)}
                    `}
                    onClick={(e) => {
                      if (action.disabled) {
                        e.preventDefault();
                        return;
                      }
                      setIsOpen(false);
                    }}
                    role="menuitem"
                  >
                    {action.loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      action.icon && <span className="flex-shrink-0">{action.icon}</span>
                    )}
                    <span className="flex-1">{action.label}</span>
                  </Link>
                ) : (
                  <button
                    onClick={(e) => handleActionClick(action, e)}
                    disabled={action.disabled || action.loading}
                    className={`
                      flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-left transition-colors duration-150
                      ${action.disabled || action.loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                      ${getActionVariantClasses(action.variant)}
                    `}
                    role="menuitem"
                  >
                    {action.loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      action.icon && <span className="flex-shrink-0">{action.icon}</span>
                    )}
                    <span className="flex-1">{action.label}</span>
                  </button>
                )}
                {action.divider && !isLastItem && (
                  <hr className="my-1 border-gray-200" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RowActionDropdown;
