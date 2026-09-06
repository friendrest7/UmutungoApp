const defaultBackendUrl = "http://localhost:8080";

export function getBackendUrl() {
  return (process.env.BACKEND_API_URL || defaultBackendUrl).replace(/\/$/, "");
}