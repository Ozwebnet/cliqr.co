// ABN Validation Utility Functions

/**
 * Validates ABN format using regex pattern
 * @param {string} abn - The ABN to validate
 * @returns {boolean} - True if valid format, false otherwise
 */
export const validateABNFormat = (abn) => {
  if (!abn) return true; // Allow empty ABN (optional field)
  
  // Remove any spaces and check if it's exactly 11 digits
  const cleanABN = abn.replace(/\s/g, '');
  const abnRegex = /^\d{11}$/;
  
  return abnRegex.test(cleanABN);
};

/**
 * Validates ABN using checksum algorithm (advanced validation)
 * @param {string} abn - The ABN to validate
 * @returns {boolean} - True if mathematically valid, false otherwise
 */
export const validateABNChecksum = (abn) => {
  if (!abn) return true; // Allow empty ABN
  
  const cleanABN = abn.replace(/\s/g, '');
  
  // First check format
  if (!validateABNFormat(cleanABN)) return false;
  
  // Convert to array of digits
  const digits = cleanABN.split('').map(Number);
  
  // Subtract 1 from the first digit
  digits[0] = digits[0] - 1;
  
  // Weighting factors
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  
  // Calculate weighted sum
  const sum = digits.reduce((total, digit, index) => {
    return total + (digit * weights[index]);
  }, 0);
  
  // Check if divisible by 89
  return sum % 89 === 0;
};

/**
 * Formats ABN with spaces for display (optional)
 * @param {string} abn - The ABN to format
 * @returns {string} - Formatted ABN with spaces
 */
export const formatABNForDisplay = (abn) => {
  if (!abn) return '';
  
  const cleanABN = abn.replace(/\s/g, '');
  if (cleanABN.length === 11) {
    return `${cleanABN.slice(0, 2)} ${cleanABN.slice(2, 5)} ${cleanABN.slice(5, 8)} ${cleanABN.slice(8, 11)}`;
  }
  
  return abn;
};

/**
 * Cleans ABN input (removes spaces)
 * @param {string} abn - The ABN to clean
 * @returns {string} - Clean ABN without spaces
 */
export const cleanABNInput = (abn) => {
  if (!abn) return '';
  return abn.replace(/\s/g, '');
};

/**
 * Gets ABN validation error message
 * @param {string} abn - The ABN to validate
 * @returns {string|null} - Error message or null if valid
 */
export const getABNValidationError = (abn) => {
  if (!abn) return null; // Allow empty ABN
  
  const cleanABN = cleanABNInput(abn);
  
  if (!validateABNFormat(cleanABN)) {
    return "ABN must be exactly 11 digits with no letters or special characters";
  }
  
  if (!validateABNChecksum(cleanABN)) {
    return "Invalid ABN - please check the number is correct";
  }
  
  return null;
};