

export const isVisitorCode = (str) => {
  if (!str || typeof str !== 'string') return false;
  
  // Pattern: VK- followed by digits (case insensitive)
  const visitorCodePattern = /^VK-\d+$/i;
  return visitorCodePattern.test(str.trim());
};


export const isEmail = (str) => {
  if (!str || typeof str !== 'string') return false;
  
  // Basic email pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(str.trim());
};


export const identifyVisitorIdentifier = (str) => {
  if (!str || typeof str !== 'string') {
    return { type: 'unknown', value: str };
  }

  const trimmedStr = str.trim();

  if (isVisitorCode(trimmedStr)) {
    return { 
      type: 'code', 
      value: trimmedStr.toUpperCase() // Normalize to uppercase
    };
  }

  if (isEmail(trimmedStr)) {
    return { 
      type: 'email', 
      value: trimmedStr.toLowerCase() // Normalize to lowercase
    };
  }

  return { type: 'unknown', value: trimmedStr };
};