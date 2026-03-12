export function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function getStoredToken() {
  return localStorage.getItem("token");
}

export function setStoredToken(token) {
  localStorage.setItem("token", token);
}

export function clearStoredToken() {
  localStorage.removeItem("token");
}

export function getRolesFromToken(token) {
  const payload = parseJwt(token);
  if (!payload) return [];

  const roles =
    payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    payload["role"] ||
    payload["roles"] ||
    [];

  return Array.isArray(roles) ? roles : [roles];
}

export function hasRole(roles, roleName) {
  return roles.includes("admin") || roles.includes(roleName);
}