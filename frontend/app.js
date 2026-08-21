async function login() {

    try {

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        console.log("Username:", username);
        console.log("Password:", password);

        const response = await fetch(API_URL + "/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        console.log("Status:", response.status);

        const data = await response.json();

        console.log("Response:", data);
        if (response.ok && data.access_token) {
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("username", data.username || username);
            localStorage.setItem("role", data.role || "user");
            document.getElementById("message").style.color = "var(--success-color, #10b981)";
            document.getElementById("message").innerHTML = "✅ Login Successful";
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 500);
        } else {
            const errMsg = data.detail || data.message || "Invalid username or password";
            document.getElementById("message").style.color = "var(--danger-color, #ef4444)";
            document.getElementById("message").innerHTML = "❌ " + errMsg;
        }
    }

    catch (error) {
        console.error("Login error:", error);
        document.getElementById("message").innerHTML = "❌ Login failed";
    }
}

// Check for expired session query parameter and display message
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("expired") === "true") {
        const messageEl = document.getElementById("message");
        if (messageEl) {
            messageEl.style.color = "var(--danger-color, #ef4444)";
            messageEl.innerHTML = "⚠️ Session expired. Please log in again.";
        }
    }
});