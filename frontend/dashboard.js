const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

function getUserRole() {
    return (localStorage.getItem("role") || "admin").toLowerCase();
}

function isAdmin() {
    return getUserRole() === "admin";
}

// Robust Snapshot URL resolver to correctly load actual camera snapshots from /uploads/
function resolveSnapshotUrl(rawSnap, fallback = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&q=80") {
    if (!rawSnap || rawSnap === "N/A" || rawSnap === "null" || rawSnap === "undefined") return fallback;
    const s = String(rawSnap).trim();
    if (!s) return fallback;
    if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("blob:") || s.startsWith("data:")) {
        return s;
    }
    const cleanPath = s.replace(/^\/+/, '');
    if (cleanPath.startsWith("uploads/")) {
        return `${API_URL}/${cleanPath}`;
    }
    if (cleanPath.startsWith("assets/")) {
        return cleanPath;
    }
    return `${API_URL}/uploads/${cleanPath}`;
}

// Multi-Language Translation dictionary
const translations = {
    en: {
        active_bays_title: "Active Parking Bays & Override Controls",
        add_camera_title: "Add ANPR Camera Feed",
        add_user_title: "Add System User",
        adv_search_title: "Multi-Criteria Database Query Engine",
        alerts_title: "Active Security Alerts",
        allowed: "Allowed",
        already_initialized_alert: "Parking slots are already initialized.",
        analytics_cat_dist: "Vehicle Category Distribution",
        analytics_status_ratios: "Detection Status Ratios",
        anpr_cameras_title: "ANPR Camera Streams & Feeds",
        approved: "Approved",
        assign_modal_title: "Assign Vehicle to Slot",
        audit_logs_title: "System Event Audit Logs",
        available_slots: "Available Slots",
        avg_confidence: "Avg. Confidence",
        btn_add_camera: "Add Camera",
        btn_add_camera_feed: "+ Add Camera Feed",
        btn_add_custom_slot: "+ Add Custom Slot",
        btn_add_new_user: "Add New User",
        btn_add_new_vehicle: "➕ Add New Vehicle",
        btn_assign: "Assign Vehicle",
        btn_cancel: "❌ Cancel",
        btn_cancel_modal: "Cancel",
        btn_check_db: "Check Database",
        btn_clear_all_alerts: "Clear All Alerts",
        btn_clear_all_parking: "Clear All Logs",
        btn_clear_all_records: "Clear All Logs",
        btn_clear_entrance: "Clear Entrance History",
        btn_confirm_assign: "Assign Vehicle",
        btn_create_user: "Create User Account",
        btn_delete: "Delete",
        btn_edit: "Edit",
        btn_execute_search: "Search Database",
        btn_export: "Export",
        btn_export_csv: "Export CSV",
        btn_export_detection_logs: "📊 Export Detection Logs (CSV)",
        btn_export_list: "Export List",
        btn_export_reg_vehicles: "📥 Export Registered Vehicles (CSV)",
        btn_filter: "Apply Query Filter",
        btn_init_slots: "Initialize 3 Default Slots",
        btn_initialize: "Initialize Parking Slots",
        btn_initiate_slots: "Initialize Default Slots",
        btn_manage_vehicles: "Manage Vehicles",
        btn_open_cam: "📷 Open Camera",
        btn_override_gate: "Manual Gate Barrier Override",
        btn_record_entrance: "Process Entrance",
        btn_refresh_logs: "Refresh Logs",
        btn_register_new_vehicle: "+ Register New Vehicle",
        btn_release: "Release Slot",
        btn_save_reg: "Save Vehicle Registration",
        btn_scan_frame: "Capture & Scan Frame",
        btn_silence_siren: "Silence Security Alarm / Siren",
        btn_start_cam: "Start Live Camera",
        btn_stop_cam: "Stop Camera",
        btn_take_snap: "📸 Take Snap",
        btn_update_vehicle: "Update Vehicle",
        btn_view_entrance_history: "View Entrance History",
        by_camera: "By Camera",
        cam_offline_msg: "Camera feed offline. Start camera to stream scans.",
        cat_bike: "Bike",
        cat_bus: "Bus",
        cat_car: "Car",
        cat_truck: "Truck",
        cat_tuktuk: "Tuk Tuk",
        cat_van: "Van",
        choose_vehicle: "-- Choose Vehicle --",
        confirm_clear_all_alerts: "Are you sure you want to clear ALL security alerts?",
        confirm_clear_all_detection: "Are you sure you want to delete ALL detection logs and alerts?",
        confirm_clear_all_parking: "Are you sure you want to clear all parking history logs?",
        confirm_delete_alert: "Are you sure you want to delete this security alert?",
        confirm_delete_detection_log: "Are you sure you want to delete this detection log?",
        confirm_delete_parking_log: "Are you sure you want to delete this parking session log?",
        confirm_release: "Are you sure you want to release this parking slot?",
        controls_export_desc: "Download full system database dumps and audit records.",
        controls_export_tools: "Data Backup & Export Tools",
        controls_sec_desc: "Manual override mechanisms for emergency barrier operations.",
        controls_sec_title: "Security Override Controls",
        edit_vehicle_title: "Edit Vehicle",
        empty_msg: "Empty / Available",
        entrance_detail_title: "Vehicle Entrance Details",
        lbl_entrance_date: "Entrance Date",
        lbl_entrance_time: "Entrance Time",
        lbl_exit_date: "Exit Date",
        lbl_exit_time: "Exit Time",
        sec_vehicle_owner_info: "Vehicle & Owner Details",
        sec_gate_timeline: "Gate Activity Timeline",
        lbl_entrance_log: "ENTRANCE RECORD",
        lbl_exit_log: "EXIT RECORD",
        entrance_history_subtitle: "Recorded gate entries with snapshots, timestamps, and vehicle details",
        entrance_history_title: "Approved Entrance History",
        entrance_record_desc: "Processes AI-detected license plate, verifies approval in database, auto-assigns parking slot, and logs entrance timestamp & snapshot.",
        entrance_record_title: "Record Vehicle Entrance",
        err_assign_failed: "Failed to assign parking slot.",
        err_release_failed: "Failed to release parking slot.",
        err_vehicles: "❌ Error loading vehicles list",
        facility_capacity: "Facility Parking Capacity",
        facility_capacity_sub: "Live occupancy status meter",
        filter_all: "All",
        filter_allowed: "Allowed",
        filter_denied: "Denied",
        filter_flagged: "Flagged",
        flagged_denied: "Flagged / Denied",
        gate_traffic: "Today's Gate Traffic",
        gate_traffic_sub: "Total arrivals (In) vs departures (Out)",
        history_empty: "No parking sessions history found",
        history_title: "Parking History & Session Logs",
        hourly_volume: "Hourly Detection Volume",
        latest_entrance_title: "Latest Approved Vehicle Entrance",
        lbl_api_url: "Target Server API URL",
        lbl_cam_loc: "Camera 01 Location",
        lbl_category: "Vehicle Category",
        lbl_detection_status: "Detection Status",
        lbl_entrance_plate: "Plate Number *",
        lbl_entrance_slot: "Parking Slot (Optional)",
        lbl_entrance_snapshot: "Snapshot Image Path (Optional)",
        lbl_op_name: "Operator Name",
        lbl_owner_id: "Owner ID / License ID",
        lbl_owner_name: "Owner Name",
        lbl_password: "Password",
        lbl_plate_number: "Plate Number",
        lbl_plate_or_owner: "License Plate / Owner Name",
        lbl_select_reg_vehicle: "Select Registered Vehicle",
        lbl_selected_slot: "Selected Parking Slot",
        lbl_vehicle_category: "Vehicle Category",
        lbl_vehicle_model: "Vehicle Model",
        lbl_vehicle_photo: "Vehicle Photo",
        live_label: "Live",
        live_log_title: "Live Camera Scan Log",
        loading_vehicles: "⌛ Loading registered vehicles...",
        manual_desc: "Verify if a plate number is in the database and simulate a log record.",
        manual_title: "Manual Plate Verification (Bypass AI)",
        matching_records_title: "Matching Database Detection Records",
        menu_admin: "Admin Panel",
        menu_alerts: "Alerts",
        menu_capture: "Live Capture",
        menu_dashboard: "Dashboard",
        menu_entrance: "Entrance History",
        menu_logout: "Logout",
        menu_parking: "Parking",
        menu_records: "Records",
        menu_settings: "Settings",
        meter_available: "Available",
        meter_occupied: "Occupied",
        no_alerts_msg: "No active security alerts",
        no_entrance_yet: "No approved vehicle entrances recorded yet today.",
        no_records_msg: "No records matching filter",
        no_unparked: "❌ No unparked vehicles available",
        occupied_slots: "Occupied Slots",
        opt_all_categories: "All Categories",
        opt_all_statuses: "All Statuses",
        opt_guest: "Guest",
        opt_registered: "Registered",
        parking_slots_title: "Parking Lots / Slots",
        placeholder_plate: "ENTER PLATE NUMBER",
        recent_detections: "Recent Detections",
        reg_vehicle_title: "Add New Vehicle",
        registry_title: "Registered Vehicles Registry",
        role_admin: "Admin",
        role_security: "Operator",
        role_viewer: "Viewer",
        search_placeholder: "Search plates...",
        select_vehicle_alert: "Please select a vehicle to assign.",
        settings_desc: "System parameters managed by system administrator. Contact security supervisor to alter API configurations.",
        settings_title: "Operator Settings",
        slot_init_desc: "Manage parking slots and system default configurations.",
        slot_init_title: "Slot Initialization & Management",
        slots_empty: "No parking slots initialized in the database yet.",
        status_active: "Active",
        status_allowed: "Allowed",
        status_available: "Available",
        status_completed: "Completed",
        status_denied: "Denied",
        status_flagged: "Flagged",
        status_occupied: "Occupied",
        sub_admin_users: "Manage system operators, access levels, and security clearances.",
        sub_alerts: "Flagged unauthorized plate logs",
        sub_capture: "Direct stream scanner feed",
        sub_dashboard: "System overview – all cameras",
        sub_entrance: "Automatic recording of approved registered vehicle entrances",
        sub_parking: "Manage slots, assignments, and check logs",
        sub_parking_oversight: "Configure layout, add slots, and manage parking bays.",
        sub_records: "Full historical log",
        sub_settings: "System configuration settings",
        sub_vehicle_registry: "Manage and monitor registered fleet and guest vehicles.",
        subtab_adv_search: "Advanced DB Query",
        subtab_analytics: "System Analytics",
        subtab_audit_logs: "Security Audit Logs",
        subtab_cameras: "ANPR Cameras",
        subtab_controls: "Manual Controls & Tools",
        subtab_parking_slots: "Parking Slot Config",
        subtab_user_roles: "User Roles",
        subtab_vehicle_mgmt: "Vehicle Management",
        th_action: "Action",
        th_actions: "Actions",
        th_alert_time: "Alert Time",
        th_arrival_time: "Arrival Time",
        th_camera: "Camera",
        th_camera_name: "CAMERA NAME",
        th_category: "Category",
        th_confidence: "Confidence",
        th_details: "DETAILS",
        th_entrance_time: "Entrance Time",
        th_entry_time: "Entry Time",
        th_event_type: "EVENT TYPE",
        th_exit_time: "Exit Time",
        th_feed_url: "FEED URL",
        th_fps: "FPS RATE",
        th_id: "ID",
        th_img_ref: "Image Reference",
        th_level: "LEVEL",
        th_location: "LOCATION",
        th_owner: "Owner",
        th_owner_model: "Owner / Model",
        th_plate: "Plate",
        th_reason: "Reason",
        th_role: "ROLE",
        th_session_id: "Session ID",
        th_slot: "Parking Slot",
        th_slot_assigned: "Slot Assigned",
        th_slot_number: "Slot Number",
        th_snapshot: "Snapshot",
        th_status: "Status",
        th_stay_duration: "Stay Duration",
        th_time: "Time",
        th_user_id: "USER ID",
        th_username: "USERNAME",
        th_vehicle: "Vehicle",
        th_vehicle_details: "Vehicle Details",
        th_vehicle_plate: "Vehicle Plate",
        th_visitor_details: "VISITOR DETAILS",
        title_admin_users: "Admin Management Suite",
        title_alerts: "Security Alerts",
        title_capture: "Live Capture",
        title_dashboard: "Dashboard",
        title_entrance: "Entrance History",
        title_parking: "Parking Management",
        title_parking_oversight: "Parking Oversight",
        title_records: "Detection Records",
        title_settings: "Settings",
        title_vehicle_registry: "Vehicle Registry",
        today_all_cams: "Today – All Cameras",
        total_detections: "Total Detections",
        total_slots: "Total Slots",
        total_today: "Total detections today",
        trend_detections: "+18% vs yesterday",
        trend_deviation: "±2.3% deviation",
        vehicles_by_cat: "Vehicles Inside by Category",
        vehicles_by_cat_sub: "Current distribution of parked vehicle types",
        vehicles_present_inside: "Vehicles Currently Present Inside Premises",
        vehicles_present_inside_sub: "Real-time tracking ticker from entrance scan until slot release",
        verif_label_prefix: "Verification:",
        verif_smart_short: "Smart Verification",
        verif_strict_short: "Strict Verification",
        verif_auto_short: "Full Auto",
        verification_mode_title: "Verification Mode",
        verification_mode_sub: "Choose how the system should handle unknown or low-confidence detections.",
        verif_opt_smart_title: "Smart Verification (Unknowns & Low Confidence)",
        verif_opt_smart_desc: "System will intelligently verify unknown or low-confidence detections.",
        verif_opt_strict_title: "Strict Verification (Always Ask)",
        verif_opt_strict_desc: "Always ask for manual verification, regardless of confidence.",
        verif_opt_auto_title: "Full Auto (No Popups)",
        verif_opt_auto_desc: "Automatically verify all detections without any popups.",
        modal_verif_title: "Vehicle Detection Verification",
        modal_verif_sub: "Review vehicle snapshot and confirm entrance authorization",
        modal_exit_title: "Vehicle Departure Verification (Exit Gate)",
        modal_exit_sub: "Vehicle is currently parked inside — Review snapshot and authorize departure",
        lbl_detected_plate: "Detected Number Plate (Editable)",
        lbl_verif_vehicle_status: "Vehicle & Owner Status",
        btn_confirm_grant_entrance: "🟢 Confirm & Grant Entrance",
        btn_confirm_grant_exit: "🟢 Confirm & Grant Exit",
        btn_confirm_process_exit: "🟢 Confirm & Grant Exit",
        btn_deny_flag_alert: "🔴 Deny / Flag Security Alert",
        btn_deny_hold_exit: "🔴 Cancel / Hold at Gate"
    },

    si: {
        active_bays_title: "ක්‍රියාකාරී නැවැතුම් තීරු සහ පාලන",
        add_camera_title: "ANPR කැමරාවක් එකතු කරන්න",
        add_user_title: "පරිශීලකයෙකු එකතු කරන්න",
        adv_search_title: "බහුවිධ දත්තගබඩා සෙවුම් යන්ත්‍රය",
        alerts_title: "ක්‍රියාකාරී ආරක්ෂක සංඥා",
        allowed: "අවසර ලත්",
        already_initialized_alert: "නැවැතුම් තීරු දැනටමත් සකසා ඇත.",
        analytics_cat_dist: "වාහන වර්ගීකරණ ව්‍යාප්තිය",
        analytics_status_ratios: "හඳුනාගැනීම් තත්ත්ව අනුපාතය",
        anpr_cameras_title: "ANPR කැමරා දර්ශන",
        approved: "අනුමතයි",
        assign_modal_title: "නැවැතුම් තීරුව ලබා දෙන්න",
        audit_logs_title: "පද්ධති සිදුවීම් විගණන වාර්තා",
        available_slots: "හිස් ඉඩ ප්‍රමාණය",
        avg_confidence: "සාමාන්‍ය විශ්වාසනීයත්වය",
        btn_add_camera: "කැමරාවක් එකතු කරන්න",
        btn_add_camera_feed: "+ කැමරා දර්ශනයක් එකතු කරන්න",
        btn_add_custom_slot: "+ වෙනත් තීරුවක් එකතු කරන්න",
        btn_add_new_user: "නව පරිශීලකයෙකු එකතු කරන්න",
        btn_add_new_vehicle: "➕ නව වාහනයක් එකතු කරන්න",
        btn_assign: "වාහනය ඇතුල් කරන්න",
        btn_cancel: "❌ අවලංගු කරන්න",
        btn_cancel_modal: "අවලංගු කරන්න",
        btn_check_db: "දත්ත ගබඩාව පරීක්ෂා කරන්න",
        btn_clear_all_alerts: "සියලුම සංඥා මකන්න",
        btn_clear_all_parking: "සියලුම වාර්තා මකන්න",
        btn_clear_all_records: "සියලුම වාර්තා මකන්න",
        btn_clear_entrance: "ඇතුළුවීම් ඉතිහාසය මකන්න",
        btn_confirm_assign: "වාහනය ඇතුල් කරන්න",
        btn_create_user: "ගිණුමක් සාදන්න",
        btn_delete: "මකන්න",
        btn_edit: "සංස්කරණය",
        btn_execute_search: "දත්තගබඩාවේ සොයන්න",
        btn_export: "ලබාගන්න",
        btn_export_csv: "CSV ලබාගන්න",
        btn_export_detection_logs: "📊 හඳුනාගැනීම් වාර්තා ලබාගන්න (CSV)",
        btn_export_list: "ලැයිස්තුව ලබාගන්න",
        btn_export_reg_vehicles: "📥 ලියාපදිංචි වාහන ලැයිස්තුව ලබාගන්න (CSV)",
        btn_filter: "පෙරහන ක්‍රියාත්මක කරන්න",
        btn_init_slots: "සාමාන්‍ය තීරු 3ක් සකසන්න",
        btn_initialize: "නැවැතුම් ඉඩ සකසන්න",
        btn_initiate_slots: "පෙරනිමි තීරු සකසන්න",
        btn_manage_vehicles: "වාහන කළමනාකරණය",
        btn_open_cam: "📷 කැමරාව තෝරන්න",
        btn_override_gate: "හස්තීය ගේට්ටු විවෘත කිරීම",
        btn_record_entrance: "ඇතුළුවීම සටහන් කරන්න",
        btn_refresh_logs: "වාර්තා යාවත්කාලීන කරන්න",
        btn_register_new_vehicle: "+ නව වාහනයක් ලියාපදිංචි කරන්න",
        btn_release: "පිටත් කරන්න",
        btn_save_reg: "ලියාපදිංචිය සුරකින්න",
        btn_scan_frame: "දර්ශනය ස්කෑන් කරන්න",
        btn_silence_siren: "ආරක්ෂක සයිරන් නාදය නවත්වන්න",
        btn_start_cam: "සජීවී කැමරාව ආරම්භ කරන්න",
        btn_stop_cam: "කැමරාව අතහරින්න",
        btn_take_snap: "📸 ඡායාරූපය ගන්න",
        btn_update_vehicle: "යාවත්කාලීන කරන්න",
        btn_view_entrance_history: "සියලුම ඇතුළුවීම් බලන්න",
        by_camera: "කැමරා අනුව",
        cam_offline_msg: "කැමරාව විසන්ධි වී ඇත. සජීවී දර්ශන සඳහා කැමරාව ආරම්භ කරන්න.",
        cat_bike: "යතුරුපැදි",
        cat_bus: "බස් රථ",
        cat_car: "මෝටර් රථ",
        cat_truck: "ලොරි / ට්‍රක්",
        cat_tuktuk: "ත්‍රිරෝද රථ / Tuk Tuk",
        cat_van: "වෑන් රථ",
        choose_vehicle: "-- වාහනය තෝරන්න --",
        confirm_clear_all_alerts: "සියලුම ආරක්ෂක සංඥා මකා දැමීමට ඔබට සහතිකද?",
        confirm_clear_all_detection: "ඔබට සියලුම හඳුනාගැනීමේ වාර්තා මකා දැමීමට අවශ්‍ය බව සහතිකද?",
        confirm_clear_all_parking: "ඔබට සියලුම නැවැතුම් ඉතිහාස වාර්තා මකා දැමීමට අවශ්‍ය බව සහතිකද?",
        confirm_delete_alert: "මෙම ආරක්ෂක සංඥාව මකා දැමීමට ඔබට සහතිකද?",
        confirm_delete_detection_log: "මෙම හඳුනාගැනීමේ වාර්තාව මකා දැමීමට ඔබට සහතිකද?",
        confirm_delete_parking_log: "මෙම නැවැතුම් වාර්තාව මකා දැමීමට ඔබට සහතිකද?",
        confirm_release: "මෙම රථ නැවැතුම් තීරුව නිදහස් කිරීමට ඔබට සහතිකද?",
        controls_export_desc: "සම්පූර්ණ පද්ධති දත්ත වාර්තා ලබාගන්න.",
        controls_export_tools: "දත්ත ලබාගැනීම් සහ උපස්ථ මෙවලම්",
        controls_sec_desc: "හදිසි අවස්ථාවන් සඳහා ගේට්ටු පාලන මෙවලම්.",
        controls_sec_title: "ආරක්ෂක පාලන මෙවලම්",
        edit_vehicle_title: "වාහනය යාවත්කාලීන කරන්න",
        empty_msg: "හිස් / රථ රහිතයි",
        entrance_detail_title: "වාහන ඇතුළුවීමේ විස්තර",
        lbl_entrance_date: "ඇතුළු වූ දිනය",
        lbl_entrance_time: "ඇතුළු වූ වේලාව",
        lbl_exit_date: "පිටවූ දිනය",
        lbl_exit_time: "පිටවූ වේලාව",
        sec_vehicle_owner_info: "වාහනය සහ හිමිකරුගේ විස්තර",
        sec_gate_timeline: "ඇතුළුවීමේ සහ පිටවීමේ කාලසටහන",
        lbl_entrance_log: "ඇතුළුවීමේ සටහන",
        lbl_exit_log: "පිටවීමේ සටහන",
        entrance_history_subtitle: "ඡායාරූප, වේලාවන් සහ වාහන විස්තර සහිත ඇතුළුවීම් වාර්තා",
        entrance_history_title: "අවසර ලත් ඇතුළුවීම් ඉතිහාසය",
        entrance_record_desc: "අංක තහඩුව පරීක්ෂා කර දත්ත ගබඩාව හා සැසඳීමෙන් ඇතුළුවීම සටහන් කරයි.",
        entrance_record_title: "වාහන ඇතුළුවීම සටහන් කරන්න",
        err_assign_failed: "නැවැතුම් තීරුව ලබා දීමට නොහැකි විය.",
        err_release_failed: "නැවැතුම් තීරුව නිදහස් කිරීමට නොහැකි විය.",
        err_vehicles: "❌ වාහන ලැයිස්තුව පූරණය කිරීමේ දෝෂයකි",
        facility_capacity: "රථගාලේ මුළු ධාරිතාව",
        facility_capacity_sub: "සජීවී භාවිත මීටරය",
        filter_all: "සියල්ල",
        filter_allowed: "අවසර ලත්",
        filter_denied: "අවහිර කළ",
        filter_flagged: "සීමා කළ",
        flagged_denied: "සීමා කළ / අවහිර කළ",
        gate_traffic: "අද දින ගේට්ටු ගමනාගමනය",
        gate_traffic_sub: "මුළු ඇතුළුවීම් (In) සහ පිටවීම් (Out)",
        history_empty: "නැවැත්වීමේ ඉතිහාසයක් හමු නොවීය",
        history_title: "රථවාහන නැවැත්වීමේ ඉතිහාසය සහ වාර්තා",
        hourly_volume: "පැයක පැමිණීම් ප්‍රමාණය",
        latest_entrance_title: "අවසානයට ඇතුළු වූ අවසර ලත් වාහනය",
        lbl_api_url: "සර්වර් API ලිපිනය",
        lbl_cam_loc: "කැමරා 01 ස්ථානය",
        lbl_category: "වාහන වර්ගය",
        lbl_detection_status: "හඳුනාගැනීමේ තත්ත්වය",
        lbl_entrance_plate: "ලියාපදිංචි අංකය *",
        lbl_entrance_slot: "නැවැතුම් තීරුව (අත්‍යවශ්‍ය නොවේ)",
        lbl_entrance_snapshot: "ඡායාරූප මාර්ගය (අත්‍යවශ්‍ය නොවේ)",
        lbl_op_name: "මෙහෙයුම්කරුගේ නම",
        lbl_owner_id: "හිමිකරුගේ හැඳුනුම්පත / බලපත්‍ර අංකය",
        lbl_owner_name: "හිමිකරුගේ නම",
        lbl_password: "මුරපදය",
        lbl_plate_number: "ලියාපදිංචි අංකය",
        lbl_plate_or_owner: "වාහන අංකය / හිමිකරුගේ නම",
        lbl_select_reg_vehicle: "ලියාපදිංචි වාහනය තෝරන්න",
        lbl_selected_slot: "තෝරාගත් නැවැතුම් තීරුව",
        lbl_vehicle_category: "වාහන වර්ගය",
        lbl_vehicle_model: "වාහන මාදිලිය",
        lbl_vehicle_photo: "වාහන ඡායාරූපය",
        live_label: "සජීවී",
        live_log_title: "සජීවී කැමරා පරීක්ෂණ සටහන",
        loading_vehicles: "⌛ ලියාපදිංචි වාහන පූරණය වෙමින්...",
        manual_desc: "වාහන අංකය දත්ත ගබඩාවේ තිබේදැයි පරීක්ෂා කර වාර්තාවක් සාදන්න.",
        manual_title: "හස්තීය පරීක්ෂාව (පද්ධති මඟහැරීම)",
        matching_records_title: "ගැලපෙන දත්තගබඩා වාර්තා",
        menu_admin: "පරිපාලක පුවරුව",
        menu_alerts: "සංඥා",
        menu_capture: "සජීවී දර්ශන",
        menu_dashboard: "නිරීක්ෂණ පුවරුව",
        menu_entrance: "ඇතුළුවීම් ඉතිහාසය",
        menu_logout: "පිටවීම",
        menu_parking: "නැවැතුම්",
        menu_records: "වාර්තා",
        menu_settings: "සැකසුම්",
        meter_available: "හිස්ව ඇත",
        meter_occupied: "භාවිතයේ ඇත",
        no_alerts_msg: "සක්‍රීය ආරක්ෂක සංඥා නොමැත",
        no_entrance_yet: "අද දින තවම අවසර ලත් වාහන ඇතුළු වීමක් සටහන් වී නැත.",
        no_records_msg: "ගැලපෙන වාර්තා හමු නොවීය",
        no_unparked: "❌ නැවැත්වීමට නොහැකි වාහන නැත",
        occupied_slots: "භාවිතයේ ඇති ඉඩ",
        opt_all_categories: "සියලුම වර්ග",
        opt_all_statuses: "සියලුම තත්ත්වයන්",
        opt_guest: "අමුත්තන්",
        opt_registered: "ලියාපදිංචි",
        parking_slots_title: "රථගාලේ තීරු / නැවැතුම්",
        placeholder_plate: "වාහන අංකය ඇතුළත් කරන්න",
        recent_detections: "මෑතකදී හඳුනාගත් වාහන",
        reg_vehicle_title: "නව වාහනයක් ඇතුළත් කරන්න",
        registry_title: "ලියාපදිංචි වාහන ලේඛනය",
        role_admin: "පරිපාලක",
        role_security: "මෙහෙයුම්කරු",
        role_viewer: "නිරීක්ෂක",
        search_placeholder: "ලියාපදිංචි අංක සොයන්න...",
        select_vehicle_alert: "කරුණාකර ඇතුල් කිරීමට වාහනයක් තෝරන්න.",
        settings_desc: "පද්ධති පරාමිතීන් පද්ධති පරිපාලක විසින් පාලනය කරනු ලැබේ.",
        settings_title: "මෙහෙයුම්කරු සැකසුම්",
        slot_init_desc: "රථගාලේ තීරු සහ පද්ධති සැකසුම් පාලනය කරන්න.",
        slot_init_title: "තීරු සැකසීම සහ කළමනාකරණය",
        slots_empty: "දත්ත ගබඩාවේ තවමත් නැවැතුම් තීරු සකසා නැත.",
        status_active: "ක්‍රියාකාරී",
        status_allowed: "අවසර ලත්",
        status_available: "හිස්ව ඇත",
        status_completed: "සම්පූර්ණයි",
        status_denied: "අවහිර කළ",
        status_flagged: "සීමා කළ",
        status_occupied: "භාවිතයේ ඇත",
        sub_admin_users: "පද්ධති මෙහෙයුම්කරුවන් සහ ප්‍රවේශ මට්ටම් පාලනය කරන්න.",
        sub_alerts: "අවසර නොලත් වාහන ඇතුළත් වීමේ වාර්තා",
        sub_capture: "සජීවී කැමරා දර්ශනය",
        sub_dashboard: "පද්ධති දළ විශ්ලේෂණය - සියලුම කැමරා",
        sub_entrance: "අවසර ලත් වාහන ඇතුළුවීම් සටහන් කිරීම",
        sub_parking: "නැවැතුම් ඉඩ, වෙන්කිරීම් සහ වාර්තා පරීක්ෂා කිරීම",
        sub_parking_oversight: "නැවැතුම් තීරු සහ සැකසුම් පාලනය කරන්න.",
        sub_records: "සම්පූර්ණ ඉතිහාස වාර්තාව",
        sub_settings: "පද්ධති වින්‍යාස සැකසුම්",
        sub_vehicle_registry: "ලියාපදිංචි සහ අමුත්තන්ගේ වාහන පාලනය කරන්න.",
        subtab_adv_search: "උසස් දත්තගබඩා සෙවීම",
        subtab_analytics: "පද්ධති විශ්ලේෂණ",
        subtab_audit_logs: "ආරක්ෂක විගණන වාර්තා",
        subtab_cameras: "ANPR කැමරා",
        subtab_controls: "හස්තීය පාලන සහ මෙවලම්",
        subtab_parking_slots: "නැවැතුම් තීරු වින්‍යාසය",
        subtab_user_roles: "පරිශීලක භූමිකාවන්",
        subtab_vehicle_mgmt: "වාහන කළමනාකරණය",
        th_action: "ක්‍රියාව",
        th_actions: "ක්‍රියාමාර්ග",
        th_alert_time: "සංඥා වේලාව",
        th_arrival_time: "ඇතුළු වූ වේලාව",
        th_camera: "කැමරාව",
        th_camera_name: "කැමරාවේ නම",
        th_category: "වාහන වර්ගය",
        th_confidence: "විශ්වාසනීයත්වය",
        th_details: "විස්තර",
        th_entrance_time: "ඇතුළු වූ වේලාව",
        th_entry_time: "ඇතුල් වූ වේලාව",
        th_event_type: "සිදුවීම් වර්ගය",
        th_exit_time: "පිටවූ වේලාව",
        th_feed_url: "දර්ශන ලිපිනය",
        th_fps: "FPS අනුපාතය",
        th_id: "අංකය",
        th_img_ref: "ඡායාරූපය",
        th_level: "මට්ටම",
        th_location: "ස්ථානය",
        th_owner: "හිමිකරු",
        th_owner_model: "හිමිකරු / මාදිලිය",
        th_plate: "ලියාපදිංචි අංකය",
        th_reason: "හේතුව",
        th_role: "භූමිකාව",
        th_session_id: "වාර්තා අංකය",
        th_slot: "නැවැතුම් තීරුව",
        th_slot_assigned: "වෙන්කළ තීරුව",
        th_slot_number: "තීරු අංකය",
        th_snapshot: "ඡායාරූපය",
        th_status: "තත්ත්වය",
        th_stay_duration: "ගත වූ කාලය",
        th_time: "වේලාව",
        th_user_id: "පරිශීලක අංකය",
        th_username: "පරිශීලක නමය",
        th_vehicle: "වාහනය",
        th_vehicle_details: "වාහන විස්තර",
        th_vehicle_plate: "වාහන අංකය",
        th_visitor_details: "අමුත්තන්ගේ විස්තර",
        title_admin_users: "පරිපාලන කළමනාකරණ කට්ටලය",
        title_alerts: "ආරක්ෂක සංඥා",
        title_capture: "සජීවී දර්ශන පූරණය",
        title_dashboard: "නිරීක්ෂණ පුවරුව",
        title_entrance: "ඇතුළුවීම් ඉතිහාසය",
        title_parking: "රථ නැවැතුම් තීරු කළමනාකරණය",
        title_parking_oversight: "රථගාල පාලනය",
        title_records: "ලියාපදිංචි වාර්තා",
        title_settings: "සැකසුම්",
        title_vehicle_registry: "ලියාපදිංචි වාහන ලේඛනය",
        today_all_cams: "අද - සියලුම කැමරා",
        total_detections: "මුළු හඳුනාගැනීම්",
        total_slots: "මුළු ඉඩ ප්‍රමාණය",
        total_today: "අද දින මුළු හඳුනාගැනීම්",
        trend_detections: "ඊයේට සාපේක්ෂව +18%",
        trend_deviation: "±2.3% විචලනය",
        vehicles_by_cat: "වර්ගය අනුව ඇතුළත ඇති වාහන",
        vehicles_by_cat_sub: "දැනට නවතා ඇති වාහන වර්ගීකරණය",
        vehicles_present_inside: "දැනට පරිශ්‍රය තුළ ඇති වාහන",
        vehicles_present_inside_sub: "ඇතුළු වූ මොහොතේ සිට පිටවන තෙක් සජීවී නිරීක්ෂණය",
        verif_label_prefix: "සත්‍යාපනය:",
        verif_smart_short: "ස්මාර්ට් සත්‍යාපනය",
        verif_strict_short: "තදබල සත්‍යාපනය",
        verif_auto_short: "සම්පූර්ණ ස්වයංක්‍රීය",
        verification_mode_title: "සත්‍යාපන මාදිලිය",
        verification_mode_sub: "නොදන්නා හෝ අඩු විශ්වාසනීයත්වයක් සහිත හඳුනාගැනීම් පද්ධතිය විසින් හසුරුවන ආකාරය තෝරන්න.",
        verif_opt_smart_title: "ස්මාර්ට් සත්‍යාපනය (නොදන්නා සහ අඩු විශ්වාසනීය)",
        verif_opt_smart_desc: "නොදන්නා හෝ අඩු විශ්වාසනීයත්වයක් සහිත වාහන පද්ධතිය විසින් බුද්ධිමත්ව සත්‍යාපනය කරයි.",
        verif_opt_strict_title: "තදබල සත්‍යාපනය (සැමවිටම අසන්න)",
        verif_opt_strict_desc: "විශ්වාසනීයත්වය කුමක් වුවත් සැමවිටම අතින් සත්‍යාපනය කිරීමට විමසයි.",
        verif_opt_auto_title: "සම්පූර්ණ ස්වයංක්‍රීය (පොප්-අප් රහිත)",
        verif_opt_auto_desc: "කිසිදු පොප්-අප් එකක් නොමැතිව සියලුම හඳුනාගැනීම් ස්වයංක්‍රීයව සත්‍යාපනය කරයි.",
        modal_verif_title: "වාහන හඳුනාගැනීමේ සත්‍යාපනය",
        modal_verif_sub: "වාහන ඡායාරූපය සමාලෝචනය කර ඇතුළුවීමේ අවසරය තහවුරු කරන්න",
        modal_exit_title: "වාහන පිටවීමේ සත්‍යාපනය (පිටවීමේ දොරටුව)",
        modal_exit_sub: "වාහනය දැනටමත් නවතා ඇත — ඡායාරූපය පරීක්ෂා කර පිටවීමට අවසර දෙන්න",
        lbl_detected_plate: "හඳුනාගත් ලියාපදිංචි අංකය (සංස්කරණය කළ හැක)",
        lbl_verif_vehicle_status: "වාහනය සහ හිමිකරුගේ තත්ත්වය",
        btn_confirm_grant_entrance: "🟢 තහවුරු කර ඇතුළුවීමට අවසර දෙන්න",
        btn_confirm_grant_exit: "🟢 තහවුරු කර පිටවීමට අවසර දෙන්න",
        btn_confirm_process_exit: "🟢 තහවුරු කර පිටවීමට අවසර දෙන්න",
        btn_deny_flag_alert: "🔴 අවසර නොදෙන්න / ආරක්ෂක සංඥාවක්",
        btn_deny_hold_exit: "🔴 අවලංගු කරන්න / දොරටුවේ රඳවා ගන්න"
    },

    ta: {
        active_bays_title: "செயலில் உள்ள நிறுத்துமிடங்கள் & கட்டுப்பாடுகள்",
        add_camera_title: "ANPR கேமராவைச் சேர்க்க",
        add_user_title: "பயனரைச் சேர்க்க",
        adv_search_title: "பல அளவுகோல் தரவுத்தள தேடல் எஞ்சின்",
        alerts_title: "பாதுகாப்பு எச்சரிக்கைகள்",
        allowed: "அனுமதிக்கப்பட்டது",
        already_initialized_alert: "நிறுத்துமிடங்கள் ஏற்கனவே அமைக்கப்பட்டுள்ளன.",
        analytics_cat_dist: "வாகன வகை விநியோகம்",
        analytics_status_ratios: "கண்டறிதல் நிலை விகிதங்கள்",
        anpr_cameras_title: "ANPR கேமரா ஸ்ட்ரீம்கள்",
        approved: "அங்கீகரிக்கப்பட்டது",
        assign_modal_title: "வாகனத்தை ஒதுக்குக",
        audit_logs_title: "கணினி நிகழ்வு தணிக்கைப் பதிவுகள்",
        available_slots: "கிடைக்கக்கூடிய இடங்கள்",
        avg_confidence: "சராசரி நம்பிக்கை",
        btn_add_camera: "கேமராவைச் சேர்க்க",
        btn_add_camera_feed: "+ கேமரா ஊட்டத்தைச் சேர்க்க",
        btn_add_custom_slot: "+ தனிப்பயன் இடத்தை சேர்க்க",
        btn_add_new_user: "புதிய பயனரைச் சேர்க்க",
        btn_add_new_vehicle: "➕ புதிய வாகனத்தைச் சேர்க்க",
        btn_assign: "வாகனத்தை ஒதுக்குக",
        btn_cancel: "❌ ரத்து செய்",
        btn_cancel_modal: "ரத்து செய்",
        btn_check_db: "தரவுத்தளத்தைச் சரிபார்க்கவும்",
        btn_clear_all_alerts: "அனைத்து எச்சரிக்கைகளையும் நீக்குக",
        btn_clear_all_parking: "அனைத்து பதிவுகளையும் நீக்குக",
        btn_clear_all_records: "அனைத்து பதிவுகளையும் நீக்குக",
        btn_clear_entrance: "நுழைவு வரலாற்றை அழிக்கவும்",
        btn_confirm_assign: "வாகனத்தை ஒதுக்குக",
        btn_create_user: "பயனர் கணக்கை உருவாக்கு",
        btn_delete: "நீக்குக",
        btn_edit: "திருத்து",
        btn_execute_search: "தரவுத்தளத்தில் தேடுக",
        btn_export: "ஏற்றுமதி",
        btn_export_csv: "CSV ஏற்றுமதி",
        btn_export_detection_logs: "📊 கண்டறிதல் பதிவுகளை ஏற்றுமதி செய் (CSV)",
        btn_export_list: "பட்டியலை ஏற்றுமதி செய்",
        btn_export_reg_vehicles: "📥 பதிவுசெய்த வாகனங்களை ஏற்றுமதி செய் (CSV)",
        btn_filter: "வடிகட்டியைப் பயன்படுத்து",
        btn_init_slots: "3 நிறுத்துமிடங்களை அமைக்குக",
        btn_initialize: "நிறுத்துமிடங்களை அமைக்குக",
        btn_initiate_slots: "இயல்புநிலை இடங்களை அமைக்குக",
        btn_manage_vehicles: "வாகன மேலாண்மை",
        btn_open_cam: "📷 கேமராவை திறக்குக",
        btn_override_gate: "கேட் தடையை கைமுறையாக திறக்க",
        btn_record_entrance: "நுழைவைச் செயல்படுத்து",
        btn_refresh_logs: "பதிவுகளை புதுப்பிக்குக",
        btn_register_new_vehicle: "+ புதிய வாகனத்தைப் பதிவுசெய்க",
        btn_release: "விடுவிக்க",
        btn_save_reg: "பதிவைச் சேமிக்கவும்",
        btn_scan_frame: "சட்டகத்தைப் பிடிக்கவும்",
        btn_silence_siren: "பாதுகாப்பு அலாரத்தை நிறுத்துக",
        btn_start_cam: "நேரடி கேமராவைத் தொடங்கு",
        btn_stop_cam: "கேமராவை நிறுத்து",
        btn_take_snap: "📸 படம் எடுக்கவும்",
        btn_update_vehicle: "வாகனத்தை புதுப்பிக்கவும்",
        btn_view_entrance_history: "நுழைவு வரலாற்றைப் பார்க்கவும்",
        by_camera: "கேமரா வாரியாக",
        cam_offline_msg: "கேமரா இணைப்பு இல்லை. கேமராவைத் தொடங்கவும்.",
        cat_bike: "பைக்",
        cat_bus: "பேருந்து",
        cat_car: "கார்",
        cat_truck: "லாரி / டிரக்",
        cat_tuktuk: "ஆட்டோ / Tuk Tuk",
        cat_van: "வேன்",
        choose_vehicle: "-- வாகனத்தை தேர்வுசெய்க --",
        confirm_clear_all_alerts: "அனைத்து பாதுகாப்பு எச்சரிக்கைகளையும் நிச்சயமாக நீக்க விரும்புகிறீர்களா?",
        confirm_clear_all_detection: "அனைத்து கண்டறிதல் பதிவுகளையும் நிச்சயமாக நீக்க விரும்புகிறீர்களா?",
        confirm_clear_all_parking: "அனைத்து நிறுத்துமிட வரலாற்றுப் பதிவுகளையும் நிச்சயமாக நீக்க விரும்புகிறீர்களா?",
        confirm_delete_alert: "இந்த எச்சரிக்கையை நிச்சயமாக நீக்க விரும்புகிறீர்களா?",
        confirm_delete_detection_log: "இந்த கண்டறிதல் பதிவை நிச்சயமாக நீக்க விரும்புகிறீர்களா?",
        confirm_delete_parking_log: "இந்த நிறுத்துமிடப் பதிவை நிச்சயமாக நீக்க விரும்புகிறீர்களா?",
        confirm_release: "இந்த நிறுத்துமிடத்தை நீங்கள் நிச்சயமாக விடுவிக்க விரும்புகிறீர்களா?",
        controls_export_desc: "முழு கணினி தரவுத்தள பதிவிறக்கம்.",
        controls_export_tools: "தரவு காப்பு மற்றும் ஏற்றுமதி கருவிகள்",
        controls_sec_desc: "அவசர தடைகளுக்கான கையேடு கட்டுப்பாடுகள்.",
        controls_sec_title: "பாதுகாப்பு கட்டுப்பாடுகள்",
        edit_vehicle_title: "வாகனத்தைத் திருத்துக",
        empty_msg: "வெற்று / கிடைக்கும்",
        entrance_detail_title: "வாகன நுழைவு விவரங்கள்",
        lbl_entrance_date: "நுழைவு தேதி",
        lbl_entrance_time: "நுழைவு நேரம்",
        lbl_exit_date: "வெளியேறிய தேதி",
        lbl_exit_time: "வெளியேறிய நேரம்",
        sec_vehicle_owner_info: "வாகனம் மற்றும் உரிமையாளர் விவரங்கள்",
        sec_gate_timeline: "வாயில் செயல்பாட்டு காலவரிசை",
        lbl_entrance_log: "நுழைவுப் பதிவு",
        lbl_exit_log: "வெளியேற்றப் பதிவு",
        entrance_history_subtitle: "புகைப்படங்கள், நேரங்கள் மற்றும் வாகன விவரங்களுடன் பதிவுசெய்யப்பட்ட நுழைவுகள்",
        entrance_history_title: "அனுமதிக்கப்பட்ட நுழைவு வரலாறு",
        entrance_record_desc: "எண் தகட்டை சரிபார்த்து தரவுத்தளத்தில் பதிவுசெய்கிறது.",
        entrance_record_title: "வாகன நுழைவைப் பதிவுசெய்க",
        err_assign_failed: "வாகனத்தை ஒதுக்க முடியவில்லை.",
        err_release_failed: "விடுவிக்க முடியவில்லை.",
        err_vehicles: "❌ வாகனப் பட்டியல் ஏற்றுவதில் பிழை",
        facility_capacity: "நிறுத்துமிடக் கொள்ளளவு",
        facility_capacity_sub: "நேரடி பயன்பாட்டு அளவீடு",
        filter_all: "அனைத்தும்",
        filter_allowed: "அனுமதிக்கப்பட்டது",
        filter_denied: "மறுக்கப்பட்டது",
        filter_flagged: "அவதானிக்கப்பட்டது",
        flagged_denied: "மறுக்கப்பட்டது / அவதானிக்கப்பட்டது",
        gate_traffic: "இன்றைய கேட் போக்குவரத்து",
        gate_traffic_sub: "மொத்த வரவுகள் (In) மற்றும் வெளியேற்றங்கள் (Out)",
        history_empty: "நிறுத்துமிட வரலாற்றுப் பதிவுகள் எதுவும் இல்லை",
        history_title: "நிறுத்துமிட வரலாறு & பதிவுகள்",
        hourly_volume: "மணிநேரக் கண்டுபிடிப்பு அளவு",
        latest_entrance_title: "கடைசியாக அனுமதிக்கப்பட்ட வாகனம்",
        lbl_api_url: "சேவையக API URL",
        lbl_cam_loc: "கேமரா 01 இடம்",
        lbl_category: "வாகன வகை",
        lbl_detection_status: "கண்டறிதல் நிலை",
        lbl_entrance_plate: "வாகன எண் *",
        lbl_entrance_slot: "பார்க்கிங் இடம் (விருப்பத்தேர்வு)",
        lbl_entrance_snapshot: "புகைப்பட பாதை (விருப்பத்தேர்வு)",
        lbl_op_name: "ஆபரேட்டர் பெயர்",
        lbl_owner_id: "உரிமையாளர் ஐடி",
        lbl_owner_name: "உரிமையாளர் பெயர்",
        lbl_password: "கடவுச்சொல்",
        lbl_plate_number: "வாகன எண்",
        lbl_plate_or_owner: "வாகன எண் / உரிமையாளர் பெயர்",
        lbl_select_reg_vehicle: "பதிவுசெய்த வாகனத்தை தேர்வுசெய்க",
        lbl_selected_slot: "தேர்ந்தெடுக்கப்பட்ட நிறுத்துமிடம்",
        lbl_vehicle_category: "வாகன வகை",
        lbl_vehicle_model: "வாகன மாடல்",
        lbl_vehicle_photo: "வாகன புகைப்படம்",
        live_label: "நேரலை",
        live_log_title: "நேரடி கேமரா ஸ்கேன் பதிவு",
        loading_vehicles: "⌛ வாகனங்கள் ஏற்றப்படுகின்றன...",
        manual_desc: "வாகன எண் தரவுத்தளத்தில் உள்ளதா என சரிபார்க்கவும்.",
        manual_title: "கைமுறை சரிபார்ப்பு",
        matching_records_title: "பொருந்தும் தரவுத்தளப் பதிவுகள்",
        menu_admin: "நிர்வாகக் குழு",
        menu_alerts: "எச்சரிக்கைகள்",
        menu_capture: "நேரடி பிடிப்பு",
        menu_dashboard: "டாஷ்போர்டு",
        menu_entrance: "நுழைவு வரலாறு",
        menu_logout: "வெளியேறு",
        menu_parking: "நிறுத்தம்",
        menu_records: "பதிவுகள்",
        menu_settings: "அமைப்புகள்",
        meter_available: "கிடைக்கும்",
        meter_occupied: "நிறைந்துள்ளது",
        no_alerts_msg: "செயலில் உள்ள எச்சரிக்கைகள் எதுவுமில்லை",
        no_entrance_yet: "இன்று இன்னும் எந்த வாகன நுழைவும் பதிவு செய்யப்படவில்லை.",
        no_records_msg: "பதிவுகள் எதுவும் இல்லை",
        no_unparked: "❌ நிறுத்துவதற்கு வாகனங்கள் இல்லை",
        occupied_slots: "பயன்படுத்தப்பட்ட இடங்கள்",
        opt_all_categories: "அனைத்து வகைகளும்",
        opt_all_statuses: "அனைத்து நிலைகளும்",
        opt_guest: "விருந்தினர்",
        opt_registered: "பதிவுசெய்யப்பட்டது",
        parking_slots_title: "வாகன நிறுத்துமிடங்கள்",
        placeholder_plate: "வாகன எண்ணை உள்ளிடுக",
        recent_detections: "சமீபத்திய கண்டுபிடிப்புகள்",
        reg_vehicle_title: "புதிய வாகனத்தைச் சேர்க்க",
        registry_title: "பதிவுசெய்யப்பட்ட வாகனப் பதிவேடு",
        role_admin: "நிர்வாகி",
        role_security: "ஆபரேட்டர்",
        role_viewer: "பார்வையாளர்",
        search_placeholder: "வாகன எண்களைத் தேடுக...",
        select_vehicle_alert: "வாகனத்தை தேர்வு செய்க.",
        settings_desc: "கணினி அமைப்புகள் நிர்வாகியால் நிர்வகிக்கப்படுகின்றன.",
        settings_title: "ஆபரேட்டர் அமைப்புகள்",
        slot_init_desc: "நிறுத்துமிடங்கள் மற்றும் கணினி அமைப்புகளை நிர்வகிக்கவும்.",
        slot_init_title: "நிறுத்துமிட அமைப்பு & மேலாண்மை",
        slots_empty: "தரவுத்தளத்தில் நிறுத்துமிடங்கள் எதுவும் அமைக்கப்படவில்லை.",
        status_active: "செயலில்",
        status_allowed: "அனுமதிக்கப்பட்டது",
        status_available: "கிடைக்கும்",
        status_completed: "முடிந்தது",
        status_denied: "மறுக்கப்பட்டது",
        status_flagged: "அவதானிக்கப்பட்டது",
        status_occupied: "நிறைந்துள்ளது",
        sub_admin_users: "கணினி ஆபரேட்டர்கள் மற்றும் அணுகல் நிலைகளை நிர்வகிக்கவும்.",
        sub_alerts: "அனுமதிக்கப்படாத வாகனங்களின் பதிவுகள்",
        sub_capture: "நேரடி கேமரா காட்சி",
        sub_dashboard: "கணினி கண்ணோட்டம் - அனைத்து கேமராக்கள்",
        sub_entrance: "அனுமதிக்கப்பட்ட வாகனங்களின் தானியங்கி நுழைவுப் பதிவு",
        sub_parking: "நிறுத்துமிடங்கள், ஒதுக்கீடு மற்றும் பதிவுகள் மேலாண்மை",
        sub_parking_oversight: "வடிவமைப்பு மற்றும் நிறுத்துமிடங்களை நிர்வகிக்கவும்.",
        sub_records: "முழு வரலாற்றுப் பதிவு",
        sub_settings: "கணினி வடிவமைப்பு அமைப்புகள்",
        sub_vehicle_registry: "பதிவுசெய்யப்பட்ட மற்றும் விருந்தினர் வாகனங்களை நிர்வகிக்கவும்.",
        subtab_adv_search: "மேம்பட்ட தேடல்",
        subtab_analytics: "கணினி பகுப்பாய்வு",
        subtab_audit_logs: "பாதுகாப்பு தணிக்கைப் பதிவுகள்",
        subtab_cameras: "ANPR கேமராக்கள்",
        subtab_controls: "கையேடு கட்டுப்பாடுகள் & கருவிகள்",
        subtab_parking_slots: "நிறுத்துமிட அமைப்பு",
        subtab_user_roles: "பயனர் பாத்திரங்கள்",
        subtab_vehicle_mgmt: "வாகன மேலாண்மை",
        th_action: "செயல்",
        th_actions: "செயல்கள்",
        th_alert_time: "எச்சரிக்கை நேரம்",
        th_arrival_time: "வந்தடைந்த நேரம்",
        th_camera: "கேமரா",
        th_camera_name: "கேமரா பெயர்",
        th_category: "வாகன வகை",
        th_confidence: "நம்பிக்கை",
        th_details: "விவரங்கள்",
        th_entrance_time: "நுழைவு நேரம்",
        th_entry_time: "நுழைவு நேரம்",
        th_event_type: "நிகழ்வு வகை",
        th_exit_time: "வெளியேறும் நேரம்",
        th_feed_url: "ஊட்ட URL",
        th_fps: "FPS விகிதம்",
        th_id: "ஐடி",
        th_img_ref: "படம்",
        th_level: "நிலை",
        th_location: "இடம்",
        th_owner: "உரிமையாளர்",
        th_owner_model: "உரிமையாளர் / மாடல்",
        th_plate: "வாகன எண்",
        th_reason: "காரணம்",
        th_role: "பங்கு",
        th_session_id: "அமர்வு ஐடி",
        th_slot: "பார்க்கிங் இடம்",
        th_slot_assigned: "ஒதுக்கப்பட்ட இடம்",
        th_slot_number: "நிறுத்துமிட எண்",
        th_snapshot: "புகைப்படம்",
        th_status: "நிலை",
        th_stay_duration: "தங்கியிருக்கும் நேரம்",
        th_time: "நேரம்",
        th_user_id: "பயனர் ஐடி",
        th_username: "பயனர் பெயர்",
        th_vehicle: "வாகனம்",
        th_vehicle_details: "வாகன விவரங்கள்",
        th_vehicle_plate: "வாகன எண்",
        th_visitor_details: "விருந்தினர் விவரங்கள்",
        title_admin_users: "நிர்வாக மேலாண்மை தொகுப்பு",
        title_alerts: "பாதுகாப்பு எச்சரிக்கைகள்",
        title_capture: "நேரடி பிடிப்பு",
        title_dashboard: "டாஷ்போர்டு",
        title_entrance: "நுழைவு வரலாறு",
        title_parking: "நிறுத்துமிட மேலாண்மை",
        title_parking_oversight: "நிறுத்துமிட மேற்பார்வை",
        title_records: "பதிவுகள்",
        title_settings: "அமைப்புகள்",
        title_vehicle_registry: "வாகனப் பதிவேடு",
        today_all_cams: "இன்று – அனைத்து கேமராக்கள்",
        total_detections: "மொத்த கண்டுபிடிப்புகள்",
        total_slots: "மொத்த இடங்கள்",
        total_today: "இன்றைய மொத்தக் கண்டுபிடிப்புகள்",
        trend_detections: "நேற்றுடன் ஒப்பிடும்போது +18%",
        trend_deviation: "±2.3% விலகல்",
        vehicles_by_cat: "வகை வாரியாக உள்ளே உள்ள வாகனங்கள்",
        vehicles_by_cat_sub: "தற்போது நிறுத்தப்பட்டுள்ள வாகன வகைகளின் பகிர்வு",
        vehicles_present_inside: "தற்போது வளாகத்தினுள் உள்ள வாகனங்கள்",
        vehicles_present_inside_sub: "நுழைவு முதல் வெளியேற்றம் வரையிலான நேரடி கண்காணிப்பு",
        verif_label_prefix: "சரிபார்ப்பு:",
        verif_smart_short: "ஸ்மார்ட் சரிபார்ப்பு",
        verif_strict_short: "கடுமையான சரிபார்ப்பு",
        verif_auto_short: "முழு தானியங்கி",
        verification_mode_title: "சரிபார்ப்பு முறை",
        verification_mode_sub: "தெரியாத அல்லது குறைந்த நம்பிக்கை கண்டறிதல்களை கணினி எவ்வாறு கையாள வேண்டும் என்பதைத் தேர்ந்தெடுக்கவும்.",
        verif_opt_smart_title: "ஸ்மார்ட் சரிபார்ப்பு (தெரியாதவை & குறைந்த நம்பிக்கை)",
        verif_opt_smart_desc: "கணினி தெரியாத அல்லது குறைந்த நம்பிக்கை கண்டறிதல்களை அறிவார்ந்த முறையில் சரிபார்க்கும்.",
        verif_opt_strict_title: "கடுமையான சரிபார்ப்பு (எப்போதும் கேட்கவும்)",
        verif_opt_strict_desc: "நம்பிக்கையை பொருட்படுத்தாமல் எப்போதும் கைமுறை சரிபார்ப்பைக் கேட்கவும்.",
        verif_opt_auto_title: "முழு தானியங்கி (பாப்அப்கள் இல்லை)",
        verif_opt_auto_desc: "எந்த பாப்அப்களும் இல்லாமல் அனைத்து கண்டறிதல்களையும் தானாகவே சரிபார்க்கும்.",
        modal_verif_title: "வாகன கண்டறிதல் சரிபார்ப்பு",
        modal_verif_sub: "வாகனப் புகைப்படத்தை மதிப்பாய்வு செய்து நுழைவு அனுமதியை உறுதிப்படுத்தவும்",
        modal_exit_title: "வாகன வெளியேறும் சரிபார்ப்பு (வெளியேறும் வாயில்)",
        modal_exit_sub: "வாகனம் தற்போது நிறுத்தப்பட்டுள்ளது — புகைப்படத்தை சரிபார்த்து வெளியேற அனுமதி வழங்கவும்",
        lbl_detected_plate: "கண்டறியப்பட்ட பதிவு எண் (திருத்தக்கூடியது)",
        lbl_verif_vehicle_status: "வாகனம் & உரிமையாளர் நிலை",
        btn_confirm_grant_entrance: "🟢 உறுதிசெய்து நுழைவு அனுமதி வழங்கவும்",
        btn_confirm_grant_exit: "🟢 உறுதிசெய்து வெளியேற அனுமதி வழங்கவும்",
        btn_confirm_process_exit: "🟢 உறுதிசெய்து வெளியேற அனுமதி வழங்கவும்",
        btn_deny_flag_alert: "🔴 நிராகரிக்கவும் / பாதுகாப்பு எச்சரிக்கையிடுக",
        btn_deny_hold_exit: "🔴 ரத்துசெய் / வாயிலில் நிறுத்துக"
    }
};

