/**
 * Formats an ISO date string to include both date and time.
 *
 * @param dateStr - The ISO date string to format.
 * @param includeSeconds - Whether to include seconds in the time format (default: false).
 * @returns The formatted date and time as a string.
 */

const formatDateTime = (dateStr: string, includeSeconds: boolean = false): string => {
  if (!dateStr) {
    throw new Error('Invalid date string provided');
  }

  try {
    const date = new Date(dateStr);
    
    // Format date part
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const dateFormatted = `${year}-${month}-${day}`;
    
    // Format time part
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    
    const timeFormatted = includeSeconds 
      ? `${hours}:${minutes}:${seconds}` 
      : `${hours}:${minutes}`;
    
    return `${dateFormatted} ${timeFormatted}`;
  } catch (error) {
    throw new Error(`Error formatting date and time: ${error}`);
  }
};

/**
 * Formats an ISO date string to a more user-friendly local format with time.
 *
 * @param dateStr - The ISO date string to format.
 * @param locale - The locale to use for formatting (default: 'en-US').
 * @returns The formatted date and time in a user-friendly format.
 */
export const formatDateTimeLocale = (dateStr: string, locale: string = 'en-US'): string => {
  if (!dateStr) {
    throw new Error('Invalid date string provided');
  }

  try {
    const date = new Date(dateStr);
    
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    
    return date.toLocaleDateString(locale, dateOptions);
  } catch (error) {
    throw new Error(`Error formatting date and time with locale: ${error}`);
  }
};

export default formatDateTime;
