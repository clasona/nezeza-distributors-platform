/**
 * Formats an ISO date string to YYYY-MM-DD.
 *
 * @param dateStr - The ISO date string to format.
 * @returns The formatted date as a string in YYYY-MM-DD format.
 */

const formatDate = (dateStr: string): string => {
  if (!dateStr) {
    throw new Error('Invalid date string provided');
  }

  try {
    const date = new Date(dateStr);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    throw new Error(`Error formatting date: ${error}`);
  }
};

export default formatDate;