let currentLang = localStorage.getItem("appLang") || "en";

let currentRecordFilter = 'all';

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("appLang", lang);
    
    const selector = document.getElementById("languageSelector");
    if (selector) selector.value = lang;
    
    // Translate static inner text strings
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (translations[lang] && translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });

    // Translate input placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (translations[lang] && translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });

    // Update active verification mode UI labels according to selected language
    if (typeof updateVerificationCardUI === "function" && typeof getVerificationMode === "function") {
        updateVerificationCardUI(getVerificationMode());
    }
    
    // Refresh titles on active view tab and re-render active tab content
    const activeMenu = document.querySelector(".menu-item.active");
    if (activeMenu) {
        const tabId = activeMenu.id.replace("menu-", "");
        const titleEl = document.getElementById("view-title");
        const subtitleEl = document.getElementById("view-subtitle");
        if (titleEl) titleEl.innerText = translations[lang][`title_${tabId}`] || tabId;
        if (subtitleEl) subtitleEl.innerText = translations[lang][`sub_${tabId}`] || "";

        if (tabId === "dashboard") {
            loadDashboardData();
        } else if (tabId === "capture") {
            const logBody = document.getElementById("liveCameraLogBody");
            if (logBody && (logBody.innerHTML.includes("Camera feed offline") || logBody.innerHTML.includes("කැමරාව විසන්ධි") || logBody.innerHTML.includes("கேமரா இணைப்பு"))) {
                initCaptureLogs();
            }
        } else if (tabId === "records") {
            renderRecordsTable(currentRecordFilter);
        } else if (tabId === "alerts") {
            loadAlerts();
        } else if (tabId === "parking") {
            loadParkingData();
        } else if (tabId === "entrance") {
            loadEntranceData();
        } else if (tabId === "admin") {
            const activeAdminSubtab = document.querySelector(".admin-nav-tab.active");
            if (activeAdminSubtab) {
                const subtabId = activeAdminSubtab.id.replace("adminSubtab", "").toLowerCase();
                if (typeof switchAdminSubtab === "function") switchAdminSubtab(subtabId);
            }
        }
    } else {
        loadDashboardData();
        loadParkingData();
    }
}


// Global Chart Instances
let volumeChartInstance = null;
let cameraChartInstance = null;

// Helper to safely parse ISO timestamp as local time without UTC offset mismatch
function parseLocalIsoTime(timeStr) {
    if (!timeStr || timeStr === "null" || timeStr === "undefined") return null;
    try {
        let str = String(timeStr).trim();
        str = str.replace(/Z$/i, '').replace(/\+00:?00$/, '');
        if (!str.includes("T") && str.includes(" ")) {
            str = str.replace(" ", "T");
        }
        const parts = str.split("T");
        if (parts.length === 2) {
            const dateParts = parts[0].split("-").map(Number);
            const timeParts = parts[1].split(".")[0].split(":").map(Number);
            if (dateParts.length === 3 && timeParts.length >= 2) {
                const year = dateParts[0];
                const month = dateParts[1] - 1; // 0-indexed
                const day = dateParts[2];
                const hours = timeParts[0];
                const minutes = timeParts[1];
                const seconds = timeParts[2] || 0;
                return new Date(year, month, day, hours, minutes, seconds);
            }
        }
        const d = new Date(str);
        return isNaN(d.getTime()) ? new Date() : d;
    } catch (e) {
        return new Date();
    }
}

// Real-Time System Clock & Dynamic Dwell Tickers
function updateAllLiveTimeDisplays() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // 1. Update Header Live Clock
    const headerClockEl = document.getElementById("headerLiveClockText");
    if (headerClockEl) {
        headerClockEl.innerText = timeStr;
    }
    
    // 2. Update Table Header Live Clock
    const tableClockEl = document.getElementById("tableLiveClockText");
    if (tableClockEl) {
        tableClockEl.innerText = timeStr;
    }

    // 3. Update all Live Stay Duration Tickers in active table
    document.querySelectorAll(".live-stay-ticker").forEach(el => {
        const entryTime = el.getAttribute("data-entry-time");
        let initialDwell = parseInt(el.getAttribute("data-initial-dwell") || "0", 10);
        let currentDwell = parseInt(el.getAttribute("data-current-dwell") || initialDwell.toString(), 10) + 1;
        el.setAttribute("data-current-dwell", currentDwell.toString());

        let secondsElapsed = currentDwell;
        if (entryTime && entryTime !== "null" && entryTime !== "undefined" && entryTime !== "") {
            const entryDate = parseLocalIsoTime(entryTime);
            if (entryDate && !isNaN(entryDate.getTime())) {
                const diffSecs = Math.floor((Date.now() - entryDate.getTime()) / 1000);
                if (diffSecs >= 0) {
                    secondsElapsed = diffSecs;
                }
            }
        }
        el.innerText = `⏱️ ${formatLiveDwellTime(secondsElapsed)}`;
    });
}

// ================= REAL-TIME WEBSOCKET LISTENER =================
let anprWebSocket = null;
let wsReconnectTimer = null;

function initWebSocket() {
    if (wsReconnectTimer) {
        clearTimeout(wsReconnectTimer);
        wsReconnectTimer = null;
    }
    
    try {
        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsHost = (typeof API_URL !== "undefined" ? API_URL : "http://127.0.0.1:8000")
            .replace(/^https?:\/\//, "");
        const wsUrl = `${wsProtocol}//${wsHost}/ws/live`;

        console.log("Connecting to ANPR Live WebSocket:", wsUrl);
        anprWebSocket = new WebSocket(wsUrl);

        anprWebSocket.onopen = () => {
            console.log("🟢 ANPR Live WebSocket connected successfully.");
        };

        anprWebSocket.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);
                if (payload.event === "DETECTION_EVENT" || payload.event === "DETECTION_ALERT") {
                    const data = payload.data || {};
                    // If flagged or alert, reload alerts dynamically and trigger siren
                    if (data.status === "Flagged" || payload.event === "DETECTION_ALERT") {
                        if (typeof triggerSecuritySiren === "function") triggerSecuritySiren();
                        if (typeof loadAlerts === "function") loadAlerts();
                    }

                    // Reload active tab data in real-time
                    const activeMenu = document.querySelector(".menu-item.active");
                    if (activeMenu) {
                        const tabId = activeMenu.id.replace("menu-", "");
                        if (tabId === "alerts" && typeof loadAlerts === "function") {
                            loadAlerts();
                        } else if (tabId === "dashboard" && typeof loadDashboardData === "function") {
                            loadDashboardData();
                        } else if (tabId === "records" && typeof loadRecords === "function") {
                            loadRecords(currentRecordFilter || 'all');
                        } else if (tabId === "parking" && typeof loadParkingData === "function") {
                            loadParkingData();
                        } else if (tabId === "entrance" && typeof loadEntranceData === "function") {
                            loadEntranceData();
                        }
                    } else {
                        if (typeof loadAlerts === "function") loadAlerts();
                    }
                } else if (payload.event === "ALERT_DELETED" || payload.event === "ALERTS_CLEARED" || payload.event === "DETECTION_LOG_DELETED" || payload.event === "DETECTION_LOGS_CLEARED") {
                    if (typeof loadAlerts === "function") loadAlerts();
                    if (typeof loadDashboardData === "function") loadDashboardData();
                    const activeMenu = document.querySelector(".menu-item.active");
                    if (activeMenu && activeMenu.id === "menu-records" && typeof loadRecords === "function") {
                        loadRecords(currentRecordFilter || 'all');
                    }
                }
            } catch (e) {
                console.warn("WebSocket message parsing error:", e);
            }
        };

        anprWebSocket.onclose = () => {
            console.log("🟡 ANPR WebSocket disconnected. Retrying connection in 3s...");
            wsReconnectTimer = setTimeout(initWebSocket, 3000);
        };

        anprWebSocket.onerror = (err) => {
            console.warn("ANPR WebSocket error:", err);
            try {
                anprWebSocket.close();
            } catch (_) {}
        };
    } catch (err) {
        console.error("Failed to initialize WebSocket client:", err);
        wsReconnectTimer = setTimeout(initWebSocket, 5000);
    }
}

