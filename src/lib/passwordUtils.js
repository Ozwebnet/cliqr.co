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

  for (const info of personalInfo) {
    if (info.length >= 3 && password.toLowerCase().includes(info)) {
      errors.push("Not contain personal information (name, email).");
      break;
    }
  }

  if (/(.)\1\1\1/.test(password)) {
    errors.push("Not contain four identical characters in a row (e.g., '1111', 'aaaa').");
  }

  const commonSequences = ['1234', 'abcd', 'qwer', 'asdf', 'zxcv'];
  for (const seq of commonSequences) {
    if (password.toLowerCase().includes(seq)) {
      errors.push(`Not contain common sequences like '${seq}'.`);
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
    noPersonalInfo: true,
    noRepeatOrSequence: true,
  });

  React.useEffect(() => {
    const validationErrors = validatePassword(password, userDetails);
    setErrors(validationErrors);

    setRequirementsMet({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[^A-Za-z0-9]/.test(password),
      noPersonalInfo: !validationErrors.some(err => err.includes("personal information")),
      noRepeatOrSequence: !validationErrors.some(err => err.includes("identical characters") || err.includes("common sequences")),
    });

  }, [password, userDetails]);

  const Requirement = ({ met, text }) => (
    <li className={`text-sm flex items-center ${met ? 'text-green-400' : 'text-red-400'}`}>
      {met ? '✓' : '✗'} <span className="ml-2">{text}</span>
    </li>
  );

  if (!password && Object.values(requirementsMet).every(val => val === false || val === true && (val === requirementsMet.noPersonalInfo || val === requirementsMet.noRepeatOrSequence) )) { // initial state
    return null;
  }

  return (
    <ul className="mt-2 space-y-1 p-3 bg-slate-700/50 rounded-md border border-slate-600">
      <Requirement met={requirementsMet.length} text="At least 8 characters" />
      <Requirement met={requirementsMet.uppercase} text="At least one uppercase letter (A-Z)" />
      <Requirement met={requirementsMet.lowercase} text="At least one lowercase letter (a-z)" />
      <Requirement met={requirementsMet.number} text="At least one number (0-9)" />
      <Requirement met={requirementsMet.specialChar} text="At least one special character (e.g. !@#$%)" />
      <Requirement met={requirementsMet.noPersonalInfo} text="Does not contain personal information (name, email part)" />
      <Requirement met={requirementsMet.noRepeatOrSequence} text="Does not contain 4+ repeated chars or common sequences" />
    </ul>
  );
};