/**
 * Vesoko Platform Brand Colors Utility
 * 
 * This file centralizes all Vesoko brand colors and provides utility functions
 * for consistent color usage across the application.
 */

// Primary Brand Colors - Updated Orange & Brown Theme
export const VESOKO_COLORS = {
  // Orange & Brown - Primary brand colors (matching logo)
  PRIMARY: '#ff7a00',           // Main orange
  PRIMARY_DARK: '#e66a00',      // Darker orange for hover states
  PRIMARY_LIGHT: '#ff8f33',     // Lighter orange for subtle accents
  SECONDARY: '#3d1f00',         // Deep brown
  SECONDARY_LIGHT: '#5c2f00',   // Lighter brown for hover states
  BACKGROUND: '#f7ede2',        // Light cream/beige background
  BACKGROUND_LIGHT: '#faf6f1',  // Even lighter background
  ACCENT: '#ff7a00',            // Same as primary for consistency
  
  // Legacy color mappings for backward compatibility
  DARK_BLUE: '#ff7a00',         // Mapped to primary orange
  DARK_BLUE_2: '#e66a00',       // Mapped to darker orange
  LIGHT_BLUE: '#f7ede2',        // Mapped to background
  POWDER_BLUE: '#ff7a00',       // Mapped to primary orange
  YELLOW: '#ff7a00',            // Mapped to primary orange
  YELLOW_600: '#ff7a00',        // Mapped to primary orange
  LIGHT: '#3d1f00',             // Mapped to secondary brown
  
  // Greens - Success states (keeping as is)
  GREEN_500: '#4CAF50',
  GREEN_600: '#38a169',
  GREEN_800: '#276749',
  
  // Reds - Error/warning states (keeping as is)
  RED_200: '#fed7d7',
  RED_600: '#e53e3e',
  RED_700: '#c53030',
  
  // Grays - Neutral states (keeping as is)
  GRAY_200: '#edf2f7',
  GRAY_600: '#718096',
} as const;

// Tailwind class mappings for the brand colors
export const VESOKO_TAILWIND_CLASSES = {
  // Background colors
  BG_DARK_BLUE: 'bg-vesoko_primary',
  BG_DARK_BLUE_2: 'bg-vesoko_primary_2',
  BG_LIGHT_BLUE: 'bg-vesoko_background',
  BG_POWDER_BLUE: 'bg-vesoko_primary',
  BG_GREEN_500: 'bg-vesoko_primary',
  BG_GREEN_600: 'bg-vesoko_primary',
  BG_GREEN_800: 'bg-vesoko_secondary',
  BG_RED_200: 'bg-vesoko_red_200',
  BG_RED_600: 'bg-vesoko_red_600',
  BG_RED_700: 'bg-vesoko_red_700',
  BG_GRAY_200: 'bg-vesoko_gray_200',
  BG_GRAY_600: 'bg-vesoko_gray_600',
  BG_YELLOW: 'bg-vesoko_primary',
  BG_YELLOW_600: 'bg-vesoko_primary_600',
  
  // Text colors
  TEXT_DARK_BLUE: 'text-vesoko_primary',
  TEXT_DARK_BLUE_2: 'text-vesoko_primary_2',
  TEXT_LIGHT_BLUE: 'text-vesoko_background',
  TEXT_POWDER_BLUE: 'text-vesoko_primary',
  TEXT_GREEN_500: 'text-vesoko_green_500',
  TEXT_GREEN_600: 'text-vesoko_primary',
  TEXT_GREEN_800: 'text-vesoko_green_800',
  TEXT_RED_200: 'text-vesoko_red_200',
  TEXT_RED_600: 'text-vesoko_red_600',
  TEXT_RED_700: 'text-vesoko_red_700',
  TEXT_GRAY_200: 'text-vesoko_gray_200',
  TEXT_GRAY_600: 'text-vesoko_gray_600',
  TEXT_YELLOW: 'text-vesoko_primary',
  TEXT_YELLOW_600: 'text-vesoko_primary_600',
  TEXT_LIGHT: 'text-vesoko_secondary',
  TEXT_WHITE: 'text-white',
  
  // Border colors
  BORDER_DARK_BLUE: 'border-vesoko_primary',
  BORDER_RED_200: 'border-vesoko_red_200',
  BORDER_RED_600: 'border-vesoko_red_600',
  BORDER_GRAY_200: 'border-vesoko_gray_200',
  
  // Ring colors (for focus states)
  RING_DARK_BLUE: 'ring-vesoko_primary',
  RING_RED_600: 'ring-vesoko_red_600',
  RING_GREEN_600: 'ring-vesoko_green_600',
} as const;