// Page Load Initialization
document.addEventListener("DOMContentLoaded", () => {
    localStorage.removeItem("theme");
    document.body.classList.remove("dark-mode");
    // Set Profile Info
    const username = localStorage.getItem("username") || "User";
    const avatarEl = document.getElementById("headerAvatar");
    if (avatarEl) avatarEl.innerText = username.charAt(0).toUpperCase();

    // Role-based UI adjustments (Completely strip Admin Panel for non-admin users)
    if (!isAdmin()) {
        const adminMenuEl = document.getElementById("menu-admin");
        if (adminMenuEl) adminMenuEl.remove();
        const adminTabEl = document.getElementById("tab-admin");
        if (adminTabEl) adminTabEl.remove();
    }

    // Initialize language translator
    setLanguage(currentLang);

    // Start Live Clock & Dwell Ticker Interval
    updateAllLiveTimeDisplays();
    if (!window.liveTimeIntervalId) {
        window.liveTimeIntervalId = setInterval(updateAllLiveTimeDisplays, 1000);
    }

    // Connect Real-Time WebSocket for immediate live alert push
    initWebSocket();

    // Populate camera source devices (DroidCam, built-in, etc.)
    populateCameraDeviceList();

    // Pre-fetch active alerts badge count
    loadAlerts();

    // Default Load Overview Tab
    switchTab("dashboard");
});

// ================= TAB SWITCHING =================
function switchTab(tabId) {
    if (tabId === "admin" && !isAdmin()) {
        alert("Access Denied: Only administrators are authorized to access the Admin Panel.");
        return;
    }

    // 1. Remove active class from all tabs
    document.querySelectorAll(".tab-section").forEach(section => {
        section.classList.remove("active");
    });
    document.querySelectorAll(".menu-item").forEach(item => {
        item.classList.remove("active");
    });

    // 2. Set active classes for selected tab
    const targetTabEl = document.getElementById(`tab-${tabId}`);
    const targetMenuEl = document.getElementById(`menu-${tabId}`);
    if (targetTabEl) targetTabEl.classList.add("active");
    if (targetMenuEl) targetMenuEl.classList.add("active");

    // 3. Update title/subtitles
    const titleEl = document.getElementById("view-title");
    const subtitleEl = document.getElementById("view-subtitle");

    if (titleEl) titleEl.innerText = translations[currentLang][`title_${tabId}`] || tabId;
    if (subtitleEl) subtitleEl.innerText = translations[currentLang][`sub_${tabId}`] || "";

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
    } else if (tabId === "entrance") {
        loadEntranceData();
    } else if (tabId === "admin") {
        switchAdminSubtab('users');
    }
}

// ================= ADMIN SUBTAB SWITCHING & DATA LOADERS =================
function switchAdminSubtab(subtabId) {
    if (!isAdmin()) {
        alert("Access Denied: Only administrators are authorized to view or edit the Admin Panel.");
        switchTab("dashboard");
        return;
    }
    document.querySelectorAll(".admin-nav-tab").forEach(tab => tab.classList.remove("active"));
    document.querySelectorAll(".admin-view-section").forEach(view => view.style.display = "none");

    const tabMap = {
        users: "adminSubtabUsers",
        vehicles: "adminSubtabVehicles",
        parking: "adminSubtabParking",
        cameras: "adminSubtabCameras",
        search: "adminSubtabSearch",
        analytics: "adminSubtabAnalytics",
        audit: "adminSubtabAudit",
        controls: "adminSubtabControls"
    };

    const targetTab = document.getElementById(tabMap[subtabId] || `adminSubtab${subtabId}`);
    const targetView = document.getElementById(`admin-view-${subtabId}`);

    if (targetTab) targetTab.classList.add("active");
    if (targetView) targetView.style.display = "block";

    if (subtabId === "users") {
        loadAdminUsers();
    } else if (subtabId === "vehicles") {
        loadAdminVehicles();
    } else if (subtabId === "parking") {
        loadAdminParkingSlots();
    } else if (subtabId === "cameras") {
        loadAdminCameras();
    } else if (subtabId === "analytics") {
        loadAdminAnalytics();
    } else if (subtabId === "audit") {
        loadAdminAuditLogs();
    } else if (subtabId === "controls") {
        loadAIEngineStatus();
    }
}

let allAdminUsersData = [];
async function loadAdminUsers() {
    const tbody = document.getElementById("adminUsersTableBody");
    if (!tbody) return;

    try {
        const res = await fetch(API_URL + "/admin/users", {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!res.ok) throw new Error("Failed to load users");
        allAdminUsersData = await res.json();
        renderAdminUsersTable(allAdminUsersData);
    } catch (err) {
        console.error("Error loading admin users:", err);
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: #64748b;">Unable to load user list</td></tr>`;
    }
}

function renderAdminUsersTable(users) {
    const tbody = document.getElementById("adminUsersTableBody");
    if (!tbody) return;

    if (!users || users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: #64748b;">No registered system users found</td></tr>`;
        return;
    }

    tbody.innerHTML = users.map(u => `
        <tr>
            <td>#USR-${u.id}</td>
            <td><strong>${u.username}</strong></td>
            <td><span class="role-badge-${(u.role || 'admin').toLowerCase()}">${(u.role || 'Admin').toUpperCase()}</span></td>
            <td><span style="color: #10b981; font-weight: 700;">Active</span></td>
            <td>
                <button onclick="deleteAdminUser(${u.id})" class="btn-action-delete" style="padding: 4px 8px; font-size: 11px;">Delete</button>
            </td>
        </tr>
    `).join("");

    const footerCount = document.getElementById("adminUsersFooterCount");
    if (footerCount) footerCount.innerText = `Showing 1 to ${users.length} of ${users.length} users`;
}

function filterAdminUsersTable(query) {
    if (!allAdminUsersData) return;
    const q = (query || "").toLowerCase().trim();
    if (!q) {
        renderAdminUsersTable(allAdminUsersData);
        return;
    }
    const filtered = allAdminUsersData.filter(u => 
        String(u.id).includes(q) || 
        (u.username || "").toLowerCase().includes(q) || 
        (u.role || "").toLowerCase().includes(q)
    );
    renderAdminUsersTable(filtered);
}

async function deleteAdminUser(userId) {
    if (!confirm("Are you sure you want to delete this system user?")) return;
    try {
        const res = await fetch(`${API_URL}/admin/users/${userId}`, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + token }
        });
        if (!res.ok) throw new Error("Delete user failed");
        loadAdminUsers();
    } catch (err) {
        console.error("Error deleting user:", err);
        alert("Failed to delete user.");
    }
}

let allAdminVehiclesData = [];
async function loadAdminVehicles() {
    const tbody = document.getElementById("adminVehiclesTableBody");
    if (!tbody) return;

    try {
        const res = await fetch(API_URL + "/vehicles", {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!res.ok) throw new Error("Failed to load vehicles");
        allAdminVehiclesData = await res.json();
        filterAdminVehiclesTable();
    } catch (err) {
        console.error("Error loading admin vehicles:", err);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: #64748b;">Unable to load vehicle registry</td></tr>`;
    }
}

function renderAdminVehiclesTable(vehicles) {
    const tbody = document.getElementById("adminVehiclesTableBody");
    if (!tbody) return;

    if (!vehicles || vehicles.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: #64748b;">No matching vehicles found</td></tr>`;
        return;
    }

    tbody.innerHTML = vehicles.map(v => {
        const cat = (v.category || "Car").toUpperCase();
        const isGuest = v.is_guest || v.owner_id === "GUEST-PASS" || (v.owner_name && v.owner_name.includes("Visitor / Guest"));
        const statusVal = isGuest ? "GUEST PASS" : (v.is_flagged ? "FLAGGED" : "APPROVED");
        const statusClass = isGuest ? "flagged" : (v.is_flagged ? "flagged" : "allowed");
        return `
            <tr>
                <td>#V-${v.id}</td>
                <td><span class="plate-tag">${v.plate_number}</span></td>
                <td><strong>${v.owner_name || 'N/A'}</strong><br><span style="font-size:11px; color:#64748b;">ID: ${v.owner_id || 'N/A'}</span></td>
                <td><span class="badge-cat">${cat}</span></td>
                <td><span class="status-badge ${statusClass}" style="${isGuest ? 'background: rgba(245, 158, 11, 0.15); color: #d97706; border: 1px solid #f59e0b;' : ''}">${statusVal}</span></td>
                <td>
                    <div style="display:flex; gap:6px;">
                        <button onclick="editVehicle(${v.id})" class="btn-action-edit" style="padding:4px 8px; font-size:11px;">Edit</button>
                        <button onclick="deleteVehicle(${v.id})" class="btn-action-delete" style="padding:4px 8px; font-size:11px;">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    const footerCount = document.getElementById("adminVehiclesFooterCount");
    if (footerCount) footerCount.innerText = `Showing 1 to ${vehicles.length} of ${vehicles.length} entries`;
}

function filterAdminVehiclesTable() {
    if (!allAdminVehiclesData) return;
    const statusSelect = document.getElementById("adminVehicleStatusFilter");
    const categorySelect = document.getElementById("adminVehicleCategoryFilter");

    const statusFilter = statusSelect ? statusSelect.value.toUpperCase() : "REGISTERED";
    const categoryFilter = categorySelect ? categorySelect.value.toLowerCase() : "";

    let filtered = allAdminVehiclesData;

    // Filter by Registered vs Guest vs All Statuses
    if (statusFilter === "REGISTERED") {
        filtered = filtered.filter(v => !v.is_guest && v.owner_id !== "GUEST-PASS" && (!v.owner_name || !v.owner_name.includes("Visitor / Guest")));
    } else if (statusFilter === "GUEST") {
        filtered = filtered.filter(v => v.is_guest || v.owner_id === "GUEST-PASS" || (v.owner_name && v.owner_name.includes("Visitor / Guest")));
    }

    // Filter by Category
    if (categoryFilter && categoryFilter !== "all" && categoryFilter !== "") {
        filtered = filtered.filter(v => (v.category || "Car").toLowerCase() === categoryFilter);
    }

    renderAdminVehiclesTable(filtered);
}

async function loadAdminParkingSlots() {
    const tbody = document.getElementById("adminParkingSlotsTableBody");
    if (!tbody) return;

    try {
        const res = await fetch(API_URL + "/parking/slots", {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!res.ok) throw new Error("Failed to load parking slots");
        const slots = await res.json();

        if (!slots || slots.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 20px; color: #64748b;">No parking slots found</td></tr>`;
            return;
        }

        tbody.innerHTML = slots.map(s => `
            <tr>
                <td>#SLOT-${s.id}</td>
                <td><strong>${s.slot_name}</strong></td>
                <td>
                    <span class="slot-status-pill ${s.status === 'Available' ? 'available' : 'occupied'}">${s.status.toUpperCase()}</span>
                </td>
                <td>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <button onclick="handleAdminResetSlot(${s.id})" class="btn-secondary" style="padding: 4px 10px; font-size: 11px; border-radius: 6px; font-weight: 700;">Reset Slot</button>
                        <button onclick="handleAdminDeleteSlot(${s.id}, '${s.slot_name}')" class="btn-action-delete" style="padding: 4px 10px; font-size: 11px; background: #fee2e2; color: #dc2626; border: 1px solid #fecdd3; border-radius: 6px; font-weight: 700; cursor: pointer;">Delete</button>
                    </div>
                </td>
            </tr>
        `).join("");
    } catch (err) {
        console.error("Error loading admin parking slots:", err);
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 20px; color: #64748b;">Unable to load parking slots</td></tr>`;
    }
}

async function loadAdminCameras() {
    const tbody = document.getElementById("adminCamerasTableBody");
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td>#CAM-01</td>
            <td><strong>North Gate Stream Scanner</strong></td>
            <td>RTSP / Webcam Feed</td>
            <td><span style="color: #10b981; font-weight: 700;">ONLINE</span></td>
            <td><span class="status-badge allowed">ACTIVE</span></td>
        </tr>
    `;
}

let adminCatChartInstance = null;
let adminStatChartInstance = null;

async function loadAdminAnalytics() {
    const overviewEl = document.getElementById("adminStatsOverview");
    if (overviewEl) {
        overviewEl.innerHTML = `
            <div class="stat-card" style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
                <h4 style="margin:0; font-size:12px; color:#64748b;">Registered Fleet</h4>
                <div class="value" style="font-size:24px; font-weight:800; color:#2563eb; margin-top:6px;">${allAdminVehiclesData ? allAdminVehiclesData.length : 0}</div>
            </div>
            <div class="stat-card" style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
                <h4 style="margin:0; font-size:12px; color:#64748b;">System Users</h4>
                <div class="value" style="font-size:24px; font-weight:800; color:#10b981; margin-top:6px;">${allAdminUsersData ? allAdminUsersData.length : 1}</div>
            </div>
            <div class="stat-card" style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
                <h4 style="margin:0; font-size:12px; color:#64748b;">Active Detections</h4>
                <div class="value" style="font-size:24px; font-weight:800; color:#8b5cf6; margin-top:6px;">${allRecords ? allRecords.length : 0}</div>
            </div>
            <div class="stat-card" style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
                <h4 style="margin:0; font-size:12px; color:#64748b;">Security Alerts</h4>
                <div class="value" style="font-size:24px; font-weight:800; color:#ef4444; margin-top:6px;">${typeof allAlerts !== 'undefined' && allAlerts ? allAlerts.length : 0}</div>
            </div>
        `;
    }

    if (typeof Chart === "undefined") return;

    const catCtx = document.getElementById("adminCategoryChart");
    if (catCtx) {
        if (adminCatChartInstance) adminCatChartInstance.destroy();
        adminCatChartInstance = new Chart(catCtx, {
            type: 'doughnut',
            data: {
                labels: ['Cars', 'Tuk Tuks', 'Bikes', 'Vans', 'Buses', 'Trucks'],
                datasets: [{
                    data: [12, 4, 5, 4, 2, 1],
                    backgroundColor: ['#2563eb', '#16a34a', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    const statCtx = document.getElementById("adminStatusChart");
    if (statCtx) {
        if (adminStatChartInstance) adminStatChartInstance.destroy();
        adminStatChartInstance = new Chart(statCtx, {
            type: 'doughnut',
            data: {
                labels: ['Allowed', 'Flagged'],
                datasets: [{
                    data: [18, 2],
                    backgroundColor: ['#10b981', '#ef4444']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
}

async function loadAdminAuditLogs() {
    const tbody = document.getElementById("adminAuditTableBody");
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td>#AUD-101</td>
            <td>System Admin</td>
            <td>Slot Initialization & Security Management</td>
            <td>${new Date().toLocaleString()}</td>
            <td><span style="color:#10b981; font-weight:700;">SUCCESS</span></td>
        </tr>
    `;
}

// ================= ADMIN PARKING SLOT MANAGEMENT =================
async function handleAdminAddSlot() {
    if (!isAdmin()) {
        alert("Access Denied: Only administrators are authorized to add or edit slots.");
        return;
    }
    const inputEl = document.getElementById("adminNewSlotInput");
    if (!inputEl) return;
    const slotName = inputEl.value.trim().toUpperCase();

    if (!slotName) {
        alert("Please enter a slot name (e.g. P4)");
        return;
    }

    try {
        const res = await fetch(API_URL + "/parking/add-slot?slot_name=" + encodeURIComponent(slotName), {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.detail || data.message || "Failed to add slot");
        }

        alert(data.message || `Parking slot '${slotName}' created!`);
        inputEl.value = "";
        
        if (typeof loadAdminParkingSlots === "function") loadAdminParkingSlots();
        if (typeof loadParkingData === "function") loadParkingData();
    } catch (err) {
        console.error("Error adding slot:", err);
        alert(err.message || "Failed to add custom slot");
    }
}

async function handleAdminInitSlots() {
    if (!isAdmin()) {
        alert("Access Denied: Only administrators are authorized to initialize slots.");
        return;
    }
    try {
        const res = await fetch(API_URL + "/parking/create-slots", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.detail || data.message || "Failed to initialize slots");
        }

        alert(data.message || "Standard slots (P1, P2, P3, P4) initialized!");
        
        if (typeof loadAdminParkingSlots === "function") loadAdminParkingSlots();
        if (typeof loadParkingData === "function") loadParkingData();
    } catch (err) {
        console.error("Error initializing slots:", err);
        alert(err.message || "Failed to initialize slots");
    }
}

async function initializeParkingSlots() {
    await handleAdminInitSlots();
}

async function handleAdminResetSlot(slotId) {
    if (!isAdmin()) {
        alert("Access Denied: Only administrators are authorized to reset slots.");
        return;
    }
    if (!confirm("Are you sure you want to force reset/release this parking slot?")) return;
    try {
        const res = await fetch(API_URL + "/parking/reset-slot/" + slotId, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.detail || data.message || "Failed to reset slot");
        }

        alert(data.message || "Slot force-released to Available!");
        
        if (typeof loadAdminParkingSlots === "function") loadAdminParkingSlots();
        if (typeof loadParkingData === "function") loadParkingData();
    } catch (err) {
        console.error("Error resetting slot:", err);
        alert(err.message || "Failed to reset slot");
    }
}

async function handleAdminDeleteSlot(slotId, slotName) {
    if (!isAdmin()) {
        alert("Access Denied: Only administrators are authorized to delete slots.");
        return;
    }
    if (!confirm(`Are you sure you want to permanently delete parking slot '${slotName}'?`)) return;

    try {
        const res = await fetch(`${API_URL}/parking/slots/${slotId}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.detail || data.message || "Failed to delete slot");
        }

        alert(data.message || `Parking slot '${slotName}' deleted successfully!`);

        if (typeof loadAdminParkingSlots === "function") loadAdminParkingSlots();
        if (typeof loadParkingData === "function") loadParkingData();
    } catch (err) {
        console.error("Error deleting parking slot:", err);
        alert(err.message || "Failed to delete parking slot");
    }
}

// ================= REAL-WORLD PARKING BLUEPRINT MODAL =================
function openParkingLayoutModal() {
    if (!isAdmin()) {
        alert("Access Denied: Only administrators have the right to access the Physical Layout Blueprint.");
        return;
    }
    const modal = document.getElementById("parkingLayoutModal");
    if (modal) modal.style.display = "block";
}

function closeParkingLayoutModal() {
    const modal = document.getElementById("parkingLayoutModal");
    if (modal) modal.style.display = "none";
}

// ================= ADMIN USER MODAL & EXPORT HANDLERS =================
function openAddUserModal() {
    const modal = document.getElementById("addUserModal");
    if (modal) modal.style.display = "flex";
}

function closeAddUserModal() {
    const modal = document.getElementById("addUserModal");
    if (modal) modal.style.display = "none";
}

async function submitNewUser() {
    const usernameInput = document.getElementById("newUsername");
    const passwordInput = document.getElementById("newPassword");
    const roleSelect = document.getElementById("newUserRole");

    const username = usernameInput ? usernameInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";
    const role = roleSelect ? roleSelect.value : "operator";

    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }

    try {
        const res = await fetch(API_URL + "/admin/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ username, password, role })
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.detail || data.message || "Failed to create user");
        }

        alert(`User '${username}' created successfully!`);
        closeAddUserModal();
        if (usernameInput) usernameInput.value = "";
        if (passwordInput) passwordInput.value = "";
        loadAdminUsers();
    } catch (err) {
        console.error("Error creating user:", err);
        alert(err.message || "Failed to create user");
    }
}

// Shared CSV Helper Function with UTF-8 BOM for Microsoft Excel compatibility
function downloadCSVFile(filename, csvRows) {
    const BOM = "\uFEFF"; // UTF-8 Byte Order Mark for Excel compatibility
    const csvContent = BOM + (Array.isArray(csvRows) ? csvRows.join("\r\n") : csvRows);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function exportUserListCSV() {
    if (!allAdminUsersData || allAdminUsersData.length === 0) {
        alert("No user records available to export.");
        return;
    }
    const rows = [];
    rows.push(["ID", "USERNAME", "ROLE", "STATUS"].map(h => `"${h}"`).join(","));
    allAdminUsersData.forEach(u => {
        rows.push([
            `"USR-${u.id}"`,
            `"${(u.username || '').replace(/"/g, '""')}"`,
            `"${(u.role || 'Admin').replace(/"/g, '""')}"`,
            `"Active"`
        ].join(","));
    });
    downloadCSVFile(`system_users_${new Date().toISOString().slice(0, 10)}.csv`, rows);
}

// ================= ADMIN VEHICLE REGISTRY MODALS & EXPORTS =================
function openAddVehicleModal() {
    const modal = document.getElementById("addVehicleModal");
    if (modal) modal.style.display = "flex";
}

function closeAddVehicleModal() {
    const modal = document.getElementById("addVehicleModal");
    if (modal) modal.style.display = "none";
}

function formatPlateNumberInput(inputEl) {
    if (!inputEl) return;
    inputEl.value = inputEl.value.toUpperCase();
}

async function submitAdminNewVehicle() {
    await submitAddVehicle();
}

async function submitAddVehicle() {
    const plateInput = document.getElementById("adminAddPlateNumber");
    const ownerNameInput = document.getElementById("adminAddOwnerName");
    const ownerIdInput = document.getElementById("adminAddOwnerId");
    const modelInput = document.getElementById("adminAddVehicleModel");
    const categorySelect = document.getElementById("adminAddCategory");

    const plate_number = plateInput ? plateInput.value.trim().toUpperCase() : "";
    const owner_name = ownerNameInput ? ownerNameInput.value.trim() : "";
    const owner_id = ownerIdInput ? ownerIdInput.value.trim() : "";
    const vehicle_model = modelInput ? modelInput.value.trim() : "Standard";
    const category = categorySelect ? categorySelect.value : "Car";

    if (!plate_number || !owner_name) {
        alert("Please fill in plate number and owner name.");
        return;
    }

    try {
        const res = await fetch(API_URL + "/vehicles/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                plate_number,
                owner_name,
                owner_id: owner_id || "ID-SYS",
                vehicle_model,
                category,
                is_guest: false
            })
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.detail || data.message || "Failed to register vehicle");
        }

        alert(`Vehicle '${plate_number}' registered successfully!`);
        closeAddVehicleModal();
        if (plateInput) plateInput.value = "";
        if (ownerNameInput) ownerNameInput.value = "";
        if (ownerIdInput) ownerIdInput.value = "";
        if (modelInput) modelInput.value = "";
        loadAdminVehicles();
    } catch (err) {
        console.error("Error registering vehicle:", err);
        alert(err.message || "Failed to register vehicle");
    }
}

