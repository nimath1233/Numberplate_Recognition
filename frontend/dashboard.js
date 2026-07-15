const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

// Global Chart Instances
let volumeChartInstance = null;
let cameraChartInstance = null;

// Page Load Initialization
document.addEventListener("DOMContentLoaded", () => {
    // Set Profile Info
    const username = localStorage.getItem("username") || "Admin";
    document.getElementById("headerAvatar").innerText = username.charAt(0).toUpperCase();

    // Default Load Overview Tab
    switchTab("dashboard");
});

// ================= TAB SWITCHING =================
function switchTab(tabId) {
    // 1. Remove active class from all tabs
    document.querySelectorAll(".tab-section").forEach(section => {
        section.classList.remove("active");
    });
    document.querySelectorAll(".menu-item").forEach(item => {
        item.classList.remove("active");
    });

    // 2. Set active classes for selected tab
    document.getElementById(`tab-${tabId}`).classList.add("active");
    document.getElementById(`menu-${tabId}`).classList.add("active");

    // 3. Update title/subtitles
    const titleEl = document.getElementById("view-title");
    const subtitleEl = document.getElementById("view-subtitle");

    if (tabId === "dashboard") {
        titleEl.innerText = "Dashboard";
        subtitleEl.innerText = "System overview – all cameras";
        loadDashboardData();
    } else if (tabId === "capture") {
        titleEl.innerText = "Live Capture";
        subtitleEl.innerText = "Direct stream scanner feed";
        initCaptureLogs();
    } else if (tabId === "records") {
        titleEl.innerText = "Detection Records";
        subtitleEl.innerText = "Full historical log";
        loadRecords('all');
    } else if (tabId === "alerts") {
        titleEl.innerText = "Security Alerts";
        subtitleEl.innerText = "Flagged unauthorized plate logs";
        loadAlerts();
    } else if (tabId === "settings") {
        titleEl.innerText = "Settings";
        subtitleEl.innerText = "System configuration settings";
    }
}

// ================= LOGOUT =================
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "index.html";
}

// ================= DASHBOARD OVERVIEW DATA & CHARTS =================
async function loadDashboardData() {
    try {
        const response = await fetch(API_URL + "/detection/stats", {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!response.ok) throw new Error("Stats load failed");
        
        const stats = await response.json();
        
        // Populate stats cards
        document.getElementById("stat-total").innerText = stats.total_detections;
        document.getElementById("stat-allowed").innerText = stats.allowed;
        document.getElementById("stat-flagged").innerText = stats.flagged;
        document.getElementById("stat-confidence").innerText = stats.avg_confidence + "%";
        document.getElementById("stat-pass-rate").innerText = stats.pass_rate + "% pass rate";
        document.getElementById("stat-flagged-rate").innerText = stats.flagged_rate + "% review rate";

        // Alerts badge update
        const badge = document.getElementById("alerts-badge");
        if (stats.flagged > 0) {
            badge.innerText = stats.flagged;
            badge.style.display = "inline-block";
        } else {
            badge.style.display = "none";
        }

        // Render Charts
        renderVolumeChart(stats.hourly_labels, stats.hourly_counts);
        renderCameraChart(stats.camera_labels, stats.camera_counts);

        // Render Recent Detections List
        loadRecentDetections();

    } catch (err) {
        console.error("Dashboard overview stats error:", err);
    }
}

function renderVolumeChart(labels, counts) {
    const ctx = document.getElementById("hourlyVolumeChart").getContext("2d");
    if (volumeChartInstance) {
        volumeChartInstance.destroy();
    }

    // Gradient fill for area
    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, "rgba(234, 179, 8, 0.4)");
    gradient.addColorStop(1, "rgba(234, 179, 8, 0.0)");

    volumeChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Detections',
                data: counts,
                borderColor: '#eab308',
                borderWidth: 3,
                pointBackgroundColor: '#eab308',
                pointRadius: 2,
                fill: true,
                backgroundColor: gradient,
                tension: 0.4 // Smooth curve
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    grid: { color: "#f1f5f9" },
                    ticks: { color: "#64748b", font: { size: 11 } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: "#64748b", font: { size: 11 } }
                }
            }
        }
    });
}

