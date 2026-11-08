export const isReservedAdminEmail = (email) =>
  String(process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .includes(String(email || "").trim().toLowerCase());

export const hasAdminAccess = (user) =>
  user?.role === "admin" ||
  (user?.emailVerified === true && isReservedAdminEmail(user.email));