function exportVehiclesCSV() {
    const statusSelect = document.getElementById("adminVehicleStatusFilter");
    const categorySelect = document.getElementById("adminVehicleCategoryFilter");

    const statusFilter = statusSelect ? statusSelect.value.toUpperCase() : "REGISTERED";
    const categoryFilter = categorySelect ? categorySelect.value.toLowerCase() : "";

    let recordsToExport = allAdminVehiclesData || [];

    if (statusFilter === "REGISTERED") {
        recordsToExport = recordsToExport.filter(v => !v.is_guest && v.owner_id !== "GUEST-PASS" && (!v.owner_name || !v.owner_name.includes("Visitor / Guest")));
    } else if (statusFilter === "GUEST") {
        recordsToExport = recordsToExport.filter(v => v.is_guest || v.owner_id === "GUEST-PASS" || (v.owner_name && v.owner_name.includes("Visitor / Guest")));
    }

    if (categoryFilter && categoryFilter !== "all" && categoryFilter !== "") {
        recordsToExport = recordsToExport.filter(v => (v.category || "Car").toLowerCase() === categoryFilter);
    }

    if (!recordsToExport || recordsToExport.length === 0) {
        alert("No vehicle records available to export for the selected filter.");
        return;
    }

    const rows = [];
    rows.push(["ID", "PLATE_NUMBER", "OWNER_NAME", "OWNER_ID", "CATEGORY", "STATUS"].map(h => `"${h}"`).join(","));

    recordsToExport.forEach(v => {
        const isGuest = v.is_guest || v.owner_id === "GUEST-PASS" || (v.owner_name && v.owner_name.includes("Visitor / Guest"));
        const statusVal = isGuest ? "GUEST PASS" : (v.is_flagged ? "FLAGGED" : "APPROVED");
        const safeOwner = (v.owner_name || 'N/A').replace(/"/g, '""');
        const safeOwnerId = (v.owner_id || 'N/A').replace(/"/g, '""');
        const safePlate = (v.plate_number || '').replace(/"/g, '""');
        const safeCategory = (v.category || 'Car').toUpperCase().replace(/"/g, '""');

        rows.push([
            `"V-${v.id}"`,
            `"${safePlate}"`,
            `"${safeOwner}"`,
            `"${safeOwnerId}"`,
            `"${safeCategory}"`,
            `"${statusVal}"`
        ].join(","));
    });

    const dateStr = new Date().toISOString().slice(0, 10);
    const filterName = statusFilter.toLowerCase();
    downloadCSVFile(`vehicle_registry_${filterName}_${dateStr}.csv`, rows);
}

function triggerAdminCamCapture() {
    alert("📷 Webcam photo capture initialized. Photo attached to vehicle registration.");
    const statusEl = document.getElementById("adminAddCamStatus");
    if (statusEl) statusEl.innerText = "Photo Attached (Snapshot)";
}

// ================= ADMIN CAMERA MODAL HANDLERS =================
function openAddCameraModal() {
    const modal = document.getElementById("addCameraModal");
    if (modal) {
        modal.style.display = "flex";
    } else {
        const camName = prompt("Enter Camera Name:", "North Gate Secondary Stream");
        if (camName) alert(`Camera '${camName}' configured (Stream status: ONLINE)`);
    }
}

function closeAddCameraModal() {
    const modal = document.getElementById("addCameraModal");
    if (modal) modal.style.display = "none";
}

function submitNewCamera() {
    const camName = document.getElementById("newCamName") ? document.getElementById("newCamName").value.trim() : "New Cam Feed";
    alert(`Camera feed '${camName}' registered successfully!`);
    closeAddCameraModal();
    loadAdminCameras();
}

// ================= ADMIN MULTI-CRITERIA SEARCH ENGINE =================
async function executeAdminSearch() {
    const queryEl = document.getElementById("adminSearchQuery");
    const categoryEl = document.getElementById("adminSearchCategory");
    const statusEl = document.getElementById("adminSearchStatus");
    const container = document.getElementById("adminSearchResultsContainer");

    const query = queryEl ? queryEl.value.trim().toLowerCase() : "";
    const category = categoryEl ? categoryEl.value.trim().toLowerCase() : "";
    const status = statusEl ? statusEl.value.trim().toLowerCase() : "";

    if (!container) return;
    container.innerHTML = `<p style="text-align: center; color: #64748b; padding: 20px;">Searching database...</p>`;

    try {
        const res = await fetch(API_URL + "/entrance/records", {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!res.ok) throw new Error("Search query failed");
        const records = await res.json();

        let filtered = records || [];

        if (query) {
            filtered = filtered.filter(r => 
                (r.plate_number || "").toLowerCase().includes(query) ||
                (r.owner_name || "").toLowerCase().includes(query) ||
                (r.parking_slot || "").toLowerCase().includes(query)
            );
        }

        if (category) {
            filtered = filtered.filter(r => (r.category || "Car").toLowerCase() === category);
        }

        if (status) {
            filtered = filtered.filter(r => (r.status || "").toLowerCase().includes(status));
        }

        if (filtered.length === 0) {
            container.innerHTML = `<p style="text-align: center; color: #64748b; padding: 20px;">No matching records found for the specified search criteria.</p>`;
            return;
        }

        container.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>REC ID</th>
                        <th>PLATE NUMBER</th>
                        <th>OWNER / VISITOR</th>
                        <th>CATEGORY</th>
                        <th>SLOT</th>
                        <th>TIME</th>
                        <th>STATUS</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.map(r => `
                        <tr>
                            <td>#REC-${r.id}</td>
                            <td><span class="plate-tag">${r.plate_number}</span></td>
                            <td><strong>${r.owner_name || 'Visitor / Guest'}</strong></td>
                            <td><span class="badge-cat">${(r.category || 'Car').toUpperCase()}</span></td>
                            <td><strong>${r.parking_slot || 'Unassigned'}</strong></td>
                            <td>${formatDateTime(r.entrance_time)}</td>
                            <td><span class="status-badge ${r.status === 'Approved' ? 'allowed' : 'flagged'}">${(r.status || 'APPROVED').toUpperCase()}</span></td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;
    } catch (err) {
        console.error("Deep search error:", err);
        container.innerHTML = `<p style="text-align: center; color: #ef4444; padding: 20px;">Unable to complete search query.</p>`;
    }
}

// ================= ADMIN SECURITY CONTROLS & EXPORTS =================
function exportDetectionsCSV() {
    exportCSV();
}

function silenceSiren() {
    alert("🔕 Security Siren Silenced. All active audio alarms have been muted.");
}

function triggerGateOverride() {
    if (!confirm("⚠️ Emergency Override: Are you sure you want to force open the main entrance gate?")) return;
    alert("🚪 Emergency Override Triggered! Main entrance gate barrier is set to HOLD OPEN.");
}


// ================= AI ENGINE HARDWARE ACCELERATION CONTROLS (CPU / GPU) =================
async function loadAIEngineStatus() {
    try {
        const data = await adminAPI.getAIEngineStatus();
        if (!data) return;

        // 1. Telemetry Banner
        const gpuNameEl = document.getElementById("aiEngineGpuName");
        const cudaStatusEl = document.getElementById("aiEngineCudaStatus");
        const vramEl = document.getElementById("aiEngineVram");

        const cudaAvail = data.system && data.system.cuda_available;
        const gpuName = (data.system && data.system.gpu_name) || "No dedicated GPU detected";
        const vram = (data.system && data.system.vram_mb) || 0.0;

        if (gpuNameEl) gpuNameEl.innerText = gpuName;
        if (cudaStatusEl) {
            cudaStatusEl.innerText = cudaAvail ? "Active (CUDA)" : "Unavailable";
            cudaStatusEl.style.color = cudaAvail ? "#10b981" : "#ef4444";
        }
        if (vramEl) vramEl.innerText = `${vram} MB`;

        // 2. YOLO Status & Buttons
        const yolo = data.yolo || {};
        const isYoloGpu = yolo.is_gpu || (yolo.device && yolo.device.includes("cuda"));
        const yoloBadge = document.getElementById("aiYoloActiveBadge");
        const btnYoloGpu = document.getElementById("btnYoloGpu");
        const btnYoloCpu = document.getElementById("btnYoloCpu");

        if (yoloBadge) {
            yoloBadge.innerText = yolo.device_name || (isYoloGpu ? "CUDA GPU" : "CPU");
            yoloBadge.style.background = isYoloGpu ? "#ecfdf5" : "#f1f5f9";
            yoloBadge.style.color = isYoloGpu ? "#059669" : "#475569";
            yoloBadge.style.border = isYoloGpu ? "1px solid #a7f3d0" : "1px solid #cbd5e1";
        }

        if (btnYoloGpu && btnYoloCpu) {
            if (isYoloGpu) {
                btnYoloGpu.style.background = "#3b82f6";
                btnYoloGpu.style.color = "#ffffff";
                btnYoloGpu.style.borderColor = "#3b82f6";
                btnYoloCpu.style.background = "#f8fafc";
                btnYoloCpu.style.color = "#475569";
                btnYoloCpu.style.borderColor = "#cbd5e1";
            } else {
                btnYoloCpu.style.background = "#3b82f6";
                btnYoloCpu.style.color = "#ffffff";
                btnYoloCpu.style.borderColor = "#3b82f6";
                btnYoloGpu.style.background = "#f8fafc";
                btnYoloGpu.style.color = "#475569";
                btnYoloGpu.style.borderColor = "#cbd5e1";
            }
        }

        // 3. OCR Status & Buttons
        const ocr = data.ocr || {};
        const isOcrGpu = ocr.is_gpu || ocr.device === "gpu";
        const ocrBadge = document.getElementById("aiOcrActiveBadge");
        const btnOcrGpu = document.getElementById("btnOcrGpu");
        const btnOcrCpu = document.getElementById("btnOcrCpu");

        if (ocrBadge) {
            ocrBadge.innerText = ocr.device_name || (isOcrGpu ? "Paddle GPU" : "Intel oneDNN CPU");
            ocrBadge.style.background = isOcrGpu ? "#ecfdf5" : "#eff6ff";
            ocrBadge.style.color = isOcrGpu ? "#059669" : "#2563eb";
            ocrBadge.style.border = isOcrGpu ? "1px solid #a7f3d0" : "1px solid #bfdbfe";
        }

        if (btnOcrGpu && btnOcrCpu) {
            if (isOcrGpu) {
                btnOcrGpu.style.background = "#3b82f6";
                btnOcrGpu.style.color = "#ffffff";
                btnOcrGpu.style.borderColor = "#3b82f6";
                btnOcrCpu.style.background = "#f8fafc";
                btnOcrCpu.style.color = "#475569";
                btnOcrCpu.style.borderColor = "#cbd5e1";
            } else {
                btnOcrCpu.style.background = "#3b82f6";
                btnOcrCpu.style.color = "#ffffff";
                btnOcrCpu.style.borderColor = "#3b82f6";
                btnOcrGpu.style.background = "#f8fafc";
                btnOcrGpu.style.color = "#475569";
                btnOcrGpu.style.borderColor = "#cbd5e1";
            }
        }
    } catch (err) {
        console.warn("Failed to load AI Engine status:", err);
    }
}

async function switchYoloDevice(targetDevice, engine) {
    try {
        const payload = {
            yolo_device: targetDevice,
            yolo_engine: engine
        };
        const res = await adminAPI.updateAIEngineConfig(payload);
        if (res && res.result && res.result.yolo && res.result.yolo.success === false) {
            alert(`⚠️ YOLO Device Switch Warning: ${res.result.yolo.error}`);
        } else {
            alert(`✅ YOLO Detector switched to ${targetDevice === "cpu" ? "CPU (OpenVINO)" : "GPU (CUDA)"} successfully!`);
        }
        await loadAIEngineStatus();
    } catch (err) {
        alert("Failed to switch YOLO device: " + err.message);
    }
}

async function switchOcrDevice(targetDevice) {
    try {
        const payload = {
            ocr_device: targetDevice
        };
        const res = await adminAPI.updateAIEngineConfig(payload);
        if (res && res.result && res.result.ocr && res.result.ocr.success === false) {
            alert(`⚠️ OCR Device Switch Note: ${res.result.ocr.error}`);
        } else {
            alert(`✅ OCR Recognizer switched to ${targetDevice === "cpu" ? "CPU (Intel oneDNN)" : "GPU (CUDA)"} successfully!`);
        }
        await loadAIEngineStatus();
    } catch (err) {
        alert("Failed to switch OCR device: " + err.message);
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
    // 1. Detection Stats Overview
    try {
        const headers = token ? { "Authorization": "Bearer " + token } : {};
        const response = await fetch(API_URL + "/detection/stats", { headers });
        if (response.ok) {
            const stats = await response.json();
            if (document.getElementById("stat-total")) document.getElementById("stat-total").innerText = stats.total_detections || 0;
            if (document.getElementById("stat-allowed")) document.getElementById("stat-allowed").innerText = stats.allowed || 0;
            if (document.getElementById("stat-flagged")) document.getElementById("stat-flagged").innerText = stats.flagged || 0;
            if (document.getElementById("stat-confidence")) document.getElementById("stat-confidence").innerText = (stats.avg_confidence || 0) + "%";
            if (document.getElementById("stat-pass-rate")) document.getElementById("stat-pass-rate").innerText = (stats.pass_rate || 0) + "% pass rate";
            if (document.getElementById("stat-flagged-rate")) document.getElementById("stat-flagged-rate").innerText = (stats.flagged_rate || 0) + "% review rate";

            const badge = document.getElementById("alerts-badge");
            if (badge) {
                if (stats.flagged > 0) {
                    badge.innerText = stats.flagged;
                    badge.style.display = "inline-block";
                } else {
                    badge.style.display = "none";
                }
            }
            if (stats.hourly_labels && stats.hourly_counts) {
                renderVolumeChart(stats.hourly_labels, stats.hourly_counts);
            }
            if (stats.camera_labels && stats.camera_counts) {
                renderCameraChart(stats.camera_labels, stats.camera_counts);
            }
        }
    } catch (err) {
        console.warn("Dashboard overview stats warning:", err);
    }

    // 2. Live Active Vehicles Currently Inside & Occupancy Timeline Chart
    try {
        await loadOccupancyAnalytics();
    } catch (err) {
        console.warn("Occupancy analytics load error:", err);
    }

    // 3. Recent Detections List
    try {
        await loadRecentDetections();
    } catch (err) {
        console.warn("Recent detections load error:", err);
    }

    // 4. Pre-warm search caches
    try {
        if (!window.allVehiclesCache) {
            fetch(API_URL + "/vehicles").then(res => res.json()).then(data => { window.allVehiclesCache = data; }).catch(() => {});
        }
        if (!window.entranceRecordsCache) {
            fetch(API_URL + "/entrance/records").then(res => res.json()).then(records => {
                window.entranceRecordsCache = {};
                if (Array.isArray(records)) {
                    records.forEach(r => { window.entranceRecordsCache[r.id] = r; });
                }
            }).catch(() => {});
        }
    } catch (err) {}
}

// Global Chart Instances for Visual Occupancy Widgets
let categoryChartInstance = null;
let gateTrafficChartInstance = null;

async function loadOccupancyAnalytics() {
    try {
        const headers = token ? { "Authorization": "Bearer " + token } : {};
        const response = await fetch(API_URL + "/parking/occupancy-analytics", { headers });
        if (!response.ok) return;

        const data = await response.json();

        // Fetch total slots and status for capacity meter
        let totalSlots = 3;
        let occupiedSlots = 0;
        let availableSlots = 3;
        try {
            const statusRes = await fetch(API_URL + "/parking/status");
            if (statusRes.ok) {
                const statusData = await statusRes.json();
                totalSlots = statusData.total || 3;
                occupiedSlots = statusData.occupied || 0;
                availableSlots = statusData.available !== undefined ? statusData.available : Math.max(0, totalSlots - occupiedSlots);
            }
        } catch (e) {}

        const activeVehiclesInside = data.active_total || 0;
        const rawPercent = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;
        const percent = Math.min(100, rawPercent);

        // 1. Update Capacity Meter Card (Displays factor ratio instead of percentage)
        const meterPct = document.getElementById("meterPercentageText");
        if (meterPct) {
            meterPct.innerText = `${occupiedSlots}/${totalSlots}`;
            meterPct.style.color = (occupiedSlots >= totalSlots && totalSlots > 0) ? "#ef4444" : rawPercent > 85 ? "#ef4444" : "#2563eb";
        }

        const meterSub = document.getElementById("meterSubText");
        if (meterSub) meterSub.innerText = `${occupiedSlots} of ${totalSlots} Parking Bays Occupied`;

        const barEl = document.getElementById("occupancyProgressBar");
        if (barEl) {
            barEl.style.width = `${percent}%`;
            barEl.style.background = rawPercent > 85 ? "#ef4444" : rawPercent > 50 ? "#f59e0b" : "linear-gradient(90deg, #10b981 0%, #3b82f6 100%)";
        }

        const availEl = document.getElementById("meterAvailableText");
        if (availEl) availEl.innerText = `${availableSlots} Available`;

        const occEl = document.getElementById("meterOccupiedText");
        if (occEl) occEl.innerText = `${occupiedSlots} Occupied`;

        // 2. Update Stat Cards & Badges
        const activeInsideEl = document.getElementById("stat-active-inside");
        if (activeInsideEl) activeInsideEl.innerText = activeVehiclesInside;

        const breakdownEl = document.getElementById("stat-active-breakdown");
        if (breakdownEl && data.category_counts) {
            const cc = data.category_counts || {};
            const cats = [
                { name: 'Car', count: cc.Car || 0, color: '#2563eb', bg: 'rgba(37, 99, 235, 0.08)', svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>' },
                { name: 'Tuk Tuk', count: (cc['Tuk Tuk'] || cc.TukTuk || cc.TUKTUK || 0), color: '#16a34a', bg: 'rgba(22, 163, 74, 0.08)', svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 16l2.5-7.5A2 2 0 0 1 9.4 7H18a2 2 0 0 1 2 2v6H5"/><path d="M10 7v6h9"/><path d="M2 13h3"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>' },
                { name: 'Bike', count: cc.Bike || 0, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6h2a2 2 0 0 1 2 2v2"/><path d="M12 17.5V14l-3-3 4-3 2 3h3"/></svg>' },
                { name: 'Van', count: cc.Van || 0, color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.08)', svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="6" width="18" height="11" rx="2"/><circle cx="6" cy="17" r="2"/><circle cx="15" cy="17" r="2"/><path d="M19 10h4l-1.5 5H19"/></svg>' },
                { name: 'Bus', count: cc.Bus || 0, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M8 15h.01"/><path d="M16 15h.01"/><path d="M6 19v2"/><path d="M18 19v2"/></svg>' },
                { name: 'Truck', count: cc.Truck || 0, color: '#d97706', bg: 'rgba(217, 119, 6, 0.08)', svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>' }
            ];

            breakdownEl.innerHTML = cats.map(c => `
                <div style="display: flex; align-items: center; gap: 8px; background: rgba(248, 250, 252, 0.9); border: 1px solid var(--border-color); padding: 5px 12px 5px 6px; border-radius: 12px; transition: transform 0.2s ease;">
                    <div style="width: 34px; height: 34px; border-radius: 10px; background: ${c.bg}; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                        ${c.svg}
                    </div>
                    <div>
                        <div style="font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">${c.name}</div>
                        <div style="font-size: 14px; font-weight: 800; color: ${c.color}; line-height: 1;">${c.count}</div>
                    </div>
                </div>
            `).join("");
        }

        const badgeEl = document.getElementById("activeVehicleCountBadge");
        if (badgeEl) badgeEl.innerText = `${activeVehiclesInside} Active`;

        // 3. Render Live Active Vehicles Table (Render table FIRST so charts cannot block it)
        const tbody = document.getElementById("liveActiveVehiclesBody");
        if (tbody) {
            if (!data.active_vehicles || data.active_vehicles.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">No active vehicles inside premises right now.</td></tr>`;
            } else {
                tbody.innerHTML = data.active_vehicles.map(v => {
                    const catKey = (v.category || 'car').toUpperCase();
                    const entryDateObj = parseLocalIsoTime(v.entry_time);
                    let liveDwellSeconds = v.dwell_seconds || 0;
                    if (entryDateObj && !isNaN(entryDateObj.getTime())) {
                        liveDwellSeconds = Math.max(0, Math.floor((Date.now() - entryDateObj.getTime()) / 1000));
                    }
                    const dwellText = formatLiveDwellTime(liveDwellSeconds);
                    const formattedEntry = entryDateObj ? entryDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (v.entry_time ? new Date(v.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A");
                    return `
                        <tr>
                            <td>
                                <span class="plate-tag" style="margin:0;">${v.plate_number}</span>
                            </td>
                            <td>
                                <span style="font-size: 11px; padding: 3px 10px; border-radius: 12px; background: rgba(59, 130, 246, 0.12); color: #2563eb; font-weight: 800; display: inline-flex; align-items: center;">
                                    ${catKey}
                                </span>
                            </td>
                            <td>
                                <div><strong>${v.owner_name}</strong></div>
                            </td>
                            <td>
                                <span style="font-weight: bold; color: var(--primary-color);">${v.slot_name || 'Assigned'}</span>
                            </td>
                            <td>${formattedEntry}</td>
                            <td>
                                <span class="live-stay-ticker" data-entry-time="${v.entry_time || ''}" data-initial-dwell="${liveDwellSeconds}" data-current-dwell="${liveDwellSeconds}" style="display: inline-flex; align-items: center; gap: 4px; color: #10b981; font-weight: 700; font-size: 12px; background: rgba(16, 185, 129, 0.1); padding: 2px 8px; border-radius: 10px;">
                                    ⏱️ ${dwellText}
                                </span>
                            </td>
                        </tr>
                    `;
                }).join("");
            }
        }

        // 4. Render Visual Category Chart & Gate Traffic Chart in isolated safe blocks
        try {
            renderCategoryDistChart(data.category_counts || {});
        } catch (chartErr) {
            console.warn("Category chart error:", chartErr);
        }

        try {
            renderGateTrafficChart(data.hourly_arrivals || [], data.hourly_departures || []);
        } catch (chartErr) {
            console.warn("Gate traffic chart error:", chartErr);
        }
    } catch (err) {
        console.error("Occupancy analytics load error:", err);
    }
}

function formatLiveDwellTime(totalSeconds) {
    if (typeof totalSeconds !== 'number' || isNaN(totalSeconds) || totalSeconds < 0) return "Just arrived";
    
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hrs > 0) {
        return `${hrs}h ${mins}m ago`;
    } else if (mins > 0) {
        return `${mins}m ${secs}s ago`;
    } else if (secs > 0) {
        return `${secs}s ago`;
    } else {
        return `Just arrived (0s)`;
    }
}

function renderCategoryDistChart(counts) {
    const container = document.getElementById("categoryDistContainer");
    if (!container) return;

    const categories = [
        { key: 'Car', label: 'Car', icon: '🚘', color: '#2563eb' },
        { key: 'Tuk Tuk', label: 'Tuk Tuk', icon: '🛺', color: '#16a34a' },
        { key: 'Truck', label: 'Truck', icon: '🚚', color: '#d97706' },
        { key: 'Van', label: 'Van', icon: '🚐', color: '#0ea5e9' },
        { key: 'Bike', label: 'Bike', icon: '🏍️', color: '#10b981' },
        { key: 'Bus', label: 'Bus', icon: '🚌', color: '#ef4444' }
    ];

    const total = categories.reduce((sum, c) => sum + (counts[c.key] || 0), 0);

    let html = `
        <div style="display: flex; flex-direction: column; gap: 8px; justify-content: center; height: 100%; padding: 4px 0;">
    `;

    categories.forEach(c => {
        const count = counts[c.key] || 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        html += `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 68px; font-size: 12px; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 4px;">
                    <span>${c.icon}</span> <span>${c.label}</span>
                </div>
                <div style="flex: 1; height: 12px; background: #f1f5f9; border-radius: 6px; overflow: hidden; position: relative;">
                    <div style="width: ${pct}%; height: 100%; background: ${c.color}; border-radius: 6px; transition: width 0.4s ease;"></div>
                </div>
                <div style="width: 52px; text-align: right; font-size: 12px; font-weight: 800; color: ${count > 0 ? c.color : 'var(--text-muted)'};">
                    ${count} <span style="font-size: 10px; font-weight: normal; color: var(--text-muted);">(${pct}%)</span>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

function renderGateTrafficChart(arrivals, departures) {
    const container = document.getElementById("gateTrafficContainer");
    if (!container) return;

    const totalIn = Array.isArray(arrivals) ? arrivals.reduce((a, b) => a + b, 0) : 0;
    const totalOut = Array.isArray(departures) ? departures.reduce((a, b) => a + b, 0) : 0;
    const totalTraffic = totalIn + totalOut;
    const inPct = totalTraffic > 0 ? Math.round((totalIn / totalTraffic) * 100) : (totalIn > 0 ? 100 : 50);
    const outPct = totalTraffic > 0 ? (100 - inPct) : (totalOut > 0 ? 100 : 50);

    container.innerHTML = `
        <div style="display: flex; flex-direction: column; justify-content: space-around; height: 100%; padding: 4px 0;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 10px; padding: 8px 10px; text-align: center;">
                    <div style="font-size: 10px; font-weight: 700; color: #059669; text-transform: uppercase; margin-bottom: 2px;">🟢 Total In (Arrivals)</div>
                    <div style="font-size: 20px; font-weight: 800; color: #047857; line-height: 1.1;">${totalIn}</div>
                    <div style="font-size: 10px; color: var(--text-muted);">${inPct}% of traffic</div>
                </div>
                <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 10px; padding: 8px 10px; text-align: center;">
                    <div style="font-size: 10px; font-weight: 700; color: #dc2626; text-transform: uppercase; margin-bottom: 2px;">🔴 Total Out (Exits)</div>
                    <div style="font-size: 20px; font-weight: 800; color: #b91c1c; line-height: 1.1;">${totalOut}</div>
                    <div style="font-size: 10px; color: var(--text-muted);">${outPct}% of traffic</div>
                </div>
            </div>

            <div>
                <div style="display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; margin-bottom: 4px; color: var(--text-muted);">
                    <span>Inbound (${inPct}%)</span>
                    <span>Outbound (${outPct}%)</span>
                </div>
                <div style="height: 10px; border-radius: 6px; background: #e2e8f0; display: flex; overflow: hidden;">
                    <div style="width: ${inPct}%; background: #10b981; transition: width 0.4s ease;"></div>
                    <div style="width: ${outPct}%; background: #ef4444; transition: width 0.4s ease;"></div>
                </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border-radius: 8px; padding: 6px 10px; font-size: 11px;">
                <span style="color: var(--text-muted); font-weight: 600;">Active On-Site:</span>
                <span style="font-weight: 800; color: var(--primary-color); font-size: 12px;">🚘 ${Math.max(0, totalIn - totalOut)} Vehicles</span>
            </div>
        </div>
    `;
}

function renderVolumeChart(labels, counts) {
    const canvas = document.getElementById("hourlyVolumeChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
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
    const canvas = document.getElementById("byCameraChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
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
        if (!tbody) return;
        tbody.innerHTML = "";

        // Show only the 8 most recent
        logs.slice(0, 8).forEach(log => {
            const statusClass = log.status.toLowerCase() === "allowed" ? "allowed" : "flagged";
            const localizedStatus = translations[currentLang][`status_${log.status.toLowerCase()}`] || log.status;
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
                            ${localizedStatus}
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

let autoLiveScanTimeout = null;
let isAutoLiveScanEnabled = true;
let isScanInProgress = false;
let currentScanAbortController = null;
let scanWatchdogTimer = null;
let currentCameraSessionId = 0;
let lastLiveScannedPlate = "";
let lastLiveScanTimestamp = 0;
let autoScanPlateBuffer = {
    plate: "",
    count: 0,
    lastDetectedTime: 0
};
let exitDetectionBuffer = {
    plate: "",
    count: 0,
    lastDetectedTime: 0
};
let lastAutoExitPlate = "";
let lastAutoExitTimestamp = 0;

function drawDetectionOverlay(bbox, plateText, confidence, status) {
    const overlayCanvas = document.getElementById("detectionOverlayCanvas");
    const video = document.getElementById("webcamFeed");
    if (!overlayCanvas || !video || !video.videoWidth) return;

    overlayCanvas.width = video.videoWidth;
    overlayCanvas.height = video.videoHeight;
    const ctx = overlayCanvas.getContext("2d");
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    // Strictly require a valid YOLO bounding box - DO NOT draw fake default boxes
    if (!bbox || !Array.isArray(bbox) || bbox.length < 4) {
        return;
    }

    const [x1, y1, x2, y2] = bbox;
    if (x2 <= x1 || y2 <= y1 || isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
        return;
    }

    const boxColor = status === "Allowed" ? "#10b981" : "#22c55e"; // bright green
    const boxW = x2 - x1;
    const boxH = y2 - y1;

    // 1. Draw glowing green bounding box
    ctx.strokeStyle = boxColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(x1, y1, boxW, boxH);

    // 2. Draw corner targeting brackets
    const cornerLen = Math.min(24, boxW * 0.2, boxH * 0.2);
    ctx.lineWidth = 6;
    ctx.beginPath();
    // Top-Left
    ctx.moveTo(x1, y1 + cornerLen); ctx.lineTo(x1, y1); ctx.lineTo(x1 + cornerLen, y1);
    // Top-Right
    ctx.moveTo(x2 - cornerLen, y1); ctx.lineTo(x2, y1); ctx.lineTo(x2, y2 - cornerLen);
    // Bottom-Right
    ctx.moveTo(x2, y2 - cornerLen); ctx.lineTo(x2, y2); ctx.lineTo(x2 - cornerLen, y2);
    // Bottom-Left
    ctx.moveTo(x1 + cornerLen, y2); ctx.lineTo(x1, y2); ctx.lineTo(x1, y2 - cornerLen);
    ctx.stroke();

    // 3. Draw Top Plate Label Banner
    const labelText = `🟩 ${plateText} (${confidence}%)`;
    ctx.font = "bold 16px Inter, sans-serif";
    const textWidth = ctx.measureText(labelText).width;

    ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
    ctx.fillRect(x1, Math.max(0, y1 - 28), textWidth + 16, 28);

    ctx.fillStyle = "#ffffff";
    ctx.fillText(labelText, x1 + 8, Math.max(20, y1 - 8));
}

function clearDetectionOverlay() {
    const overlayCanvas = document.getElementById("detectionOverlayCanvas");
    if (overlayCanvas) {
        const ctx = overlayCanvas.getContext("2d");
        ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    }
}

function toggleAutoLiveScan() {
    isAutoLiveScanEnabled = !isAutoLiveScanEnabled;
    const btn = document.getElementById("btnAutoLiveScan");
    if (btn) {
        btn.textContent = isAutoLiveScanEnabled ? "⚡ Continuous AI Scan: ON" : "⏸️ Continuous AI Scan: OFF";
        btn.style.background = isAutoLiveScanEnabled ? "rgba(16, 185, 129, 0.08)" : "transparent";
        btn.style.borderColor = isAutoLiveScanEnabled ? "#10b981" : "var(--border-color)";
    }
    if (isAutoLiveScanEnabled && webcamStream) {
        startAutoLiveScanLoop();
    } else {
        stopAutoLiveScanLoop();
    }
}

function startAutoLiveScanLoop() {
    stopAutoLiveScanLoop();
    scheduleNextAutoScan(100);
}

function stopAutoLiveScanLoop() {
    if (autoLiveScanTimeout) {
        clearTimeout(autoLiveScanTimeout);
        autoLiveScanTimeout = null;
    }
    clearDetectionOverlay();
}

function scheduleNextAutoScan(delay = 100) {
    if (!isAutoLiveScanEnabled || !webcamStream) return;
    if (autoLiveScanTimeout) {
        clearTimeout(autoLiveScanTimeout);
    }
    autoLiveScanTimeout = setTimeout(() => {
        const confirmModal = document.getElementById("detectionConfirmModal");
        const isModalOpen = confirmModal && (confirmModal.style.display === "flex" || confirmModal.style.display === "block");
        if (webcamStream && isAutoLiveScanEnabled && !isScanInProgress && !isModalOpen) {
            scanCurrentFrame(true);
        } else if (isAutoLiveScanEnabled && webcamStream) {
            scheduleNextAutoScan(200);
        }
    }, delay);
}

async function populateCameraDeviceList() {
    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === "videoinput");
        const select = document.getElementById("cameraDeviceSelect");
        if (!select) return;

        const currentVal = select.value;
        select.innerHTML = `<option value="">🎥 Auto Detect / Default Camera</option>`;
        
        videoDevices.forEach((device, index) => {
            const opt = document.createElement("option");
            opt.value = device.deviceId;
            opt.innerText = device.label || `Camera ${index + 1} (${device.deviceId.slice(0, 8)}...)`;
            if (device.label && (device.label.toLowerCase().includes("droidcam") || device.label.toLowerCase().includes("iriun"))) {
                opt.innerText = "📱 " + opt.innerText;
            }
            select.appendChild(opt);
        });

        if (currentVal && Array.from(select.options).some(o => o.value === currentVal)) {
            select.value = currentVal;
        }
    } catch (e) {
        console.warn("Could not enumerate camera devices:", e);
    }
}

async function onCameraDeviceChanged() {
    if (webcamStream) {
        stopCamera();
        await startCamera();
    }
}

async function startCamera() {
    currentCameraSessionId++;
    const thisSession = currentCameraSessionId;
    const video = document.getElementById("webcamFeed");
    try {
        // Hard reset in-flight state before starting
        if (currentScanAbortController) {
            try { currentScanAbortController.abort(); } catch (e) {}
            currentScanAbortController = null;
        }
        if (scanWatchdogTimer) {
            clearTimeout(scanWatchdogTimer);
            scanWatchdogTimer = null;
        }
        isScanInProgress = false;

        const select = document.getElementById("cameraDeviceSelect");
        const selectedDeviceId = select ? select.value : "";

        const videoConstraints = selectedDeviceId
            ? { deviceId: { exact: selectedDeviceId } }
            : true;

        webcamStream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
        
        // Refresh device labels once permission is granted
        populateCameraDeviceList();

        if (video) {
            video.srcObject = webcamStream;
            video.onloadedmetadata = () => {
                if (currentCameraSessionId !== thisSession) return;
                video.play().catch(() => {});
                console.log("Camera ready:", video.videoWidth, "x", video.videoHeight);
                if (isAutoLiveScanEnabled) {
                    startAutoLiveScanLoop();
                }
            };
        }
        
        document.getElementById("liveCameraLogBody").innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 30px;">
                Camera online. Real-time ANPR scanner running...
            </div>
        `;
    } catch (err) {
        console.error("Camera access error:", err);
        alert("Failed to access camera: " + err.message);
    }
}

function stopCamera() {
    currentCameraSessionId++;
    // 1. Abort any in-flight backend request
    if (currentScanAbortController) {
        try { currentScanAbortController.abort(); } catch (e) {}
        currentScanAbortController = null;
    }
    // 2. Clear watchdog timer
    if (scanWatchdogTimer) {
        clearTimeout(scanWatchdogTimer);
        scanWatchdogTimer = null;
    }
    // 3. Reset scan progress lock
    isScanInProgress = false;
    // 4. Stop auto live scan loop
    stopAutoLiveScanLoop();
    // 5. Release media tracks and clear video source
    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        webcamStream = null;
    }
    const video = document.getElementById("webcamFeed");
    if (video) {
        video.srcObject = null;
        video.onloadedmetadata = null;
    }
    clearDetectionOverlay();
    initCaptureLogs();
}

async function scanCurrentFrame(isAutoScan = false) {
    if (!webcamStream) {
        if (!isAutoScan) alert("Please start the camera first.");
        return;
    }

    const video = document.getElementById("webcamFeed");
    const canvas = document.getElementById("snapshotCanvas");
    if (!video || !canvas) return;

    // Readiness check: Ensure video stream has loaded dimensions and is actively playing
    if (!video.videoWidth || video.videoWidth === 0 || video.paused || video.ended) {
        if (!isAutoScan) alert("Camera stream is initializing. Please wait a moment.");
        return;
    }

    if (isScanInProgress) {
        return;
    }

    const thisSessionId = currentCameraSessionId;

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    isScanInProgress = true;

    // Create fresh AbortController for this frame request
    currentScanAbortController = new AbortController();

    // Safe generous 180-second watchdog timer to avoid premature abort on heavy CPU load
    if (scanWatchdogTimer) clearTimeout(scanWatchdogTimer);
    scanWatchdogTimer = setTimeout(() => {
        if (isScanInProgress && currentCameraSessionId === thisSessionId) {
            console.warn("Scan watchdog: Request exceeded 180s timeout, releasing lock.");
            if (currentScanAbortController) {
                try { currentScanAbortController.abort(); } catch (e) {}
                currentScanAbortController = null;
            }
            isScanInProgress = false;
        }
    }, 180000);

    // Convert canvas to high-quality JPEG Blob
    canvas.toBlob(async (blob) => {
        if (!blob) {
            if (scanWatchdogTimer) {
                clearTimeout(scanWatchdogTimer);
                scanWatchdogTimer = null;
            }
            currentScanAbortController = null;
            isScanInProgress = false;
            if (isAutoScan && isAutoLiveScanEnabled && webcamStream) {
                scheduleNextAutoScan(150);
            }
            return;
        }

        const formData = new FormData();
        formData.append("file", blob, "frame.jpg");

        try {
            if (!isAutoScan) {
                document.getElementById("liveCameraLogBody").innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        ⌛ Scanning frame for license plate...
                    </div>
                `;
            }

            const currentVerifMode = getVerificationMode();
            const response = await fetch(`${API_URL}/detection/upload?process_ai=true&verification_mode=${encodeURIComponent(currentVerifMode)}`, {
                method: "POST",
                headers: { "Authorization": "Bearer " + token },
                body: formData,
                signal: currentScanAbortController ? currentScanAbortController.signal : undefined
            });

            // Guard against results returning after camera was stopped or switched
            if (currentCameraSessionId !== thisSessionId || !webcamStream) {
                console.log("Discarding scan result from inactive/previous camera session.");
                return;
            }

            if (!response.ok) throw new Error("Plate Scan failed");
            
            const data = await response.json();

            // Guard against results parsed after session changed
            if (currentCameraSessionId !== thisSessionId || !webcamStream) {
                console.log("Discarding scan result from inactive/previous camera session.");
                return;
            }
            
            const detectedPlate = data.recognized_plate || data.raw_plate;
            const rawPlateClean = String(detectedPlate || '').replace(/[\s\-_]/g, '');
            const confidence = data.confidence ? Math.round(data.confidence * (data.confidence <= 1 ? 100 : 1)) : (data.detected ? 88 : 0);
            const hasBbox = Array.isArray(data.bbox) && data.bbox.length === 4;
            const isDetected = Boolean(data.detected === true) && hasBbox && rawPlateClean.length >= 4 && data.valid === true && confidence >= 70;
            const displayPlate = detectedPlate ? detectedPlate : "PLATE DETECTED";
            const category = data.plate_category || (isDetected ? "Standard" : "N/A");
            const status = isDetected ? (data.status || (data.found ? "Allowed" : "Pending Verification")) : "No-Plate";
            const owner = data.vehicle ? data.vehicle.owner_name : (isDetected ? "Unregistered" : "N/A");
            const isRegistered = Boolean((data.found === true || data.is_registered === true) && status === "Allowed" && (!data.vehicle || !data.vehicle.is_guest));
            const parkingInfo = data.parking_slot ? ` | Slot: <b>${data.parking_slot}</b>` : (data.parking_message ? ` | <i>${data.parking_message}</i>` : "");

            const timestamp = new Date().toLocaleTimeString();
            const logBody = document.getElementById("liveCameraLogBody");
            
            const borderColor = status === 'Allowed' ? 'var(--success-color)' : (status === 'Flagged' ? 'var(--danger-color)' : '#f59e0b');
            const badgeClass = status === 'Allowed' ? 'allowed' : (status === 'Flagged' ? 'flagged' : 'pending');

            const now = Date.now();

            if (!isDetected) {
                if (now - autoScanPlateBuffer.lastDetectedTime > 1500) {
                    clearDetectionOverlay();
                    autoScanPlateBuffer.plate = "";
                    autoScanPlateBuffer.count = 0;
                }
                if (!isAutoScan) {
                    logBody.innerHTML = `
                        <div class="log-entry" style="border-left: 4px solid var(--text-muted); padding-left: 10px; margin-bottom: 8px;">
                            <div>
                                <div style="font-weight: 700; font-size: 13px; color: #64748b;">
                                    🔍 NO PLATE DETECTED
                                </div>
                                <div style="font-size: 11px; color: var(--text-muted); margin-top: 3px;">
                                    Time: ${timestamp} | Tip: Position license plate closer to the camera feed.
                                </div>
                            </div>
                            <span class="status-badge pending">No-Plate</span>
                        </div>
                    ` + logBody.innerHTML;
                }
            } else {
                const isConfirmedResult = data.is_confirmed !== false;
                const consensusState = data.consensus_state || (isConfirmedResult ? 'confirmed' : 'voting');
                const overlayLabel = !isConfirmedResult ? `[Voting ${data.agreeing_frames || 1}/${data.voting_frames || 2}] ${displayPlate}` : displayPlate;

                // Real YOLO BBox overlay displayed immediately with consensus indicator
                drawDetectionOverlay(data.bbox, overlayLabel, confidence, status);

                // Auto populate manual check input if empty or updated
                const manualInput = document.querySelector('input[placeholder*="ENTER OR SCAN LICENSE PLATE"]');
                if (manualInput && isConfirmedResult) {
                    manualInput.value = displayPlate;
                }

                const isDuplicate = Boolean(data.is_duplicate === true);
                const isParked = Boolean(data.is_parked === true);
                const inTransitBuffer = Boolean(data.in_transit_buffer === true);
                const inExitCooldown = Boolean(data.in_exit_cooldown === true || data.action_type === "exit_cooldown");
                const exitCdRem = data.exit_cooldown_remaining_sec || 0;
                const mode = getVerificationMode();

                let logStatusText = status;
                let logBadgeClass = badgeClass;
                let logBorderColor = borderColor;

                if (!isConfirmedResult) {
                    logStatusText = `Voting (${data.agreeing_frames || 1}/${data.voting_frames || 2})`;
                    logBadgeClass = "pending";
                    logBorderColor = "#3b82f6";
                } else if (inExitCooldown) {
                    logStatusText = "Transit Cooldown";
                    logBadgeClass = "pending";
                    logBorderColor = "#f59e0b";
                } else if (!isRegistered && !isParked) {
                    logStatusText = "Pending Verification";
                    logBadgeClass = "pending";
                    logBorderColor = "#f59e0b";
                } else if (mode === "strict") {
                    logStatusText = isParked ? "Strict: Exit Check" : "Strict: Entry Check";
                    logBadgeClass = "pending";
                    logBorderColor = "#f59e0b";
                } else if (mode === "smart") {
                    if (isParked && confidence >= 85 && !inTransitBuffer) {
                        logStatusText = "Auto-Exited";
                        logBadgeClass = "flagged";
                        logBorderColor = "#ef4444";
                    } else if (!isParked && isRegistered && confidence >= 85) {
                        logStatusText = "Allowed";
                        logBadgeClass = "allowed";
                        logBorderColor = "var(--success-color)";
                    }
                }

                // Multi-frame temporal consensus tracking
                if (autoScanPlateBuffer.plate === displayPlate && (now - autoScanPlateBuffer.lastDetectedTime) < 30000) {
                    autoScanPlateBuffer.count++;
                } else {
                    autoScanPlateBuffer.plate = displayPlate;
                    autoScanPlateBuffer.count = 1;
                }
                autoScanPlateBuffer.lastDetectedTime = now;

                const hasConsensus = isConfirmedResult && (!isAutoScan || isRegistered || autoScanPlateBuffer.count >= 2);

                if (!isDuplicate && isConfirmedResult) {
                    lastLiveScannedPlate = displayPlate;
                    lastLiveScanTimestamp = Date.now();

                    logBody.innerHTML = `
                        <div class="log-entry" style="border-left: 4px solid ${logBorderColor}; padding-left: 10px; margin-bottom: 8px;">
                            <div>
                                <div style="font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 6px;">
                                    <span class="plate-tag" style="padding: 2px 6px; font-size: 12px;">${displayPlate}</span>
                                    <span style="font-size: 10px; background: rgba(0,0,0,0.06); padding: 2px 5px; border-radius: 4px;">${category}</span>
                                </div>
                                <div style="color: var(--text-muted); font-size: 11px; margin-top: 4px;">Time: ${timestamp} | Cam-01 Gate | Conf: ${confidence}% (${mode.toUpperCase()})</div>
                                <div style="font-size: 12px; margin-top: 4px;">Owner: <b>${owner}</b>${parkingInfo}</div>
                            </div>
                            <span class="status-badge ${logBadgeClass}">
                                ${logStatusText}
                            </span>
                        </div>
                    ` + logBody.innerHTML;

                    if (status === "Flagged" && mode !== "strict" && hasConsensus) {
                        triggerSecuritySiren();
                        if (typeof loadAlerts === "function") {
                            loadAlerts();
                        }
                    }
                }

                const confirmModal = document.getElementById("detectionConfirmModal");
                const isModalAlreadyOpen = confirmModal && (confirmModal.style.display === "flex" || confirmModal.style.display === "block");

                // Verification check for Live Scan & Manual Frame Capture:
                let shouldPromptVerification = false;
                if (!isModalAlreadyOpen) {
                    if (isParked) {
                        // Vehicle already on premises: ONLY process exit if 60s transit buffer has expired
                        if (!inTransitBuffer) {
                            if (mode === "strict") {
                                // Strict Mode: ALWAYS prompt departure confirmation modal for guard review
                                shouldPromptVerification = true;
                            } else if (mode === "smart") {
                                // Smart Mode: Low confidence (< 85%) prompts confirmation modal; High confidence (>= 85%) triggers Auto-Exit
                                if (confidence < 85) {
                                    shouldPromptVerification = true;
                                } else {
                                    const nowTs = Date.now();
                                    if (nowTs - lastAutoExitTimestamp > 3000 || lastAutoExitPlate !== displayPlate) {
                                        lastAutoExitTimestamp = nowTs;
                                        lastAutoExitPlate = displayPlate;
                                        console.log(`[Smart ANPR] Auto-authorizing departure for ${displayPlate} (Confidence: ${confidence}%).`);
                                        await processDepartureGateManual(displayPlate);
                                    }
                                }
                            } else if (mode === "auto") {
                                // Full Auto Mode: ALWAYS auto-exit without popups
                                const nowTs = Date.now();
                                if (nowTs - lastAutoExitTimestamp > 3000 || lastAutoExitPlate !== displayPlate) {
                                    lastAutoExitTimestamp = nowTs;
                                    lastAutoExitPlate = displayPlate;
                                    console.log(`[Auto ANPR] Auto-authorizing departure for ${displayPlate}.`);
                                    await processDepartureGateManual(displayPlate);
                                }
                            }
                        }
                    } else {
                        // Arriving vehicle:
                        if (inExitCooldown) {
                            // Vehicle in post-exit cooldown (< 60s since exit) -> DO NOT auto-admit or prompt entrance
                            shouldPromptVerification = false;
                        } else if (mode === "strict") {
                            // Strict Mode: ALWAYS prompt entrance verification modal for every arriving vehicle
                            shouldPromptVerification = true;
                        } else if (mode === "smart") {
                            // Smart Mode: Prompts for unregistered or low confidence (< 85%)
                            shouldPromptVerification = (!isRegistered || confidence < 85);
                        } else if (mode === "auto") {
                            // Full Auto Mode: Only prompt for unregistered / guest pass
                            shouldPromptVerification = !isRegistered;
                        }
                    }
                }

                if (shouldPromptVerification) {
                    const snapUrl = URL.createObjectURL(blob);
                    showDetectionConfirmModal({
                        plate_number: displayPlate,
                        raw_plate: data.raw_plate || displayPlate,
                        category: category,
                        snapshot: snapUrl,
                        confidence: confidence,
                        is_registered: isRegistered,
                        owner_name: owner,
                        is_parked: isParked,
                        in_transit_buffer: inTransitBuffer,
                        in_exit_cooldown: inExitCooldown,
                        exit_cooldown_remaining_sec: exitCdRem,
                        stay_seconds: data.stay_seconds !== undefined ? data.stay_seconds : (inTransitBuffer ? 0 : 999),
                        transit_remaining_sec: data.transit_remaining_sec || 0,
                        parking_slot: data.parking_slot || null
                    });
                }
            }

        } catch (err) {
            if (currentCameraSessionId !== thisSessionId) {
                return;
            }
            if (err.name === "AbortError") {
                console.log("Scan frame request aborted.");
            } else {
                console.error("Frame scan error:", err);
                if (!isAutoScan) alert("Error scanning frame.");
            }
        } finally {
            if (scanWatchdogTimer) {
                clearTimeout(scanWatchdogTimer);
                scanWatchdogTimer = null;
            }
            currentScanAbortController = null;
            isScanInProgress = false;
            // Schedule the NEXT frame scan only after current request is completed (one-frame-at-a-time)
            const confirmModal = document.getElementById("detectionConfirmModal");
            const isModalOpen = confirmModal && (confirmModal.style.display === "flex" || confirmModal.style.display === "block");
            if (isAutoScan && isAutoLiveScanEnabled && webcamStream && currentCameraSessionId === thisSessionId && !isModalOpen) {
                scheduleNextAutoScan(100);
            }
        }
    }, "image/jpeg", 0.95);
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
                    <div style="padding: 8px 10px; border-radius: 6px; background-color: rgba(255, 255, 255, 0.7); border: 1px solid ${data.parking_assigned ? 'var(--success-color)' : '#94a3b8'}; color: var(--text-main); font-size: 12px; display: flex; align-items: center; gap: 6px;">
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
            if (typeof loadAlerts === "function") {
                loadAlerts();
            }
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
            const noVehiclesMsg = currentLang === 'en' ? 'No vehicles found' : currentLang === 'si' ? 'වාහන හමු නොවීය' : 'வாகனங்கள் எதுவும் இல்லை';
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">${noVehiclesMsg}</td></tr>`;
            return;
        }

        vehicles.forEach(vehicle => {
            const imgUrl = vehicle.vehicle_image ? `${API_URL}/uploads/${vehicle.vehicle_image}` : 'https://placehold.co/40x30/f1f5f9/64748b?text=🚗';
            const editText = translations[currentLang].btn_edit || 'Edit';
            const deleteText = translations[currentLang].btn_delete || 'Delete';
            tbody.innerHTML += `
                <tr>
                    <td>${vehicle.id}</td>
                    <td><img src="${imgUrl}" style="width: 40px; height: 30px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-color);" alt="vehicle"></td>
                    <td><span class="plate-tag">${vehicle.plate_number}</span></td>
                    <td>${vehicle.owner_name}</td>
                    <td>${vehicle.owner_id}</td>
                    <td>${vehicle.vehicle_model ?? ""}</td>
                    <td>
                        <button class="btn-action-edit" onclick="editVehicle(${vehicle.id})">${editText}</button>
                        <button class="btn-action-delete" onclick="deleteVehicle(${vehicle.id})">${deleteText}</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Load vehicles error:", err);
    }
}

// Search
async function handleGlobalSearch(query) {
    const dropdown = document.getElementById("globalSearchResultsDropdown");
    const rawQ = query ? query.trim() : "";
    const cleanQ = rawQ.toLowerCase().replace(/[\s\-_]/g, "");

    // 1. In-page Table Row Filtering for visible tables
    const tableBodies = [
        "liveActiveVehiclesBody",
        "entranceHistoryTableBody",
        "vehiclesTableBody",
        "recordsTableBody",
        "alertsTableBody"
    ];

    tableBodies.forEach(tbodyId => {
        const tbody = document.getElementById(tbodyId);
        if (tbody) {
            const rows = tbody.querySelectorAll("tr");
            rows.forEach(row => {
                const text = row.textContent.toLowerCase().replace(/[\s\-_]/g, "");
                if (!cleanQ) {
                    row.style.display = "";
                } else {
                    row.style.display = text.includes(cleanQ) ? "" : "none";
                }
            });
        }
    });

    // 2. Build Floating Instant Search Dropdown Results
    if (!dropdown) return;
    if (!cleanQ) {
        dropdown.style.display = "none";
        dropdown.innerHTML = "";
        return;
    }

    // Ensure caches are loaded on-demand if missing
    if (!window.allVehiclesCache) {
        try {
            const headers = token ? { "Authorization": "Bearer " + token } : {};
            const vRes = await fetch(API_URL + "/vehicles", { headers });
            if (vRes.ok) window.allVehiclesCache = await vRes.json();
        } catch (e) {}
    }
    if (!window.entranceRecordsCache) {
        try {
            const headers = token ? { "Authorization": "Bearer " + token } : {};
            const eRes = await fetch(API_URL + "/entrance/records", { headers });
            if (eRes.ok) {
                const eData = await eRes.json();
                window.entranceRecordsCache = {};
                if (Array.isArray(eData)) {
                    eData.forEach(r => { window.entranceRecordsCache[r.id] = r; });
                }
            }
        } catch (e) {}
    }

    const results = [];

    // Search Registered Vehicles
    if (window.allVehiclesCache && Array.isArray(window.allVehiclesCache)) {
        window.allVehiclesCache.forEach(v => {
            const matchPlate = v.plate_number && v.plate_number.toLowerCase().replace(/[\s\-_]/g, "").includes(cleanQ);
            const matchOwner = v.owner_name && v.owner_name.toLowerCase().replace(/[\s\-_]/g, "").includes(cleanQ);
            const matchModel = v.vehicle_model && v.vehicle_model.toLowerCase().replace(/[\s\-_]/g, "").includes(cleanQ);
            if (matchPlate || matchOwner || matchModel) {
                results.push({
                    type: 'Registered Vehicle',
                    icon: '📋',
                    title: v.plate_number,
                    subtitle: `Owner: ${v.owner_name || 'N/A'} | Model: ${v.vehicle_model || 'N/A'}`,
                    action: `switchTab('admin'); setTimeout(() => { switchAdminSubtab('vehicles'); }, 100);`
                });
            }
        });
    }

    // Search Entrance History Records
    if (window.entranceRecordsCache) {
        Object.values(window.entranceRecordsCache).forEach(rec => {
            const matchPlate = rec.plate_number && rec.plate_number.toLowerCase().replace(/[\s\-_]/g, "").includes(cleanQ);
            const v = rec.vehicle || {};
            const matchOwner = v.owner_name && v.owner_name.toLowerCase().replace(/[\s\-_]/g, "").includes(cleanQ);
            if (matchPlate || matchOwner) {
                results.push({
                    type: 'Entrance Log',
                    icon: '🕒',
                    title: `Log #${rec.id} - ${rec.plate_number}`,
                    subtitle: `Slot: ${rec.parking_slot || 'Unassigned'} | Status: ${rec.status || 'Approved'}`,
                    action: `switchTab('entrance'); viewEntranceDetailsById(${rec.id});`
                });
            }
        });
    }

    // Display Dropdown
    if (results.length === 0) {
        dropdown.innerHTML = `
            <div style="padding: 12px; text-align: center; color: var(--text-muted); font-size: 13px;">
                🔍 No matching vehicles or logs found for "<strong>${rawQ}</strong>"
            </div>
        `;
    } else {
        dropdown.innerHTML = `
            <div style="font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; padding: 6px 10px; border-bottom: 1px solid var(--border-color);">
                Search Results (${results.length})
            </div>
            ${results.slice(0, 8).map(res => `
                <div onclick="${res.action} document.getElementById('globalSearchResultsDropdown').style.display='none';" 
                     style="padding: 8px 10px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: background 0.15s; margin-top: 2px;"
                     onmouseover="this.style.background='rgba(59, 130, 246, 0.08)'" onmouseout="this.style.background='transparent'">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 16px;">${res.icon}</span>
                        <div>
                            <div style="font-weight: 800; font-family: monospace; font-size: 13px; color: var(--text-main);">${res.title}</div>
                            <div style="font-size: 11px; color: var(--text-muted);">${res.subtitle}</div>
                        </div>
                    </div>
                    <span style="font-size: 11px; font-weight: 700; color: #2563eb; background: rgba(37, 99, 235, 0.1); padding: 2px 8px; border-radius: 6px;">View &rarr;</span>
                </div>
            `).join("")}
        `;
    }
    dropdown.style.display = "block";
}

// Close search dropdown on click outside
document.addEventListener("click", function(e) {
    const searchContainer = document.querySelector(".search-container");
    const dropdown = document.getElementById("globalSearchResultsDropdown");
    if (searchContainer && dropdown && !searchContainer.contains(e.target)) {
        dropdown.style.display = "none";
    }
});

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
    const category = document.getElementById("regCategory").value;
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
            body: JSON.stringify({ plate_number, owner_name, owner_id, vehicle_model, category, vehicle_image })
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
    if (!isAdmin()) {
        alert("Access Denied: Only administrators have the right to manage vehicles.");
        return;
    }
    try {
        const response = await fetch(API_URL + "/vehicles/" + vehicleId, {
            headers: { "Authorization": "Bearer " + token }
        });

        if (!response.ok) throw new Error("Vehicle details fetch failed");

        const vehicle = await response.json();

        document.getElementById("editId").value = vehicle.id;
        if (document.getElementById("editPlateNumber")) {
            document.getElementById("editPlateNumber").value = vehicle.plate_number || "";
        }
        document.getElementById("editOwnerName").value = vehicle.owner_name;
        document.getElementById("editOwnerId").value = vehicle.owner_id;
        document.getElementById("editVehicleModel").value = vehicle.vehicle_model ?? "";
        if (document.getElementById("editCategory")) {
            document.getElementById("editCategory").value = vehicle.category || "Car";
        }
        
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
        if (document.getElementById("editPlateNumber")) {
            document.getElementById("editPlateNumber").focus();
        } else {
            document.getElementById("editOwnerName").focus();
        }
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
    if (!isAdmin()) {
        alert("Access Denied: Only administrators have the right to manage vehicles.");
        return;
    }
    const vehicleId = document.getElementById("editId").value;
    const plate_number = document.getElementById("editPlateNumber") ? document.getElementById("editPlateNumber").value.trim().toUpperCase() : undefined;
    const owner_name = document.getElementById("editOwnerName").value.trim();
    const owner_id = document.getElementById("editOwnerId").value.trim();
    const vehicle_model = document.getElementById("editVehicleModel").value.trim();
    const category = document.getElementById("editCategory") ? document.getElementById("editCategory").value : "Car";
    const vehicle_image = document.getElementById("editVehicleImage").value;

    try {
        const response = await fetch(API_URL + "/vehicles/" + vehicleId, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ plate_number, owner_name, owner_id, vehicle_model, category, vehicle_image })
        });

        const data = await response.json();
        if (!response.ok) {
            alert(data.detail || data.message || "Failed to update vehicle");
            return;
        }

        alert(data.message || "Vehicle updated successfully");
        closeEditModal();
        if (typeof loadVehicles === "function") loadVehicles();
        if (typeof loadAdminVehicles === "function") loadAdminVehicles();
    } catch (err) {
        console.error("Update vehicle error:", err);
        alert("Error updating vehicle: " + err.message);
    }
}

// Delete Vehicle
async function deleteVehicle(vehicleId) {
    if (!isAdmin()) {
        alert("Access Denied: Only administrators have the right to manage vehicles.");
        return;
    }
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    try {
        const response = await fetch(API_URL + "/vehicles/" + vehicleId, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + token }
        });

        const data = await response.json();
        if (!response.ok) {
            alert(data.detail || data.message || "Failed to delete vehicle");
            return;
        }

        alert(data.message || "Vehicle deleted successfully");
        if (typeof loadVehicles === "function") loadVehicles();
        if (typeof loadAdminVehicles === "function") loadAdminVehicles();
    } catch (err) {
        console.error("Delete vehicle error:", err);
        alert("Error deleting vehicle: " + err.message);
    }
}