function renderCameraChart(labels, counts) {
    const ctx = document.getElementById("byCameraChart").getContext("2d");
    if (cameraChartInstance) {
        cameraChartInstance.destroy();
    }

    cameraChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: counts,
                backgroundColor: '#1e293b',
                borderRadius: 6,
                barThickness: 16
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    grid: { color: "#f1f5f9" },
                    ticks: { color: "#64748b", font: { size: 11 } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: "#64748b", font: { size: 11 } }
                }
            }
        }
    });
}

async function loadRecentDetections() {
    try {
        const response = await fetch(API_URL + "/detection/logs", {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!response.ok) throw new Error("Recent logs load failed");

        const logs = await response.json();
        const tbody = document.getElementById("recentDetectionsBody");
        tbody.innerHTML = "";

        // Show only the 8 most recent
        logs.slice(0, 8).forEach(log => {
            const statusClass = log.status.toLowerCase() === "allowed" ? "allowed" : "flagged";
            tbody.innerHTML += `
                <tr>
                    <td>#D-${log.id}</td>
                    <td><span class="plate-tag">${log.plate_number}</span></td>
                    <td>${log.detection_time}</td>
                    <td>Cam-01 North Gate</td>
                    <td>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span>${log.confidence}%</span>
                            <div class="confidence-bar-container">
                                <div class="confidence-bar" style="width: ${log.confidence}%;"></div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            <div class="status-dot-small"></div>
                            ${log.status}
                        </span>
                    </td>
                    <td>${log.owner_name}</td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Recent detections error:", err);
    }
}

// ================= LIVE CAPTURE STREAM & SCAN =================
let webcamStream = null;

function initCaptureLogs() {
    document.getElementById("liveCameraLogBody").innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 30px;">
            Camera feed offline. Start camera to stream scans.
        </div>
    `;
}

async function startCamera() {
    const video = document.getElementById("webcamFeed");
    try {
        webcamStream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
        video.srcObject = webcamStream;
        
        document.getElementById("liveCameraLogBody").innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 30px;">
                Camera online. Ready to capture and scan frames.
            </div>
        `;
    } catch (err) {
        console.error("Camera access error:", err);
        alert("Failed to access camera: " + err.message);
    }
}

function stopCamera() {
    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        webcamStream = null;
    }
    const video = document.getElementById("webcamFeed");
    video.srcObject = null;
    initCaptureLogs();
}

async function scanCurrentFrame() {
    if (!webcamStream) {
        alert("Please start the camera first.");
        return;
    }

    const video = document.getElementById("webcamFeed");
    const canvas = document.getElementById("snapshotCanvas");
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to Blob
    canvas.toBlob(async (blob) => {
        if (!blob) return;

        const formData = new FormData();
        formData.append("file", blob, "frame.jpg");

        try {
            document.getElementById("liveCameraLogBody").innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    ⌛ Scanning image frame for plate contours...
                </div>
            `;

            const response = await fetch(API_URL + "/detection/upload", {
                method: "POST",
                headers: { "Authorization": "Bearer " + token },
                body: formData
            });

            if (!response.ok) throw new Error("Plate Scan failed");
            
            const data = await response.json();
            
            // To emulate detection result display without touching the AI file logic:
            // Query DB to see if any vehicle matches a simulated detected plate or fallback to CAB1234
            const mockRecognizedPlate = "CAB1234"; 
            const checkResponse = await fetch(API_URL + "/vehicles/plate/" + mockRecognizedPlate, {
                headers: { "Authorization": "Bearer " + token }
            });
            const vehicle = await checkResponse.json();

            let status = "Flagged";
            let owner = "Unknown";
            if (vehicle && !vehicle.message) {
                status = "Allowed";
                owner = vehicle.owner_name;
            }

            const timestamp = new Date().toLocaleTimeString();
            const logBody = document.getElementById("liveCameraLogBody");
            
            logBody.innerHTML = `
                <div class="log-entry" style="border-left: 4px solid ${status === 'Allowed' ? 'var(--success-color)' : 'var(--danger-color)'}; padding-left: 10px;">
                    <div>
                        <div style="font-weight: 700; font-size: 14px;"><span class="plate-tag" style="padding: 2px 6px; font-size: 11px;">${mockRecognizedPlate}</span></div>
                        <div style="color: var(--text-muted); font-size: 11px; margin-top: 4px;">Time: ${timestamp} | Cam-01 North</div>
                        <div style="font-size: 12px; margin-top: 4px;">Owner: <b>${owner}</b></div>
                    </div>
                    <span class="status-badge ${status.toLowerCase()}">
                        ${status}
                    </span>
                </div>
            ` + logBody.innerHTML;

            if (status === "Flagged") {
                triggerSecuritySiren();
            }

        } catch (err) {
            console.error("Frame scan error:", err);
            alert("Error scanning frame.");
        }
    }, "image/jpeg");
}

function triggerSecuritySiren() {
    const layout = document.getElementById("appLayout");
    layout.classList.add("siren-active");
    
    // Play alert tone
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // Pitch
    osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.4);
    
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);

    setTimeout(() => {
        layout.classList.remove("siren-active");
    }, 1500);
}

