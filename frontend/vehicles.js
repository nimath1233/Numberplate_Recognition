const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}


// ================= LOAD ALL VEHICLES =================

async function loadVehicles() {

    try {

        const response = await fetch(
            API_URL + "/vehicles",
            {
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );


        if (!response.ok) {
            throw new Error("Failed to load vehicles");
        }


        const vehicles = await response.json();


        displayVehicles(vehicles);


    } catch(error) {

        console.log(error);

        alert("Failed to load vehicles.");

    }

}



// ================= DISPLAY VEHICLES =================

function displayVehicles(vehicles) {


    const tableBody = document.getElementById("vehicleBody");

    tableBody.innerHTML = "";


    if (vehicles.length === 0) {

        tableBody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align:center;">
                No vehicles found
            </td>
        </tr>
        `;

        return;
    }



    vehicles.forEach(vehicle => {


        tableBody.innerHTML += `

        <tr>

            <td>${vehicle.id}</td>

            <td>${vehicle.plate_number}</td>

            <td>${vehicle.owner_name}</td>

            <td>${vehicle.owner_id}</td>

            <td>${vehicle.vehicle_model ?? ""}</td>


            <td>

                <button onclick="editVehicle(${vehicle.id})">
                    Edit
                </button>


                <button onclick="deleteVehicle(${vehicle.id})">
                    Delete
                </button>


            </td>


        </tr>

        `;


    });


}



// ================= EDIT VEHICLE =================

async function editVehicle(vehicleId) {


    try {


        const response = await fetch(

            API_URL + "/vehicles/" + vehicleId,

            {
                headers:{
                    "Authorization":"Bearer " + token
                }
            }

        );



        if(!response.ok){

            throw new Error("Vehicle not found");

        }



        const vehicle = await response.json();



        document.getElementById("editId").value = vehicle.id;

        document.getElementById("editOwnerName").value =
            vehicle.owner_name;


        document.getElementById("editOwnerId").value =
            vehicle.owner_id;


        document.getElementById("editVehicleModel").value =
            vehicle.vehicle_model ?? "";



    }


    catch(error){

        console.log(error);

        alert("Failed to load vehicle details");

    }



}





// ================= SEARCH VEHICLE =================

async function searchVehicle() {


    const plate =
        document.getElementById("searchPlate")
        .value
        .trim();



    if(plate === ""){


        alert("Please enter a plate number.");

        return;

    }



    try{


        const response = await fetch(

            API_URL + "/vehicles/" + plate,

            {

                headers:{
                    "Authorization":"Bearer " + token
                }

            }

        );



        const vehicle = await response.json();



        const tableBody =
            document.getElementById("vehicleBody");



        tableBody.innerHTML = "";




        if(vehicle.message){


            tableBody.innerHTML = `

            <tr>

                <td colspan="6" style="text-align:center;">

                    Vehicle Not Found

                </td>


            </tr>

            `;


            return;

        }




        tableBody.innerHTML = `

        <tr>

            <td>${vehicle.id}</td>

            <td>${vehicle.plate_number}</td>

            <td>${vehicle.owner_name}</td>

            <td>${vehicle.owner_id}</td>

            <td>${vehicle.vehicle_model ?? ""}</td>


            <td>

                <button onclick="editVehicle(${vehicle.id})">
                    Edit
                </button>


                <button onclick="deleteVehicle(${vehicle.id})">
                    Delete
                </button>


            </td>


        </tr>


        `;



    }


    catch(error){


        console.log(error);

        alert("Error searching vehicle.");


    }



}





// ================= DELETE VEHICLE =================


async function deleteVehicle(vehicleId){


    const confirmDelete =
        confirm("Are you sure you want to delete this vehicle?");



    if(!confirmDelete){

        return;

    }



    try{


        const response = await fetch(

            API_URL + "/vehicles/" + vehicleId,

            {

                method:"DELETE",

                headers:{

                    "Authorization":"Bearer " + token

                }

            }

        );



        const data = await response.json();



        alert(data.message);



        loadVehicles();



    }


    catch(error){


        console.log(error);

        alert("Failed to delete vehicle.");

    }



}






// ================= UPDATE VEHICLE =================


async function updateVehicle(){



    const vehicleId =
        document.getElementById("editId").value;



    const owner_name =
        document.getElementById("editOwnerName").value;



    const owner_id =
        document.getElementById("editOwnerId").value;



    const vehicle_model =
        document.getElementById("editVehicleModel").value;





    try{



        const response = await fetch(

            API_URL + "/vehicles/" + vehicleId,

            {

                method:"PUT",


                headers:{

                    "Content-Type":"application/json",

                    "Authorization":"Bearer " + token

                },


                body:JSON.stringify({

                    owner_name,

                    owner_id,

                    vehicle_model

                })


            }

        );




        const data = await response.json();



        alert(data.message);



        loadVehicles();




        document.getElementById("editId").value = "";

        document.getElementById("editOwnerName").value = "";

        document.getElementById("editOwnerId").value = "";

        document.getElementById("editVehicleModel").value = "";



    }


    catch(error){


        console.log(error);

        alert("Update failed.");

    }


}




// LOAD DATA WHEN PAGE OPENS

loadVehicles();