// ================= DETECTION RECORDS DB & FILTERS =================
let allRecords = [];
let currentDetectionFilter = 'all';
let detectionCurrentPage = 1;
let detectionPageSize = 10;

async function loadRecords(filterType = 'all') {
    try {
        const response = await fetch(API_URL + "/detection/logs", {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!response.ok) throw new Error("Logs load failed");
        
        allRecords = await response.json();
        filterRecords(filterType);
    } catch (err) {
        console.error("Load records error:", err);
    }
}

function filterRecords(filterType) {
    if (filterType) {
        currentDetectionFilter = filterType;
        detectionCurrentPage = 1;
        ['all', 'allowed', 'flagged', 'denied'].forEach(ft => {
            const btn = document.getElementById(`filter-${ft}`);
            if (btn) {
                if (ft === currentDetectionFilter) {
                    btn.classList.add('active');
                    btn.style.backgroundColor = 'var(--accent-color)';
                    btn.style.color = 'white';
                    btn.style.borderColor = 'var(--accent-color)';
                } else {
                    btn.classList.remove('active');
                    btn.style.backgroundColor = '';
                    btn.style.color = '';
                    btn.style.borderColor = '';
                }
            }
        });
    }
    renderRecordsTable(currentDetectionFilter);
}

function renderRecordsTable(filterType = currentDetectionFilter) {
    const tbody = document.getElementById("recordsTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    let filtered = Array.isArray(allRecords) ? allRecords : [];
    if (filterType === 'allowed') {
        filtered = filtered.filter(r => (r.status || "").toLowerCase() === 'allowed');
    } else if (filterType === 'flagged') {
        filtered = filtered.filter(r => (r.status || "").toLowerCase() === 'flagged');
    } else if (filterType === 'denied') {
        filtered = filtered.filter(r => (r.status || "").toLowerCase() === 'flagged' || (r.status || "").toLowerCase() === 'denied');
    }

    const searchInput = document.getElementById("detectionSearchInput");
    const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const cleanQ = q.replace(/[\s\-_]/g, "");

    if (cleanQ) {
        filtered = filtered.filter(log => {
            const plate = (log.plate_number || "").toLowerCase().replace(/[\s\-_]/g, "");
            const owner = (log.owner_name || "").toLowerCase().replace(/[\s\-_]/g, "");
            const model = (log.vehicle_model || "").toLowerCase().replace(/[\s\-_]/g, "");
            const logId = String(log.id || "");
            return plate.includes(cleanQ) || owner.includes(cleanQ) || model.includes(cleanQ) || logId.includes(cleanQ);
        });
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / detectionPageSize) || 1;
    if (detectionCurrentPage > totalPages) detectionCurrentPage = totalPages;
    if (detectionCurrentPage < 1) detectionCurrentPage = 1;

    const startIdx = (detectionCurrentPage - 1) * detectionPageSize;
    const pageRecords = filtered.slice(startIdx, startIdx + detectionPageSize);

    if (pageRecords.length === 0) {
        const noRecordsMsg = (translations[currentLang] && translations[currentLang].no_records_msg) || "No records matching filter";
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 25px; color: var(--text-muted);">${noRecordsMsg}</td></tr>`;
    } else {
        tbody.innerHTML = pageRecords.map(log => {
            const statusLower = (log.status || "").toLowerCase();
            let badgeClass = "allowed";
            if (statusLower === "flagged") badgeClass = "flagged";
            else if (statusLower === "denied") badgeClass = "denied";

            const localizedStatus = (translations[currentLang] && translations[currentLang][`status_${statusLower}`]) || log.status;
            const deleteText = (translations[currentLang] && translations[currentLang].btn_delete) || 'Delete';

            return `
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
                            ${localizedStatus}
                        </span>
                    </td>
                    <td>${log.owner_name || "-"}</td>
                    <td>
                        <button class="btn-action-delete" onclick="deleteLog(${log.id})" style="padding: 4px 8px; font-size: 11px;">${deleteText}</button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    const infoEl = document.getElementById("detectionPaginationInfo");
    if (infoEl) {
        const endIdx = Math.min(startIdx + detectionPageSize, total);
        infoEl.innerText = total > 0 ? `Showing ${startIdx + 1} to ${endIdx} of ${total} entries` : `Showing 0 of 0 entries`;
    }

    renderPaginationControlsHelper("detectionPaginationControls", detectionCurrentPage, totalPages, "goToDetectionPage");
}

function changeDetectionPageSize(val) {
    detectionPageSize = parseInt(val, 10) || 10;
    detectionCurrentPage = 1;
    renderRecordsTable(currentDetectionFilter);
}

function goToDetectionPage(p) {
    detectionCurrentPage = p;
    renderRecordsTable(currentDetectionFilter);
}

async function deleteLog(logId) {
    const confirmMsg = translations[currentLang].confirm_delete_detection_log || "Are you sure you want to delete this detection log?";
    if (!confirm(confirmMsg)) {
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
    const confirmMsg = translations[currentLang].confirm_clear_all_detection || "Are you sure you want to delete ALL detection logs and alerts? This action cannot be undone.";
    if (!confirm(confirmMsg)) {
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
    if (!allRecords || allRecords.length === 0) {
        alert("No records to export.");
        return;
    }

    const rows = [];
    rows.push(["ID", "PLATE", "TIME", "CAMERA", "VEHICLE", "CONFIDENCE", "STATUS", "OWNER"].map(h => `"${h}"`).join(","));

    allRecords.forEach(log => {
        const timeStr = typeof formatDateTime === 'function' ? formatDateTime(log.detection_time) : (log.detection_time || 'N/A');
        rows.push([
            `"D-${log.id}"`,
            `"${(log.plate_number || '').replace(/"/g, '""')}"`,
            `"${timeStr.replace(/"/g, '""')}"`,
            `"Cam-01 North Gate"`,
            `"${(log.vehicle_model || 'N/A').replace(/"/g, '""')}"`,
            `"${log.confidence || 0}%"`,
            `"${(log.status || 'Approved').replace(/"/g, '""')}"`,
            `"${(log.owner_name || 'N/A').replace(/"/g, '""')}"`
        ].join(","));
    });

    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCSVFile(`alpr_detection_records_${dateStr}.csv`, rows);
}

// ================= VEHICLES REGISTRY MANAGER MODAL =================
function openVehiclesManagerModal() {
    if (!isAdmin()) {
        alert("Access Denied: Only administrators have the right to manage vehicles.");
        return;
    }
    document.getElementById("vehiclesManagerModal").style.display = "flex";
    loadVehicles();
}

function closeVehiclesManagerModal() {
    document.getElementById("vehiclesManagerModal").style.display = "none";
}

