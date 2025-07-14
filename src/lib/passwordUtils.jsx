import React from 'react';

export const validatePassword = (password, userDetails = {}) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push("Be at least 8 characters long.");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Contain at least one uppercase letter (A-Z).");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Contain at least one lowercase letter (a-z).");
  }
  if (!/\d/.test(password)) {
    errors.push("Contain at least one number (0-9).");
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Contain at least one special character (e.g., !@#$%^&*).");
  }

  const personalInfo = [
    userDetails.email?.split('@')[0], 
    userDetails.legal_first_name, 
    userDetails.legal_middle_name, 
    userDetails.legal_last_name, 
    userDetails.preferred_name
  ].filter(Boolean).map(info => info.toLowerCase());

  let personalInfoError = false;
  for (const info of personalInfo) {
    if (info.length >= 3 && password.toLowerCase().includes(info)) {
      personalInfoError = true;
      break;
    }
  }
  if (personalInfoError) {
    errors.push("Does not contain personal information (name, email part).");
  }


  let repeatOrSequenceError = false;
  if (/(.)\1\1/.test(password)) { 
    errors.push("Does not contain 3+ repeated characters (e.g., 'aaa', '111').");
    repeatOrSequenceError = true;
  }

  const commonSequences = ['123', 'abc', 'qwe', 'asd', 'zxc'];
  for (const seq of commonSequences) {
    if (password.toLowerCase().includes(seq)) {
      if (!repeatOrSequenceError) { 
          errors.push(`Does not contain common sequences (e.g., '${seq}').`);
      }
      repeatOrSequenceError = true; 
      break; 
    }
  }
  
  return errors;
};

export const PasswordStrengthIndicator = ({ password, userDetails }) => {
  const [errors, setErrors] = React.useState([]);
  const [requirementsMet, setRequirementsMet] = React.useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });
  const [specificErrors, setSpecificErrors] = React.useState([]);

  React.useEffect(() => {
    const validationErrors = validatePassword(password, userDetails);
    
    setRequirementsMet({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[^A-Za-z0-9]/.test(password),
    });

    const currentSpecificErrors = [];
    if (validationErrors.some(err => err.includes("personal information"))) {
      currentSpecificErrors.push("Password should not contain personal information (like parts of your name or email).");
    }
    if (validationErrors.some(err => err.includes("repeated characters") || err.includes("common sequences"))) {
      currentSpecificErrors.push("Password should not contain 3+ repeated characters (e.g., 'aaa') or common sequences (e.g., 'abc').");
    }
    setSpecificErrors(currentSpecificErrors);
    
    setErrors(validationErrors);


  }, [password, userDetails]);

  const Requirement = ({ met, text }) => (
    <li className={`text-sm flex items-center ${met ? 'text-green-400' : 'text-red-400'}`}>
      {met ? '✓' : '✗'} <span className="ml-2">{text}</span>
    </li>
  );

  if (!password) {
    return null;
  }

  return (
    <div className="mt-2 space-y-1 p-3 bg-slate-700/50 rounded-md border border-slate-600">
      <ul className="space-y-1">
        <Requirement met={requirementsMet.length} text="At least 8 characters" />
        <Requirement met={requirementsMet.uppercase} text="At least one uppercase letter (A-Z)" />
        <Requirement met={requirementsMet.lowercase} text="At least one lowercase letter (a-z)" />
        <Requirement met={requirementsMet.number} text="At least one number (0-9)" />
        <Requirement met={requirementsMet.specialChar} text="At least one special character (e.g. !@#$%)" />
      </ul>
      {specificErrors.length > 0 && (
        <ul className="mt-2 pt-2 border-t border-slate-600 space-y-1">
          {specificErrors.map((error, index) => (
            <li key={index} className="text-sm flex items-center text-red-400">
              ✗ <span className="ml-2">{error}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};