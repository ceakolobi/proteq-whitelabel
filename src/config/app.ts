// Proteq White-Label Configuration
// All values are driven by environment variables so each tenant
// gets its own branding without touching source code.

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Proteq';
export const APP_URL  = import.meta.env.VITE_APP_URL  || 'proteq.antum.com.br';

// Keys used in localStorage — must be unique per tenant to avoid
// collisions when multiple tenants share the same browser profile.
export const SESSION_KEY = import.meta.env.VITE_SESSION_KEY || 'proteqUser';
export const THEME_KEY   = import.meta.env.VITE_THEME_KEY   || 'proteq-theme';

// Optional: hex color to override the default brand color at runtime.
// If not set, the compiled Tailwind theme colors are used as-is.
export const PRIMARY_COLOR = import.meta.env.VITE_PRIMARY_COLOR || null;
