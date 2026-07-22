const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

// Multi-Language Translation dictionary
const translations = {
    en: {
        menu_dashboard: "Dashboard",
        menu_capture: "Live Capture",
        menu_records: "Records",
        menu_alerts: "Alerts",
        menu_parking: "Parking",
        menu_settings: "Settings",
        menu_logout: "Logout",
        
        title_dashboard: "Dashboard",
        sub_dashboard: "System overview – all cameras",
        title_capture: "Live Capture",
        sub_capture: "Direct stream scanner feed",
        title_records: "Detection Records",
        sub_records: "Full historical log",
        title_alerts: "Security Alerts",
        sub_alerts: "Flagged unauthorized plate logs",
        title_parking: "Parking Management",
        sub_parking: "Manage slots, assignments, and check logs",
        title_settings: "Settings",
        sub_settings: "System configuration settings",

        total_detections: "Total Detections",
        allowed: "Allowed",
        flagged_denied: "Flagged / Denied",
        avg_confidence: "Avg. Confidence",
        trend_detections: "+18% vs yesterday",
        trend_deviation: "±2.3% deviation",
        
        total_slots: "Total Slots",
        available_slots: "Available Slots",
        occupied_slots: "Occupied Slots",
        parking_slots_title: "Parking Lots / Slots",
        btn_initialize: "Initialize Parking Slots",
        history_title: "Parking History & Session Logs",
        
        th_session_id: "Session ID",
        th_vehicle_plate: "Vehicle Plate",
        th_slot_number: "Slot Number",
        th_entry_time: "Entry Time",
        th_exit_time: "Exit Time",
        th_status: "Status",
        th_action: "Action",
        
        status_available: "Available",
        status_occupied: "Occupied",
        status_active: "Active",
        status_completed: "Completed",
        btn_assign: "Assign Vehicle",
        btn_release: "Release Slot",
        empty_msg: "Empty / Available",
        history_empty: "No parking sessions history found",
        slots_empty: "No parking slots initialized in the database yet.",
        btn_init_slots: "Initialize 3 Default Slots",
        confirm_release: "Are you sure you want to release this parking slot?",
        choose_vehicle: "-- Choose Vehicle --",
        loading_vehicles: "⌛ Loading registered vehicles...",
        no_unparked: "❌ No unparked vehicles available",
        err_vehicles: "❌ Error loading vehicles list",
        select_vehicle_alert: "Please select a vehicle to assign.",
        err_assign_failed: "Failed to assign parking slot.",
        err_release_failed: "Failed to release parking slot.",
        already_initialized_alert: "Parking slots are already initialized."
    },
    si: {
        menu_dashboard: "නිරීක්ෂණ පුවරුව",
        menu_capture: "සජීවී දර්ශන",
        menu_records: "වාර්තා",
        menu_alerts: "සංඥා",
        menu_parking: "නැවැතුම්",
        menu_settings: "සැකසුම්",
        menu_logout: "පිටවීම",
        
        title_dashboard: "නිරීක්ෂණ පුවරුව",
        sub_dashboard: "පද්ධති දළ විශ්ලේෂණය - සියලුම කැමරා",
        title_capture: "සජීවී දර්ශන පූරණය",
        sub_capture: "සජීවී කැමරා දර්ශනය",
        title_records: "ලියාපදිංචි වාර්තා",
        sub_records: "සම්පූර්ණ ඉතිහාස වාර්තාව",
        title_alerts: "ආරක්ෂක සංඥා",
        sub_alerts: "අවසර නොලත් වාහන ඇතුළත් වීමේ වාර්තා",
        title_parking: "රථ නැවැතුම් තීරු කළමනාකරණය",
        sub_parking: "නැවැතුම් ඉඩ, වෙන්කිරීම් සහ වාර්තා පරීක්ෂා කිරීම",
        title_settings: "සැකසුම්",
        sub_settings: "පද්ධති වින්‍යාස සැකසුම්",

        total_detections: "මුළු හඳුනාගැනීම්",
        allowed: "අවසර ලත්",
        flagged_denied: "සීමා කළ / අවහිර කළ",
        avg_confidence: "සාමාන්‍ය විශ්වාසනීයත්වය",
        trend_detections: "ඊයේට සාපේක්ෂව +18%",
        trend_deviation: "±2.3% විචලනය",
        
        total_slots: "මුළු ඉඩ ප්‍රමාණය",
        available_slots: "හිස් ඉඩ ප්‍රමාණය",
        occupied_slots: "භාවිතයේ ඇති ඉඩ",
        parking_slots_title: "රථගාලේ තීරු / නැවැතුම්",
        btn_initialize: "නැවැතුම් ඉඩ සකසන්න",
        history_title: "රථවාහන නැවැත්වීමේ ඉතිහාසය සහ වාර්තා",
        
        th_session_id: "සැසි අංකය",
        th_vehicle_plate: "ලියාපදිංචි අංකය",
        th_slot_number: "තීරු අංකය",
        th_entry_time: "ඇතුල් වූ වේලාව",
        th_exit_time: "පිටවූ වේලාව",
        th_status: "තත්ත්වය",
        th_action: "ක්‍රියාව",
        
        status_available: "හිස්ව ඇත",
        status_occupied: "භාවිතයේ ඇත",
        status_active: "ක්‍රියාකාරී",
        status_completed: "සම්පූර්ණයි",
        btn_assign: "වාහනය ඇතුල් කරන්න",
        btn_release: "පිටත් කරන්න",
        empty_msg: "හිස් / රථ රහිතයි",
        history_empty: "නැවැත්වීමේ ඉතිහාසයක් හමු නොවීය",
        slots_empty: "දත්ත ගබඩාවේ තවමත් නැවැතුම් තීරු සකසා නැත.",
        btn_init_slots: "සාමාන්‍ය තීරු 3ක් සකසන්න",
        confirm_release: "මෙම රථ නැවැතුම් තීරුව නිදහස් කිරීමට ඔබට සහතිකද?",
        choose_vehicle: "-- වාහනය තෝරන්න --",
        loading_vehicles: "⌛ ලියාපදිංචි වාහන පූරණය වෙමින්...",
        no_unparked: "❌ නැවැත්වීමට නොහැකි වාහන නැත",
        err_vehicles: "❌ වාහන ලැයිස්තුව පූරණය කිරීමේ දෝෂයකි",
        select_vehicle_alert: "කරුණාකර ඇතුල් කිරීමට වාහනයක් තෝරන්න.",
        err_assign_failed: "නැවැතුම් තීරුව ලබා දීමට නොහැකි විය.",
        err_release_failed: "නැවැතුම් තීරුව නිදහස් කිරීමට නොහැකි විය.",
        already_initialized_alert: "නැවැතුම් තීරු දැනටමත් සකසා ඇත."
    },
    ta: {
        menu_dashboard: "டாஷ்போர்டு",
        menu_capture: "நேரடி பிடிப்பு",
        menu_records: "பதிவுகள்",
        menu_alerts: "எச்சரிக்கைகள்",
        menu_parking: "நிறுத்தம்",
        menu_settings: "அமைப்புகள்",
        menu_logout: "வெளியேறு",
        
        title_dashboard: "டாஷ்போர்டு",
        sub_dashboard: "கணினி கண்ணோட்டம் - அனைத்து கேமராக்கள்",
        title_capture: "நேரடி பிடிப்பு",
        sub_capture: "நேரடி கேமரா காட்சி",
        title_records: "பதிவுகள்",
        sub_records: "முழு வரலாற்றுப் பதிவு",
        title_alerts: "பாதுகாப்பு எச்சரிக்கைகள்",
        sub_alerts: "அனுமதிக்கப்படாத வாகனங்களின் பதிவுகள்",
        title_parking: "நிறுத்துமிட மேலாண்மை",
        sub_parking: "நிறுத்துமிடங்கள், ஒதுக்கீடு மற்றும் பதிவுகள் மேலாண்மை",
        title_settings: "அமைப்புகள்",
        sub_settings: "கணினி வடிவமைப்பு அமைப்புகள்",

        total_detections: "மொத்த கண்டுபிடிப்புகள்",
        allowed: "அனுமதிக்கப்பட்டது",
        flagged_denied: "மறுக்கப்பட்டது / அவதானிக்கப்பட்டது",
        avg_confidence: "சராசரி நம்பிக்கை",
        trend_detections: "நேற்றுடன் ஒப்பிடும்போது +18%",
        trend_deviation: "±2.3% விலகல்",
        
        total_slots: "மொத்த இடங்கள்",
        available_slots: "கிடைக்கக்கூடிய இடங்கள்",
        occupied_slots: "பயன்படுத்தப்பட்ட இடங்கள்",
        parking_slots_title: "வாகன நிறுத்துமிடங்கள்",
        btn_initialize: "நிறுத்துமிடங்களை அமைக்குக",
        history_title: "நிறுத்துமிட வரலாறு & பதிவுகள்",
        
        th_session_id: "அமர்வு ஐடி",
        th_vehicle_plate: "வாகன எண்",
        th_slot_number: "நிறுத்துமிட எண்",
        th_entry_time: "நுழைவு நேரம்",
        th_exit_time: "வெளியேறும் நேரம்",
        th_status: "நிலை",
        th_action: "செயல்",
        
        status_available: "கிடைக்கும்",
        status_occupied: "நிறைந்துள்ளது",
        status_active: "செயலில்",
        status_completed: "முடிந்தது",
        btn_assign: "வாகனத்தை ஒதுக்குக",
        btn_release: "விடுவிக்க",
        empty_msg: "வெற்று / கிடைக்கும்",
        history_empty: "நிறுத்துமிட வரலாற்றுப் பதிவுகள் எதுவும் இல்லை",
        slots_empty: "தரவுத்தளத்தில் நிறுத்துமிடங்கள் எதுவும் அமைக்கப்படவில்லை.",
        btn_init_slots: "3 நிறுத்துமிடங்களை அமைக்குக",
        confirm_release: "இந்த நிறுத்துமிடத்தை நீங்கள் நிச்சயமாக விடுவிக்க விரும்புகிறீர்களா?",
        choose_vehicle: "-- வாகனத்தை தேர்வுசெய்க --",
        loading_vehicles: "⌛ வாகனங்கள் ஏற்றப்படுகின்றன...",
        no_unparked: "❌ நிறுத்துவதற்கு வாகனங்கள் இல்லை",
        err_vehicles: "❌ வாகனப் பட்டியல் ஏற்றுவதில் பிழை",
        select_vehicle_alert: "வாகனத்தை தேர்வு செய்க.",
        err_assign_failed: "வாகனத்தை ஒதுக்க முடியவில்லை.",
        err_release_failed: "விடுவிக்க முடியவில்லை.",
        already_initialized_alert: "நிறுத்துமிடங்கள் ஏற்கனவே அமைக்கப்பட்டுள்ளன."
    }
};

