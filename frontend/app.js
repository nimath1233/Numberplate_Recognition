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
if (data.access_token) {

    localStorage.setItem(
        "token",
        data.access_token
    );

    document.getElementById("message").innerHTML =
        "✅ Login Successful";

    setTimeout(() => {
        window.location.href = "dashboard.html";
    }, 1000);

}
    }

    catch (error) {
        console.error("Login error:", error);
        document.getElementById("message").innerHTML = "❌ Login failed";
    }
}