/**
 * Get status-specific colors for order fulfillment status
 */
export const getOrderStatusClasses = (status: string): string => {
  const normalizedStatus = status.toLowerCase();
  
  switch (normalizedStatus) {
    case 'pending':
      return `${VESOKO_TAILWIND_CLASSES.BG_YELLOW} ${VESOKO_TAILWIND_CLASSES.TEXT_LIGHT}`;
    case 'placed':
      return `${VESOKO_TAILWIND_CLASSES.BG_GREEN_500} ${VESOKO_TAILWIND_CLASSES.TEXT_WHITE}`;
    case 'processing':
      return `${VESOKO_TAILWIND_CLASSES.BG_LIGHT_BLUE} ${VESOKO_TAILWIND_CLASSES.TEXT_DARK_BLUE}`;
    case 'shipped':
      return `${VESOKO_TAILWIND_CLASSES.BG_POWDER_BLUE} ${VESOKO_TAILWIND_CLASSES.TEXT_DARK_BLUE_2}`;
    case 'delivered':
      return `${VESOKO_TAILWIND_CLASSES.BG_GREEN_600} ${VESOKO_TAILWIND_CLASSES.TEXT_WHITE}`;
    case 'cancelled':
      return `${VESOKO_TAILWIND_CLASSES.BG_RED_600} ${VESOKO_TAILWIND_CLASSES.TEXT_WHITE}`;
    case 'archived':
      return `${VESOKO_TAILWIND_CLASSES.BG_GRAY_200} ${VESOKO_TAILWIND_CLASSES.TEXT_GRAY_600}`;
    default:
      return `${VESOKO_TAILWIND_CLASSES.BG_GRAY_200} ${VESOKO_TAILWIND_CLASSES.TEXT_GRAY_600}`;
  }
};

/**
 * Get button classes for different action types
 */
export const getButtonClasses = (variant: 'primary' | 'secondary' | 'danger' | 'success'): string => {
  const baseClasses = 'inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';
  
  switch (variant) {
    case 'primary':
      return `${baseClasses} border-transparent text-white ${VESOKO_TAILWIND_CLASSES.BG_DARK_BLUE} hover:${VESOKO_TAILWIND_CLASSES.BG_DARK_BLUE_2} ${VESOKO_TAILWIND_CLASSES.RING_DARK_BLUE}`;
    case 'secondary':
      return `${baseClasses} border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 ring-gray-500`;
    case 'danger':
      return `${baseClasses} border ${VESOKO_TAILWIND_CLASSES.BORDER_RED_200} ${VESOKO_TAILWIND_CLASSES.TEXT_RED_700} ${VESOKO_TAILWIND_CLASSES.BG_RED_200} hover:${VESOKO_TAILWIND_CLASSES.BG_RED_600} hover:${VESOKO_TAILWIND_CLASSES.TEXT_WHITE} ${VESOKO_TAILWIND_CLASSES.RING_RED_600}`;
    case 'success':
      return `${baseClasses} border-transparent text-white ${VESOKO_TAILWIND_CLASSES.BG_GREEN_600} hover:${VESOKO_TAILWIND_CLASSES.BG_GREEN_800} ${VESOKO_TAILWIND_CLASSES.RING_GREEN_600}`;
    default:
      return `${baseClasses} border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 ring-gray-500`;
  }
};

/**
 * Get consistent form field classes
 */
export const getFormFieldClasses = (hasError: boolean = false): string => {
  const baseClasses = 'block w-full rounded-lg border px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors duration-200';
  
  if (hasError) {
    return `${baseClasses} ${VESOKO_TAILWIND_CLASSES.BORDER_RED_600} ${VESOKO_TAILWIND_CLASSES.RING_RED_600}`;
  }
  
  return `${baseClasses} border-gray-300 ${VESOKO_TAILWIND_CLASSES.RING_DARK_BLUE}`;
};

/**
 * Get consistent table row hover classes
 */
export const getTableRowClasses = (): string => {
  return `hover:${VESOKO_TAILWIND_CLASSES.BG_LIGHT_BLUE} transition-colors duration-150`;
};

/**
 * Get consistent modal backdrop classes
 */
export const getModalBackdropClasses = (): string => {
  return 'fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity';
};
