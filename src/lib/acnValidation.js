// ACN Validation Utility Functions

/**
 * Validates ACN format using regex pattern
 * @param {string} acn - The ACN to validate
 * @returns {boolean} - True if valid format, false otherwise
 */
export const validateACNFormat = (acn) => {
  if (!acn) return true; // Allow empty ACN (optional field)
  
  // Remove any spaces and check if it's exactly 9 digits
  const cleanACN = acn.replace(/\s/g, '');
  const acnRegex = /^\d{9}$/;
  
  return acnRegex.test(cleanACN);
};

/**
 * Validates ACN using checksum algorithm (advanced validation)
 * @param {string} acn - The ACN to validate
 * @returns {boolean} - True if mathematically valid, false otherwise
 */
export const validateACNChecksum = (acn) => {
  if (!acn) return true; // Allow empty ACN
  
  const cleanACN = acn.replace(/\s/g, '');
  
  // First check format
  if (!validateACNFormat(cleanACN)) return false;
  
  // Convert to array of digits
  const digits = cleanACN.split('').map(Number);
  
  // ACN checksum validation using modulus 10 weighting
  // The first 8 digits are used to calculate the 9th digit (check digit)
  const weights = [8, 7, 6, 5, 4, 3, 2, 1];
  
  // Calculate weighted sum of first 8 digits
  const sum = digits.slice(0, 8).reduce((total, digit, index) => {
    return total + (digit * weights[index]);
  }, 0);
  
  // Calculate check digit
  const remainder = sum % 10;
  const checkDigit = remainder === 0 ? 0 : 10 - remainder;
  
  // Compare with the 9th digit
  return checkDigit === digits[8];
};

/**
 * Formats ACN with spaces for display (optional)
 * @param {string} acn - The ACN to format
 * @returns {string} - Formatted ACN with spaces
 */
export const formatACNForDisplay = (acn) => {
  if (!acn) return '';
  
  const cleanACN = acn.replace(/\s/g, '');
  if (cleanACN.length === 9) {
    return `${cleanACN.slice(0, 3)} ${cleanACN.slice(3, 6)} ${cleanACN.slice(6, 9)}`;
  }
  
  return acn;
};

/**
 * Cleans ACN input (removes spaces)
 * @param {string} acn - The ACN to clean
 * @returns {string} - Clean ACN without spaces
 */
export const cleanACNInput = (acn) => {
  if (!acn) return '';
  return acn.replace(/\s/g, '');
};

/**
 * Gets ACN validation error message
 * @param {string} acn - The ACN to validate
 * @returns {string|null} - Error message or null if valid
 */
export const getACNValidationError = (acn) => {
  if (!acn) return null; // Allow empty ACN
  
  const cleanACN = cleanACNInput(acn);
  
  if (!validateACNFormat(cleanACN)) {
    return "ACN must be exactly 9 digits with no letters or special characters";
  }
  
  if (!validateACNChecksum(cleanACN)) {
    return "Invalid ACN - please check the number is correct";
  }
  
  return null;
};