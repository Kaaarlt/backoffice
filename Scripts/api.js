const API_BASE = "https://portfolio-api-three-black.vercel.app/api/v1";
const TOKEN_KEY = "authToken";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function isTokenValid(token) {
  if (!token) return false;
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    return !payload.exp || payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function requireAuth() {
  if (isTokenValid(getToken())) return true;
  localStorage.removeItem(TOKEN_KEY);
  location.replace("login.html");
  return false;
}

async function request(path, { method = "GET", body } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Ocurrió un error, intenta de nuevo");
  }
  return data;
}

export function register(user) {
  return request("/auth/register", { method: "POST", body: user });
}

export async function login({ email, password }) {
  const data = await request("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  localStorage.setItem(TOKEN_KEY, data.token);
  return data;
}