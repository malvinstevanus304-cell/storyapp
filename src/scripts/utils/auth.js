// src/scripts/utils/auth.js
export function getToken() {
  return localStorage.getItem('api_token') || null;
}

export function setToken(token) {
  localStorage.setItem('api_token', token);
}

export function clearToken() {
  localStorage.removeItem('api_token');
}
