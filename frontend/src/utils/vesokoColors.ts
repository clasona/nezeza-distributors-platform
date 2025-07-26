/**
 * Vesoko Platform Brand Colors Utility
 * 
 * This file centralizes all Vesoko brand colors and provides utility functions
 * for consistent color usage across the application.
 */

// Primary Brand Colors
export const VESOKO_COLORS = {
  // Blues - Primary brand colors
  DARK_BLUE: '#3182ce',
  DARK_BLUE_2: '#2456a3', 
  LIGHT_BLUE: '#e2f3fd',
  POWDER_BLUE: '#A7C7E7',
  
  // Greens - Success states
  GREEN_500: '#4CAF50',
  GREEN_600: '#38a169',
  GREEN_800: '#276749',
  
  // Reds - Error/warning states
  RED_200: '#fed7d7',
  RED_600: '#e53e3e',
  RED_700: '#c53030',
  
  // Grays - Neutral states
  GRAY_200: '#edf2f7',
  GRAY_600: '#718096',
  
  // Other
  YELLOW: '#febd69',
  YELLOW_600: '#d69e2e',
  LIGHT: '#232F3E',
} as const;

// Tailwind class mappings for the brand colors
export const VESOKO_TAILWIND_CLASSES = {
  // Background colors
  BG_DARK_BLUE: 'bg-vesoko_dark_blue',
  BG_DARK_BLUE_2: 'bg-vesoko_dark_blue_2',
  BG_LIGHT_BLUE: 'bg-vesoko_light_blue',
  BG_POWDER_BLUE: 'bg-vesoko_powder_blue',
  BG_GREEN_500: 'bg-vesoko_green_500',
  BG_GREEN_600: 'bg-vesoko_green_600',
  BG_GREEN_800: 'bg-vesoko_green_800',
  BG_RED_200: 'bg-vesoko_red_200',
  BG_RED_600: 'bg-vesoko_red_600',
  BG_RED_700: 'bg-vesoko_red_700',
  BG_GRAY_200: 'bg-vesoko_gray_200',
  BG_GRAY_600: 'bg-vesoko_gray_600',
  BG_YELLOW: 'bg-vesoko_yellow',
  BG_YELLOW_600: 'bg-vesoko_yellow_600',
  
  // Text colors
  TEXT_DARK_BLUE: 'text-vesoko_dark_blue',
  TEXT_DARK_BLUE_2: 'text-vesoko_dark_blue_2',
  TEXT_LIGHT_BLUE: 'text-vesoko_light_blue',
  TEXT_POWDER_BLUE: 'text-vesoko_powder_blue',
  TEXT_GREEN_500: 'text-vesoko_green_500',
  TEXT_GREEN_600: 'text-vesoko_green_600',
  TEXT_GREEN_800: 'text-vesoko_green_800',
  TEXT_RED_200: 'text-vesoko_red_200',
  TEXT_RED_600: 'text-vesoko_red_600',
  TEXT_RED_700: 'text-vesoko_red_700',
  TEXT_GRAY_200: 'text-vesoko_gray_200',
  TEXT_GRAY_600: 'text-vesoko_gray_600',
  TEXT_YELLOW: 'text-vesoko_yellow',
  TEXT_YELLOW_600: 'text-vesoko_yellow_600',
  TEXT_LIGHT: 'text-vesoko_light',
  TEXT_WHITE: 'text-white',
  
  // Border colors
  BORDER_DARK_BLUE: 'border-vesoko_dark_blue',
  BORDER_RED_200: 'border-vesoko_red_200',
  BORDER_RED_600: 'border-vesoko_red_600',
  BORDER_GRAY_200: 'border-vesoko_gray_200',
  
  // Ring colors (for focus states)
  RING_DARK_BLUE: 'ring-vesoko_dark_blue',
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
    case 'confirmed':
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
