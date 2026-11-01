import dns from "dns/promises";

const BLOCKED_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "invalid.com",
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
]);

const COMMON_DOMAIN_TYPOS = new Map([
  ["gmial.com", "gmail.com"],
  ["gamil.com", "gmail.com"],
  ["gmail.con", "gmail.com"],
  ["gmail.cmo", "gmail.com"],
  ["gmail.co", "gmail.com"],
  ["hotnail.com", "hotmail.com"],
  ["hotmai.com", "hotmail.com"],
  ["outlok.com", "outlook.com"],
  ["yaho.com", "yahoo.com"],
  ["yahoo.con", "yahoo.com"],
]);

export const validateEmailDomain = async (email) => {
  const domain = String(email || "").split("@")[1]?.toLowerCase();
  if (!domain) return { valid: false, reason: "Please enter a valid email address" };
  if (domain.length > 253 || domain.includes("..")) {
    return { valid: false, reason: "Please enter a valid email address" };
  }
  const suggestedDomain = COMMON_DOMAIN_TYPOS.get(domain);
  if (suggestedDomain) {
    return {
      valid: false,
      reason: `Did you mean @${suggestedDomain}?`,
    };
  }
  if (BLOCKED_DOMAINS.has(domain) || domain.endsWith(".invalid")) {
    return { valid: false, reason: "This email address is not valid or does not exist" };
  }

  try {
    const records = await dns.resolveMx(domain);
    if (!records.length) {
      return { valid: false, reason: "This email address is not valid or does not exist" };
    }
    return { valid: true };
  } catch (error) {
    return { valid: false, reason: "This email address is not valid or does not exist" };
  }
};
