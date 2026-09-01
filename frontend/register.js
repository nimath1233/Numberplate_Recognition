async function registerUser() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    try {

        const response = await fetch(
            API_URL + "/auth/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    password,
                    role
                })
            }
        );

        const data = await response.json();

        if (response.ok) {

            document.getElementById("message").innerHTML =
                "✅ Registration Successful! Redirecting to login...";

            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000);

        } else {

            document.getElementById("message").innerHTML =
                "❌ " + (data.detail || data.message);

        }

    } catch (error) {

        console.error(error);

        document.getElementById("message").innerHTML =
            "❌ Cannot connect to the server.";

    }

}