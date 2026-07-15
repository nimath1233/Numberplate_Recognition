async function registerVehicle() {

    const token = localStorage.getItem("token");
    console.log("Token:", token);

    if (!token) {
        window.location.href = "index.html";
        return;
    }

    const plate_number = document.getElementById("plate_number").value;
    const owner_name = document.getElementById("owner_name").value;
    const owner_id = document.getElementById("owner_id").value;
    const vehicle_model = document.getElementById("vehicle_model").value;
    const vehicle_image = document.getElementById("vehicle_image").value;

    try {

        const response = await fetch(
            API_URL + "/vehicles",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },

                body: JSON.stringify({
                    plate_number,
                    owner_name,
                    owner_id,
                    vehicle_model,
                    vehicle_image
                })

            }
        );

        const data = await response.json();

        if (response.ok) {

            document.getElementById("message").innerHTML =
                "✅ Vehicle Registered Successfully";

        } else {

            document.getElementById("message").innerHTML =
                "❌ " + (data.detail || data.message);

        }

    } catch (error) {

        console.error(error);

        document.getElementById("message").innerHTML =
            "Cannot connect to server.";

    }

}