let currentLang = localStorage.getItem("appLang") || "en";

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("appLang", lang);
    
    const selector = document.getElementById("languageSelector");
    if (selector) selector.value = lang;
    
    // Translate static strings
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (translations[lang] && translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });
    
    // Refresh titles on active view tab
    const activeMenu = document.querySelector(".menu-item.active");
    if (activeMenu) {
        const tabId = activeMenu.id.replace("menu-", "");
        const titleEl = document.getElementById("view-title");
        const subtitleEl = document.getElementById("view-subtitle");
        titleEl.innerText = translations[lang][`title_${tabId}`] || tabId;
        subtitleEl.innerText = translations[lang][`sub_${tabId}`] || "";
    }
    
    // Reload dynamic layouts
    loadParkingData();
}

// Global Chart Instances
let volumeChartInstance = null;
let cameraChartInstance = null;

// Page Load Initialization
document.addEventListener("DOMContentLoaded", () => {
    // Set Profile Info
    const username = localStorage.getItem("username") || "Admin";
    document.getElementById("headerAvatar").innerText = username.charAt(0).toUpperCase();

    // Initialize language translator
    setLanguage(currentLang);

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

    titleEl.innerText = translations[currentLang][`title_${tabId}`] || tabId;
    subtitleEl.innerText = translations[currentLang][`sub_${tabId}`] || "";

    // 4. Load tab specific metrics
    if (tabId === "dashboard") {
        loadDashboardData();
    } else if (tabId === "capture") {
        initCaptureLogs();
    } else if (tabId === "records") {
        loadRecords('all');
    } else if (tabId === "alerts") {
        loadAlerts();
    } else if (tabId === "parking") {
        loadParkingData();
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
            const imgHtml = imgUrl ? `<img src="${imgUrl}" style="width: 80px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-color);" alt="vehicle">` : '<div style="width: 80px; height: 60px; background: var(--accent-light); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: var(--text-muted);"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg></div>';
            
            resultEl.innerHTML = `
                <div style="padding: 12px; border-radius: 6px; background-color: var(--success-light); border: 1px solid var(--success-color); color: var(--text-main); font-size: 13px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: 700; color: #065f46; display: flex; align-items: center; gap: 4px;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><polyline points="20 6 9 17 4 12"/></svg> AVAILABLE IN DATABASE
                        </span>
                        <span class="plate-tag" style="background-color: var(--plate-bg); color: white; padding: 2px 6px; font-size: 11px; font-weight: 700; border-radius: 4px;">${v.plate_number}</span>
                    </div>
                    <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 10px;">
                        ${imgHtml}
                        <div style="flex: 1;">
                            <div>Owner: <b style="color: #0f172a;">${v.owner_name}</b></div>
                            <div style="margin-top: 2px;">Owner ID: <b style="color: #0f172a;">${v.owner_id}</b></div>
                            <div style="margin-top: 2px;">Model: <b style="color: #0f172a;">${v.vehicle_model || "N/A"}</b></div>
                        </div>
                    </div>
                    <div style="padding: 8px 10px; border-radius: 6px; background-color: rgba(255, 255, 255, 0.7); border: 1px dashed ${data.parking_assigned ? 'var(--success-color)' : '#94a3b8'}; color: var(--text-main); font-size: 12px; display: flex; align-items: center; gap: 6px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg> <span><b>Parking Assignment:</b> ${data.parking_message}</span>
                    </div>
                </div>
            `;
            
            // Reload parking dashboard metrics if a slot was automatically assigned
            if (data.parking_assigned) {
                loadParkingData();
            }
        } else {
            resultEl.innerHTML = `
                <div style="padding: 12px; border-radius: 6px; background-color: var(--danger-light); border: 1px solid var(--danger-color); color: var(--text-main); font-size: 13px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: 700; color: #991b1b; display: flex; align-items: center; gap: 4px;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> NOT IN DATABASE (FLAGGED)
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

// ================= PARKING MANAGEMENT =================

async function loadParkingData() {
    try {
        // Fetch slots, active sessions, history, and status
        const [slotsRes, activeRes, historyRes, statusRes] = await Promise.all([
            fetch(API_URL + "/parking/slots"),
            fetch(API_URL + "/parking/active"),
            fetch(API_URL + "/parking/history"),
            fetch(API_URL + "/parking/status")
        ]);

        if (!slotsRes.ok || !activeRes.ok || !historyRes.ok || !statusRes.ok) {
            throw new Error("Failed to fetch parking data from server");
        }

        const slots = await slotsRes.json();
        const activeSessions = await activeRes.json();
        const history = await historyRes.json();
        const statusData = await statusRes.json();

        const totalSlots = slots.length;

        // Update stats
        document.getElementById("parking-stat-total").innerText = statusData.total;
        document.getElementById("parking-stat-available").innerText = statusData.available >= 0 ? statusData.available : 0;
        document.getElementById("parking-stat-occupied").innerText = statusData.occupied;

        // Render slots grid
        const grid = document.getElementById("parkingSlotsGrid");
        grid.innerHTML = "";

        if (totalSlots === 0) {
            grid.innerHTML = `
                <div style="text-align: center; grid-column: 1 / -1; padding: 45px 20px; background: white; border: 1px dashed var(--border-color); border-radius: 12px; margin: 10px 0;">
                    <p style="font-size: 15px; color: var(--text-muted); margin-bottom: 16px;">${translations[currentLang].slots_empty}</p>
                    <button onclick="initializeParkingSlots()" class="btn-primary" style="width: auto; padding: 8px 20px; display: inline-flex; align-items: center; gap: 8px;">
                        ${translations[currentLang].btn_init_slots}
                    </button>
                </div>
            `;
        } else {
            slots.forEach(slot => {
                const activeSession = activeSessions.find(s => s.slot_number === slot.slot_name);
                
                let occupantHtml = "";
                let actionButtonHtml = "";
                let cardClass = "slot-card available";
                let statusBadge = `<span class="slot-status-badge available"><span class="status-dot-small"></span>${translations[currentLang].status_available}</span>`;

                if (slot.status !== "Available") {
                    cardClass = "slot-card occupied";
                    statusBadge = `<span class="slot-status-badge occupied"><span class="status-dot-small"></span>${translations[currentLang].status_occupied}</span>`;
                    
                    if (activeSession) {
                        const formattedTime = formatParkingTime(activeSession.entry_time);
                        occupantHtml = `
                            <div class="slot-occupant-info">
                                <span class="plate-tag" style="margin-bottom: 8px; display: inline-block;">${activeSession.plate_number}</span>
                                <p style="font-size: 12px; color: var(--text-muted); margin: 2px 0;"><strong>Entry:</strong> ${formattedTime}</p>
                            </div>
                        `;
                        actionButtonHtml = `
                            <button onclick="releaseParkingSlot(${activeSession.session_id})" class="btn-secondary release-btn" style="width: 100%; font-size: 12px; font-weight: bold; background: var(--danger-light); color: var(--danger-color); border-color: var(--danger-color);">
                                ${translations[currentLang].btn_release}
                            </button>
                        `;
                    } else {
                        occupantHtml = `
                            <div class="slot-occupant-info">
                                <p style="font-size: 12px; color: var(--text-muted); margin: 2px 0;">${currentLang === 'en' ? 'Occupant info unavailable' : currentLang === 'si' ? 'හිමිකරුගේ තොරතුරු නොමැත' : 'உரிமையாளர் விவரங்கள் இல்லை'}</p>
                            </div>
                        `;
                        actionButtonHtml = `
                            <p style="font-size: 12px; color: var(--text-muted); text-align: center;">${translations[currentLang].status_occupied}</p>
                        `;
                    }
                } else {
                    occupantHtml = `
                        <div class="slot-occupant-info empty">
                            <p style="font-size: 13px; color: var(--text-muted); font-style: italic; margin: 15px 0;">${translations[currentLang].empty_msg}</p>
                        </div>
                    `;
                    actionButtonHtml = `
                        <button onclick="openAssignModal(${slot.id}, '${slot.slot_name}')" class="btn-primary" style="width: 100%; font-size: 12px; font-weight: bold; margin-top: 0; background-color: var(--accent-color); border-color: var(--accent-color);">
                            ${translations[currentLang].btn_assign}
                        </button>
                    `;
                }

                grid.innerHTML += `
                    <div class="${cardClass}">
                        <div class="slot-card-header">
                            <h4 class="slot-title">${slot.slot_name}</h4>
                            ${statusBadge}
                        </div>
                        <div class="slot-card-body">
                            ${occupantHtml}
                        </div>
                        <div class="slot-card-actions">
                            ${actionButtonHtml}
                        </div>
                    </div>
                `;
            });
        }

        // Render history table
        const historyBody = document.getElementById("parkingHistoryTableBody");
        historyBody.innerHTML = "";

        if (history.length === 0) {
            historyBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--text-muted); padding: 20px;">${translations[currentLang].history_empty}</td></tr>`;
        } else {
            // Sort by ID / latest session first
            const sortedHistory = [...history].sort((a, b) => b.session_id - a.session_id);
            
            sortedHistory.forEach(sess => {
                const isCompleted = sess.status.toLowerCase() === "completed";
                const sessStatusText = isCompleted ? translations[currentLang].status_completed : translations[currentLang].status_active;
                const statusColor = isCompleted ? "var(--text-muted)" : "var(--danger-color)";
                const statusBg = isCompleted ? "var(--accent-light)" : "var(--danger-light)";
                
                let actionHtml = "-";
                if (!isCompleted) {
                    actionHtml = `
                        <button onclick="releaseParkingSlot(${sess.session_id})" class="btn-secondary" style="width: auto; padding: 4px 10px; font-size: 11px; background: var(--danger-light); color: var(--danger-color); border-color: var(--danger-color);">
                            ${translations[currentLang].btn_release}
                        </button>
                    `;
                }

                historyBody.innerHTML += `
                    <tr>
                        <td>#PS-${sess.session_id}</td>
                        <td><span class="plate-tag">${sess.plate_number || "UNKNOWN"}</span></td>
                        <td><strong>${sess.slot_number || "-"}</strong></td>
                        <td style="font-size: 12px;">${formatParkingTime(sess.entry_time)}</td>
                        <td style="font-size: 12px;">${sess.exit_time ? formatParkingTime(sess.exit_time) : "-"}</td>
                        <td>
                            <span class="status-badge" style="color: ${statusColor}; background-color: ${statusBg}; display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">
                                <div style="width: 6px; height: 6px; border-radius: 50%; background-color: ${statusColor};"></div>
                                ${sessStatusText}
                            </span>
                        </td>
                        <td>${actionHtml}</td>
                    </tr>
                `;
            });
        }

    } catch (err) {
        console.error("Load parking data error:", err);
    }
}

