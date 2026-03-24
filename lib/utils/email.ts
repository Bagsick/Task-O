/**
 * Normalizes an email address for consistent lookups and to prevent account duplication.
 * Handle Gmail dot-insensitivity and sub-addressing (the + part).
 */
export function normalizeEmail(email: string): string {
    if (!email) return '';

    const trimmed = email.trim().toLowerCase();
    const [localPart, domain] = trimmed.split('@');

    if (!domain) return trimmed;

    // 1. Handle sub-addressing (e.g., user+extra@domain.com -> user@domain.com)
    // This is supported by most major providers (Gmail, Microsoft, Yahoo, etc.)
    const baseLocalPart = localPart.split('+')[0];

    // 2. Handle Gmail-specific dot insensitivity
    const gmailDomains = ['gmail.com', 'googlemail.com'];
    if (gmailDomains.includes(domain)) {
        // Remove dots ONLY for Gmail/Googlemail
        return `${baseLocalPart.replace(/\./g, '')}@${domain}`;
    }

    // 3. For all other providers, keep dots but use the stripped base local part
    return `${baseLocalPart}@${domain}`;
}
