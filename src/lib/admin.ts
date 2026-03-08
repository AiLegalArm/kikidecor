// Single source of truth for admin access
const ADMIN_EMAIL = "admin@kikidecor.ru";

export function isAdminUser(email: string | undefined | null): boolean {
  if (!email) return false;
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
