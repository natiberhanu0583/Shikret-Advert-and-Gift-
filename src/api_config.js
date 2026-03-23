/**
 * Central configuration for the API URL.
 * We use relative paths for everything because:
 * 1. In production, the backend serves the frontend from the same origin.
 * 2. In development, we use Vite's proxy (see vite.config.js).
 */
const API_BASE_URL = ''; // Always use relative paths for maximum stability

export default API_BASE_URL;