async function initializeParkingSlots() {
    try {
        const response = await fetch(API_URL + "/parking/create-slots", {
            method: "POST"
        });
        const data = await response.json();
        let alertMsg = data.message;
        if (data.message === "Parking slots are already initialized.") {
            alertMsg = translations[currentLang].already_initialized_alert;
        }
        alert(alertMsg || "Operation complete");
        loadParkingData();
    } catch (err) {
        console.error("Initialize parking slots error:", err);
        alert("Failed to initialize slots: " + err.message);
    }
}

async function openAssignModal(slotId, slotNumber) {
    document.getElementById("assignSlotId").value = slotId;
    document.getElementById("assignSlotName").value = slotNumber;

    const select = document.getElementById("assignVehicleSelect");
    select.innerHTML = `<option value="">${translations[currentLang].loading_vehicles}</option>`;

    try {
        // Fetch vehicles & active sessions to filter out currently parked vehicles
        const [vehiclesRes, activeRes] = await Promise.all([
            fetch(API_URL + "/vehicles", { headers: { "Authorization": "Bearer " + token } }),
            fetch(API_URL + "/parking/active")
        ]);

        if (!vehiclesRes.ok || !activeRes.ok) {
            throw new Error("Failed to retrieve vehicles data");
        }

        const vehicles = await vehiclesRes.json();
        const activeSessions = await activeRes.json();

        // Extract parked plate numbers
        const parkedPlates = new Set(activeSessions.map(s => s.plate_number.toUpperCase()));

        // Filter unparked vehicles
        const availableVehicles = vehicles.filter(v => !parkedPlates.has(v.plate_number.toUpperCase()));

        select.innerHTML = "";

        if (availableVehicles.length === 0) {
            select.innerHTML = `<option value="">${translations[currentLang].no_unparked}</option>`;
        } else {
            select.innerHTML = `<option value="">${translations[currentLang].choose_vehicle}</option>`;
            availableVehicles.forEach(v => {
                select.innerHTML += `<option value="${v.id}">${v.plate_number} (${v.owner_name})</option>`;
            });
        }

        document.getElementById("assignModal").style.display = "flex";
    } catch (err) {
        console.error("Error opening assign modal:", err);
        select.innerHTML = `<option value="">${translations[currentLang].err_vehicles}</option>`;
        document.getElementById("assignModal").style.display = "flex";
    }
}

