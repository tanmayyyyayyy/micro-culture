import { rateLimit, ipKeyGenerator } from "express-rate-limit";

/**
 * Key generator: prefer userId (set by requireAuth middleware) over IP.
 * Falls back to ipKeyGenerator (IPv6-safe) when no userId is available.
 */
function userOrIpKey(req) {
  return req.userId ? `user:${req.userId}` : ipKeyGenerator(req);
}

/**
 * AI endpoint limiter — applied per-user to protect Groq API credits.
 * 30 AI calls per hour per user covers: ritual fetch, generation, summary.
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  keyGenerator: userOrIpKey,
  validate: { xForwardedForHeader: false },
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Too many AI requests. Please wait before trying again.",
    retryAfterSeconds: 3600,
  },
});

/**
 * Stricter limiter for culture blueprint generation — expensive prompt.
 * 10 blueprints per hour per user.
 */
export const cultureGenerateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: userOrIpKey,
  validate: { xForwardedForHeader: false },
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Too many culture generation requests. Please wait before trying again.",
    retryAfterSeconds: 3600,
  },
});

/**
 * Auth endpoint limiter — prevents brute-force on login/register.
 * 20 attempts per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  validate: { xForwardedForHeader: false },
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Too many authentication attempts. Please wait 15 minutes.",
    retryAfterSeconds: 900,
  },
});
