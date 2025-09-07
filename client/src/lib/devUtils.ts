/**
 * Development utilities for EchoGarden
 * Contains DEV account management and access control
 */

// List of authorized DEV accounts
export const DEV_ACCOUNTS = [
  'frederic.dewaege@outlook.com',
  'admin@echogarden.local'
];

/**
 * Check if a user email is authorized as a DEV account
 * @param email - User's email address
 * @returns true if the email is in the DEV accounts list
 */
export function isDevAccount(email?: string): boolean {
  return email ? DEV_ACCOUNTS.includes(email) : false;
}

/**
 * Get a list of all DEV accounts (for logging/debugging)
 * @returns Array of DEV account emails
 */
export function getDevAccounts(): string[] {
  return [...DEV_ACCOUNTS];
}

/**
 * Check if the current environment allows DEV features
 * @returns true if in development mode
 */
export function isDevEnvironment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Log DEV account access (for debugging)
 * @param email - User's email
 * @param action - Action being performed
 */
export function logDevAccess(email: string, action: string): void {
  if (isDevEnvironment()) {
    console.log(`🔧 DEV Access: ${email} - ${action}`);
  }
}
