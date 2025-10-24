// Secure password encryption utilities using Web Crypto API

export const generateSalt = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const encryptPassword = async (password: string, salt: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
};

export const verifyPassword = async (password: string, hash: string, salt: string): Promise<boolean> => {
  const newHash = await encryptPassword(password, salt);
  return newHash === hash;
};

// Additional security utilities
export const isStrongPassword = (password: string): boolean => {
  return password.length >= 6;
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};