const API_URL = "http://127.0.0.1:8000";

console.log("api.js loaded");

// Global fetch interceptor to handle 401 Unauthorized (token expiration)
const originalFetch = window.fetch;
window.fetch = async function (...args) {
    const response = await originalFetch(...args);
    if (response.status === 401) {
        const path = window.location.pathname.toLowerCase();
        const isLoginPage = path.endsWith("index.html") || path === "/" || path === "";
        if (!isLoginPage) {
            localStorage.removeItem("token");
            window.location.href = "index.html?expired=true";
        }
    }
    return response;
};