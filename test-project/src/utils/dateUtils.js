/**
 * Format date to a readable string
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Get days difference between two dates
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} Number of days
 */
export function getDaysDifference(date1, date2) {
  const diffTime = Math.abs(date2 - date1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}