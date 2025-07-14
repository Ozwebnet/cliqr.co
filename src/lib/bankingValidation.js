// BSB and Account Number Validation Utility Functions

/**
 * Validates BSB format using regex pattern
 * @param {string} bsb - The BSB to validate
 * @returns {boolean} - True if valid format, false otherwise
 */
export const validateBSBFormat = (bsb) => {
  if (!bsb) return true; // Allow empty BSB (optional field)
  
  // Remove any spaces and check format
  const cleanBSB = bsb.replace(/\s/g, '');
  // Allow optional dash format: 123-456 or 123456
  const bsbRegex = /^\d{3}-?\d{3}$/;
  
  return bsbRegex.test(cleanBSB);
};

/**
 * Validates Account Number format using regex pattern
 * @param {string} accountNumber - The account number to validate
 * @returns {boolean} - True if valid format, false otherwise
 */
export const validateAccountNumberFormat = (accountNumber) => {
  if (!accountNumber) return true; // Allow empty account number (optional field)
  
  // Remove any spaces and check if it's 6 to 10 digits
  const cleanAccountNumber = accountNumber.replace(/\s/g, '');
  const accountNumberRegex = /^\d{6,10}$/;
  
  return accountNumberRegex.test(cleanAccountNumber);
};

/**
 * Formats BSB with dash for display (optional)
 * @param {string} bsb - The BSB to format
 * @returns {string} - Formatted BSB with dash
 */
export const formatBSBForDisplay = (bsb) => {
  if (!bsb) return '';
  
  const cleanBSB = bsb.replace(/\s|-/g, '');
  if (cleanBSB.length === 6) {
    return `${cleanBSB.slice(0, 3)}-${cleanBSB.slice(3, 6)}`;
  }
  
  return bsb;
};

/**
 * Cleans BSB input (removes spaces and dashes)
 * @param {string} bsb - The BSB to clean
 * @returns {string} - Clean BSB without spaces or dashes
 */
export const cleanBSBInput = (bsb) => {
  if (!bsb) return '';
  return bsb.replace(/\s|-/g, '');
};

/**
 * Cleans Account Number input (removes spaces)
 * @param {string} accountNumber - The account number to clean
 * @returns {string} - Clean account number without spaces
 */
export const cleanAccountNumberInput = (accountNumber) => {
  if (!accountNumber) return '';
  return accountNumber.replace(/\s/g, '');
};

/**
 * Gets BSB validation error message
 * @param {string} bsb - The BSB to validate
 * @returns {string|null} - Error message or null if valid
 */
export const getBSBValidationError = (bsb) => {
  if (!bsb) return null; // Allow empty BSB
  
  const cleanBSB = cleanBSBInput(bsb);
  
  if (!validateBSBFormat(cleanBSB)) {
    return "BSB must be exactly 6 digits (e.g., 123456 or 123-456). No letters or spaces.";
  }
  
  return null;
};

/**
 * Gets Account Number validation error message
 * @param {string} accountNumber - The account number to validate
 * @returns {string|null} - Error message or null if valid
 */
export const getAccountNumberValidationError = (accountNumber) => {
  if (!accountNumber) return null; // Allow empty account number
  
  const cleanAccountNumber = cleanAccountNumberInput(accountNumber);
  
  if (!validateAccountNumberFormat(cleanAccountNumber)) {
    return "Account number must be 6 to 10 digits. No spaces or special characters.";
  }
  
  return null;
};