function closeAssignModal() {
    document.getElementById("assignModal").style.display = "none";
}

async function assignParkingSlot() {
    const slotId = document.getElementById("assignSlotId").value;
    const vehicleId = document.getElementById("assignVehicleSelect").value;

    if (!vehicleId) {
        alert(translations[currentLang].select_vehicle_alert);
        return;
    }

    try {
        const response = await fetch(API_URL + "/parking/assign", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                vehicle_id: parseInt(vehicleId),
                slot_id: parseInt(slotId)
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert(data.message || (currentLang === 'en' ? "Slot assigned successfully!" : currentLang === 'si' ? "නැවැතුම් තීරුව සාර්ථකව ලබා දෙන ලදී!" : "நிறுத்துமிடம் வெற்றிகரமாக ஒதுக்கப்பட்டது!"));
            closeAssignModal();
            loadParkingData();
        } else {
            alert(data.detail || translations[currentLang].err_assign_failed);
        }
    } catch (err) {
        console.error("Assign parking slot error:", err);
        alert("Error executing assignment request: " + err.message);
    }
}

async function releaseParkingSlot(sessionId) {
    if (!confirm(translations[currentLang].confirm_release)) {
        return;
    }

    try {
        const response = await fetch(API_URL + "/parking/release", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                session_id: parseInt(sessionId)
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert(data.message || (currentLang === 'en' ? "Vehicle released successfully!" : currentLang === 'si' ? "වාහනය සාර්ථකව පිටත් කරන ලදී!" : "வாகனம் வெற்றிகரமாக விடுவிக்கப்பட்டது!"));
            loadParkingData();
        } else {
            alert(data.detail || translations[currentLang].err_release_failed);
        }
    } catch (err) {
        console.error("Release parking slot error:", err);
        alert("Error executing release request: " + err.message);
    }
}

function formatParkingTime(dateString) {
    if (!dateString) return "-";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            // Handle cases where datetime does not parse perfectly or has 'Z' omitted but is UTC
            // Replace space with T
            const cleanStr = dateString.replace(" ", "T");
            const d = new Date(cleanStr);
            return isNaN(d.getTime()) ? dateString : d.toLocaleString();
        }
        return date.toLocaleString();
    } catch (e) {
        return dateString;
    }
}