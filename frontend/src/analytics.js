/**
 * analytics.js — Minimal Google Analytics 4 integration.
 *
 * Reads the Measurement ID from the Vite env variable VITE_GA_MEASUREMENT_ID.
 * If the variable is absent (dev without .env, CI, etc.) all calls are no-ops.
 *
 * NEVER send passwords, emails, JWTs, tokens, or private user data here.
 */

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

/** Inject the gtag <script> tags once. Safe to call multiple times. */
export function initGA() {
  if (!GA_ID || typeof window === "undefined" || window.__ga_initialized) return;
  window.__ga_initialized = true;

  // Global gtag data layer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, {
    send_page_view: false, // We handle page_view manually for SPA
  });

  // Load the gtag script asynchronously
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
}

/** Send a page_view hit. Call on every route change. */
export function trackPageView(path) {
  if (!GA_ID || typeof window?.gtag !== "function") return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
  });
}

/**
 * Send a custom event.
 * @param {string} eventName  - GA4 event name (snake_case)
 * @param {object} [params]   - Non-private parameters only
 */
export function trackEvent(eventName, params = {}) {
  if (!GA_ID || typeof window?.gtag !== "function") return;
  window.gtag("event", eventName, params);
}
