const token = localStorage.getItem("token");

if (!token) {

    window.location.href = "index.html";

}

document.getElementById("welcome").innerHTML =
    "Welcome to the ANPR System";

function logout() {

    localStorage.removeItem("token");

    window.location.href = "index.html";

}