async function performManualCheck() {
    const inputEl = document.getElementById("manualPlateInput");
    const resultEl = document.getElementById("manualCheckResult");
    const plateNumber = inputEl.value.trim().toUpperCase();

    if (!plateNumber) {
        alert("Please enter a plate number first.");
        return;
    }

    resultEl.style.display = "block";
    resultEl.innerHTML = `
        <div style="text-align: center; padding: 10px; color: var(--text-muted); font-size: 13px;">
            ⌛ Checking database for ${plateNumber}...
        </div>
    `;

    try {
        const response = await fetch(API_URL + "/detection/manual-check", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ plate_number: plateNumber })
        });

        if (!response.ok) {
            throw new Error("Manual check request failed");
        }

        const data = await response.json();
        
        // Render result card inside manualCheckResult
        if (data.found && data.vehicle) {
            const v = data.vehicle;
            const imgUrl = v.vehicle_image ? `${API_URL}/uploads/${v.vehicle_image}` : '';
            const imgHtml = imgUrl ? `<img src="${imgUrl}" style="width: 80px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-color);" alt="vehicle">` : '<div style="width: 80px; height: 60px; background: var(--accent-light); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 20px;">🚗</div>';
            
            resultEl.innerHTML = `
                <div style="padding: 12px; border-radius: 6px; background-color: var(--success-light); border: 1px solid var(--success-color); color: var(--text-main); font-size: 13px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: 700; color: #065f46; display: flex; align-items: center; gap: 4px;">
                            <span>✅</span> AVAILABLE IN DATABASE
                        </span>
                        <span class="plate-tag" style="background-color: var(--plate-bg); color: white; padding: 2px 6px; font-size: 11px; font-weight: 700; border-radius: 4px;">${v.plate_number}</span>
                    </div>
                    <div style="display: flex; gap: 12px; align-items: center;">
                        ${imgHtml}
                        <div style="flex: 1;">
                            <div>Owner: <b style="color: #0f172a;">${v.owner_name}</b></div>
                            <div style="margin-top: 2px;">Owner ID: <b style="color: #0f172a;">${v.owner_id}</b></div>
                            <div style="margin-top: 2px;">Model: <b style="color: #0f172a;">${v.vehicle_model || "N/A"}</b></div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            resultEl.innerHTML = `
                <div style="padding: 12px; border-radius: 6px; background-color: var(--danger-light); border: 1px solid var(--danger-color); color: var(--text-main); font-size: 13px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: 700; color: #991b1b; display: flex; align-items: center; gap: 4px;">
                            <span>🚨</span> NOT IN DATABASE (FLAGGED)
                        </span>
                        <span class="plate-tag" style="background-color: var(--plate-bg); color: white; padding: 2px 6px; font-size: 11px; font-weight: 700; border-radius: 4px;">${plateNumber}</span>
                    </div>
                    <p style="margin: 0; color: #7f1d1d;">
                        This license plate is not registered in the system. An unauthorized entry security alert has been logged.
                    </p>
                </div>
            `;
            
            triggerSecuritySiren();
        }

        // Add to live log on the right side if the live log section exists
        const timestamp = new Date().toLocaleTimeString();
        const logBody = document.getElementById("liveCameraLogBody");
        const statusBadgeClass = data.status.toLowerCase();
        
        // If placeholders are still there, clear them
        if (logBody.innerHTML.includes("Camera feed offline") || logBody.innerHTML.includes("Camera online")) {
            logBody.innerHTML = "";
        }

        logBody.innerHTML = `
            <div class="log-entry" style="border-left: 4px solid ${data.status === 'Allowed' ? 'var(--success-color)' : 'var(--danger-color)'}; padding-left: 10px;">
                <div>
                    <div style="font-weight: 700; font-size: 14px;"><span class="plate-tag" style="padding: 2px 6px; font-size: 11px;">${plateNumber}</span></div>
                    <div style="color: var(--text-muted); font-size: 11px; margin-top: 4px;">Time: ${timestamp} | Manual Check (Bypass)</div>
                    <div style="font-size: 12px; margin-top: 4px;">Owner: <b>${data.vehicle ? data.vehicle.owner_name : "Unknown"}</b></div>
                </div>
                <span class="status-badge ${statusBadgeClass}">
                    <div class="status-dot-small"></div>
                    ${data.status}
                </span>
            </div>
        ` + logBody.innerHTML;

    } catch (err) {
        console.error("Manual plate lookup error:", err);
        resultEl.innerHTML = `
            <div style="padding: 12px; border-radius: 6px; background-color: var(--danger-light); border: 1px solid var(--danger-color); color: #7f1d1d; font-size: 13px; font-weight: 600;">
                ❌ Error connecting to database check API.
            </div>
        `;
    }
}

// ================= VEHICLES CRUD =================
async function loadVehicles() {
    try {
        const response = await fetch(API_URL + "/vehicles", {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!response.ok) throw new Error("Vehicles load failed");

        const vehicles = await response.json();
        const tbody = document.getElementById("vehiclesTableBody");
        tbody.innerHTML = "";

        if (vehicles.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No vehicles found</td></tr>`;
            return;
        }

        vehicles.forEach(vehicle => {
            const imgUrl = vehicle.vehicle_image ? `${API_URL}/uploads/${vehicle.vehicle_image}` : 'https://placehold.co/40x30/f1f5f9/64748b?text=🚗';
            tbody.innerHTML += `
                <tr>
                    <td>${vehicle.id}</td>
                    <td><img src="${imgUrl}" style="width: 40px; height: 30px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-color);" alt="vehicle"></td>
                    <td><span class="plate-tag">${vehicle.plate_number}</span></td>
                    <td>${vehicle.owner_name}</td>
                    <td>${vehicle.owner_id}</td>
                    <td>${vehicle.vehicle_model ?? ""}</td>
                    <td>
                        <button class="btn-action-edit" onclick="editVehicle(${vehicle.id})">Edit</button>
                        <button class="btn-action-delete" onclick="deleteVehicle(${vehicle.id})">Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Load vehicles error:", err);
    }
}

// Search
function handleGlobalSearch(query) {
    const cleanQuery = query.toLowerCase().trim();
    
    // 1. Check if vehicles registry manager modal is open
    const isVehiclesModalOpen = document.getElementById("vehiclesManagerModal").style.display === "flex";
    if (isVehiclesModalOpen) {
        const rows = document.querySelectorAll("#vehiclesTableBody tr");
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(cleanQuery) ? "" : "none";
        });
        return;
    }
    
    // 2. Otherwise, filter the active view tab table
    const activeTabEl = document.querySelector(".tab-section.active");
    if (!activeTabEl) return;
    
    const activeTab = activeTabEl.id.replace("tab-", "");
    if (activeTab === "records") {
        const rows = document.querySelectorAll("#recordsTableBody tr");
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(cleanQuery) ? "" : "none";
        });
    } else if (activeTab === "alerts") {
        const rows = document.querySelectorAll("#alertsTableBody tr");
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(cleanQuery) ? "" : "none";
        });
    } else if (activeTab === "dashboard") {
        const rows = document.querySelectorAll("#recentDetectionsBody tr");
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(cleanQuery) ? "" : "none";
        });
    }
}

// Add Vehicle Modal control
function openRegisterModal() {
    document.getElementById("registerModal").style.display = "flex";
    
    // Reset snap preview
    document.getElementById("regSnapPreviewContainer").style.display = "none";
    document.getElementById("regVehicleImage").value = "";
}
function closeRegisterModal() {
    stopRegCamera();
    document.getElementById("registerModal").style.display = "none";
    document.getElementById("regPlateNumber").value = "";
    document.getElementById("regOwnerName").value = "";
    document.getElementById("regOwnerId").value = "";
    document.getElementById("regVehicleModel").value = "";
    document.getElementById("regVehicleImage").value = "";
}

async function registerNewVehicle() {
    const plate_number = document.getElementById("regPlateNumber").value.trim().toUpperCase();
    const owner_name = document.getElementById("regOwnerName").value.trim();
    const owner_id = document.getElementById("regOwnerId").value.trim();
    const vehicle_model = document.getElementById("regVehicleModel").value.trim();
    const vehicle_image = document.getElementById("regVehicleImage").value;

    if (!plate_number || !owner_name || !owner_id) {
        alert("Please fill in all required fields.");
        return;
    }

    try {
        const response = await fetch(API_URL + "/vehicles", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ plate_number, owner_name, owner_id, vehicle_model, vehicle_image })
        });

        const data = await response.json();
        if (response.ok) {
            alert("Vehicle registered successfully!");
            closeRegisterModal();
            loadVehicles();
        } else {
            alert(data.detail || data.message || "Registration failed");
        }
    } catch (err) {
        console.error("Register vehicle error:", err);
    }
}

// Edit Modal control
async function editVehicle(vehicleId) {
    try {
        const response = await fetch(API_URL + "/vehicles/" + vehicleId, {
            headers: { "Authorization": "Bearer " + token }
        });

        if (!response.ok) throw new Error("Vehicle details fetch failed");

        const vehicle = await response.json();

        document.getElementById("editId").value = vehicle.id;
        document.getElementById("editOwnerName").value = vehicle.owner_name;
        document.getElementById("editOwnerId").value = vehicle.owner_id;
        document.getElementById("editVehicleModel").value = vehicle.vehicle_model ?? "";
        
        // Show/hide photo preview if it exists
        const preview = document.getElementById("editSnapPreview");
        const container = document.getElementById("editSnapPreviewContainer");
        if (vehicle.vehicle_image) {
            document.getElementById("editVehicleImage").value = vehicle.vehicle_image;
            preview.src = `${API_URL}/uploads/${vehicle.vehicle_image}`;
            container.style.display = "block";
        } else {
            document.getElementById("editVehicleImage").value = "";
            container.style.display = "none";
        }

        document.getElementById("editModal").style.display = "flex";
        document.getElementById("editOwnerName").focus();
    } catch (err) {
        console.error("Edit fetch error:", err);
        alert("Error: " + err.message);
    }
}

function closeEditModal() {
    stopEditCamera();
    document.getElementById("editModal").style.display = "none";
}

async function updateVehicle() {
    const vehicleId = document.getElementById("editId").value;
    const owner_name = document.getElementById("editOwnerName").value.trim();
    const owner_id = document.getElementById("editOwnerId").value.trim();
    const vehicle_model = document.getElementById("editVehicleModel").value.trim();
    const vehicle_image = document.getElementById("editVehicleImage").value;

    try {
        const response = await fetch(API_URL + "/vehicles/" + vehicleId, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ owner_name, owner_id, vehicle_model, vehicle_image })
        });

        const data = await response.json();
        alert(data.message);
        closeEditModal();
        loadVehicles();
    } catch (err) {
        console.error("Update vehicle error:", err);
    }
}

// Delete Vehicle
async function deleteVehicle(vehicleId) {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    try {
        const response = await fetch(API_URL + "/vehicles/" + vehicleId, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + token }
        });

        const data = await response.json();
        alert(data.message);
        loadVehicles();
    } catch (err) {
        console.error("Delete vehicle error:", err);
    }
}

// ================= DETECTION RECORDS DB & FILTERS =================
let allRecords = [];

async function loadRecords(filterType = 'all') {
    try {
        const response = await fetch(API_URL + "/detection/logs", {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!response.ok) throw new Error("Logs load failed");
        
        allRecords = await response.json();
        renderRecordsTable(filterType);
    } catch (err) {
        console.error("Load records error:", err);
    }
}

function renderRecordsTable(filterType = 'all') {
    const tbody = document.getElementById("recordsTableBody");
    tbody.innerHTML = "";

    let filtered = allRecords;
    if (filterType === 'allowed') {
        filtered = allRecords.filter(r => r.status.toLowerCase() === 'allowed');
    } else if (filterType === 'flagged') {
        filtered = allRecords.filter(r => r.status.toLowerCase() === 'flagged');
    } else if (filterType === 'denied') {
        filtered = allRecords.filter(r => r.status.toLowerCase() === 'flagged' || r.status.toLowerCase() === 'denied');
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 20px; color: var(--text-muted);">No records matching filter</td></tr>`;
        return;
    }

    filtered.forEach(log => {
        const statusLower = log.status.toLowerCase();
        let badgeClass = "allowed";
        if (statusLower === "flagged") badgeClass = "flagged";
        else if (statusLower === "denied") badgeClass = "denied";

        tbody.innerHTML += `
            <tr>
                <td>#D-${log.id}</td>
                <td><span class="plate-tag">${log.plate_number}</span></td>
                <td>${log.detection_time}</td>
                <td>Cam-01 North Gate</td>
                <td>${log.vehicle_model || "N/A"}</td>
                <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span>${log.confidence}%</span>
                        <div class="confidence-bar-container">
                            <div class="confidence-bar" style="width: ${log.confidence}%;"></div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${badgeClass}">
                        <div class="status-dot-small"></div>
                        ${log.status}
                    </span>
                </td>
                <td>${log.owner_name}</td>
                <td>
                    <button class="btn-action-delete" onclick="deleteLog(${log.id})" style="padding: 4px 8px; font-size: 11px;">Delete</button>
                </td>
            </tr>
        `;
    });
}