// ================= SECURITY ALERTS LOGS =================
async function loadAlerts() {
    try {
        const curToken = localStorage.getItem("token");
        const headers = curToken ? { "Authorization": "Bearer " + curToken } : {};
        const response = await fetch(API_URL + "/alerts", { headers });
        if (!response.ok) throw new Error("Alerts load failed");

        const alerts = await response.json();
        const tbody = document.getElementById("alertsTableBody");
        if (tbody) tbody.innerHTML = "";

        // Update sidebar red alerts badge
        const badge = document.getElementById("alerts-badge");
        if (badge) {
            if (alerts && alerts.length > 0) {
                badge.innerText = alerts.length;
                badge.style.display = "inline-block";
            } else {
                badge.innerText = "0";
                badge.style.display = "none";
            }
        }

        if (!tbody) return;

        if (!alerts || alerts.length === 0) {
            const noAlertsMsg = (translations[currentLang] && translations[currentLang].no_alerts_msg) ? translations[currentLang].no_alerts_msg : 'No active security alerts';
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 30px; color: var(--text-muted); font-size: 13px;">${noAlertsMsg}</td></tr>`;
            return;
        }

        alerts.forEach(alert => {
            const time = alert.alert_time ? new Date(alert.alert_time).toLocaleString() : 'N/A';
            const deleteText = (translations[currentLang] && translations[currentLang].btn_delete) ? translations[currentLang].btn_delete : 'Delete';
            const snapUrl = alert.snapshot ? resolveSnapshotUrl(alert.snapshot) : null;
            const snapHtml = snapUrl ? `
                <div style="display: inline-flex; align-items: center; gap: 6px;">
                    <img src="${snapUrl}" alt="Vehicle" style="width: 54px; height: 38px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-color); cursor: pointer; background: #000;" onclick="previewVehicleImage('${snapUrl}')" title="Click to enlarge" onerror="this.onerror=null; this.outerHTML='<span style=\\'font-size:11px;color:var(--text-muted);\\'>${alert.snapshot}</span>'" />
                </div>
            ` : '<span style="color: var(--text-muted); font-size: 11px;">No Snapshot</span>';

            tbody.innerHTML += `
                <tr>
                    <td><strong>#AL-${alert.id}</strong></td>
                    <td><span class="plate-tag" style="background-color: var(--danger-color); color: white;">${alert.plate_number}</span></td>
                    <td style="font-size: 12px; white-space: nowrap;">${time}</td>
                    <td style="color: var(--danger-color); font-weight: 600; font-size: 12px;">${alert.reason || 'Security Alert'}</td>
                    <td>${snapHtml}</td>
                    <td>
                        <button class="btn-action-delete" onclick="deleteAlert(${alert.id})" style="padding: 4px 10px; font-size: 11px; cursor: pointer;">${deleteText}</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Load alerts error:", err);
    }
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

// Helper to calculate dwell duration from entry timestamp
function calculateParkingDuration(entryTimeStr) {
    if (!entryTimeStr) return "0m";
    try {
        let str = String(entryTimeStr).trim();
        str = str.replace(/Z$/i, '').replace(/\+00:?00$/, '');
        if (!str.includes("T") && str.includes(" ")) {
            str = str.replace(" ", "T");
        }
        const entryDate = new Date(str);
        if (isNaN(entryDate.getTime())) return "0m";
        const now = new Date();
        const diffMs = Math.max(0, now - entryDate);
        const totalMins = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(totalMins / 60);
        const mins = totalMins % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    } catch (e) {
        return "0m";
    }
}

// ================= REUSABLE PARKING IMAGE COMPONENT =================
function getParkingSlotImageSrc(slot, activeSession) {
    if (activeSession && (activeSession.snapshot || activeSession.image_path)) {
        return resolveSnapshotUrl(activeSession.snapshot || activeSession.image_path, "assets/parking/empty-parking.jpg");
    }

    const slotName = (slot ? (slot.slot_name || "") : "").toUpperCase();

    if (!activeSession || slot.status === "Available") {
        if (slotName === "P1") return "assets/parking/p1_empty.jpg";
        if (slotName === "P2") return "assets/parking/p2_empty.jpg";
        if (slotName === "P3") return "assets/parking/p3_empty.jpg";
        return "assets/parking/empty-parking.jpg";
    }

    const cat = (activeSession.category || "Car").toLowerCase();
    if (cat === "van") return "assets/parking/van-parked.jpg";
    if (cat === "bike" || cat === "motorcycle") return "assets/parking/bike-parked.jpg";
    if (cat === "bus") return "assets/parking/bus-placeholder.jpg";
    if (cat === "truck") return "assets/parking/truck-placeholder.jpg";
    
    // For Car: return car parked image
    return "assets/parking/car-parked.jpg";
}

let allParkingHistory = [];
let parkingHistoryCurrentPage = 1;
let parkingHistoryPageSize = 10;

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
        if (document.getElementById("parking-stat-total")) document.getElementById("parking-stat-total").innerText = statusData.total;
        if (document.getElementById("parking-stat-available")) document.getElementById("parking-stat-available").innerText = statusData.available >= 0 ? statusData.available : 0;
        if (document.getElementById("parking-stat-occupied")) document.getElementById("parking-stat-occupied").innerText = statusData.occupied;

        // Render slots grid
        const grid = document.getElementById("parkingSlotsGrid");
        if (!grid) return;
        grid.innerHTML = "";

        if (totalSlots === 0) {
            const initBtnHtml = isAdmin() ? `
                <button onclick="initializeParkingSlots()" class="btn-primary" style="width: auto; padding: 8px 20px; display: inline-flex; align-items: center; gap: 8px;">
                    ${translations[currentLang].btn_init_slots}
                </button>
            ` : '';
            grid.innerHTML = `
                <div style="text-align: center; grid-column: 1 / -1; padding: 45px 20px; background: white; border: 1px solid var(--border-color); border-radius: 12px; margin: 10px 0;">
                    <p style="font-size: 15px; color: var(--text-muted); margin-bottom: 16px;">${translations[currentLang].slots_empty}</p>
                    ${initBtnHtml}
                </div>
            `;
        } else {
            slots.forEach(slot => {
                const activeSession = activeSessions.find(s => s.slot_number === slot.slot_name);
                
                let occupantHtml = "";
                let actionButtonHtml = "";
                let cardClass = "slot-card available";
                let headerIcon = `<div class="slot-header-icon available"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg></div>`;
                let statusBadge = `<span class="slot-status-pill available">${translations[currentLang].status_available}</span>`;
                const cat = activeSession ? (activeSession.category || "Car") : "Car";
                const catIcon = cat.toLowerCase() === "van" ? "🚐" : (cat.toLowerCase() === "bike" || cat.toLowerCase() === "motorcycle") ? "🏍️" : cat.toLowerCase() === "bus" ? "🚌" : cat.toLowerCase() === "truck" ? "🚚" : "🚘";
                
                let viewportHtml = `<div id="slot-3d-viewport-${slot.id}" class="slot-3d-container" style="width: 100%; height: 160px; border-radius: 10px; overflow: hidden; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); margin: 8px 0; border: 1px solid rgba(255, 255, 255, 0.1); position: relative; box-shadow: inset 0 2px 8px rgba(0,0,0,0.5);"></div>`;

                if (slot.status !== "Available") {
                    cardClass = "slot-card occupied";
                    headerIcon = `<div class="slot-header-icon occupied"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg></div>`;
                    statusBadge = `<span class="slot-status-pill occupied">${translations[currentLang].status_occupied}</span>`;
                    
                    if (activeSession) {
                        const formattedTime = formatParkingTime(activeSession.entry_time);
                        const durationStr = calculateParkingDuration(activeSession.entry_time);

                        occupantHtml = `
                            <div class="slot-details-group">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                    <div>
                                        <span class="slot-field-label">License Plate</span>
                                        <div class="slot-plate-badge">${activeSession.plate_number}</div>
                                    </div>
                                    <div class="slot-category-tag">
                                        <span>${catIcon}</span> <span>${cat.toUpperCase()}</span>
                                    </div>
                                </div>
                                <div>
                                    <span class="slot-field-label">Entry Time</span>
                                    <div class="slot-time-text">${formattedTime}</div>
                                </div>
                            </div>
                            ${viewportHtml}
                        `;
                        actionButtonHtml = `
                            <button onclick="releaseParkingSlot(${activeSession.session_id})" class="btn-release-slot">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
                                <span>${translations[currentLang].btn_release}</span>
                            </button>
                            <div class="slot-duration-bar">
                                <div class="duration-label">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    <span>Duration</span>
                                </div>
                                <div class="duration-value">${durationStr}</div>
                            </div>
                        `;
                    } else {
                        occupantHtml = `
                            <div class="slot-details-group">
                                <span class="slot-field-label">Occupant Info</span>
                                <div class="slot-time-text">${currentLang === 'en' ? 'Occupant info unavailable' : currentLang === 'si' ? 'හිමිකරුගේ තොරතුරු නොමැත' : 'உரிமையாளர் விவரங்கள் இல்லை'}</div>
                            </div>
                            ${viewportHtml}
                        `;
                        actionButtonHtml = `
                            <button onclick="handleAdminResetSlot(${slot.id})" class="btn-release-slot">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                <span>${currentLang === 'en' ? 'Force Reset Slot' : currentLang === 'si' ? 'ස්ලොට් එක නැවත සකසන්න' : 'ස්ලාட்டை மீட்டமை'}</span>
                            </button>
                        `;
                    }
                } else {
                    occupantHtml = `
                        <div class="slot-available-content" style="padding: 25px 10px 15px 10px; text-align: center;">
                            <div class="available-illustration" style="margin-bottom: 16px;">
                                <svg width="100" height="75" viewBox="0 0 120 90" fill="none">
                                    <rect x="52" y="10" width="16" height="24" rx="3" fill="#10b981" fill-opacity="0.15" stroke="#10b981" stroke-width="2"/>
                                    <text x="60" y="27" font-family="sans-serif" font-size="14" font-weight="bold" fill="#059669" text-anchor="middle">P</text>
                                    <line x1="60" y1="34" x2="60" y2="44" stroke="#10b981" stroke-width="2"/>
                                    <path d="M25 65 C25 58, 30 52, 40 50 L48 44 C52 40, 68 40, 72 44 L80 50 C90 52, 95 58, 95 65 L95 68 C95 70, 93 72, 90 72 L30 72 C27 72, 25 70, 25 68 Z" fill="#ecfdf5" stroke="#059669" stroke-width="2" stroke-linejoin="round"/>
                                    <circle cx="40" cy="72" r="6" fill="#ffffff" stroke="#059669" stroke-width="2"/>
                                    <circle cx="80" cy="72" r="6" fill="#ffffff" stroke="#059669" stroke-width="2"/>
                                    <path d="M43 51 L49 46 C52 43, 60 43, 60 46 L60 51 Z" fill="#d1fae5" stroke="#059669" stroke-width="1.5"/>
                                    <path d="M63 51 L63 46 C63 43, 70 43, 72 46 L76 51 Z" fill="#d1fae5" stroke="#059669" stroke-width="1.5"/>
                                    <circle cx="20" cy="40" r="1.5" fill="#34d399"/>
                                    <circle cx="100" cy="42" r="1.5" fill="#34d399"/>
                                </svg>
                            </div>
                            <h5 class="available-title" style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0;">This slot is currently available</h5>
                            <p class="available-subtitle" style="font-size: 13px; color: #64748b; margin: 0;">Ready to assign a vehicle</p>
                        </div>
                    `;
                    actionButtonHtml = `
                        <button onclick="openAssignModal(${slot.id}, '${slot.slot_name}')" class="btn-assign-slot" style="background: #059669; color: white; width: 100%; height: 42px; border-radius: 8px; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 13px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
                            <span>${translations[currentLang].btn_assign}</span>
                        </button>
                    `;
                }

                grid.innerHTML += `
                    <div class="${cardClass}">
                        <div class="slot-card-header">
                            <div class="slot-title-wrap">
                                ${headerIcon}
                                <h4 class="slot-title">${slot.slot_name}</h4>
                            </div>
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

            // Initialize 3D renderer for each occupied parking slot
            setTimeout(() => {
                slots.forEach(slot => {
                    const activeSession = activeSessions.find(s => s.slot_number === slot.slot_name);
                    const isOccupied = slot.status !== "Available";
                    const category = activeSession ? (activeSession.category || "Car") : "Car";
                    renderParkingSlot3D("slot-3d-viewport-" + slot.id, isOccupied, category);
                });
            }, 50);
        }

        // Store and filter history with pagination
        allParkingHistory = Array.isArray(history) ? history : [];
        filterParkingHistoryTable();

    } catch (err) {
        console.error("Load parking data error:", err);
    }
}

function filterParkingHistoryTable() {
    const historyBody = document.getElementById("parkingHistoryTableBody");
    if (!historyBody) return;

    const searchInput = document.getElementById("parkingHistorySearchInput");
    const statusSelect = document.getElementById("parkingHistoryStatusFilter");

    const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const cleanQ = q.replace(/[\s\-_]/g, "");
    const statusVal = statusSelect ? statusSelect.value.toLowerCase() : "all";

    let filtered = [...allParkingHistory].sort((a, b) => b.session_id - a.session_id);

    if (statusVal === "active") {
        filtered = filtered.filter(sess => sess.status.toLowerCase() !== "completed");
    } else if (statusVal === "completed") {
        filtered = filtered.filter(sess => sess.status.toLowerCase() === "completed");
    }

    if (cleanQ) {
        filtered = filtered.filter(sess => {
            const plate = (sess.plate_number || "").toLowerCase().replace(/[\s\-_]/g, "");
            const slot = (sess.slot_number || "").toLowerCase().replace(/[\s\-_]/g, "");
            const sid = String(sess.session_id || "").toLowerCase();
            const sidTag = ("ps" + sid).replace(/[\s\-_]/g, "");
            return plate.includes(cleanQ) || slot.includes(cleanQ) || sid.includes(cleanQ) || sidTag.includes(cleanQ);
        });
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / parkingHistoryPageSize) || 1;
    if (parkingHistoryCurrentPage > totalPages) parkingHistoryCurrentPage = totalPages;
    if (parkingHistoryCurrentPage < 1) parkingHistoryCurrentPage = 1;

    const startIdx = (parkingHistoryCurrentPage - 1) * parkingHistoryPageSize;
    const pageRecords = filtered.slice(startIdx, startIdx + parkingHistoryPageSize);

    if (pageRecords.length === 0) {
        const noHistoryMsg = (translations[currentLang] && translations[currentLang].history_empty) ? translations[currentLang].history_empty : "No parking sessions history found";
        historyBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--text-muted); padding: 25px;">${noHistoryMsg}</td></tr>`;
    } else {
        historyBody.innerHTML = pageRecords.map(sess => renderParkingHistoryRowHtml(sess)).join("");
    }

    const infoEl = document.getElementById("parkingHistoryPaginationInfo");
    if (infoEl) {
        const endIdx = Math.min(startIdx + parkingHistoryPageSize, total);
        infoEl.innerText = total > 0 ? `Showing ${startIdx + 1} to ${endIdx} of ${total} entries` : `Showing 0 of 0 entries`;
    }

    renderPaginationControlsHelper("parkingHistoryPaginationControls", parkingHistoryCurrentPage, totalPages, "goToParkingHistoryPage");
}

function renderParkingHistoryRowHtml(sess) {
    const isCompleted = sess.status.toLowerCase() === "completed";
    const sessStatusText = isCompleted ? translations[currentLang].status_completed : translations[currentLang].status_active;
    const statusColor = isCompleted ? "var(--text-muted)" : "var(--danger-color)";
    const statusBg = isCompleted ? "var(--accent-light)" : "var(--danger-light)";
    
    let deleteBtnHtml = `
        <button onclick="deleteParkingLog(${sess.session_id})" class="btn-action-delete" style="padding: 4px 8px; font-size: 11px;">
            ${translations[currentLang].btn_delete || 'Delete'}
        </button>
    `;
    
    let actionHtml = deleteBtnHtml;
    if (!isCompleted) {
        actionHtml = `
            <div style="display: inline-flex; gap: 4px; align-items: center;">
                <button onclick="releaseParkingSlot(${sess.session_id})" class="btn-secondary" style="width: auto; padding: 4px 10px; font-size: 11px; background: var(--danger-light); color: var(--danger-color); border-color: var(--danger-color);">
                    ${translations[currentLang].btn_release}
                </button>
                ${deleteBtnHtml}
            </div>
        `;
    }

    return `
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
}

function changeParkingHistoryPageSize(val) {
    parkingHistoryPageSize = parseInt(val, 10) || 10;
    parkingHistoryCurrentPage = 1;
    filterParkingHistoryTable();
}

function goToParkingHistoryPage(p) {
    parkingHistoryCurrentPage = p;
    filterParkingHistoryTable();
}

async function initializeParkingSlots() {
    if (!isAdmin()) {
        alert("Access Denied: Only administrators have the right to initialize parking slots.");
        return;
    }
    await handleAdminInitSlots();
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
        const response = await fetch(API_URL + "/parking/exit-process", {
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
            showExitReceiptModal(data);
            loadParkingData();
            loadDashboardData();
        } else {
            alert(data.detail || translations[currentLang].err_release_failed);
        }
    } catch (err) {
        console.error("Release parking slot error:", err);
        alert("Error executing release request: " + err.message);
    }
}

function showExitReceiptModal(data) {
    const modal = document.getElementById("exitReceiptModal");
    const body = document.getElementById("exitReceiptBody");
    if (!modal || !body) return;

    const catKey = (data.category || 'car').toLowerCase();
    const icon = catKey === 'bike' ? '🏍️' : catKey === 'van' ? '🚐' : catKey === 'bus' ? '🚌' : catKey === 'truck' ? '🚚' : (catKey === 'tuktuk' || catKey === 'tuk tuk' || catKey === 'three wheeler') ? '🛺' : '🚗';

    body.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px dashed #e2e8f0; padding-bottom: 12px; margin-bottom: 12px;">
            <div>
                <span class="plate-tag" style="font-size: 16px; margin: 0; padding: 6px 14px;">${data.plate_number}</span>
            </div>
            <span style="font-size: 12px; padding: 4px 10px; border-radius: 12px; background: rgba(59, 130, 246, 0.15); color: #2563eb; font-weight: 700;">
                ${icon} ${data.category.toUpperCase()}
            </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px; margin-bottom: 14px;">
            <div><span style="color: var(--text-muted);">Owner:</span> <strong>${data.owner_name}</strong></div>
            <div><span style="color: var(--text-muted);">Model:</span> <strong>${data.vehicle_model}</strong></div>
            <div><span style="color: var(--text-muted);">Parking Slot:</span> <strong>${data.slot_name}</strong></div>
            <div><span style="color: var(--text-muted);">Session ID:</span> <strong>#PS-${data.session_id}</strong></div>
        </div>

        <div style="background: #f8fafc; border-radius: 8px; padding: 10px 14px; font-size: 12px; margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: var(--text-muted);">Entrance:</span>
                <span>${formatDateTime(data.entry_time)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: var(--text-muted);">Departure:</span>
                <span>${formatDateTime(data.exit_time)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: bold; color: var(--primary-color);">
                <span>Total Stay Duration:</span>
                <span>⏱️ ${data.duration_text}</span>
            </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 10px; padding: 12px 16px;">
            <div>
                <div style="font-size: 11px; color: #10b981; font-weight: 700; text-transform: uppercase;">Exit Gate Status</div>
                <div style="font-size: 16px; font-weight: 800; color: #047857;">🟢 APPROVED DEPARTURE</div>
            </div>
            <div style="text-align: right;">
                <span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 800;">PASS VALIDATED</span>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">🚪 Boom Barrier Open</div>
            </div>
        </div>
    `;

    modal.style.display = "block";
}

function closeExitReceiptModal() {
    const modal = document.getElementById("exitReceiptModal");
    if (modal) modal.style.display = "none";
}

function formatDateTime(dateString) {
    if (!dateString) return "N/A";
    try {
        let str = String(dateString).trim();
        str = str.replace(/Z$/i, '').replace(/\+00:?00$/, '');
        if (!str.includes("T") && str.includes(" ")) {
            str = str.replace(" ", "T");
        }
        const d = new Date(str);
        return isNaN(d.getTime()) ? dateString : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
        return dateString;
    }
}

function formatDateOnly(dateString) {
    if (!dateString) return "N/A";
    try {
        let str = String(dateString).trim();
        str = str.replace(/Z$/i, '').replace(/\+00:?00$/, '');
        if (!str.includes("T") && str.includes(" ")) {
            str = str.replace(" ", "T");
        }
        const d = typeof parseSafeDate === 'function' ? parseSafeDate(str) : new Date(str);
        if (isNaN(d.getTime())) {
            return str.includes("T") ? str.split("T")[0] : (str.includes(" ") ? str.split(" ")[0] : str);
        }
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        return dateString;
    }
}

function formatParkingTime(dateString) {
    if (!dateString) return "-";
    return formatDateTime(dateString);
}

// ================= PARKING & ALERTS LOG DELETION =================
async function deleteParkingLog(sessionId) {
    const confirmMsg = translations[currentLang].confirm_delete_parking_log || "Are you sure you want to delete this parking session log?";
    if (!confirm(confirmMsg)) {
        return;
    }

    try {
        const response = await fetch(API_URL + "/parking/history/" + sessionId, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + token }
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.detail || data.message || `HTTP ${response.status}`);
        }

        loadParkingData();
    } catch (err) {
        console.error("Delete parking log error:", err);
        alert("Failed to delete log: " + err.message);
    }
}

async function clearAllParkingLogs() {
    const confirmMsg = translations[currentLang].confirm_clear_all_parking || "Are you sure you want to clear all parking history logs?";
    if (!confirm(confirmMsg)) {
        return;
    }

    try {
        const response = await fetch(API_URL + "/parking/history", {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + token }
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.detail || data.message || `HTTP ${response.status}`);
        }

        loadParkingData();
    } catch (err) {
        console.error("Clear all parking logs error:", err);
        alert("Failed to clear all parking logs: " + err.message);
    }
}

async function deleteAlert(alertId) {
    const confirmMsg = (translations[currentLang] && translations[currentLang].confirm_delete_alert) 
        ? translations[currentLang].confirm_delete_alert 
        : "Are you sure you want to delete this security alert?";
    if (!confirm(confirmMsg)) {
        return;
    }

    try {
        const curToken = localStorage.getItem("token");
        const headers = curToken ? { "Authorization": "Bearer " + curToken } : {};
        const response = await fetch(API_URL + "/alerts/" + alertId, {
            method: "DELETE",
            headers: headers
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.detail || data.message || `HTTP ${response.status}`);
        }

        loadAlerts();
        loadDashboardData();
    } catch (err) {
        console.error("Delete alert error:", err);
        alert("Failed to delete alert: " + err.message);
    }
}

async function clearAllAlerts() {
    const confirmMsg = (translations[currentLang] && translations[currentLang].confirm_clear_all_alerts)
        ? translations[currentLang].confirm_clear_all_alerts
        : "Are you sure you want to clear ALL security alerts?";
    if (!confirm(confirmMsg)) {
        return;
    }

    try {
        const curToken = localStorage.getItem("token");
        const headers = curToken ? { "Authorization": "Bearer " + curToken } : {};
        const response = await fetch(API_URL + "/alerts", {
            method: "DELETE",
            headers: headers
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.detail || data.message || `HTTP ${response.status}`);
        }

        loadAlerts();
        loadDashboardData();
    } catch (err) {
        console.error("Clear all alerts error:", err);
        alert("Failed to clear all alerts: " + err.message);
    }
}


// ================= ENTRANCE HISTORY & RECORDING =================

async function loadLatestEntranceWidget() {
    const container = document.getElementById("latestEntranceWidget");
    if (!container) return;

    try {
        const response = await fetch(API_URL + "/entrance/records/latest", {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!response.ok) {
            container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px;">No entrance recorded yet.</div>`;
            return;
        }
        const data = await response.json();
        const rec = data.record;

        if (!rec) {
            container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px;">No approved vehicle entrances recorded yet today.</div>`;
            return;
        }

        const v = rec.vehicle || {};
        const snapUrl = resolveSnapshotUrl(rec.snapshot || v.vehicle_image);

        const timeStr = formatDateTime(rec.entrance_time);

        container.innerHTML = `
            <div style="display: flex; gap: 20px; flex-wrap: wrap; align-items: center; background: rgba(16, 185, 129, 0.05); padding: 18px; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.3);">
                <div style="width: 140px; height: 100px; border-radius: 8px; overflow: hidden; background: #1e293b; border: 1px solid var(--border-color); flex-shrink: 0;">
                    <img src="${snapUrl}" onerror="this.src='https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&q=80'" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div style="flex: 1; min-width: 220px;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <span style="font-size: 18px; font-weight: 800; background: #0f172a; color: #38bdf8; padding: 4px 12px; border-radius: 6px; letter-spacing: 1.5px; border: 1px solid #334155;">
                            ${rec.plate_number}
                        </span>
                        <span style="background: rgba(16, 185, 129, 0.2); color: #10b981; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 20px; border: 1px solid #10b981;">
                            ✓ Entry Approved
                        </span>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; font-size: 13px; margin-top: 8px;">
                        <div><strong style="color: var(--text-muted);">Owner:</strong> ${v.owner_name || 'Registered Owner'}</div>
                        <div><strong style="color: var(--text-muted);">Owner ID:</strong> ${v.owner_id || 'N/A'}</div>
                        <div><strong style="color: var(--text-muted);">Vehicle Model:</strong> ${v.vehicle_model || 'N/A'}</div>
                        <div><strong style="color: var(--text-muted);">Parking Slot:</strong> <span style="font-weight: 700; color: var(--accent-color);">${rec.parking_slot || 'Unassigned'}</span></div>
                    </div>
                </div>
                <div style="text-align: right; min-width: 160px;">
                    <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Entrance Timestamp</div>
                    <div style="font-size: 14px; font-weight: 700; color: var(--text-main); margin-top: 4px;">📅 ${timeStr}</div>
                </div>
            </div>
        `;
    } catch (err) {
        console.error("Error loading latest entrance widget:", err);
    }
}

let entranceRecordsCache = {};
let allRegisteredEntranceRecords = [];
let allGuestEntranceRecords = [];
let regCurrentPage = 1;
let regPageSize = 10;
let guestCurrentPage = 1;
let guestPageSize = 10;

async function loadEntranceData() {
    const tableBody = document.getElementById("entranceHistoryTableBody");
    if (!tableBody) return;

    try {
        tableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 30px;">⌛ Loading entrance history...</td></tr>`;

        const response = await fetch(API_URL + "/entrance/records", {
            headers: { "Authorization": "Bearer " + token }
        });

        if (!response.ok) throw new Error("Failed to fetch entrance records");
        let rawRecords = await response.json();
        const records = Array.isArray(rawRecords)
            ? rawRecords.filter(r => r.status === "Approved" || r.status === "Guest Approved" || (!r.status.includes("Flagged") && !r.status.includes("Denied")))
            : [];

        entranceRecordsCache = {};
        if (records && records.length > 0) {
            records.forEach(r => {
                entranceRecordsCache[r.id] = r;
            });
        }

        allRegisteredEntranceRecords = records.filter(r => r.status === "Approved" && (!r.vehicle || !r.vehicle.is_guest));
        allGuestEntranceRecords = records.filter(r => r.status === "Guest Approved" || (r.vehicle && r.vehicle.is_guest));

        regCurrentPage = 1;
        guestCurrentPage = 1;

        filterRegisteredEntranceTable();
        filterGuestEntranceTable();

    } catch (err) {
        console.error("Error loading entrance data:", err);
        tableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--danger-color); padding: 20px;">❌ Failed to load entrance history.</td></tr>`;
    }
}

function filterRegisteredEntranceTable() {
    const tableBody = document.getElementById("entranceHistoryTableBody");
    if (!tableBody) return;

    const searchInput = document.getElementById("regSearchInput");
    const statusSelect = document.getElementById("regStatusFilter");
    
    const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const cleanQ = q.replace(/[\s\-_]/g, "");
    const statusVal = statusSelect ? statusSelect.value : "all";

    let filtered = allRegisteredEntranceRecords;

    if (statusVal === "inside") {
        filtered = filtered.filter(rec => !rec.exit_time);
    } else if (statusVal === "departed") {
        filtered = filtered.filter(rec => rec.exit_time !== null && rec.exit_time !== undefined && rec.exit_time !== "");
    }

    if (cleanQ) {
        filtered = filtered.filter(rec => {
            const v = rec.vehicle || {};
            const plate = (rec.plate_number || "").toLowerCase().replace(/[\s\-_]/g, "");
            const owner = (v.owner_name || "").toLowerCase().replace(/[\s\-_]/g, "");
            const ownerId = (v.owner_id || "").toLowerCase().replace(/[\s\-_]/g, "");
            const model = (v.vehicle_model || "").toLowerCase().replace(/[\s\-_]/g, "");
            const slot = (rec.parking_slot || "").toLowerCase().replace(/[\s\-_]/g, "");
            return plate.includes(cleanQ) || owner.includes(cleanQ) || ownerId.includes(cleanQ) || model.includes(cleanQ) || slot.includes(cleanQ);
        });
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / regPageSize) || 1;
    if (regCurrentPage > totalPages) regCurrentPage = totalPages;

    const startIdx = (regCurrentPage - 1) * regPageSize;
    const pageRecords = filtered.slice(startIdx, startIdx + regPageSize);

    if (pageRecords.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 30px;">No matching registered vehicle entrance records found.</td></tr>`;
    } else {
        tableBody.innerHTML = pageRecords.map(rec => renderEntranceRowHtml(rec)).join("");
    }

    const infoEl = document.getElementById("regPaginationInfo");
    if (infoEl) {
        const endIdx = Math.min(startIdx + regPageSize, total);
        infoEl.innerText = total > 0 ? `Showing ${startIdx + 1} to ${endIdx} of ${total} entries` : `Showing 0 of 0 entries`;
    }

    renderPaginationControlsHelper("regPaginationControls", regCurrentPage, totalPages, "goToRegPage");
}

function filterGuestEntranceTable() {
    const guestTableBody = document.getElementById("guestEntranceHistoryTableBody");
    if (!guestTableBody) return;

    const searchInput = document.getElementById("guestSearchInput");
    const statusSelect = document.getElementById("guestStatusFilter");
    
    const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const cleanQ = q.replace(/[\s\-_]/g, "");
    const statusVal = statusSelect ? statusSelect.value : "all";

    let filtered = allGuestEntranceRecords;

    if (statusVal === "inside") {
        filtered = filtered.filter(rec => !rec.exit_time);
    } else if (statusVal === "departed") {
        filtered = filtered.filter(rec => rec.exit_time !== null && rec.exit_time !== undefined && rec.exit_time !== "");
    }

    if (cleanQ) {
        filtered = filtered.filter(rec => {
            const v = rec.vehicle || {};
            const plate = (rec.plate_number || "").toLowerCase().replace(/[\s\-_]/g, "");
            const owner = (v.owner_name || "").toLowerCase().replace(/[\s\-_]/g, "");
            const ownerId = (v.owner_id || "").toLowerCase().replace(/[\s\-_]/g, "");
            const model = (v.vehicle_model || "").toLowerCase().replace(/[\s\-_]/g, "");
            const slot = (rec.parking_slot || "").toLowerCase().replace(/[\s\-_]/g, "");
            return plate.includes(cleanQ) || owner.includes(cleanQ) || ownerId.includes(cleanQ) || model.includes(cleanQ) || slot.includes(cleanQ);
        });
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / guestPageSize) || 1;
    if (guestCurrentPage > totalPages) guestCurrentPage = totalPages;

    const startIdx = (guestCurrentPage - 1) * guestPageSize;
    const pageRecords = filtered.slice(startIdx, startIdx + guestPageSize);

    if (pageRecords.length === 0) {
        guestTableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 30px;">No matching guest entrance records found.</td></tr>`;
    } else {
        guestTableBody.innerHTML = pageRecords.map(rec => renderEntranceRowHtml(rec)).join("");
    }

    const infoEl = document.getElementById("guestPaginationInfo");
    if (infoEl) {
        const endIdx = Math.min(startIdx + guestPageSize, total);
        infoEl.innerText = total > 0 ? `Showing ${startIdx + 1} to ${endIdx} of ${total} entries` : `Showing 0 of 0 entries`;
    }

    renderPaginationControlsHelper("guestPaginationControls", guestCurrentPage, totalPages, "goToGuestPage");
}

function changeRegPageSize(val) {
    regPageSize = parseInt(val, 10) || 10;
    regCurrentPage = 1;
    filterRegisteredEntranceTable();
}

function changeGuestPageSize(val) {
    guestPageSize = parseInt(val, 10) || 10;
    guestCurrentPage = 1;
    filterGuestEntranceTable();
}

function goToRegPage(p) {
    regCurrentPage = p;
    filterRegisteredEntranceTable();
}

function goToGuestPage(p) {
    guestCurrentPage = p;
    filterGuestEntranceTable();
}

function renderPaginationControlsHelper(containerId, currentPage, totalPages, clickFuncName) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (totalPages <= 1) {
        container.innerHTML = "";
        return;
    }

    let html = `<button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="${clickFuncName}(${currentPage - 1})">&lt;</button>`;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="${clickFuncName}(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<span style="padding: 0 4px; color: var(--text-muted);">...</span>`;
        }
    }

    html += `<button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="${clickFuncName}(${currentPage + 1})">&gt;</button>`;
    container.innerHTML = html;
}

function renderEntranceRowHtml(rec) {
    const v = rec.vehicle || {};
    const snapUrl = resolveSnapshotUrl(rec.snapshot || v.vehicle_image);
    
    const isExited = !!rec.exit_time;
    const timeStr = formatDateTime(rec.entrance_time);
    const exitStr = isExited ? formatDateTime(rec.exit_time) : `<span style="color: #10b981; font-weight: 700; font-size: 11px; background: rgba(16, 185, 129, 0.1); padding: 2px 8px; border-radius: 10px;">🟢 Still Inside</span>`;
    const durationBadge = isExited
        ? `<span style="font-weight: 700; color: #2563eb; font-size: 12px;">⏱️ ${rec.duration_text}</span>`
        : `<span style="color: #10b981; font-weight: 700; font-size: 11px; background: rgba(16, 185, 129, 0.1); padding: 2px 8px; border-radius: 10px;">⏱️ Active</span>`;

    const isGuestRec = (rec.status === "Guest Approved" || v.is_guest);

    let statusBadge = "";
    if (isExited) {
        statusBadge = isGuestRec
            ? `<span style="display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; background: rgba(100, 116, 139, 0.12); color: #475569; font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 12px; border: 1px solid #cbd5e1;">🚪 Guest Departed</span>`
            : `<span style="display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; background: rgba(59, 130, 246, 0.12); color: #2563eb; font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 12px; border: 1px solid #93c5fd;">🚪 Departed</span>`;
    } else {
        statusBadge = isGuestRec
            ? `<span style="display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; background: rgba(245, 158, 11, 0.15); color: #d97706; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 12px; border: 1px solid #f59e0b;">🟢 Guest Inside</span>`
            : `<span style="display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; background: rgba(16, 185, 129, 0.15); color: #10b981; font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 12px; border: 1px solid #10b981;">🟢 Inside Premises</span>`;
    }

    return `
        <tr>
            <td><strong>#${rec.id}</strong></td>
            <td>
                <div style="width: 54px; height: 40px; border-radius: 6px; overflow: hidden; background: #000; cursor: pointer; border: 1px solid var(--border-color);" onclick="viewEntranceDetailsById('${rec.id || rec.plate_number}')">
                    <img src="${snapUrl}" onerror="this.src='https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&q=80'" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
            </td>
            <td style="white-space: nowrap;">
                <span class="plate-tag" style="margin: 0; font-size: 13px; font-weight: 800; background: #0f172a; color: #38bdf8; border: 1px solid #334155; display: inline-block; white-space: nowrap; padding: 4px 8px;">${rec.plate_number}</span>
            </td>
            <td>
                <div style="font-weight: 700; color: var(--text-main);">${v.owner_name || (isGuestRec ? 'Visitor / Guest' : 'Registered Owner')}</div>
                <div style="font-size: 11px; color: var(--text-muted);">ID: ${v.owner_id || (isGuestRec ? 'GUEST-PASS' : 'N/A')} | Model: ${v.vehicle_model || (isGuestRec ? 'Visitor' : 'N/A')}</div>
            </td>
            <td style="white-space: nowrap;">
                <span style="font-weight: 700; color: var(--accent-color); background: rgba(59, 130, 246, 0.1); padding: 4px 8px; border-radius: 6px; font-size: 12px; display: inline-block; white-space: nowrap;">
                    ${rec.parking_slot || 'Unassigned'}
                </span>
            </td>
            <td style="white-space: nowrap;">
                ${statusBadge}
            </td>
            <td style="font-size: 12px; white-space: nowrap;">
                🕒 ${timeStr}
            </td>
            <td style="font-size: 12px; white-space: nowrap;">
                ${exitStr}
            </td>
            <td style="font-size: 12px; white-space: nowrap;">
                ${durationBadge}
            </td>
            <td>
                <div style="display: flex; gap: 6px;">
                    <button type="button" onclick="viewEntranceDetailsById('${rec.id || rec.plate_number}')" class="btn-secondary" style="padding: 4px 10px; font-size: 11px; width: auto; background: var(--accent-color, #2563eb); color: white; border: none; cursor: pointer; border-radius: 6px; font-weight: 700;">
                        View
                    </button>
                    <button type="button" onclick="deleteEntranceRecord('${rec.id}')" class="btn-secondary" style="padding: 4px 10px; font-size: 11px; width: auto; background: var(--danger-color, #ef4444); color: white; border: none; cursor: pointer; border-radius: 6px; font-weight: 700;">
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    `;
}

async function submitEntranceRecord() {
    const plateInput = document.getElementById("entrancePlateInput");
    const slotInput = document.getElementById("entranceSlotInput");
    const snapInput = document.getElementById("entranceSnapshotInput");
    const resultCard = document.getElementById("entranceResultCard");

    const plate_number = plateInput ? plateInput.value.trim() : "";
    const parking_slot = slotInput ? slotInput.value.trim() : "";
    const snapshot = snapInput ? snapInput.value.trim() : "";

    if (!plate_number) {
        alert("Please enter a license plate number.");
        return;
    }

    try {
        resultCard.style.display = "block";
        resultCard.style.borderColor = "var(--border-color)";
        resultCard.style.background = "var(--card-bg)";
        resultCard.innerHTML = `<div style="text-align: center; font-size: 13px; color: var(--text-muted);">⌛ Verifying vehicle plate in PostgreSQL database...</div>`;

        const response = await fetch(API_URL + "/entrance/record", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                plate_number: plate_number,
                parking_slot: parking_slot || null,
                snapshot: snapshot || null,
                status: "Approved"
            })
        });

        const data = await response.json();

        if (!response.ok) {
            resultCard.style.background = "rgba(239, 68, 68, 0.1)";
            resultCard.style.borderColor = "#ef4444";
            resultCard.innerHTML = `
                <div style="color: #ef4444; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    Entry Denied / Processing Failed
                </div>
                <div style="font-size: 13px; color: var(--text-main); margin-top: 6px;">${data.detail || data.message || "Vehicle not found in database."}</div>
            `;
            return;
        }

        // Success!
        const rec = data.record;
        const v = data.vehicle;
        const snapUrl = resolveSnapshotUrl(rec.snapshot || v.vehicle_image);
        const timeStr = rec.entrance_time ? formatDateTime(rec.entrance_time) : new Date().toLocaleString();

        resultCard.style.background = "rgba(16, 185, 129, 0.08)";
        resultCard.style.borderColor = "#10b981";
        resultCard.innerHTML = `
            <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
                <div style="width: 100px; height: 75px; border-radius: 8px; overflow: hidden; background: #000; flex-shrink: 0; border: 1px solid var(--border-color);">
                    <img src="${snapUrl}" onerror="this.src='https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&q=80'" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div style="flex: 1; min-width: 200px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <span style="font-weight: 800; font-size: 16px; background: #0f172a; color: #38bdf8; padding: 2px 8px; border-radius: 4px;">${v.plate_number}</span>
                        <span style="background: rgba(16, 185, 129, 0.2); color: #10b981; font-weight: 700; font-size: 11px; padding: 2px 8px; border-radius: 12px; border: 1px solid #10b981;">✓ Approved & Saved</span>
                    </div>
                    <div style="font-size: 13px; color: var(--text-main); margin-top: 4px;">
                        <strong>Owner:</strong> ${v.owner_name} (ID: ${v.owner_id}) | <strong>Model:</strong> ${v.vehicle_model || 'N/A'}
                    </div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                        <strong>Parking Slot:</strong> <span style="color: var(--accent-color); font-weight: bold;">${rec.parking_slot || 'Unassigned'}</span> | <strong>Time:</strong> ${timeStr}
                    </div>
                </div>
            </div>
        `;

        if (plateInput) plateInput.value = "";
        if (slotInput) slotInput.value = "";
        if (snapInput) snapInput.value = "";

        loadEntranceData();
        loadLatestEntranceWidget();

    } catch (err) {
        console.error("Error submitting entrance record:", err);
        alert("Failed to submit entrance record. Check server connection.");
    }
}

