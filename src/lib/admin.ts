// Single source of truth for admin access
const ADMIN_EMAILS = [
  "admin@kikidecor.ru",
  "kris@kikidecor.ru",
];

export function isAdminUser(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.some(e => e.toLowerCase() === email.toLowerCase());
}
