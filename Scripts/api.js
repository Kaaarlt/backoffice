const API_BASE = "https://portfolio-api-three-black.vercel.app/api/v1";
const TOKEN_KEY = "authToken";
const USER_KEY = "user";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
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
  clearSession();
  location.replace("login.html");
  return false;
}

export function logout() {
  clearSession();
  location.replace("login.html");
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (auth) headers["auth-token"] = getToken();

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (auth && response.status === 401) logout();
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
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data;
}

export async function getProjects() {
  const data = await request("/projects", { auth: true });
  return Array.isArray(data) ? data : data?.projects ?? [];
}

export function getProjectById(id) {
  return request(`/projects/${id}`, { auth: true });
}

export function createProject(project) {
  return request("/projects", { method: "POST", body: project, auth: true });
}

export function updateProject(id, project) {
  return request(`/projects/${id}`, { method: "PUT", body: project, auth: true });
}

export function deleteProject(id) {
  return request(`/projects/${id}`, { method: "DELETE", auth: true });
}