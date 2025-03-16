/**
 * Helper Utilities
 * Common utility functions used throughout the application
 */

/**
 * Formats a date string into a human-readable format
 * @param {string} dateString - The date string to format
 * @param {string} format - The format to use (default: 'short')
 * @returns {string} The formatted date string
 */
export function formatDate(dateString, format = 'short') {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  switch (format) {
    case 'short':
      return date.toLocaleDateString();
    case 'long':
      return date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'time':
      return date.toLocaleTimeString();
    case 'full':
      return date.toLocaleString();
    default:
      return date.toLocaleDateString();
  }
}

/**
 * Truncates a string to a specified length and adds ellipsis
 * @param {string} str - The string to truncate
 * @param {number} length - The maximum length
 * @returns {string} The truncated string
 */
export function truncate(str, length = 50) {
  if (!str || str.length <= length) {
    return str;
  }
  
  return str.slice(0, length) + '...';
}

/**
 * Debounces a function call
 * @param {Function} func - The function to debounce
 * @param {number} wait - The time to wait in milliseconds
 * @returns {Function} The debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
} 