// Australian Phone Number Validation Utility Functions

/**
 * Validates Australian phone number format using regex pattern
 * @param {string} phoneNumber - The phone number to validate
 * @returns {boolean} - True if valid format, false otherwise
 */
export const validateAustralianPhoneFormat = (phoneNumber) => {
  if (!phoneNumber) return true; // Allow empty phone number (optional field)
  
  // Remove any spaces and check format
  const cleanPhone = phoneNumber.replace(/\s/g, '');
  // Accept Mobile + Landline (AU only): ^(?:\+614|04|02|03|07|08)\d{8}$
  const australianPhoneRegex = /^(?:\+614|04|02|03|07|08)\d{8}$/;
  
  return australianPhoneRegex.test(cleanPhone);
};

/**
 * Main phone number validation function (alias for validateAustralianPhoneFormat)
 * @param {string} phoneNumber - The phone number to validate
 * @returns {boolean} - True if valid format, false otherwise
 */
export const validatePhoneNumber = validateAustralianPhoneFormat;

/**
 * Detects if the phone number is mobile or landline
 * @param {string} phoneNumber - The phone number to analyze
 * @returns {string} - 'mobile', 'landline', or 'unknown'
 */
export const detectPhoneType = (phoneNumber) => {
  if (!phoneNumber) return 'unknown';
  
  const cleanPhone = phoneNumber.replace(/\s/g, '');
  
  // Mobile patterns
  if (/^(?:\+614|04)\d{8}$/.test(cleanPhone)) {
    return 'mobile';
  }
  
  // Landline patterns
  if (/^(?:02|03|07|08)\d{8}$/.test(cleanPhone)) {
    return 'landline';
  }
  
  return 'unknown';
};

/**
 * Formats phone number for display (optional)
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - Formatted phone number
 */
export const formatPhoneForDisplay = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  const cleanPhone = phoneNumber.replace(/\s/g, '');
  
  // Format mobile numbers: 0412 345 678 or +61 4 1234 5678
  if (/^04\d{8}$/.test(cleanPhone)) {
    return `${cleanPhone.slice(0, 4)} ${cleanPhone.slice(4, 7)} ${cleanPhone.slice(7, 10)}`;
  }
  
  if (/^\+614\d{8}$/.test(cleanPhone)) {
    return `+61 4 ${cleanPhone.slice(4, 8)} ${cleanPhone.slice(8, 12)}`;
  }
  
  // Format landline numbers: 02 9876 5432
  if (/^0[2378]\d{8}$/.test(cleanPhone)) {
    return `${cleanPhone.slice(0, 2)} ${cleanPhone.slice(2, 6)} ${cleanPhone.slice(6, 10)}`;
  }
  
  return phoneNumber;
};

/**
 * Cleans phone number input (removes spaces)
 * @param {string} phoneNumber - The phone number to clean
 * @returns {string} - Clean phone number without spaces
 */
export const cleanPhoneInput = (phoneNumber) => {
  if (!phoneNumber) return '';
  return phoneNumber.replace(/\s/g, '');
};

/**
 * Gets phone number validation error message
 * @param {string} phoneNumber - The phone number to validate
 * @returns {string|null} - Error message or null if valid
 */
export const getPhoneValidationError = (phoneNumber) => {
  if (!phoneNumber) return null; // Allow empty phone number
  
  const cleanPhone = cleanPhoneInput(phoneNumber);
  
  if (!validateAustralianPhoneFormat(cleanPhone)) {
    return "Enter your Australian phone number (mobile or landline), e.g. 0412345678 or 0298765432. No spaces or symbols.";
  }
  
  return null;
};

/**
 * Gets helpful information about the phone number
 * @param {string} phoneNumber - The phone number to analyze
 * @returns {object} - Object with type and formatted number
 */
export const getPhoneInfo = (phoneNumber) => {
  if (!phoneNumber) return { type: 'unknown', formatted: '', isValid: false };
  
  const cleanPhone = cleanPhoneInput(phoneNumber);
  const type = detectPhoneType(cleanPhone);
  const formatted = formatPhoneForDisplay(cleanPhone);
  const isValid = validateAustralianPhoneFormat(cleanPhone);
  
  return {
    type,
    formatted,
    isValid,
    supportsSMS: type === 'mobile'
  };
};