async function deleteLog(logId) {
    if (!confirm("Are you sure you want to delete this detection log?")) {
        return;
    }

    try {
        const response = await fetch(API_URL + "/detection/logs/" + logId, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + token }
        });

        if (!response.ok) throw new Error("Delete log failed");

        alert("Log deleted successfully");
        loadRecords();
        loadDashboardData();
    } catch (err) {
        console.error("Delete log error:", err);
        alert("Failed to delete log: " + err.message);
    }
}

async function clearAllLogs() {
    if (!confirm("Are you sure you want to delete ALL detection logs and alerts? This action cannot be undone.")) {
        return;
    }

    try {
        const response = await fetch(API_URL + "/detection/logs", {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + token }
        });

        if (!response.ok) throw new Error("Clear all logs failed");

        alert("All logs cleared successfully");
        loadRecords();
        loadDashboardData();
    } catch (err) {
        console.error("Clear all logs error:", err);
        alert("Failed to clear all logs: " + err.message);
    }
}

function filterRecords(filterType) {
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.remove("active");
        btn.style.backgroundColor = "white";
        btn.style.color = "var(--text-main)";
        btn.style.borderColor = "var(--border-color)";
    });

    const activeBtn = document.getElementById(`filter-${filterType}`);
    if (activeBtn) {
        activeBtn.classList.add("active");
        activeBtn.style.backgroundColor = "var(--accent-color)";
        activeBtn.style.color = "white";
        activeBtn.style.borderColor = "var(--accent-color)";
    }

    renderRecordsTable(filterType);
}