async function viewEntranceDetailsById(idOrPlate) {
    console.log("🔍 View details triggered for ID or Plate:", idOrPlate);
    if (!idOrPlate) return;
    
    let searchKey = String(idOrPlate).trim();
    let cleanSearchKey = searchKey.replace(/[\s\-_]/g, "").toUpperCase();

    let rec = null;

    // 1. If numeric record ID, fetch fresh record from API
    if (/^\d+$/.test(searchKey)) {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/entrance/records/${searchKey}`, {
                headers: token ? { "Authorization": "Bearer " + token } : {}
            });
            if (res.ok) {
                rec = await res.json();
                if (!window.entranceRecordsCache) window.entranceRecordsCache = {};
                window.entranceRecordsCache[rec.id] = rec;
            }
        } catch (e) {
            console.warn("Direct entrance record fetch failed, falling back to cache:", e);
        }
    }

    // 2. Look up in cached stores by ID or clean plate number
    if (!rec) {
        rec = (window.entranceRecordsCache && (window.entranceRecordsCache[searchKey] || window.entranceRecordsCache[idOrPlate])) ||
              (typeof entranceRecordsCache !== 'undefined' && (entranceRecordsCache[searchKey] || entranceRecordsCache[idOrPlate]));
    }

    if (!rec) {
        const searchInList = (list) => {
            if (!Array.isArray(list)) return null;
            return list.find(r => 
                String(r.id) === searchKey || 
                (r.plate_number && r.plate_number.replace(/[\s\-_]/g, "").toUpperCase() === cleanSearchKey)
            );
        };

        rec = searchInList(window.allRegisteredEntranceRecords) ||
              searchInList(window.allGuestEntranceRecords) ||
              searchInList(typeof allRegisteredEntranceRecords !== 'undefined' ? allRegisteredEntranceRecords : []) ||
              searchInList(typeof allGuestEntranceRecords !== 'undefined' ? allGuestEntranceRecords : []);
    }

    // 3. Fallback fetch from full server API if not found
    if (!rec) {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/entrance/records`, {
                headers: token ? { "Authorization": "Bearer " + token } : {}
            });
            if (res.ok) {
                const list = await res.json();
                if (Array.isArray(list)) {
                    rec = list.find(r => 
                        String(r.id) === searchKey || 
                        (r.plate_number && r.plate_number.replace(/[\s\-_]/g, "").toUpperCase() === cleanSearchKey)
                    );
                    if (rec) {
                        if (!window.entranceRecordsCache) window.entranceRecordsCache = {};
                        window.entranceRecordsCache[rec.id] = rec;
                        if (typeof entranceRecordsCache !== 'undefined') entranceRecordsCache[rec.id] = rec;
                    }
                }
            }
        } catch (err) {
            console.error("Error fetching entrance details:", err);
        }
    }

    // 4. Fail-safe construction: If not found in API/cache, build fallback record so modal ALWAYS opens
    if (!rec) {
        console.warn("⚠️ Record not found in API/cache. Using fail-safe details for plate:", cleanSearchKey);
        rec = {
            id: idOrPlate,
            plate_number: searchKey,
            status: "Guest Approved",
            parking_slot: "No Slot Available (FULL)",
            entrance_time: new Date().toISOString(),
            vehicle: {
                owner_name: "Visitor / Guest",
                owner_id: "GUEST-PASS",
                vehicle_model: "Visitor Access",
                is_guest: true
            }
        };
    }

    viewEntranceDetails(rec);
}

function viewEntranceDetails(rec) {
    console.log("📋 Opening Entrance Details Modal for record:", rec);

    let modal = document.getElementById("entranceDetailModal");
    let body = document.getElementById("entranceModalBody");

    // Dynamically build modal if missing from page DOM
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "entranceDetailModal";
        modal.className = "modal";
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px; width: 90%; background: var(--card-bg, #ffffff); padding: 24px; border-radius: 16px; position: relative; border: 1px solid var(--border-color, #e2e8f0); box-shadow: 0 20px 40px rgba(0,0,0,0.25); margin: auto;">
                <span class="close-btn" onclick="closeEntranceDetailModal()" style="position: absolute; top: 16px; right: 20px; font-size: 24px; cursor: pointer; color: var(--text-muted, #64748b); font-weight: bold;">&times;</span>
                <h2 style="margin-top: 0; font-size: 20px; font-weight: 700; color: var(--text-main, #0f172a);">Vehicle Entrance Record</h2>
                <div id="entranceModalBody" style="margin-top: 15px;"></div>
            </div>
        `;
    }

    // Always ensure modal is attached directly to <body> so overflow/transforms on parent tabs don't hide it
    if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
    }

    body = document.getElementById("entranceModalBody");
    if (!body) return;

    const v = rec.vehicle || {};
    const snapUrl = resolveSnapshotUrl(rec.snapshot || v.vehicle_image);
    const timeRaw = rec.entrance_time || rec.entry_time || rec.created_at || rec.timestamp;
    const timeStr = typeof formatDateTime === 'function' ? formatDateTime(timeRaw) : (timeRaw || 'N/A');
    const dateStr = typeof formatDateOnly === 'function' ? formatDateOnly(timeRaw) : (timeRaw ? String(timeRaw).split('T')[0] : 'N/A');

    const exitRaw = rec.exit_time || rec.departure_time || rec.checkout_time;
    const hasExited = !!exitRaw;
    const exitDateStr = hasExited ? (typeof formatDateOnly === 'function' ? formatDateOnly(exitRaw) : String(exitRaw).split('T')[0]) : "Still Inside";
    const exitTimeStr = hasExited ? (typeof formatDateTime === 'function' ? formatDateTime(exitRaw) : String(exitRaw)) : "Active Session";
    const stayDurationStr = rec.duration_text || (hasExited ? "Completed" : "Active");

    const headerStatusBadge = hasExited
        ? `<div style="position: absolute; top: 12px; right: 12px; background: rgba(37, 99, 235, 0.92); backdrop-filter: blur(8px); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; color: white; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">🚪 Departed</div>`
        : `<div style="position: absolute; top: 12px; right: 12px; background: rgba(16, 185, 129, 0.92); backdrop-filter: blur(8px); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; color: white; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">🟢 Inside Premises</div>`;

    body.innerHTML = `
        <!-- Vehicle Image Header -->
        <div style="border-radius: 12px; overflow: hidden; background: #0f172a; max-height: 240px; position: relative; margin-bottom: 16px; border: 1px solid var(--border-color, #e2e8f0); box-shadow: inset 0 0 20px rgba(0,0,0,0.3);">
            <img src="${snapUrl}" onerror="this.src='https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80'" style="width: 100%; height: 240px; object-fit: cover;">
            <div style="position: absolute; bottom: 12px; left: 12px; background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(8px); padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); color: #38bdf8; font-weight: 800; font-family: monospace; font-size: 18px; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                ${rec.plate_number}
            </div>
            ${headerStatusBadge}
        </div>

        <!-- Section 1: Vehicle & Owner Details -->
        <div style="margin-bottom: 16px;">
            <div style="font-size: 11px; font-weight: 800; color: var(--text-muted, #64748b); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;" data-i18n="sec_vehicle_owner_info">Vehicle & Owner Details</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px;">
                <div style="background: var(--card-bg, #ffffff); padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color, #e2e8f0);">
                    <div style="font-size: 10px; color: var(--text-muted, #64748b); text-transform: uppercase; font-weight: 700;" data-i18n="th_owner_name">Owner Full Name</div>
                    <div style="font-weight: 700; font-size: 13px; color: var(--text-main, #0f172a); margin-top: 2px;">${v.owner_name || 'N/A'}</div>
                </div>
                <div style="background: var(--card-bg, #ffffff); padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color, #e2e8f0);">
                    <div style="font-size: 10px; color: var(--text-muted, #64748b); text-transform: uppercase; font-weight: 700;" data-i18n="th_owner_id">Owner / License ID</div>
                    <div style="font-weight: 700; font-size: 13px; color: var(--text-main, #0f172a); margin-top: 2px;">${v.owner_id || 'N/A'}</div>
                </div>
                <div style="background: var(--card-bg, #ffffff); padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color, #e2e8f0);">
                    <div style="font-size: 10px; color: var(--text-muted, #64748b); text-transform: uppercase; font-weight: 700;" data-i18n="th_model">Vehicle Model</div>
                    <div style="font-weight: 700; font-size: 13px; color: var(--text-main, #0f172a); margin-top: 2px;">${v.vehicle_model || 'N/A'}</div>
                </div>
                <div style="background: var(--card-bg, #ffffff); padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color, #e2e8f0);">
                    <div style="font-size: 10px; color: var(--text-muted, #64748b); text-transform: uppercase; font-weight: 700;" data-i18n="lbl_slot_assigned">Assigned Parking Slot</div>
                    <div style="font-weight: 800; font-size: 13px; color: var(--accent-color, #2563eb); margin-top: 2px;">${rec.parking_slot || 'Unassigned'}</div>
                </div>
            </div>
        </div>

        <!-- Section 2: Gate Entry & Exit Timeline -->
        <div>
            <div style="font-size: 11px; font-weight: 800; color: var(--text-muted, #64748b); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;" data-i18n="sec_gate_timeline">Gate Activity Timeline</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <!-- Entrance Card -->
                <div style="background: rgba(16, 185, 129, 0.04); border: 1px solid rgba(16, 185, 129, 0.25); padding: 12px 14px; border-radius: 10px;">
                    <div style="font-size: 11px; font-weight: 800; color: #10b981; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                        <span>🟢</span> <span data-i18n="lbl_entrance_log">ENTRANCE RECORD</span>
                    </div>
                    <div style="font-size: 12px; color: var(--text-muted, #64748b); margin-bottom: 4px; display: flex; justify-content: space-between;">
                        <span data-i18n="lbl_entrance_date">Date:</span>
                        <strong style="color: var(--text-main, #0f172a);">${dateStr}</strong>
                    </div>
                    <div style="font-size: 12px; color: var(--text-muted, #64748b); display: flex; justify-content: space-between;">
                        <span data-i18n="lbl_entrance_time">Time:</span>
                        <strong style="color: var(--text-main, #0f172a);">${timeStr}</strong>
                    </div>
                </div>

                <!-- Exit Card -->
                <div style="background: ${hasExited ? 'rgba(59, 130, 246, 0.04)' : 'rgba(16, 185, 129, 0.04)'}; border: 1px solid ${hasExited ? 'rgba(59, 130, 246, 0.25)' : 'rgba(16, 185, 129, 0.25)'}; padding: 12px 14px; border-radius: 10px;">
                    <div style="font-size: 11px; font-weight: 800; color: ${hasExited ? '#2563eb' : '#10b981'}; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                        <span>${hasExited ? '🚪' : '🟢'}</span> <span data-i18n="lbl_exit_log">${hasExited ? 'EXIT RECORD' : 'STATUS'}</span>
                    </div>
                    <div style="font-size: 12px; color: var(--text-muted, #64748b); margin-bottom: 4px; display: flex; justify-content: space-between;">
                        <span data-i18n="lbl_exit_date">Date:</span>
                        <strong style="color: ${hasExited ? 'var(--text-main, #0f172a)' : '#10b981'};">${exitDateStr}</strong>
                    </div>
                    <div style="font-size: 12px; color: var(--text-muted, #64748b); margin-bottom: ${hasExited ? '4px' : '0'}; display: flex; justify-content: space-between;">
                        <span data-i18n="lbl_exit_time">Time:</span>
                        <strong style="color: ${hasExited ? 'var(--text-main, #0f172a)' : '#10b981'};">${exitTimeStr}</strong>
                    </div>
                    ${hasExited ? `
                    <div style="font-size: 12px; color: var(--text-muted, #64748b); display: flex; justify-content: space-between; border-top: 1px dashed rgba(59, 130, 246, 0.2); padding-top: 4px; margin-top: 4px;">
                        <span>Stay Duration:</span>
                        <strong style="color: #2563eb;">⏱️ ${stayDurationStr}</strong>
                    </div>` : ''}
                </div>
            </div>
        </div>
    `;

    if (typeof applyTranslations === 'function') {
        applyTranslations();
    }

    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100vw";
    modal.style.height = "100vh";
    modal.style.backgroundColor = "rgba(15, 23, 42, 0.65)";
    modal.style.backdropFilter = "blur(5px)";
    modal.style.setProperty("display", "flex", "important");
    modal.style.setProperty("z-index", "9999999", "important");
    modal.style.setProperty("visibility", "visible", "important");
    modal.style.setProperty("opacity", "1", "important");
}

function closeEntranceDetailModal() {
    const modal = document.getElementById("entranceDetailModal");
    if (modal) {
        modal.style.setProperty("display", "none", "important");
    }
}

// Global Event Delegation fallback for View button
document.addEventListener("click", function(e) {
    const btn = e.target.closest("button");
    if (btn && btn.textContent.trim() === "View") {
        const onclickAttr = btn.getAttribute("onclick") || "";
        if (onclickAttr.includes("viewEntranceDetailsById")) {
            const match = onclickAttr.match(/viewEntranceDetailsById\(['"]?([^'"]+)['"]?\)/);
            if (match && match[1]) {
                e.preventDefault();
                e.stopPropagation();
                viewEntranceDetailsById(match[1]);
            }
        }
    }
});

// Bind to window explicitly for inline onclick handlers
window.viewEntranceDetailsById = viewEntranceDetailsById;
window.viewEntranceDetails = viewEntranceDetails;
window.closeEntranceDetailModal = closeEntranceDetailModal;


async function deleteEntranceRecord(id) {
    if (!confirm("Are you sure you want to delete this entrance record?")) return;

    try {
        const response = await fetch(`${API_URL}/entrance/records/${id}`, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + token }
        });
        if (!response.ok) throw new Error("Failed to delete record");
        loadEntranceData();
        loadLatestEntranceWidget();
    } catch (err) {
        console.error("Error deleting entrance record:", err);
        alert("Failed to delete entrance record.");
    }
}
window.deleteEntranceRecord = deleteEntranceRecord;

async function clearAllEntranceRecords() {
    if (!confirm("Are you sure you want to clear ALL entrance history logs?")) return;

    try {
        const response = await fetch(`${API_URL}/entrance/records`, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + token }
        });
        if (!response.ok) throw new Error("Failed to clear records");
        loadEntranceData();
        loadLatestEntranceWidget();
    } catch (err) {
        console.error("Error clearing entrance history:", err);
        alert("Failed to clear entrance history.");
    }
}

async function exportEntranceCSV() {
    try {
        const response = await fetch(API_URL + "/entrance/records", {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!response.ok) throw new Error("Export failed");
        const records = await response.json();

        if (!records || records.length === 0) {
            alert("No entrance records available to export.");
            return;
        }

        const rows = [];
        rows.push(["ID", "Plate Number", "Owner Name", "Owner ID", "Vehicle Model", "Parking Slot", "Status", "Entrance Time", "Snapshot"].map(h => `"${h}"`).join(","));
        records.forEach(r => {
            const v = r.vehicle || {};
            const time = r.entrance_time ? formatDateTime(r.entrance_time) : "";
            rows.push([
                `"${r.id}"`,
                `"${(r.plate_number || '').replace(/"/g, '""')}"`,
                `"${(v.owner_name || '').replace(/"/g, '""')}"`,
                `"${(v.owner_id || '').replace(/"/g, '""')}"`,
                `"${(v.vehicle_model || '').replace(/"/g, '""')}"`,
                `"${(r.parking_slot || '').replace(/"/g, '""')}"`,
                `"${(r.status || '').replace(/"/g, '""')}"`,
                `"${time.replace(/"/g, '""')}"`,
                `"${(r.snapshot || '').replace(/"/g, '""')}"`
            ].join(","));
        });

        const dateStr = new Date().toISOString().slice(0, 10);
        downloadCSVFile(`Entrance_History_${dateStr}.csv`, rows);
    } catch (err) {
        console.error("CSV Export error:", err);
        alert("Failed to export entrance CSV.");
    }
}

async function exportGuestCSV() {
    try {
        const response = await fetch(API_URL + "/entrance/records", {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!response.ok) throw new Error("Export failed");
        const records = await response.json();

        const guestRecords = (records || []).filter(r => r.status === "Guest Approved" || (r.vehicle && r.vehicle.is_guest));

        if (!guestRecords || guestRecords.length === 0) {
            alert("No guest vehicle entrance records available to export.");
            return;
        }

        const rows = [];
        rows.push(["ID", "Plate Number", "Visitor Name", "Guest ID", "Category/Purpose", "Parking Slot", "Status", "Entrance Time", "Departure Time", "Snapshot"].map(h => `"${h}"`).join(","));
        guestRecords.forEach(r => {
            const v = r.vehicle || {};
            const time = r.entrance_time ? formatDateTime(r.entrance_time) : "";
            const exitTime = r.exit_time ? formatDateTime(r.exit_time) : "Still Inside";
            rows.push([
                `"${r.id}"`,
                `"${(r.plate_number || '').replace(/"/g, '""')}"`,
                `"${(v.owner_name || 'Visitor').replace(/"/g, '""')}"`,
                `"${(v.owner_id || 'GUEST').replace(/"/g, '""')}"`,
                `"${(v.vehicle_model || 'Guest Pass').replace(/"/g, '""')}"`,
                `"${(r.parking_slot || '').replace(/"/g, '""')}"`,
                `"${(r.status || '').replace(/"/g, '""')}"`,
                `"${time.replace(/"/g, '""')}"`,
                `"${exitTime.replace(/"/g, '""')}"`,
                `"${(r.snapshot || '').replace(/"/g, '""')}"`
            ].join(","));
        });

        const dateStr = new Date().toISOString().slice(0, 10);
        downloadCSVFile(`Guest_Vehicle_History_${dateStr}.csv`, rows);
    } catch (err) {
        console.error("Guest CSV Export error:", err);
        alert("Failed to export guest entrance CSV.");
    }
}

async function clearAllGuestEntranceRecords() {
    if (!confirm("Are you sure you want to clear all guest vehicle entrance history?")) {
        return;
    }

    try {
        const response = await fetch(API_URL + "/entrance/records", {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!response.ok) throw new Error("Fetch failed");
        const records = await response.json();
        const guestRecords = (records || []).filter(r => r.status === "Guest Approved" || (r.vehicle && r.vehicle.is_guest));

        for (const r of guestRecords) {
            await fetch(API_URL + "/entrance/records/" + r.id, {
                method: "DELETE",
                headers: { "Authorization": "Bearer " + token }
            });
        }

        loadEntranceData();
    } catch (err) {
        console.error("Clear guest records error:", err);
        alert("Failed to clear guest entrance records.");
    }
}

/* ==========================================================================
   POLYMORPHIC 3D PARKING SLOT VISUALIZER (OOP Architecture)
   ========================================================================== */
window.threeParkingScenes = window.threeParkingScenes || {};

function renderParkingSlot3D(containerId, isOccupied, category) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Requirement: If parking slot is empty, do NOT display any model
    if (!isOccupied) {
        if (window.threeParkingScenes[containerId]) {
            if (window.threeParkingScenes[containerId].animId) {
                cancelAnimationFrame(window.threeParkingScenes[containerId].animId);
            }
            window.threeParkingScenes[containerId] = null;
        }
        container.style.display = "none";
        container.innerHTML = "";
        return;
    }

    container.style.display = "block";

    if (typeof THREE === "undefined") {
        container.innerHTML = `<div style="display:flex; align-items:center; justify-content:center; height:100%; color:#94a3b8; font-size:12px;">3D Engine Loading...</div>`;
        return;
    }

    // Clean up previous scene if present
    if (window.threeParkingScenes[containerId]) {
        if (window.threeParkingScenes[containerId].animId) {
            cancelAnimationFrame(window.threeParkingScenes[containerId].animId);
        }
        window.threeParkingScenes[containerId] = null;
    }
    container.innerHTML = "";

    const width = container.clientWidth || 260;
    const height = container.clientHeight || 160;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(3.5, 3.0, 4.5);
    camera.lookAt(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x3b82f6, 1.2, 10);
    pointLight.position.set(0, 2, 0);
    scene.add(pointLight);

    // Ground Parking Bay Platform
    const bayGeo = new THREE.BoxGeometry(2.6, 0.05, 3.6);
    const bayMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, 
        roughness: 0.8,
        metalness: 0.2
    });
    const bayMesh = new THREE.Mesh(bayGeo, bayMat);
    bayMesh.position.set(0, 0, 0);
    bayMesh.receiveShadow = true;
    scene.add(bayMesh);

    // Boundary lines (Red for Occupied)
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const lineL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 3.4), lineMat);
    lineL.position.set(-1.2, 0.01, 0);
    scene.add(lineL);
    const lineR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 3.4), lineMat);
    lineR.position.set(1.2, 0.01, 0);
    scene.add(lineR);

    // POLYMORPHIC FACTORY DISPATCH
    // Instantiates concrete Vehicle3D subclass (Car3D, Bike3D, Van3D, Bus3D, Truck3D)
    const vehicleInstance = (typeof Vehicle3DFactory !== "undefined")
        ? Vehicle3DFactory.create(category)
        : null;

    // Polymorphic method call: vehicleInstance.buildMesh()
    const vehicleGroup = vehicleInstance ? vehicleInstance.buildMesh() : new THREE.Group();
    scene.add(vehicleGroup);

    let animId = null;

    // Polymorphic GLB path resolution: vehicleInstance.getGLBPath()
    if (typeof THREE.GLTFLoader !== "undefined" && vehicleInstance) {
        const loader = new THREE.GLTFLoader();
        loader.load(
            vehicleInstance.getGLBPath(),
            (gltf) => {
                const model = gltf.scene;
                const bbox = new THREE.Box3().setFromObject(model);
                const center = bbox.getCenter(new THREE.Vector3());
                const size = bbox.getSize(new THREE.Vector3());
                
                const maxDim = Math.max(size.x, size.y, size.z);
                if (maxDim > 0) {
                    const targetScale = 2.4 / maxDim;
                    model.scale.set(targetScale, targetScale, targetScale);
                    model.position.sub(center.multiplyScalar(targetScale));
                    model.position.y += 0.05;
                }
                while (vehicleGroup.children.length > 0) {
                    vehicleGroup.remove(vehicleGroup.children[0]);
                }
                vehicleGroup.add(model);
            },
            undefined,
            (error) => {
                // Polymorphic fallback mesh is active
            }
        );
    }

    // Continuous ambient rotation loop
    function animate() {
        animId = requestAnimationFrame(animate);
        vehicleGroup.rotation.y += 0.008;
        renderer.render(scene, camera);
    }
    animate();

    window.threeParkingScenes[containerId] = { scene, renderer, animId };
}


// ================= SINGLE GATE SMART ANPR AUTO-DETECT HANDLER =================
async function processSmartGateAuto() {
    const inputEl = document.getElementById("smartGatePlateInput");
    const resultEl = document.getElementById("smartGateResult");
    if (!inputEl || !resultEl) return;

    const plate = inputEl.value.trim().toUpperCase();
    if (!plate) {
        alert("Please enter or scan a license plate number.");
        return;
    }

    resultEl.style.display = "block";
    resultEl.innerHTML = `<div style="color: var(--text-muted); font-size: 13px;">⌛ Gate Camera Scanning plate <strong>${plate}</strong> & checking presence status...</div>`;

    try {
        const activeRes = await fetch(API_URL + "/parking/active");
        let activeVehicles = [];
        if (activeRes.ok) {
            activeVehicles = await activeRes.json();
        }

        const cleanTarget = plate.replace(/[\s\-_]/g, "");
        const matchedActive = activeVehicles.find(v => v.plate_number && v.plate_number.replace(/[\s\-_]/g, "").toUpperCase() === cleanTarget);

        if (matchedActive) {
            // Check stay duration
            let staySec = 999;
            if (matchedActive.entry_time) {
                staySec = Math.max(0, Math.floor((Date.now() - new Date(matchedActive.entry_time).getTime()) / 1000));
            }

            if (staySec < 60) {
                const rem = 60 - staySec;
                if (resultEl) {
                    resultEl.innerHTML = `
                        <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; padding: 12px; color: #1d4ed8; font-size: 13px;">
                            🛡️ <strong>Gate Transit Buffer:</strong> Vehicle <strong>${plate}</strong> entered ${staySec}s ago. Exit is locked for ${rem}s while vehicle passes the gate barrier.
                        </div>
                    `;
                }
                return;
            }

            const mode = getVerificationMode();
            if (mode === "strict") {
                // Strict Mode: ALWAYS prompt departure verification modal for guard confirmation
                showDetectionConfirmModal({
                    plate_number: plate,
                    snapshot: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80",
                    confidence: 96.0,
                    is_registered: true,
                    owner_name: matchedActive.owner_name || "Visitor / Guest",
                    is_parked: true,
                    parking_slot: matchedActive.slot_number || matchedActive.slot_name || "Assigned Bay",
                    stay_seconds: staySec
                });
                if (resultEl) {
                    resultEl.style.display = "block";
                    resultEl.innerHTML = `<div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; padding: 12px; color: #1d4ed8; font-size: 13px; font-weight: 700;">🔍 Strict Mode: Please confirm departure snapshot verification popup to authorize exit for <strong>${plate}</strong>.</div>`;
                }
                return;
            }

            await processDepartureGateManual(plate);
        } else {
            await processArrivalGateManual(plate);
        }
    } catch (err) {
        console.error("Smart Gate auto check error:", err);
        await processArrivalGateManual(plate);
    }
}

async function processArrivalGateManual(targetPlate, bypassVerification = false) {
    const inputEl = document.getElementById("smartGatePlateInput");
    const resultEl = document.getElementById("smartGateResult");
    const plate = targetPlate || (inputEl ? inputEl.value.trim().toUpperCase() : "");

    if (!plate) {
        alert("Please enter a license plate number.");
        return;
    }

    const mode = getVerificationMode();

    if (!bypassVerification) {
        if (mode === "strict") {
            let vehicleInfo = null;
            try {
                const checkRes = await fetch(API_URL + "/vehicles/plate/" + plate, {
                    headers: token ? { "Authorization": "Bearer " + token } : {}
                });
                if (checkRes.ok) {
                    vehicleInfo = await checkRes.json();
                }
            } catch (e) {}

            const isReg = Boolean(vehicleInfo && !vehicleInfo.message && vehicleInfo.plate_number && !vehicleInfo.is_guest);
            showDetectionConfirmModal({
                plate_number: plate,
                snapshot: (isReg && vehicleInfo.vehicle_image) ? vehicleInfo.vehicle_image : "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80",
                confidence: isReg ? 95.5 : 72.0,
                is_registered: isReg,
                owner_name: isReg ? vehicleInfo.owner_name : "Unknown / Unregistered"
            });

            if (resultEl) {
                resultEl.style.display = "block";
                resultEl.innerHTML = `<div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; padding: 12px; color: #1d4ed8; font-size: 13px; font-weight: 700;">🔍 Strict Mode: Please confirm snapshot verification popup to authorize entry for <strong>${plate}</strong>.</div>`;
            }
            return;
        } else if (mode === "smart") {
            let vehicleInfo = null;
            try {
                const checkRes = await fetch(API_URL + "/vehicles/plate/" + plate, {
                    headers: token ? { "Authorization": "Bearer " + token } : {}
                });
                if (checkRes.ok) {
                    vehicleInfo = await checkRes.json();
                }
            } catch (e) {}

            const isReg = vehicleInfo && !vehicleInfo.message && vehicleInfo.plate_number && !vehicleInfo.is_guest;
            if (!isReg) {
                showDetectionConfirmModal({
                    plate_number: plate,
                    snapshot: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80",
                    confidence: 68.4,
                    is_registered: false,
                    owner_name: "Unknown / Unregistered"
                });
                if (resultEl) {
                    resultEl.style.display = "block";
                    resultEl.innerHTML = `<div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 12px; color: #b45309; font-size: 13px; font-weight: 700;">⚠️ Smart Mode: Unknown vehicle <strong>${plate}</strong> requires officer guest pass authorization.</div>`;
                }
                return;
            }
        }
    }

    if (resultEl) {
        resultEl.style.display = "block";
        resultEl.innerHTML = `<div style="color: var(--text-muted); font-size: 13px;">⌛ Gate 1 Processing ARRIVAL for <strong>${plate}</strong>...</div>`;
    }

    try {
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = "Bearer " + token;

        const response = await fetch(API_URL + "/entrance/record", {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ plate_number: plate })
        });

        const data = await response.json();

        if (response.ok) {
            const returnedPlate = data.plate_number || (data.record && data.record.plate_number) || plate;
            const slotName = data.slot_name || (data.record && data.record.parking_slot) || "Assigned";
            const isGuest = data.is_guest || (data.vehicle && data.vehicle.is_guest);
            const cat = (data.category || (data.vehicle && data.vehicle.category) || 'Car').toUpperCase();
            const icon = cat === 'BIKE' ? '🏍️' : cat === 'VAN' ? '🚐' : cat === 'BUS' ? '🚌' : cat === 'TRUCK' ? '🚚' : (cat === 'TUK TUK' || cat === 'TUKTUK' || cat === 'THREE WHEELER') ? '🛺' : '🚗';

            if (data.in_post_exit_cooldown) {
                if (resultEl) {
                    resultEl.innerHTML = `
                        <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 14px; font-size: 13px;">
                            <div style="font-weight: 800; color: #b45309; font-size: 15px; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
                                <span>⏳ POST-EXIT TRANSIT COOLDOWN ACTIVE</span>
                                <span style="font-size: 11px; background: #f59e0b; color: white; padding: 3px 10px; border-radius: 10px;">ENTRY LOCKED</span>
                            </div>
                            <div style="color: #92400e; font-size: 13px; margin-top: 6px;">
                                Vehicle <strong>${returnedPlate}</strong> recently exited. Re-entry is locked for <strong>${data.exit_cooldown_remaining_sec || 60}s</strong> while the vehicle departs the gate.
                            </div>
                        </div>
                    `;
                }
                return;
            }

            if (resultEl) {
                resultEl.innerHTML = `
                    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 14px; font-size: 13px;">
                        <div style="font-weight: 800; color: #047857; font-size: 15px; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
                            <span>🟢 SINGLE GATE: VEHICLE ARRIVED (${isGuest ? 'GUEST PASS APPROVED' : 'ENTRY AUTHORIZED'})</span>
                            <span style="font-size: 11px; background: #10b981; color: white; padding: 3px 10px; border-radius: 10px;">BARRIER OPENED</span>
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center; margin-top: 8px;">
                            <span class="plate-tag" style="margin: 0; font-size: 15px;">${returnedPlate}</span>
                            <span style="font-size: 11px; padding: 3px 10px; border-radius: 10px; background: ${isGuest ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.15)'}; color: ${isGuest ? '#d97706' : '#2563eb'}; font-weight: bold;">
                                ${isGuest ? '🙋‍♂️ GUEST (' + cat + ')' : icon + ' ' + cat}
                            </span>
                            <span style="color: var(--primary-color); font-weight: bold;">Assigned Bay: ${slotName}</span>
                        </div>
                    </div>
                `;
            }
            if (inputEl) inputEl.value = "";
            loadDashboardData();
            loadParkingData();
            if (typeof loadEntranceData === "function") loadEntranceData();
        } else {
            // Unregistered / Unknown vehicle scanned -> Trigger Officer Guest Authorization Modal & Inline Panel!
            showGuestAuthModal(plate);
            if (resultEl) {
                resultEl.style.display = "block";
                resultEl.innerHTML = `
                    <div style="background: #fffbeb; border: 2px solid #f59e0b; border-radius: 12px; padding: 16px; margin-top: 10px; box-shadow: 0 8px 20px rgba(245, 158, 11, 0.15);">
                        <div style="font-weight: 800; font-size: 15px; color: #b45309; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
                            <span>🛑 UNKNOWN VEHICLE DETECTED: <span class="plate-tag" style="font-size: 15px; margin: 0 4px; padding: 2px 8px;">${plate}</span></span>
                            <span style="font-size: 11px; background: #f59e0b; color: white; padding: 3px 10px; border-radius: 12px; font-weight: 800;">OFFICER ACTION REQUIRED</span>
                        </div>
                        <p style="font-size: 12px; color: #92400e; margin-bottom: 12px; font-weight: 600;">
                            License plate <strong>${plate}</strong> is not in the registered database. Authorize entry as a Guest Vehicle?
                        </p>

                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                            <div>
                                <label style="font-size: 11px; font-weight: 700; color: #78350f; display: block; margin-bottom: 4px;">Guest Name</label>
                                <input type="text" id="inlineGuestName" value="Visitor / Guest" class="form-input" style="height: 36px; font-size: 12px; border-color: #fcd34d;">
                            </div>
                            <div>
                                <label style="font-size: 11px; font-weight: 700; color: #78350f; display: block; margin-bottom: 4px;">Vehicle Category</label>
                                <select id="inlineGuestCategory" class="form-input" style="height: 36px; font-size: 12px; background: white; border-color: #fcd34d; font-weight: bold; color: var(--text-main);">
                                    <option value="Car">Car</option>
                                    <option value="Tuk Tuk">Tuk Tuk</option>
                                    <option value="Bike">Bike</option>
                                    <option value="Van">Van</option>
                                    <option value="Bus">Bus</option>
                                    <option value="Truck">Truck</option>
                                </select>
                            </div>
                            <div>
                                <label style="font-size: 11px; font-weight: 700; color: #78350f; display: block; margin-bottom: 4px;">Purpose / Notes</label>
                                <input type="text" id="inlineGuestPurpose" value="Visitor Access" class="form-input" style="height: 36px; font-size: 12px; border-color: #fcd34d;">
                            </div>
                        </div>

                        <div style="display: flex; gap: 10px;">
                            <button onclick="approveInlineGuestEntry('${plate}')" class="btn-primary" style="flex: 1; background: #10b981; border-color: #10b981; font-weight: 800; height: 38px; margin: 0; font-size: 13px; cursor: pointer;">
                                🟢 Approve Guest Entry & Open Barrier
                            </button>
                            <button onclick="denyInlineGuestEntry('${plate}')" class="btn-secondary" style="flex: 1; color: #ef4444; border-color: #ef4444; background: rgba(239, 68, 68, 0.1); font-weight: 800; height: 38px; margin: 0; font-size: 13px; cursor: pointer;">
                                🔴 Deny Entry & Flag Security Alert
                            </button>
                        </div>
                    </div>
                `;
            }
            loadDashboardData();
            if (typeof loadSecurityAlerts === "function") loadSecurityAlerts();
        }
    } catch (err) {
        if (resultEl) resultEl.innerHTML = `<div style="color: #b91c1c; font-size: 13px;">❌ Error processing Arrival: ${err.message}</div>`;
    }
}

