// Simple client-side encryption utilities for credential storage
// Note: This is basic encryption for demonstration. In production, consider using more robust encryption libraries.

class SimpleEncryption {
  constructor() {
    this.algorithm = 'AES-GCM';
    this.keyLength = 256;
  }

  // Generate a random key for encryption
  async generateKey() {
    return await window.crypto.subtle.generateKey(
      {
        name: this.algorithm,
        length: this.keyLength,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Derive key from password using PBKDF2
  async deriveKeyFromPassword(password, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    return await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: this.algorithm, length: this.keyLength },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt text data
  async encrypt(text, key) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: this.algorithm,
        iv: iv,
      },
      key,
      data
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  // Decrypt text data
  async decrypt(encryptedText, key) {
    try {
      const combined = new Uint8Array(
        atob(encryptedText)
          .split('')
          .map(char => char.charCodeAt(0))
      );

      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const decrypted = await window.crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: iv,
        },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  // Generate a random salt
  generateSalt() {
    return window.crypto.getRandomValues(new Uint8Array(16));
  }

  // Convert ArrayBuffer to base64
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    return btoa(String.fromCharCode(...bytes));
  }

  // Convert base64 to ArrayBuffer
  base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

// Password strength analysis
export const analyzePasswordStrength = (password) => {
  if (!password) return { score: 0, feedback: [], strength: 'Very Weak' };

  // Detect if this is likely a passphrase (contains common separators and word-like patterns)
  const isPassphrase = /^[a-zA-Z]+[-._][a-zA-Z]+|[a-zA-Z]+\d+|[a-zA-Z]+[!@#$%^&*]/.test(password) && 
                      (password.includes('-') || password.includes('_') || password.includes('.') || /[a-zA-Z]{4,}/.test(password));

  if (isPassphrase) {
    return analyzePassphraseStrength(password);
  }

  let score = 0;
  const feedback = [];
  const checks = {
    length: password.length >= 12,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    noRepeats: !/(.)\1{2,}/.test(password),
    noSequences: !/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789|890)/i.test(password)
  };

  // Length scoring
  if (password.length >= 16) score += 25;
  else if (password.length >= 12) score += 20;
  else if (password.length >= 8) score += 10;
  else feedback.push('Use at least 12 characters');

  // Character variety scoring
  if (checks.lowercase) score += 10;
  else feedback.push('Add lowercase letters');

  if (checks.uppercase) score += 10;
  else feedback.push('Add uppercase letters');

  if (checks.numbers) score += 10;
  else feedback.push('Add numbers');

  if (checks.symbols) score += 15;
  else feedback.push('Add special characters');

  // Pattern checks
  if (checks.noRepeats) score += 15;
  else feedback.push('Avoid repeated characters');

  if (checks.noSequences) score += 15;
  else feedback.push('Avoid common sequences');

  // Determine strength level
  let strength;
  if (score >= 85) strength = 'Very Strong';
  else if (score >= 70) strength = 'Strong';
  else if (score >= 50) strength = 'Good';
  else if (score >= 30) strength = 'Weak';
  else strength = 'Very Weak';

  return { score, feedback, strength };
};

const analyzePassphraseStrength = (passphrase) => {
  let score = 0;
  const feedback = [];
  
  // Split by common separators to count words
  const words = passphrase.split(/[-._\s!@#$%^&*0-9]+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  // Word count scoring (most important for passphrases)
  if (wordCount >= 5) score += 40;
  else if (wordCount >= 4) score += 30;
  else if (wordCount >= 3) score += 20;
  else if (wordCount >= 2) score += 10;
  else feedback.push('Use at least 3 words');

  // Length scoring (less important for passphrases but still matters)
  if (passphrase.length >= 20) score += 20;
  else if (passphrase.length >= 15) score += 15;
  else if (passphrase.length >= 10) score += 10;
  else feedback.push('Use longer words or more words');

  // Character variety scoring
  const hasNumbers = /\d/.test(passphrase);
  const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passphrase);
  const hasUppercase = /[A-Z]/.test(passphrase);
  const hasLowercase = /[a-z]/.test(passphrase);

  if (hasNumbers) score += 15;
  else feedback.push('Add numbers for better security');

  if (hasSymbols) score += 15;
  else feedback.push('Add symbols for better security');

  if (hasUppercase && hasLowercase) score += 10;
  else if (hasUppercase || hasLowercase) score += 5;

  // Word diversity bonus
  const uniqueWords = new Set(words.map(word => word.toLowerCase()));
  if (uniqueWords.size === words.length) score += 10;
  else feedback.push('Use unique words');

  // Determine strength level
  let strength;
  if (score >= 85) strength = 'Very Strong';
  else if (score >= 70) strength = 'Strong';
  else if (score >= 55) strength = 'Good';
  else if (score >= 35) strength = 'Weak';
  else strength = 'Very Weak';

  return { score, feedback, strength };
};

// Password generator
// Word list for passphrase generation
const PASSPHRASE_WORDS = [
  'apple', 'banana', 'cherry', 'dragon', 'elephant', 'forest', 'guitar', 'house', 'island', 'jungle',
  'keyboard', 'laptop', 'mountain', 'notebook', 'ocean', 'piano', 'queen', 'rainbow', 'sunset', 'thunder',
  'umbrella', 'volcano', 'winter', 'xylophone', 'yellow', 'zebra', 'adventure', 'balance', 'crystal', 'diamond',
  'energy', 'freedom', 'gravity', 'harmony', 'imagine', 'journey', 'knowledge', 'liberty', 'miracle', 'nature',
  'oxygen', 'passion', 'quantum', 'respect', 'silence', 'triumph', 'universe', 'victory', 'wisdom', 'xenial',
  'yogurt', 'zephyr', 'ancient', 'bridge', 'castle', 'desert', 'emerald', 'falcon', 'galaxy', 'horizon',
  'indigo', 'jasmine', 'kingdom', 'legend', 'mystic', 'nectar', 'orchid', 'phoenix', 'quasar', 'rhythm',
  'sapphire', 'temple', 'unique', 'velvet', 'whisper', 'express', 'yacht', 'zenith', 'aurora', 'blizzard',
  'cosmos', 'dynamo', 'essence', 'flashy', 'garden', 'heroic', 'iconic', 'jazzy', 'kinetic', 'lavish',
  'magic', 'noble', 'optic', 'prism', 'quest', 'rustic', 'stellar', 'turbo', 'ultra', 'vivid'
];

export const generatePassphrase = (options = {}) => {
  const {
    wordCount = 4,
    separator = '-',
    includeNumbers = true,
    includeSymbols = true,
    capitalizeWords = false,
    numberPosition = 'end', // 'start', 'end', 'between', 'random'
    symbolPosition = 'end' // 'start', 'end', 'between', 'random'
  } = options;

  // Generate random words
  const words = [];
  const wordArray = new Uint8Array(wordCount);
  window.crypto.getRandomValues(wordArray);

  for (let i = 0; i < wordCount; i++) {
    let word = PASSPHRASE_WORDS[wordArray[i] % PASSPHRASE_WORDS.length];
    if (capitalizeWords) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    words.push(word);
  }

  // Generate numbers if requested
  let numbers = '';
  if (includeNumbers) {
    const numArray = new Uint8Array(2);
    window.crypto.getRandomValues(numArray);
    numbers = (numArray[0] % 90 + 10).toString(); // 2-digit number
  }

  // Generate symbols if requested
  let symbols = '';
  if (includeSymbols) {
    const symbolChars = '!@#$%^&*';
    const symArray = new Uint8Array(1);
    window.crypto.getRandomValues(symArray);
    symbols = symbolChars[symArray[0] % symbolChars.length];
  }

  // Combine components based on position preferences
  let passphrase = words.join(separator);
  
  if (numberPosition === 'start') {
    passphrase = numbers + separator + passphrase;
  } else if (numberPosition === 'end') {
    passphrase = passphrase + separator + numbers;
  } else if (numberPosition === 'between' && words.length > 1) {
    const midIndex = Math.floor(words.length / 2);
    const firstPart = words.slice(0, midIndex).join(separator);
    const secondPart = words.slice(midIndex).join(separator);
    passphrase = firstPart + separator + numbers + separator + secondPart;
  } else if (numberPosition === 'random') {
    const randomIndex = Math.floor(Math.random() * (words.length + 1));
    const wordsWithNumbers = [...words];
    wordsWithNumbers.splice(randomIndex, 0, numbers);
    passphrase = wordsWithNumbers.join(separator);
  }

  if (symbolPosition === 'start') {
    passphrase = symbols + passphrase;
  } else if (symbolPosition === 'end') {
    passphrase = passphrase + symbols;
  } else if (symbolPosition === 'between' && words.length > 1) {
    const parts = passphrase.split(separator);
    const midIndex = Math.floor(parts.length / 2);
    parts.splice(midIndex, 0, symbols);
    passphrase = parts.join(separator);
  } else if (symbolPosition === 'random') {
    const parts = passphrase.split(separator);
    const randomIndex = Math.floor(Math.random() * (parts.length + 1));
    parts.splice(randomIndex, 0, symbols);
    passphrase = parts.join(separator);
  }

  return passphrase;
};

export const generateSecurePassword = (options = {}) => {
  const {
    type = 'password', // 'password' or 'passphrase'
    length = 16,
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
    excludeSimilar = true,
    excludeAmbiguous = true,
    // Passphrase options
    wordCount = 4,
    separator = '-',
    capitalizeWords = false,
    numberPosition = 'end',
    symbolPosition = 'end'
  } = options;

  if (type === 'passphrase') {
    return generatePassphrase({
      wordCount,
      separator,
      includeNumbers,
      includeSymbols,
      capitalizeWords,
      numberPosition,
      symbolPosition
    });
  }

  // Original password generation logic
  let charset = '';
  
  if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (includeNumbers) charset += '0123456789';
  if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (excludeSimilar) {
    charset = charset.replace(/[il1Lo0O]/g, '');
  }

  if (excludeAmbiguous) {
    charset = charset.replace(/[{}[\]()\/\\'"~,;.<>]/g, '');
  }

  if (!charset) {
    throw new Error('No character set available for password generation');
  }

  let password = '';
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);

  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }

  return password;
};

export const encryption = new SimpleEncryption();