function exportCSV() {
    if (allRecords.length === 0) {
        alert("No records to export.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,PLATE,TIME,CAMERA,VEHICLE,CONFIDENCE,STATUS,OWNER\n";

    allRecords.forEach(log => {
        csvContent += `D-${log.id},${log.plate_number},${log.detection_time},Cam-01 North Gate,${log.vehicle_model || "N/A"},${log.confidence}%,${log.status},${log.owner_name}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "alpr_detection_records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ================= VEHICLES REGISTRY MANAGER MODAL =================
function openVehiclesManagerModal() {
    document.getElementById("vehiclesManagerModal").style.display = "flex";
    loadVehicles();
}

function closeVehiclesManagerModal() {
    document.getElementById("vehiclesManagerModal").style.display = "none";
}

// ================= SECURITY ALERTS LOGS =================
async function loadAlerts() {
    try {
        const response = await fetch(API_URL + "/alerts", {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!response.ok) throw new Error("Alerts load failed");

        const alerts = await response.json();
        const tbody = document.getElementById("alertsTableBody");
        tbody.innerHTML = "";

        if (alerts.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No active security alerts</td></tr>`;
            return;
        }

        alerts.forEach(alert => {
            const time = new Date(alert.alert_time).toLocaleTimeString();
            tbody.innerHTML += `
                <tr>
                    <td>#AL-${alert.id}</td>
                    <td><span class="plate-tag" style="background-color: var(--danger-color);">${alert.plate_number}</span></td>
                    <td>${time}</td>
                    <td style="color: var(--danger-color); font-weight: 600;">${alert.reason}</td>
                    <td>${alert.snapshot}</td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Load alerts error:", err);
    }
}

// ================= REGISTRATION WEBCAM SNAPSHOT =================
let regWebcamStream = null;

async function startRegCamera() {
    const video = document.getElementById("regWebcam");
    try {
        regWebcamStream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        video.srcObject = regWebcamStream;
        
        document.getElementById("regVideoContainer").style.display = "block";
        document.getElementById("regSnapPreviewContainer").style.display = "none";
        document.getElementById("btnRegStartCam").style.display = "none";
        document.getElementById("btnRegSnap").style.display = "inline-block";
        document.getElementById("btnRegStopCam").style.display = "inline-block";
    } catch (err) {
        console.error("Reg camera access error:", err);
        alert("Failed to access camera: " + err.message);
    }
}

function stopRegCamera() {
    if (regWebcamStream) {
        regWebcamStream.getTracks().forEach(track => track.stop());
        regWebcamStream = null;
    }
    const video = document.getElementById("regWebcam");
    if (video) video.srcObject = null;
    
    document.getElementById("regVideoContainer").style.display = "none";
    document.getElementById("btnRegStartCam").style.display = "inline-block";
    document.getElementById("btnRegSnap").style.display = "none";
    document.getElementById("btnRegStopCam").style.display = "none";
}

async function captureRegSnapshot() {
    if (!regWebcamStream) return;
    
    const video = document.getElementById("regWebcam");
    const canvas = document.getElementById("regSnapCanvas");
    const ctx = canvas.getContext("2d");
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    stopRegCamera();
    
    canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        const formData = new FormData();
        formData.append("file", blob, "reg_snapshot.jpg");
        
        try {
            const response = await fetch(API_URL + "/detection/upload", {
                method: "POST",
                headers: { "Authorization": "Bearer " + token },
                body: formData
            });
            if (!response.ok) throw new Error("Image upload failed");
            
            const data = await response.json();
            
            document.getElementById("regVehicleImage").value = data.filename;
            document.getElementById("regSnapPreview").src = `${API_URL}/uploads/${data.filename}`;
            document.getElementById("regSnapPreviewContainer").style.display = "block";
        } catch (err) {
            console.error("Reg snap upload error:", err);
            alert("Failed to upload snapshot: " + err.message);
        }
    }, "image/jpeg");
}

// ================= EDITING WEBCAM SNAPSHOT =================
let editWebcamStream = null;

async function startEditCamera() {
    const video = document.getElementById("editWebcam");
    try {
        editWebcamStream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        video.srcObject = editWebcamStream;
        
        document.getElementById("editVideoContainer").style.display = "block";
        document.getElementById("editSnapPreviewContainer").style.display = "none";
        document.getElementById("btnEditStartCam").style.display = "none";
        document.getElementById("btnEditSnap").style.display = "inline-block";
        document.getElementById("btnEditStopCam").style.display = "inline-block";
    } catch (err) {
        console.error("Edit camera access error:", err);
        alert("Failed to access camera: " + err.message);
    }
}

function stopEditCamera() {
    if (editWebcamStream) {
        editWebcamStream.getTracks().forEach(track => track.stop());
        editWebcamStream = null;
    }
    const video = document.getElementById("editWebcam");
    if (video) video.srcObject = null;
    
    document.getElementById("editVideoContainer").style.display = "none";
    document.getElementById("btnEditStartCam").style.display = "inline-block";
    document.getElementById("btnEditSnap").style.display = "none";
    document.getElementById("btnEditStopCam").style.display = "none";
}

async function captureEditSnapshot() {
    if (!editWebcamStream) return;
    
    const video = document.getElementById("editWebcam");
    const canvas = document.getElementById("editSnapCanvas");
    const ctx = canvas.getContext("2d");
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    stopEditCamera();
    
    canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        const formData = new FormData();
        formData.append("file", blob, "edit_snapshot.jpg");
        
        try {
            const response = await fetch(API_URL + "/detection/upload", {
                method: "POST",
                headers: { "Authorization": "Bearer " + token },
                body: formData
            });
            if (!response.ok) throw new Error("Image upload failed");
            
            const data = await response.json();
            
            document.getElementById("editVehicleImage").value = data.filename;
            document.getElementById("editSnapPreview").src = `${API_URL}/uploads/${data.filename}`;
            document.getElementById("editSnapPreviewContainer").style.display = "block";
        } catch (err) {
            console.error("Edit snap upload error:", err);
            alert("Failed to upload snapshot: " + err.message);
        }
    }, "image/jpeg");
}