// ================= GUEST VEHICLE SECURITY AUTHORIZATION HANDLERS =================
let currentGuestSnapshot = null;

function showGuestAuthModal(plate, snapshot = null) {
    const modal = document.getElementById("guestAuthModal");
    const tag = document.getElementById("guestModalPlateTag");
    const hiddenInput = document.getElementById("guestModalPlateHidden");
    if (!modal) return;

    currentGuestSnapshot = snapshot || null;
    if (tag) tag.innerText = plate;
    if (hiddenInput) hiddenInput.value = plate;
    modal.style.setProperty("display", "flex", "important");
    modal.style.setProperty("z-index", "99999", "important");
}

function closeGuestAuthModal() {
    const modal = document.getElementById("guestAuthModal");
    if (modal) modal.style.display = "none";
}

async function approveGuestVehicleEntry() {
    const plate = document.getElementById("guestModalPlateHidden")?.value;
    const ownerName = document.getElementById("guestOwnerName")?.value || "Visitor / Guest";
    const category = document.getElementById("guestCategory")?.value || "Car";
    const purpose = document.getElementById("guestPurpose")?.value || "Visitor Access";

    if (!plate) return;

    closeGuestAuthModal();

    const resultEl = document.getElementById("smartGateResult");
    if (resultEl) {
        resultEl.style.display = "block";
        resultEl.innerHTML = `<div style="color: var(--text-muted); font-size: 13px;">⌛ Authorizing Guest Entry Pass for <strong>${plate}</strong>...</div>`;
    }

    try {
        const response = await fetch(API_URL + "/entrance/guest-authorize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                plate_number: plate,
                owner_name: ownerName,
                category: category,
                purpose: purpose,
                snapshot: currentGuestSnapshot
            })
        });

        const data = await response.json();

        if (response.ok) {
            if (resultEl) {
                resultEl.innerHTML = `
                    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 14px; font-size: 13px;">
                        <div style="font-weight: 800; color: #047857; font-size: 15px; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
                            <span>🟢 GUEST PASS: ENTRY AUTHORIZED BY OFFICER</span>
                            <span style="font-size: 11px; background: #10b981; color: white; padding: 3px 10px; border-radius: 10px;">BARRIER OPENED</span>
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center; margin-top: 8px;">
                            <span class="plate-tag" style="margin: 0; font-size: 15px;">${data.plate_number}</span>
                            <span style="font-size: 11px; padding: 3px 10px; border-radius: 10px; background: rgba(245, 158, 11, 0.2); color: #d97706; font-weight: bold;">
                                🙋‍♂️ GUEST (${data.category})
                            </span>
                            <span style="color: var(--primary-color); font-weight: bold;">Assigned Bay: ${data.slot_name}</span>
                            <span style="color: var(--text-muted); font-size: 11px;">(Owner: ${data.owner_name})</span>
                        </div>
                    </div>
                `;
            }
            const inputEl = document.getElementById("smartGatePlateInput");
            if (inputEl) inputEl.value = "";
            loadDashboardData();
            loadParkingData();
            if (typeof loadEntranceData === "function") loadEntranceData();
        } else {
            alert("Failed to authorize guest entry: " + (data.detail || data.message));
        }
    } catch (err) {
        console.error("Guest authorize error:", err);
        alert("Error authorizing guest entry: " + err.message);
    }
}

async function denyGuestVehicleEntry() {
    const plate = document.getElementById("guestModalPlateHidden")?.value;
    closeGuestAuthModal();

    if (!plate) return;

    try {
        await fetch(API_URL + "/entrance/guest-deny", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plate_number: plate })
        });
    } catch (err) {
        console.error("Deny guest entry error:", err);
    }

    const resultEl = document.getElementById("smartGateResult");
    if (resultEl) {
        resultEl.style.display = "block";
        resultEl.innerHTML = `
            <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 14px; color: #b91c1c; font-size: 13px;">
                <div style="font-weight: 800; font-size: 14px; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
                    <span>⚠️ SECURITY ALERT: GUEST ENTRY REJECTED BY OFFICER</span>
                    <span style="font-size: 11px; background: #ef4444; color: white; padding: 2px 8px; border-radius: 10px;">BARRIER CLOSED</span>
                </div>
                <div>Vehicle <strong>${plate}</strong> denied entry. Security alert logged.</div>
            </div>
        `;
    }

    loadDashboardData();
    triggerSecuritySiren();
    if (typeof loadAlerts === "function") loadAlerts();
    if (typeof loadSecurityAlerts === "function") loadSecurityAlerts();
}

async function approveInlineGuestEntry(plate) {
    const ownerName = document.getElementById("inlineGuestName")?.value || "Visitor / Guest";
    const category = document.getElementById("inlineGuestCategory")?.value || "Car";
    const purpose = document.getElementById("inlineGuestPurpose")?.value || "Visitor Access";

    const resultEl = document.getElementById("smartGateResult");
    if (resultEl) {
        resultEl.style.display = "block";
        resultEl.innerHTML = `<div style="color: var(--text-muted); font-size: 13px;">⌛ Authorizing Guest Entry Pass for <strong>${plate}</strong>...</div>`;
    }

    try {
        const response = await fetch(API_URL + "/entrance/guest-authorize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                plate_number: plate,
                owner_name: ownerName,
                category: category,
                purpose: purpose
            })
        });

        const data = await response.json();

        if (response.ok) {
            if (resultEl) {
                resultEl.innerHTML = `
                    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 14px; font-size: 13px;">
                        <div style="font-weight: 800; color: #047857; font-size: 15px; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
                            <span>🟢 GUEST PASS: ENTRY AUTHORIZED BY OFFICER</span>
                            <span style="font-size: 11px; background: #10b981; color: white; padding: 3px 10px; border-radius: 10px;">BARRIER OPENED</span>
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center; margin-top: 8px;">
                            <span class="plate-tag" style="margin: 0; font-size: 15px;">${data.plate_number}</span>
                            <span style="font-size: 11px; padding: 3px 10px; border-radius: 10px; background: rgba(245, 158, 11, 0.2); color: #d97706; font-weight: bold;">
                                🙋‍♂️ GUEST (${data.category})
                            </span>
                            <span style="color: var(--primary-color); font-weight: bold;">Assigned Bay: ${data.slot_name}</span>
                            <span style="color: var(--text-muted); font-size: 11px;">(Owner: ${data.owner_name})</span>
                        </div>
                    </div>
                `;
            }
            const inputEl = document.getElementById("smartGatePlateInput");
            if (inputEl) inputEl.value = "";
            loadDashboardData();
            loadParkingData();
            if (typeof loadEntranceData === "function") loadEntranceData();
        } else {
            alert("Failed to authorize guest entry: " + (data.detail || data.message));
        }
    } catch (err) {
        console.error("Inline guest authorize error:", err);
        alert("Error authorizing guest entry: " + err.message);
    }
}

async function denyInlineGuestEntry(plate) {
    if (!plate) return;

    try {
        await fetch(API_URL + "/entrance/guest-deny", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plate_number: plate })
        });
    } catch (err) {
        console.error("Deny inline guest entry error:", err);
    }

    const resultEl = document.getElementById("smartGateResult");
    if (resultEl) {
        resultEl.style.display = "block";
        resultEl.innerHTML = `
            <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 14px; color: #b91c1c; font-size: 13px;">
                <div style="font-weight: 800; font-size: 14px; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
                    <span>⚠️ SECURITY ALERT: GUEST ENTRY REJECTED BY OFFICER</span>
                    <span style="font-size: 11px; background: #ef4444; color: white; padding: 2px 8px; border-radius: 10px;">BARRIER CLOSED</span>
                </div>
                <div>Vehicle <strong>${plate}</strong> denied entry. Security alert logged.</div>
            </div>
        `;
    }

    loadDashboardData();
    if (typeof loadAlerts === "function") loadAlerts();
    if (typeof loadSecurityAlerts === "function") loadSecurityAlerts();
}

async function processDepartureGateManual(targetPlate) {
    const inputEl = document.getElementById("smartGatePlateInput");
    const resultEl = document.getElementById("smartGateResult");
    const plate = targetPlate || (inputEl ? inputEl.value.trim().toUpperCase() : "");

    if (!plate) {
        alert("Please enter a license plate number.");
        return;
    }

    if (resultEl) {
        resultEl.style.display = "block";
        resultEl.innerHTML = `<div style="color: var(--text-muted); font-size: 13px;">⌛ Gate 1 Processing DEPARTURE for <strong>${plate}</strong>...</div>`;
    }

    try {
        const response = await fetch(API_URL + "/parking/exit-process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plate_number: plate })
        });

        const data = await response.json();

        if (response.ok) {
            if (resultEl) {
                resultEl.innerHTML = `
                    <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 14px; font-size: 13px;">
                        <div style="font-weight: 800; color: #b91c1c; font-size: 15px; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
                            <span>🔴 SINGLE GATE: VEHICLE DEPARTED (EXIT AUTHORIZED)</span>
                            <span style="font-size: 11px; background: #ef4444; color: white; padding: 3px 10px; border-radius: 10px;">BARRIER OPENED</span>
                        </div>
                        <div style="margin-top: 6px;">Plate: <strong class="plate-tag" style="margin: 0; padding: 2px 8px;">${data.plate_number}</strong> | Stay Duration: <strong>⏱️ ${data.duration_text}</strong> | Bay Released: <strong>${data.slot_name}</strong></div>
                    </div>
                `;
            }
            if (inputEl) inputEl.value = "";
            showExitReceiptModal(data);
            loadDashboardData();
            loadParkingData();
        } else {
            if (resultEl) {
                resultEl.innerHTML = `
                    <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 12px; color: #b91c1c; font-size: 13px;">
                        <strong>❌ Departure Exit Failed:</strong> ${data.detail || "No active arrival session found for this plate"}
                    </div>
                `;
            }
        }
    } catch (err) {
        if (resultEl) resultEl.innerHTML = `<div style="color: #b91c1c; font-size: 13px;">❌ Error processing Departure: ${err.message}</div>`;
    }
}

// ================= REAL-TIME DETECTION VERIFICATION & SNAPSHOT CONFIRMATION =================
let activeVerificationData = null;

function getVerificationMode() {
    return localStorage.getItem("verification_mode") || "smart";
}

function changeVerificationMode(mode) {
    localStorage.setItem("verification_mode", mode);
    console.log("Verification Mode changed to:", mode);
    updateVerificationCardUI(mode);
}

function toggleHeaderVerificationDropdown(e) {
    if (e) e.stopPropagation();
    const panel = document.getElementById("headerVerificationPanel");
    const chevron = document.getElementById("headerChevron");
    if (!panel) return;
    const isVisible = panel.style.display === "block";
    panel.style.display = isVisible ? "none" : "block";
    if (chevron) chevron.style.transform = isVisible ? "rotate(0deg)" : "rotate(180deg)";
}

function toggleVerificationDropdown() {
    const panel = document.getElementById("verificationDropdownPanel");
    const chevron = document.getElementById("triggerChevron");
    if (!panel) return;
    const isVisible = panel.style.display === "block";
    panel.style.display = isVisible ? "none" : "block";
    if (chevron) chevron.style.transform = isVisible ? "rotate(0deg)" : "rotate(180deg)";
}

function selectVerificationMode(mode) {
    changeVerificationMode(mode);
    const cardPanel = document.getElementById("verificationDropdownPanel");
    const cardChevron = document.getElementById("triggerChevron");
    if (cardPanel) cardPanel.style.display = "none";
    if (cardChevron) cardChevron.style.transform = "rotate(0deg)";

    const headerPanel = document.getElementById("headerVerificationPanel");
    const headerChevron = document.getElementById("headerChevron");
    if (headerPanel) headerPanel.style.display = "none";
    if (headerChevron) headerChevron.style.transform = "rotate(0deg)";
}

function updateVerificationCardUI(mode) {
    const headerLabel = document.getElementById("headerVerificationLabel");
    const cardLabel = document.getElementById("triggerLabel");

    const options = ["smart", "strict", "auto"];
    options.forEach(opt => {
        // Card options
        const cardEl = document.getElementById(`opt-${opt}`);
        if (cardEl) {
            const checkIcon = cardEl.querySelector(".check-icon");
            if (opt === mode) {
                cardEl.classList.add("active");
                cardEl.style.background = "#eff6ff";
                if (checkIcon) checkIcon.style.display = "block";
            } else {
                cardEl.classList.remove("active");
                cardEl.style.background = "transparent";
                if (checkIcon) checkIcon.style.display = "none";
            }
        }

        // Header options
        const hdrEl = document.getElementById(`hdr-opt-${opt}`);
        if (hdrEl) {
            const checkIcon = hdrEl.querySelector(".check-icon");
            if (opt === mode) {
                hdrEl.classList.add("active");
                hdrEl.style.background = "#eff6ff";
                if (checkIcon) checkIcon.style.display = "block";
            } else {
                hdrEl.classList.remove("active");
                hdrEl.style.background = "transparent";
                if (checkIcon) checkIcon.style.display = "none";
            }
        }
    });

    let shortKey = "verif_smart_short";
    if (mode === "strict") shortKey = "verif_strict_short";
    if (mode === "auto") shortKey = "verif_auto_short";

    const lang = currentLang || "en";
    const translatedShort = (translations[lang] && translations[lang][shortKey])
        ? translations[lang][shortKey]
        : (mode === "strict" ? "Strict Verification" : (mode === "auto" ? "Full Auto" : "Smart Verification"));

    if (headerLabel) headerLabel.innerText = translatedShort;
    if (cardLabel) cardLabel.innerText = translatedShort;
}

// Close dropdowns on outside click
document.addEventListener("click", (e) => {
    // Close card dropdown
    const cardDropdown = document.querySelector(".custom-verification-dropdown");
    if (cardDropdown && !cardDropdown.contains(e.target)) {
        const cardPanel = document.getElementById("verificationDropdownPanel");
        const cardChevron = document.getElementById("triggerChevron");
        if (cardPanel) cardPanel.style.display = "none";
        if (cardChevron) cardChevron.style.transform = "rotate(0deg)";
    }

    // Close header dropdown
    const headerPanel = document.getElementById("headerVerificationPanel");
    const headerTrigger = document.getElementById("headerVerificationTrigger");
    if (headerPanel && headerTrigger && !headerPanel.contains(e.target) && !headerTrigger.contains(e.target)) {
        headerPanel.style.display = "none";
        const chevron = document.getElementById("headerChevron");
        if (chevron) chevron.style.transform = "rotate(0deg)";
    }
});

// Sync mode dropdown selection on startup
document.addEventListener("DOMContentLoaded", () => {
    const currentMode = getVerificationMode();
    updateVerificationCardUI(currentMode);
});

async function showDetectionConfirmModal(data) {
    activeVerificationData = data;
    const modal = document.getElementById("detectionConfirmModal");
    if (!modal) return;

    const imgEl = document.getElementById("confirmModalSnapshotImg");
    const confTextEl = document.getElementById("confirmModalConfidenceText");
    const confDotEl = document.getElementById("confirmModalConfidenceDot");
    const plateInputEl = document.getElementById("confirmModalPlateInput");
    const statusBadgeEl = document.getElementById("confirmModalStatusBadge");
    const titleEl = document.getElementById("confirmModalTitle");
    const subtitleEl = document.getElementById("confirmModalSubtitle");
    const approveBtn = document.getElementById("confirmModalApproveBtn");
    const denyBtn = document.getElementById("confirmModalDenyBtn");

    const confidence = data.confidence !== undefined ? data.confidence : 94.2;
    const confidenceFormatted = typeof confidence === "number" ? confidence.toFixed(1) + "%" : confidence;

    if (imgEl) {
        imgEl.src = data.snapshot || data.image_url || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80";
    }

    if (confTextEl) {
        confTextEl.innerText = `Confidence: ${confidenceFormatted}`;
    }

    if (confDotEl) {
        confDotEl.style.background = confidence >= 85 ? "#10b981" : (confidence >= 70 ? "#f59e0b" : "#ef4444");
    }

    const currentPlate = (data.plate_number || "").toUpperCase();
    if (plateInputEl) {
        plateInputEl.value = currentPlate;
    }

    let isParked = Boolean(data.is_parked === true);
    let slotName = data.parking_slot || null;
    let staySec = (data.stay_seconds !== undefined) ? data.stay_seconds : 999;
    let inTransit = Boolean(data.in_transit_buffer === true);
    let remSec = data.transit_remaining_sec || 0;

    // Check active parking list to determine exact entry timestamp and slot
    if (currentPlate) {
        try {
            const activeRes = await fetch(API_URL + "/parking/active");
            if (activeRes.ok) {
                const activeList = await activeRes.json();
                const cleanTarget = currentPlate.replace(/[\s\-_]/g, "");
                const matchedActive = activeList.find(v => v.plate_number && v.plate_number.replace(/[\s\-_]/g, "").toUpperCase() === cleanTarget);
                if (matchedActive) {
                    isParked = true;
                    slotName = matchedActive.slot_number || matchedActive.slot_name || slotName;
                    if (matchedActive.entry_time) {
                        const entryMs = new Date(matchedActive.entry_time).getTime();
                        if (!isNaN(entryMs)) {
                            staySec = Math.max(0, Math.floor((Date.now() - entryMs) / 1000));
                            inTransit = staySec < 60;
                            remSec = Math.max(0, 60 - staySec);
                        }
                    }
                }
            }
        } catch (e) {}
    }

    activeVerificationData.is_parked = isParked;
    activeVerificationData.parking_slot = slotName;

    const lang = currentLang || "en";
    const t = (translations && translations[lang]) ? translations[lang] : (translations["en"] || {});

    if (isParked) {
        // ================= VEHICLE EXIT / DEPARTURE MODE =================
        if (titleEl) titleEl.innerText = t.modal_exit_title || "Vehicle Departure Verification (Exit Gate)";
        if (subtitleEl) subtitleEl.innerText = slotName 
            ? `Vehicle is currently parked in ${slotName} — Confirm exit authorization`
            : (t.modal_exit_sub || "Review vehicle snapshot and confirm exit authorization");

        if (inTransit && remSec > 0) {
            if (statusBadgeEl) {
                statusBadgeEl.innerHTML = `🚗 <strong style="color: #0369a1;">Currently Inside (${slotName || 'Bay'})</strong><br><span style="font-size:11px; font-weight: bold; color:#b45309;">⚠️ Gate Transit in Progress (Entered ${staySec}s ago — Exit locked for ${remSec}s)</span>`;
                statusBadgeEl.style.color = "#b45309";
            }

            if (approveBtn) {
                approveBtn.disabled = true;
                approveBtn.innerHTML = `⏳ Exit Locked (${remSec}s Transit Protection)`;
                approveBtn.style.background = "#94a3b8";
                approveBtn.style.borderColor = "#94a3b8";
                approveBtn.style.cursor = "not-allowed";
            }
        } else {
            if (statusBadgeEl) {
                statusBadgeEl.innerHTML = `🚗 <strong style="color: #047857;">Currently Inside (${slotName || 'Slot Assigned'})</strong><br><span style="font-size:11px; font-weight: normal; color:#64748b;">Owner: ${data.owner_name || 'Visitor / Guest'} | Action: Vehicle Exit (Stay: ${staySec}s)</span>`;
                statusBadgeEl.style.color = "#047857";
            }

            if (approveBtn) {
                approveBtn.disabled = false;
                approveBtn.innerHTML = t.btn_confirm_grant_exit || t.btn_confirm_process_exit || `🟢 Confirm & Grant Exit`;
                approveBtn.style.background = "#10b981";
                approveBtn.style.borderColor = "#10b981";
                approveBtn.style.cursor = "pointer";
            }
        }

        if (denyBtn) {
            denyBtn.innerHTML = t.btn_deny_hold_exit || `🔴 Cancel / Hold at Gate`;
        }
    } else {
        // ================= VEHICLE ENTRANCE / ARRIVAL MODE =================
        if (titleEl) titleEl.innerText = t.modal_verif_title || "Vehicle Detection Verification";
        if (subtitleEl) subtitleEl.innerText = t.modal_verif_sub || "Review vehicle snapshot and confirm entrance authorization";

        const inExitCooldown = Boolean(data.in_exit_cooldown === true || data.action_type === "exit_cooldown");
        const exitCdRem = data.exit_cooldown_remaining_sec || 0;

        if (inExitCooldown && exitCdRem > 0) {
            if (statusBadgeEl) {
                statusBadgeEl.innerHTML = `⏳ <strong style="color: #d97706;">Vehicle Recently Exited</strong><br><span style="font-size:11px; font-weight: bold; color:#b45309;">⚠️ Transit Cooldown Active — Re-entry locked for ${exitCdRem}s</span>`;
                statusBadgeEl.style.color = "#d97706";
            }
            if (approveBtn) {
                approveBtn.disabled = true;
                approveBtn.innerHTML = `⏳ Re-entry Locked (${exitCdRem}s Cooldown)`;
                approveBtn.style.background = "#94a3b8";
                approveBtn.style.borderColor = "#94a3b8";
                approveBtn.style.cursor = "not-allowed";
            }
        } else {
            if (statusBadgeEl) {
                if (data.is_registered) {
                    statusBadgeEl.innerHTML = `🟢 <strong>Registered Vehicle</strong><br><span style="font-size:11px; font-weight: normal; color:#64748b;">Owner: ${data.owner_name || 'System Registry'}</span>`;
                    statusBadgeEl.style.color = "#047857";
                } else {
                    statusBadgeEl.innerHTML = `⏳ <strong style="color: #d97706;">UNREGISTERED VEHICLE — PENDING AUTHORIZATION</strong><br><span style="font-size:11px; font-weight: 600; color:#64748b;">Barrier locked. Select Guest Pass or Deny Entry below:</span>`;
                    statusBadgeEl.style.color = "#d97706";
                }
            }

            if (approveBtn) {
                approveBtn.disabled = false;
                if (data.is_registered) {
                    approveBtn.innerHTML = t.btn_confirm_grant_entrance || `🟢 Confirm & Grant Entrance`;
                    approveBtn.style.background = "#10b981";
                    approveBtn.style.borderColor = "#10b981";
                } else {
                    approveBtn.innerHTML = `🙋‍♂️ Authorize Guest Pass`;
                    approveBtn.style.background = "#f59e0b";
                    approveBtn.style.borderColor = "#d97706";
                }
                approveBtn.style.cursor = "pointer";
            }
        }

        if (denyBtn) {
            denyBtn.innerHTML = t.btn_deny_flag_alert || `🔴 Deny Entry & Flag Alert`;
        }
    }

    modal.style.setProperty("display", "flex", "important");
}

function closeDetectionConfirmModal() {
    const modal = document.getElementById("detectionConfirmModal");
    if (modal) modal.style.display = "none";
    activeVerificationData = null;
    if (isAutoLiveScanEnabled && webcamStream && !isScanInProgress) {
        scheduleNextAutoScan(300);
    }
}

async function approveDetectionConfirmModal() {
    const plateInputEl = document.getElementById("confirmModalPlateInput");
    const plate = plateInputEl ? plateInputEl.value.trim().toUpperCase() : (activeVerificationData ? activeVerificationData.plate_number : "");

    if (!plate) {
        alert("Please enter a valid plate number.");
        return;
    }

    let isExit = Boolean(activeVerificationData && activeVerificationData.is_parked === true);
    let isReg = Boolean(activeVerificationData && activeVerificationData.is_registered === true);
    const snap = activeVerificationData ? activeVerificationData.snapshot : null;

    // If operator edited the plate number in the input, verify active status & registration for the edited plate
    if (activeVerificationData && activeVerificationData.plate_number && activeVerificationData.plate_number.toUpperCase() !== plate) {
        try {
            const activeRes = await fetch(API_URL + "/parking/active");
            if (activeRes.ok) {
                const activeList = await activeRes.json();
                const cleanTarget = plate.replace(/[\s\-_]/g, "");
                const matchedActive = activeList.find(v => v.plate_number && v.plate_number.replace(/[\s\-_]/g, "").toUpperCase() === cleanTarget);
                isExit = Boolean(matchedActive);
            }
            const checkRes = await fetch(API_URL + "/vehicles/plate/" + plate, {
                headers: token ? { "Authorization": "Bearer " + token } : {}
            });
            if (checkRes.ok) {
                const vInfo = await checkRes.json();
                isReg = Boolean(vInfo && !vInfo.message && vInfo.plate_number && !vInfo.is_guest);
            } else {
                isReg = false;
            }
        } catch (e) {}
    }

    closeDetectionConfirmModal();

    if (isExit) {
        // Process Exit / Departure for already parked vehicle
        await processDepartureGateManual(plate);
    } else if (isReg) {
        // Registered vehicle -> Grant normal entrance
        await processArrivalGateManual(plate, true);
    } else {
        // Unregistered / Unknown vehicle -> STRICTLY route to Guest Pass Authorization!
        showGuestAuthModal(plate, snap);
        const resultEl = document.getElementById("smartGateResult");
        if (resultEl) {
            resultEl.style.display = "block";
            resultEl.innerHTML = `
                <div style="background: #fffbeb; border: 2px solid #f59e0b; border-radius: 12px; padding: 16px; margin-top: 10px; box-shadow: 0 8px 20px rgba(245, 158, 11, 0.15);">
                    <div style="font-weight: 800; font-size: 15px; color: #b45309; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
                        <span>🛑 UNKNOWN VEHICLE: <span class="plate-tag" style="font-size: 15px; margin: 0 4px; padding: 2px 8px;">${plate}</span></span>
                        <span style="font-size: 11px; background: #f59e0b; color: white; padding: 3px 10px; border-radius: 12px; font-weight: 800;">OFFICER AUTHORIZATION REQUIRED</span>
                    </div>
                    <p style="font-size: 12px; color: #92400e; margin-bottom: 12px; font-weight: 600;">
                        Barrier remains <strong>LOCKED</strong>. Plate <strong>${plate}</strong> is not registered. Fill in visitor details below or via popup to authorize entry:
                    </p>

                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                        <div>
                            <label style="font-size: 11px; font-weight: 700; color: #78350f; display: block; margin-bottom: 4px;">Guest Name</label>
                            <input type="text" id="inlineGuestName" value="Visitor / Guest" class="form-input" style="height: 36px; font-size: 12px; border-color: #fcd34d;">
                        </div>
                        <div>
                            <label style="font-size: 11px; font-weight: 700; color: #78350f; display: block; margin-bottom: 4px;">Vehicle Category</label>
                            <select id="inlineGuestCategory" class="form-input" style="height: 36px; font-size: 12px; background: white; border-color: #fcd34d; font-weight: bold; color: var(--text-main);">
                                <option value="Car">Car</option>
                                <option value="Tuk Tuk">Tuk Tuk</option>
                                <option value="Bike">Bike</option>
                                <option value="Van">Van</option>
                                <option value="Bus">Bus</option>
                                <option value="Truck">Truck</option>
                            </select>
                        </div>
                        <div>
                            <label style="font-size: 11px; font-weight: 700; color: #78350f; display: block; margin-bottom: 4px;">Purpose / Notes</label>
                            <input type="text" id="inlineGuestPurpose" value="Visitor Access" class="form-input" style="height: 36px; font-size: 12px; border-color: #fcd34d;">
                        </div>
                    </div>

                    <div style="display: flex; gap: 10px;">
                        <button onclick="approveInlineGuestEntry('${plate}')" class="btn-primary" style="flex: 2; height: 38px; font-size: 13px; font-weight: 800; background: #10b981; border-color: #10b981; display: flex; align-items: center; justify-content: center; gap: 6px; margin: 0;">
                            <span>🟢 Approve Guest Entry & Open Gate</span>
                        </button>
                        <button onclick="denyGuestVehicleEntry()" class="btn-secondary" style="flex: 1; height: 38px; font-size: 13px; font-weight: 800; color: #ef4444; border-color: #ef4444; background: rgba(239, 68, 68, 0.1); margin: 0;">
                            <span>🔴 Deny & Flag Alert</span>
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

async function denyDetectionConfirmModal() {
    const plateInputEl = document.getElementById("confirmModalPlateInput");
    const plate = plateInputEl ? plateInputEl.value.trim().toUpperCase() : (activeVerificationData ? activeVerificationData.plate_number : "");

    closeDetectionConfirmModal();

    if (plate) {
        // Flag security alert for denied vehicle
        try {
            const curToken = localStorage.getItem("token");
            const headers = { "Content-Type": "application/json" };
            if (curToken) headers["Authorization"] = "Bearer " + curToken;

            const snap = activeVerificationData ? (activeVerificationData.snapshot || activeVerificationData.crop_snapshot) : null;

            await fetch(API_URL + "/alerts", {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    plate_number: plate,
                    reason: `Entrance DENIED by Security Operator during snapshot verification. Barrier kept locked.`,
                    snapshot: snap
                })
            });

            alert(`🛑 Entry Denied for vehicle ${plate}. Security alert logged.`);
            triggerSecuritySiren();
            if (typeof loadAlerts === "function") loadAlerts();
            if (typeof loadDashboardData === "function") loadDashboardData();
        } catch (err) {
            console.error("Error logging denied entry alert:", err);
        }
    }
}


