const API_URL = (typeof window !== "undefined" && window.location && window.location.hostname)
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : "http://127.0.0.1:8000";

console.log("api.js loaded");

// Global fetch interceptor to handle 401 Unauthorized (token expiration) and network failures
const originalFetch = window.fetch;
window.fetch = async function (...args) {
    try {
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
    } catch (err) {
        if (err instanceof TypeError && (err.message.includes("fetch") || err.message.includes("NetworkError") || err.message.includes("Failed"))) {
            console.error("Backend connection error:", err);
            throw new Error(`Unable to connect to backend server (${API_URL}). Please make sure the Python FastAPI backend server is running.`);
        }
        throw err;
    }
};

// Admin API client methods
const adminAPI = {
    async getUsers() {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/admin/users`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    },

    async createUser(userData) {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/admin/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    },

    async updateUser(userId, updateData) {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/admin/users/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    },

    async deleteUser(userId) {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/admin/users/${userId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    },

    async getAnalytics() {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/admin/analytics`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    },

    async getAuditLogs() {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/admin/audit-logs`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    },

    async getCameras() {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/admin/cameras`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    },

    async addCamera(camData) {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/admin/cameras`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(camData)
        });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    },

    async updateCamera(camId, camData) {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/admin/cameras/${camId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(camData)
        });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    },

    async adminSearch(searchParams) {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/admin/search`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(searchParams)
        });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    },

    async initParkingSlots() {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/parking/create-slots`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    },

    async addParkingSlot(slotName) {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/parking/add-slot?slot_name=${encodeURIComponent(slotName)}`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    },

    async resetParkingSlot(slotId) {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/parking/reset-slot/${slotId}`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    },

    async getAIEngineStatus() {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/admin/ai-engine/status`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    },

    async updateAIEngineConfig(configPayload) {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/admin/ai-engine/config`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(configPayload)
        });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    }
};

