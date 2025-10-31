export function getAuthHeader() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("Token");
  return token ? { Authorization: token } : {};
}