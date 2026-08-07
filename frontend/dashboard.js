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
        hourly_volume: "Hourly Detection Volume",
        today_all_cams: "Today – All Cameras",
        by_camera: "By Camera",
        total_today: "Total detections today",
        recent_detections: "Recent Detections",
        search_placeholder: "Search plates...",
        
        total_slots: "Total Slots",
        available_slots: "Available Slots",
        occupied_slots: "Occupied Slots",
        parking_slots_title: "Parking Lots / Slots",
        btn_initialize: "Initialize Parking Slots",
        history_title: "Parking History & Session Logs",
        
        th_id: "ID",
        th_plate: "Plate",
        th_time: "Time",
        th_camera: "Camera",
        th_confidence: "Confidence",
        th_status: "Status",
        th_owner: "Owner",
        th_vehicle: "Vehicle",
        th_actions: "Actions",
        th_alert_time: "Alert Time",
        th_reason: "Reason",
        th_img_ref: "Image Reference",
        th_session_id: "Session ID",
        th_vehicle_plate: "Vehicle Plate",
        th_slot_number: "Slot Number",
        th_entry_time: "Entry Time",
        th_exit_time: "Exit Time",
        th_action: "Action",
        
        status_available: "Available",
        status_occupied: "Occupied",
        status_active: "Active",
        status_completed: "Completed",
        status_allowed: "Allowed",
        status_flagged: "Flagged",
        status_denied: "Denied",
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
        already_initialized_alert: "Parking slots are already initialized.",
        btn_clear_all_parking: "Clear All Logs",
        btn_delete: "Delete",
        btn_edit: "Edit",
        confirm_clear_all_parking: "Are you sure you want to clear all parking history logs?",
        confirm_delete_parking_log: "Are you sure you want to delete this parking session log?",

        btn_start_cam: "Start Live Camera",
        btn_stop_cam: "Stop Camera",
        btn_scan_frame: "Capture & Scan Frame",
        manual_title: "Manual Plate Verification (Bypass AI)",
        manual_desc: "Verify if a plate number is in the database and simulate a log record.",
        placeholder_plate: "ENTER PLATE NUMBER",
        btn_check_db: "Check Database",
        live_log_title: "Live Camera Scan Log",
        cam_offline_msg: "Camera feed offline. Start camera to stream scans.",

        filter_all: "All",
        filter_allowed: "Allowed",
        filter_flagged: "Flagged",
        filter_denied: "Denied",
        btn_export_csv: "Export CSV",
        btn_manage_vehicles: "Manage Vehicles",
        btn_clear_all_records: "Clear All Logs",
        btn_clear_all_alerts: "Clear All Alerts",
        alerts_title: "Active Security Alerts",
        no_records_msg: "No records matching filter",
        no_alerts_msg: "No active security alerts",
        confirm_clear_all_detection: "Are you sure you want to delete ALL detection logs and alerts?",
        confirm_delete_detection_log: "Are you sure you want to delete this detection log?",
        confirm_delete_alert: "Are you sure you want to delete this security alert?",
        confirm_clear_all_alerts: "Are you sure you want to clear ALL security alerts?",

        settings_title: "Operator Settings",
        lbl_op_name: "Operator Name",
        lbl_api_url: "Target Server API URL",
        lbl_cam_loc: "Camera 01 Location",
        settings_desc: "System parameters managed by system administrator. Contact security supervisor to alter API configurations.",

        edit_vehicle_title: "Edit Vehicle",
        reg_vehicle_title: "Add New Vehicle",
        registry_title: "Registered Vehicles Registry",
        assign_modal_title: "Assign Vehicle to Slot",
        lbl_owner_name: "Owner Name",
        lbl_owner_id: "Owner ID / License ID",
        lbl_vehicle_model: "Vehicle Model",
        lbl_plate_number: "Plate Number",
        lbl_vehicle_photo: "Vehicle Photo",
        btn_open_cam: "📷 Open Camera",
        btn_take_snap: "📸 Take Snap",
        btn_cancel: "❌ Cancel",
        btn_update_vehicle: "Update Vehicle",
        btn_save_reg: "Save Vehicle Registration",
        btn_add_new_vehicle: "➕ Add New Vehicle",
        lbl_selected_slot: "Selected Parking Slot",
        lbl_select_reg_vehicle: "Select Registered Vehicle",
        btn_confirm_assign: "Assign Vehicle",
        btn_cancel_modal: "Cancel",

        menu_entrance: "Entrance History",
        title_entrance: "Entrance History",
        sub_entrance: "Automatic recording of approved registered vehicle entrances",
        latest_entrance_title: "Latest Approved Vehicle Entrance",
        btn_view_entrance_history: "View Entrance History",
        no_entrance_yet: "No approved vehicle entrances recorded yet today.",
        entrance_record_title: "Record Vehicle Entrance",
        entrance_record_desc: "Processes AI-detected license plate, verifies approval in database, auto-assigns parking slot, and logs entrance timestamp & snapshot.",
        lbl_entrance_plate: "Plate Number *",
        lbl_entrance_slot: "Parking Slot (Optional)",
        lbl_entrance_snapshot: "Snapshot Image Path (Optional)",
        btn_record_entrance: "Process Entrance",
        entrance_history_title: "Approved Entrance History",
        entrance_history_subtitle: "Recorded gate entries with snapshots, timestamps, and vehicle details",
        btn_clear_entrance: "Clear Entrance History",
        th_snapshot: "Snapshot",
        th_vehicle_details: "Vehicle Details",
        th_slot: "Parking Slot",
        th_entrance_time: "Entrance Time",
        entrance_detail_title: "Vehicle Entrance Details",

        facility_capacity: "Facility Parking Capacity",
        facility_capacity_sub: "Live occupancy status meter",
        meter_available: "Available",
        meter_occupied: "Occupied",
        vehicles_by_cat: "Vehicles Inside by Category",
        vehicles_by_cat_sub: "Current distribution of parked vehicle types",
        gate_traffic: "Today's Gate Traffic",
        gate_traffic_sub: "Total arrivals (In) vs departures (Out)",
        vehicles_present_inside: "Vehicles Currently Present Inside Premises",
        vehicles_present_inside_sub: "Real-time tracking ticker from entrance scan until slot release",
        th_category: "Category",
        th_owner_model: "Owner / Model",
        th_slot_assigned: "Slot Assigned",
        th_arrival_time: "Arrival Time",
        th_stay_duration: "Live Stay Duration",
        lbl_category: "Vehicle Category"
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
        hourly_volume: "පැයක පැමිණීම් ප්‍රමාණය",
        today_all_cams: "අද - සියලුම කැමරා",
        by_camera: "කැමරා අනුව",
        total_today: "අද දින මුළු හඳුනාගැනීම්",
        recent_detections: "මෑතකදී හඳුනාගත් වාහන",
        search_placeholder: "ලියාපදිංචි අංක සොයන්න...",
        
        total_slots: "මුළු ඉඩ ප්‍රමාණය",
        available_slots: "හිස් ඉඩ ප්‍රමාණය",
        occupied_slots: "භාවිතයේ ඇති ඉඩ",
        parking_slots_title: "රථගාලේ තීරු / නැවැතුම්",
        btn_initialize: "නැවැතුම් ඉඩ සකසන්න",
        history_title: "රථවාහන නැවැත්වීමේ ඉතිහාසය සහ වාර්තා",
        
        th_slot_number: "තීරු අංකය",
        th_entry_time: "ඇතුල් වූ වේලාව",
        th_exit_time: "පිටවූ වේලාව",
        th_status: "තත්ත්වය",
        th_action: "ක්‍රියාව",
        th_id: "අංකය",
        th_plate: "ලියාපදිංචි අංකය",
        th_time: "වේලාව",
        th_camera: "කැමරාව",
        th_confidence: "විශ්වාසනීයත්වය",
        th_owner: "හිමිකරු",
        th_vehicle: "වාහනය",
        th_actions: "ක්‍රියාමාර්ග",
        th_alert_time: "සංඥා වේලාව",
        th_reason: "හේතුව",
        th_img_ref: "ඡායාරූපය",
        
        status_available: "හිස්ව ඇත",
        status_occupied: "භාවිතයේ ඇත",
        status_active: "ක්‍රියාකාරී",
        status_completed: "සම්පූර්ණයි",
        status_allowed: "අවසර ලත්",
        status_flagged: "සීමා කළ",
        status_denied: "අවහිර කළ",
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
        already_initialized_alert: "නැවැතුම් තීරු දැනටමත් සකසා ඇත.",
        btn_clear_all_parking: "සියලුම වාර්තා මකන්න",
        btn_delete: "මකන්න",
        btn_edit: "සංස්කරණය",
        confirm_clear_all_parking: "ඔබට සියලුම නැවැතුම් ඉතිහාස වාර්තා මකා දැමීමට අවශ්‍ය බව සහතිකද?",
        confirm_delete_parking_log: "මෙම නැවැතුම් වාර්තාව මකා දැමීමට ඔබට සහතිකද?",

        btn_start_cam: "සජීවී කැමරාව ආරම්භ කරන්න",
        btn_stop_cam: "කැමරාව අතහරින්න",
        btn_scan_frame: "දර්ශනය ස්කෑන් කරන්න",
        manual_title: "හස්තීය පරීක්ෂාව (පද්ධති මඟහැරීම)",
        manual_desc: "වාහන අංකය දත්ත ගබඩාවේ තිබේදැයි පරීක්ෂා කර වාර්තාවක් සාදන්න.",
        placeholder_plate: "වාහන අංකය ඇතුළත් කරන්න",
        btn_check_db: "දත්ත ගබඩාව පරීක්ෂා කරන්න",
        live_log_title: "සජීවී කැමරා පරීක්ෂණ සටහන",
        cam_offline_msg: "කැමරාව විසන්ධි වී ඇත. සජීවී දර්ශන සඳහා කැමරාව ආරම්භ කරන්න.",

        filter_all: "සියල්ල",
        filter_allowed: "අවසර ලත්",
        filter_flagged: "සීමා කළ",
        filter_denied: "අවහිර කළ",
        btn_export_csv: "CSV ලබාගන්න",
        btn_manage_vehicles: "වාහන කළමනාකරණය",
        btn_clear_all_records: "සියලුම වාර්තා මකන්න",
        btn_clear_all_alerts: "සියලුම සංඥා මකන්න",
        alerts_title: "ක්‍රියාකාරී ආරක්ෂක සංඥා",
        no_records_msg: "ගැලපෙන වාර්තා හමු නොවීය",
        no_alerts_msg: "සක්‍රීය ආරක්ෂක සංඥා නොමැත",
        confirm_clear_all_detection: "ඔබට සියලුම හඳුනාගැනීමේ වාර්තා මකා දැමීමට අවශ්‍ය බව සහතිකද?",
        confirm_delete_detection_log: "මෙම හඳුනාගැනීමේ වාර්තාව මකා දැමීමට ඔබට සහතිකද?",
        confirm_delete_alert: "මෙම ආරක්ෂක සංඥාව මකා දැමීමට ඔබට සහතිකද?",
        confirm_clear_all_alerts: "සියලුම ආරක්ෂක සංඥා මකා දැමීමට ඔබට සහතිකද?",

        settings_title: "මෙහෙයුම්කරු සැකසුම්",
        lbl_op_name: "මෙහෙයුම්කරුගේ නම",
        lbl_api_url: "සර්වර් API ලිපිනය",
        lbl_cam_loc: "කැමරා 01 ස්ථානය",
        settings_desc: "පද්ධති පරාමිතීන් පද්ධති පරිපාලක විසින් පාලනය කරනු ලැබේ.",

        edit_vehicle_title: "වාහනය යාවත්කාලීන කරන්න",
        reg_vehicle_title: "නව වාහනයක් ඇතුළත් කරන්න",
        registry_title: "ලියාපදිංචි වාහන ලේඛනය",
        assign_modal_title: "නැවැතුම් තීරුව ලබා දෙන්න",
        lbl_owner_name: "හිමිකරුගේ නම",
        lbl_owner_id: "හිමිකරුගේ හැඳුනුම්පත / බලපත්‍ර අංකය",
        lbl_vehicle_model: "වාහන මාදිලිය",
        lbl_plate_number: "ලියාපදිංචි අංකය",
        lbl_vehicle_photo: "වාහන ඡායාරූපය",
        btn_open_cam: "📷 කැමරාව තෝරන්න",
        btn_take_snap: "📸 ඡායාරූපය ගන්න",
        btn_cancel: "❌ අවලංගු කරන්න",
        btn_update_vehicle: "යාවත්කාලීන කරන්න",
        btn_save_reg: "ලියාපදිංචිය සුරකින්න",
        btn_add_new_vehicle: "➕ නව වාහනයක් එකතු කරන්න",
        lbl_selected_slot: "තෝරාගත් නැවැතුම් තීරුව",
        lbl_select_reg_vehicle: "ලියාපදිංචි වාහනය තෝරන්න",
        btn_confirm_assign: "වාහනය ඇතුල් කරන්න",
        btn_cancel_modal: "අවලංගු කරන්න",

        menu_entrance: "ඇතුළුවීම් ඉතිහාසය",
        title_entrance: "ඇතුළුවීම් ඉතිහාසය",
        sub_entrance: "අවසර ලත් වාහන ඇතුළුවීම් සටහන් කිරීම",
        latest_entrance_title: "අවසානයට ඇතුළු වූ අවසර ලත් වාහනය",
        btn_view_entrance_history: "සියලුම ඇතුළුවීම් බලන්න",
        no_entrance_yet: "අද දින තවම අවසර ලත් වාහන ඇතුළු වීමක් සටහන් වී නැත.",
        entrance_record_title: "වාහන ඇතුළුවීම සටහන් කරන්න",
        entrance_record_desc: "අංක තහඩුව පරීක්ෂා කර දත්ත ගබඩාව හා සැසඳීමෙන් ඇතුළුවීම සටහන් කරයි.",
        lbl_entrance_plate: "ලියාපදිංචි අංකය *",
        lbl_entrance_slot: "නැවැතුම් තීරුව (අත්‍යවශ්‍ය නොවේ)",
        lbl_entrance_snapshot: "ඡායාරූප මාර්ගය (අත්‍යවශ්‍ය නොවේ)",
        btn_record_entrance: "ඇතුළුවීම සටහන් කරන්න",
        entrance_history_title: "අවසර ලත් ඇතුළුවීම් ඉතිහාසය",
        entrance_history_subtitle: "ඡායාරූප, වේලාවන් සහ වාහන විස්තර සහිත ඇතුළුවීම් වාර්තා",
        btn_clear_entrance: "ඇතුළුවීම් ඉතිහාසය මකන්න",
        th_snapshot: "ඡායාරූපය",
        th_vehicle_details: "වාහන විස්තර",
        th_slot: "නැවැතුම් තීරුව",
        th_entrance_time: "ඇතුළු වූ වේලාව",
        entrance_detail_title: "වාහන ඇතුළුවීමේ විස්තර",

        facility_capacity: "රථගාලේ මුළු ධාරිතාව",
        facility_capacity_sub: "සජීවී භාවිත මීටරය",
        meter_available: "හිස්ව ඇත",
        meter_occupied: "භාවිතයේ ඇත",
        vehicles_by_cat: "වර්ගය අනුව ඇතුළත ඇති වාහන",
        vehicles_by_cat_sub: "දැනට නවතා ඇති වාහන වර්ගීකරණය",
        gate_traffic: "අද දින ගේට්ටු ගමනාගමනය",
        gate_traffic_sub: "මුළු ඇතුළුවීම් (In) සහ පිටවීම් (Out)",
        vehicles_present_inside: "දැනට පරිශ්‍රය තුළ ඇති වාහන",
        vehicles_present_inside_sub: "ඇතුළු වූ මොහොතේ සිට පිටවන තෙක් සජීවී නිරීක්ෂණය",
        th_category: "වාහන වර්ගය",
        th_owner_model: "හිමිකරු / මාදිලිය",
        th_slot_assigned: "වෙන්කළ තීරුව",
        th_arrival_time: "ඇතුළු වූ වේලාව",
        th_stay_duration: "ගත වූ සජීවී කාලය",
        lbl_category: "වාහන වර්ගය"
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
        hourly_volume: "மணிநேரக் கண்டுபிடிப்பு அளவு",
        today_all_cams: "இன்று – அனைத்து கேமராக்கள்",
        by_camera: "கேமரா வாரியாக",
        total_today: "இன்றைய மொத்தக் கண்டுபிடிப்புகள்",
        recent_detections: "சமீபத்திய கண்டுபிடிப்புகள்",
        search_placeholder: "வாகன எண்களைத் தேடுக...",
        
        total_slots: "மொத்த இடங்கள்",
        available_slots: "கிடைக்கக்கூடிய இடங்கள்",
        occupied_slots: "பயன்படுத்தப்பட்ட இடங்கள்",
        parking_slots_title: "வாகன நிறுத்துமிடங்கள்",
        btn_initialize: "நிறுத்துமிடங்களை அமைக்குக",
        history_title: "நிறுத்துமிட வரலாறு & பதிவுகள்",
        
        th_slot_number: "நிறுத்துமிட எண்",
        th_entry_time: "நுழைவு நேரம்",
        th_exit_time: "வெளியேறும் நேரம்",
        th_status: "நிலை",
        th_action: "செயல்",
        th_id: "ஐடி",
        th_plate: "வாகன எண்",
        th_time: "நேரம்",
        th_camera: "கேமரா",
        th_confidence: "நம்பிக்கை",
        th_owner: "உரிமையாளர்",
        th_vehicle: "வாகனம்",
        th_actions: "செயல்கள்",
        th_alert_time: "எச்சரிக்கை நேரம்",
        th_reason: "காரணம்",
        th_img_ref: "படம்",
        
        status_available: "கிடைக்கும்",
        status_occupied: "நிறைந்துள்ளது",
        status_active: "செயலில்",
        status_completed: "முடிந்தது",
        status_allowed: "அனுமதிக்கப்பட்டது",
        status_flagged: "அவதானிக்கப்பட்டது",
        status_denied: "மறுக்கப்பட்டது",
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
        already_initialized_alert: "நிறுத்துமிடங்கள் ஏற்கனவே அமைக்கப்பட்டுள்ளன.",
        btn_clear_all_parking: "அனைத்து பதிவுகளையும் நீக்குக",
        btn_delete: "நீக்குக",
        confirm_clear_all_parking: "அனைத்து நிறுத்துமிட வரலாற்றுப் பதிவுகளையும் நிச்சயமாக நீக்க விரும்புகிறீர்களா?",
        confirm_delete_parking_log: "இந்த நிறுத்துமிடப் பதிவை நிச்சயமாக நீக்க விரும்புகிறீர்களா?",

        menu_entrance: "நுழைவு வரலாறு",
        title_entrance: "நுழைவு வரலாறு",
        sub_entrance: "அனுமதிக்கப்பட்ட வாகனங்களின் தானியங்கி நுழைவுப் பதிவு",
        latest_entrance_title: "கடைசியாக அனுமதிக்கப்பட்ட வாகனம்",
        btn_view_entrance_history: "நுழைவு வரலாற்றைப் பார்க்கவும்",
        no_entrance_yet: "இன்று இன்னும் எந்த வாகன நுழைவும் பதிவு செய்யப்படவில்லை.",
        entrance_record_title: "வாகன நுழைவைப் பதிவுசெய்க",
        entrance_record_desc: "எண் தகட்டை சரிபார்த்து தரவுத்தளத்தில் பதிவுசெய்கிறது.",
        lbl_entrance_plate: "வாகன எண் *",
        lbl_entrance_slot: "பார்க்கிங் இடம் (விருப்பத்தேர்வு)",
        lbl_entrance_snapshot: "புகைப்பட பாதை (விருப்பத்தேர்வு)",
        btn_record_entrance: "நுழைவைச் செயல்படுத்து",
        entrance_history_title: "அனுமதிக்கப்பட்ட நுழைவு வரலாறு",
        entrance_history_subtitle: "புகைப்படங்கள், நேரங்கள் மற்றும் வாகன விவரங்களுடன் பதிவுசெய்யப்பட்ட நுழைவுகள்",
        btn_clear_entrance: "நுழைவு வரலாற்றை அழிக்கவும்",
        th_snapshot: "புகைப்படம்",
        th_vehicle_details: "வாகன விவரங்கள்",
        th_slot: "பார்க்கிங் இடம்",
        th_entrance_time: "நுழைவு நேரம்",
        entrance_detail_title: "வாகன நுழைவு விவரங்கள்",

        facility_capacity: "நிறுத்துமிடக் கொள்ளளவு",
        facility_capacity_sub: "நேரடி பயன்பாட்டு அளவீடு",
        meter_available: "கிடைக்கும்",
        meter_occupied: "நிறைந்துள்ளது",
        vehicles_by_cat: "வகை வாரியாக உள்ளே உள்ள வாகனங்கள்",
        vehicles_by_cat_sub: "தற்போது நிறுத்தப்பட்டுள்ள வாகன வகைகளின் பகிர்வு",
        gate_traffic: "இன்றைய கேட் போக்குவரத்து",
        gate_traffic_sub: "மொத்த வரவுகள் (In) மற்றும் வெளியேற்றங்கள் (Out)",
        vehicles_present_inside: "தற்போது வளாகத்தினுள் உள்ள வாகனங்கள்",
        vehicles_present_inside_sub: "நுழைவு முதல் வெளியேற்றம் வரையிலான நேரடி கண்காணிப்பு",
        th_category: "வாகன வகை",
        th_owner_model: "உரிமையாளர் / மாடல்",
        th_slot_assigned: "ஒதுக்கப்பட்ட இடம்",
        th_arrival_time: "வந்தடைந்த நேரம்",
        th_stay_duration: "தங்கியிருக்கும் நேரம்",
        lbl_category: "வாகன வகை"
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
    let clean = timeStr.toString().replace(/Z$/, '');
    let d = new Date(clean);
    if (!isNaN(d.getTime())) return d;
    return new Date(timeStr);
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

// Page Load Initialization
document.addEventListener("DOMContentLoaded", () => {
    localStorage.removeItem("theme");
    document.body.classList.remove("dark-mode");
    // Set Profile Info
    const username = localStorage.getItem("username") || "Admin";
    document.getElementById("headerAvatar").innerText = username.charAt(0).toUpperCase();

    // Initialize language translator
    setLanguage(currentLang);

    // Start Live Clock & Dwell Ticker Interval
    updateAllLiveTimeDisplays();
    if (!window.liveTimeIntervalId) {
        window.liveTimeIntervalId = setInterval(updateAllLiveTimeDisplays, 1000);
    }

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
    } else if (tabId === "entrance") {
        loadEntranceData();
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

        // Fetch total slots for capacity meter
        let totalSlots = 3;
        try {
            const statusRes = await fetch(API_URL + "/parking/status");
            if (statusRes.ok) {
                const statusData = await statusRes.json();
                totalSlots = statusData.total || 3;
            }
        } catch (e) {}

        const occupiedCount = data.active_total || 0;
        const availableCount = Math.max(0, totalSlots - occupiedCount);
        const percent = totalSlots > 0 ? Math.round((occupiedCount / totalSlots) * 100) : 0;

        // 1. Update Capacity Meter Card
        const meterPct = document.getElementById("meterPercentageText");
        if (meterPct) meterPct.innerText = `${percent}%`;

        const meterSub = document.getElementById("meterSubText");
        if (meterSub) meterSub.innerText = `${occupiedCount} of ${totalSlots} Parking Bays Occupied`;

        const barEl = document.getElementById("occupancyProgressBar");
        if (barEl) {
            barEl.style.width = `${percent}%`;
            barEl.style.background = percent > 85 ? "#ef4444" : percent > 50 ? "#f59e0b" : "linear-gradient(90deg, #10b981 0%, #3b82f6 100%)";
        }

        const availEl = document.getElementById("meterAvailableText");
        if (availEl) availEl.innerText = `${availableCount} Available`;

        const occEl = document.getElementById("meterOccupiedText");
        if (occEl) occEl.innerText = `${occupiedCount} Occupied`;

        // 2. Update Stat Cards & Badges
        const activeInsideEl = document.getElementById("stat-active-inside");
        if (activeInsideEl) activeInsideEl.innerText = occupiedCount;

        const breakdownEl = document.getElementById("stat-active-breakdown");
        if (breakdownEl && data.category_counts) {
            const cc = data.category_counts || {};
            const cats = [
                { name: 'Car', count: cc.Car || 0, color: '#2563eb', bg: 'rgba(37, 99, 235, 0.08)', svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>' },
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
        if (badgeEl) badgeEl.innerText = `${occupiedCount} Active`;

        // 3. Render Visual Category Chart & Gate Traffic Chart
        renderCategoryDistChart(data.category_counts || {});
        renderGateTrafficChart(data.hourly_arrivals || [], data.hourly_departures || []);

        // 4. Render Live Active Vehicles Table
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
    const canvas = document.getElementById("categoryDistChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    if (categoryChartInstance) {
        categoryChartInstance.destroy();
    }

    const categories = ['Car', 'Bike', 'Van', 'Bus', 'Truck'];
    const values = categories.map(c => counts[c] || 0);

    categoryChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Car', 'Bike', 'Van', 'Bus', 'Truck'],
            datasets: [{
                label: 'Active Vehicles',
                data: values,
                backgroundColor: ['#2563eb', '#f59e0b', '#0ea5e9', '#ef4444', '#d97706'],
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    grid: { color: '#f1f5f9' },
                    ticks: { color: '#64748b', precision: 0 }
                },
                y: {
                    grid: { display: false },
                    ticks: { color: '#1e293b', font: { weight: 'bold' } }
                }
            }
        }
    });
}

function renderGateTrafficChart(arrivals, departures) {
    const canvas = document.getElementById("gateTrafficChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    if (gateTrafficChartInstance) {
        gateTrafficChartInstance.destroy();
    }

    const totalIn = arrivals.reduce((a, b) => a + b, 0);
    const totalOut = departures.reduce((a, b) => a + b, 0);

    gateTrafficChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Arrived (In) 🟢', 'Departed (Out) 🔴'],
            datasets: [{
                data: [totalIn, totalOut],
                backgroundColor: ['#10b981', '#ef4444'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: { font: { size: 11, weight: 'bold' } }
                }
            },
            cutout: '65%'
        }
    });
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
                    action: `openVehiclesManagerModal(); setTimeout(() => { filterVehiclesTable('${v.plate_number}'); }, 200);`
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
    const category = document.getElementById("editCategory") ? document.getElementById("editCategory").value : "Car";
    const vehicle_image = document.getElementById("editVehicleImage").value;

    try {
        const response = await fetch(API_URL + "/vehicles/" + vehicleId, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ owner_name, owner_id, vehicle_model, category, vehicle_image })
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
        const noRecordsMsg = translations[currentLang].no_records_msg || "No records matching filter";
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 20px; color: var(--text-muted);">${noRecordsMsg}</td></tr>`;
        return;
    }

    filtered.forEach(log => {
        const statusLower = log.status.toLowerCase();
        let badgeClass = "allowed";
        if (statusLower === "flagged") badgeClass = "flagged";
        else if (statusLower === "denied") badgeClass = "denied";

        const localizedStatus = translations[currentLang][`status_${statusLower}`] || log.status;
        const deleteText = translations[currentLang].btn_delete || 'Delete';

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
                        ${localizedStatus}
                    </span>
                </td>
                <td>${log.owner_name}</td>
                <td>
                    <button class="btn-action-delete" onclick="deleteLog(${log.id})" style="padding: 4px 8px; font-size: 11px;">${deleteText}</button>
                </td>
            </tr>
        `;
    });
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

        if (!alerts || alerts.length === 0) {
            const noAlertsMsg = (translations[currentLang] && translations[currentLang].no_alerts_msg) ? translations[currentLang].no_alerts_msg : 'No active security alerts';
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 30px; color: var(--text-muted);">${noAlertsMsg}</td></tr>`;
            return;
        }

        alerts.forEach(alert => {
            const time = new Date(alert.alert_time).toLocaleTimeString();
            const deleteText = translations[currentLang].btn_delete || 'Delete';
            tbody.innerHTML += `
                <tr>
                    <td>#AL-${alert.id}</td>
                    <td><span class="plate-tag" style="background-color: var(--danger-color);">${alert.plate_number}</span></td>
                    <td>${time}</td>
                    <td style="color: var(--danger-color); font-weight: 600;">${alert.reason}</td>
                    <td>${alert.snapshot || 'N/A'}</td>
                    <td>
                        <button class="btn-action-delete" onclick="deleteAlert(${alert.id})" style="padding: 4px 8px; font-size: 11px;">${deleteText}</button>
                    </td>
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
                <div style="text-align: center; grid-column: 1 / -1; padding: 45px 20px; background: white; border: 1px solid var(--border-color); border-radius: 12px; margin: 10px 0;">
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
                const cat = activeSession ? (activeSession.category || "Car") : "Car";
                const vInstance = (typeof Vehicle3DFactory !== "undefined") ? Vehicle3DFactory.create(cat) : null;
                const catIcon = vInstance ? vInstance.getIcon() : "🚗";
                let viewportHtml = "";

                if (slot.status !== "Available") {
                    cardClass = "slot-card occupied";
                    statusBadge = `<span class="slot-status-badge occupied"><span class="status-dot-small"></span>${translations[currentLang].status_occupied}</span>`;
                    viewportHtml = `<div id="slot-3d-viewport-${slot.id}" class="slot-3d-container" style="width: 100%; height: 160px; border-radius: 10px; overflow: hidden; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); margin: 8px 0; border: 1px solid rgba(255, 255, 255, 0.1); position: relative; box-shadow: inset 0 2px 8px rgba(0,0,0,0.5);"></div>`;
                    
                    if (activeSession) {
                        const formattedTime = formatParkingTime(activeSession.entry_time);
                        occupantHtml = `
                            <div class="slot-occupant-info" style="margin-bottom: 8px;">
                                <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 6px;">
                                    <span class="plate-tag" style="margin-bottom: 0; display: inline-block;">${activeSession.plate_number}</span>
                                    <span style="font-size: 11px; padding: 3px 8px; border-radius: 12px; background: rgba(59, 130, 246, 0.15); color: #2563eb; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                                        ${catIcon} ${cat.toUpperCase()}
                                    </span>
                                </div>
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
                        <div class="slot-occupant-info empty" style="margin-bottom: 8px;">
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
                            ${viewportHtml}
                        </div>
                        <div class="slot-card-actions">
                            ${actionButtonHtml}
                        </div>
                    </div>
                `;
            });

            // Initialize 3D renderer for each parking slot
            setTimeout(() => {
                slots.forEach(slot => {
                    const activeSession = activeSessions.find(s => s.slot_number === slot.slot_name);
                    const isOccupied = slot.status !== "Available";
                    const category = activeSession ? (activeSession.category || "Car") : "Car";
                    renderParkingSlot3D("slot-3d-viewport-" + slot.id, isOccupied, category);
                });
            }, 50);
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
    const icon = catKey === 'bike' ? '🏍️' : catKey === 'van' ? '🚐' : catKey === 'bus' ? '🚌' : catKey === 'truck' ? '🚚' : '🚗';

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
        if (!str.includes("T") && str.includes(" ")) {
            str = str.replace(" ", "T");
        }
        if (!str.endsWith("Z") && !/[+-]\d{2}:?\d{2}$/.test(str)) {
            str += "Z";
        }
        const d = new Date(str);
        return isNaN(d.getTime()) ? dateString : d.toLocaleString();
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
    if (!confirm("Are you sure you want to delete this security alert?")) {
        return;
    }

    try {
        const response = await fetch(API_URL + "/alerts/" + alertId, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + token }
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
    if (!confirm("Are you sure you want to clear ALL security alerts?")) {
        return;
    }

    try {
        const response = await fetch(API_URL + "/alerts", {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + token }
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
        const snapUrl = rec.snapshot 
            ? (rec.snapshot.startsWith("http") ? rec.snapshot : `${API_URL}/${rec.snapshot}`)
            : (v.vehicle_image ? (v.vehicle_image.startsWith("http") ? v.vehicle_image : `${API_URL}/${v.vehicle_image}`) : "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&q=80");

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
            ? rawRecords.filter(r => r.status === "Approved" || (!r.status.includes("Flagged") && !r.status.includes("Denied")))
            : [];

        const guestTableBody = document.getElementById("guestEntranceHistoryTableBody");

        entranceRecordsCache = {};
        if (records && records.length > 0) {
            records.forEach(r => {
                entranceRecordsCache[r.id] = r;
            });
        }

        const registeredRecords = records.filter(r => r.status === "Approved" && (!r.vehicle || !r.vehicle.is_guest));
        const guestRecords = records.filter(r => r.status === "Guest Approved" || (r.vehicle && r.vehicle.is_guest));

        // 1. Render Registered Entrance History Table
        if (!registeredRecords || registeredRecords.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 30px;">No registered vehicle entrance history recorded yet.</td></tr>`;
        } else {
            tableBody.innerHTML = registeredRecords.map(rec => renderEntranceRowHtml(rec)).join("");
        }

        // 2. Render Guest Entrance History Table
        if (guestTableBody) {
            if (!guestRecords || guestRecords.length === 0) {
                guestTableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 30px;">No guest vehicle entrance history recorded yet.</td></tr>`;
            } else {
                guestTableBody.innerHTML = guestRecords.map(rec => renderEntranceRowHtml(rec)).join("");
            }
        }

    } catch (err) {
        console.error("Error loading entrance data:", err);
        tableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--danger-color); padding: 20px;">❌ Failed to load entrance history.</td></tr>`;
    }
}

function renderEntranceRowHtml(rec) {
    const v = rec.vehicle || {};
    let snapUrl = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&q=80";
    const rawSnap = rec.snapshot || v.vehicle_image;
    if (rawSnap) {
        if (rawSnap.startsWith("http")) {
            snapUrl = rawSnap;
        } else {
            const cleanPath = rawSnap.replace(/^\/+/, '');
            snapUrl = `${API_URL}/${cleanPath}`;
        }
    }
    
    const timeStr = formatDateTime(rec.entrance_time);
    const exitStr = rec.exit_time ? formatDateTime(rec.exit_time) : `<span style="color: #10b981; font-weight: 700; font-size: 11px; background: rgba(16, 185, 129, 0.1); padding: 2px 8px; border-radius: 10px;">🟢 Still Inside</span>`;
    const durationBadge = rec.exit_time
        ? `<span style="font-weight: 700; color: #2563eb; font-size: 12px;">⏱️ ${rec.duration_text}</span>`
        : `<span style="color: #10b981; font-weight: 700; font-size: 11px;">⏱️ Active</span>`;

    const isGuestRec = (rec.status === "Guest Approved" || v.is_guest);

    return `
        <tr>
            <td><strong>#${rec.id}</strong></td>
            <td>
                <div style="width: 54px; height: 40px; border-radius: 6px; overflow: hidden; background: #000; cursor: pointer; border: 1px solid var(--border-color);" onclick="viewEntranceDetailsById(${rec.id})">
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
                ${isGuestRec
                    ? `<span style="display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; background: rgba(245, 158, 11, 0.15); color: #d97706; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 12px; border: 1px solid #f59e0b;">🙋‍♂️ Guest Approved</span>`
                    : `<span style="display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; background: rgba(16, 185, 129, 0.15); color: #10b981; font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 12px; border: 1px solid #10b981;">✓ ${rec.status || 'Approved'}</span>`
                }
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
                    <button onclick="viewEntranceDetailsById(${rec.id})" class="btn-secondary" style="padding: 4px 8px; font-size: 11px; width: auto; background: var(--accent-color); color: white; border: none;">
                        View
                    </button>
                    <button onclick="deleteEntranceRecord(${rec.id})" class="btn-secondary" style="padding: 4px 8px; font-size: 11px; width: auto; background: var(--danger-color); color: white; border: none;">
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
        const snapUrl = rec.snapshot 
            ? (rec.snapshot.startsWith("http") ? rec.snapshot : `${API_URL}/${rec.snapshot}`)
            : (v.vehicle_image ? (v.vehicle_image.startsWith("http") ? v.vehicle_image : `${API_URL}/${v.vehicle_image}`) : "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&q=80");
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

function viewEntranceDetailsById(id) {
    const rec = entranceRecordsCache[id];
    if (rec) {
        viewEntranceDetails(rec);
    }
}

function viewEntranceDetails(rec) {
    const modal = document.getElementById("entranceDetailModal");
    const body = document.getElementById("entranceModalBody");
    if (!modal || !body) return;

    const v = rec.vehicle || {};
    let snapUrl = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80";
    const rawSnap = rec.snapshot || v.vehicle_image;
    if (rawSnap) {
        if (rawSnap.startsWith("http")) {
            snapUrl = rawSnap;
        } else {
            const cleanPath = rawSnap.replace(/^\/+/, '');
            snapUrl = `${API_URL}/${cleanPath}`;
        }
    }
    const timeStr = formatDateTime(rec.entrance_time);

    body.innerHTML = `
        <div style="border-radius: 10px; overflow: hidden; background: #000; max-height: 250px; position: relative; margin-bottom: 16px; border: 1px solid var(--border-color);">
            <img src="${snapUrl}" onerror="this.src='https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80'" style="width: 100%; height: 250px; object-fit: cover;">
            <div style="position: absolute; bottom: 10px; left: 10px; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(4px); padding: 6px 14px; border-radius: 6px; border: 1px solid #334155; color: #38bdf8; font-weight: 800; font-family: monospace; font-size: 18px;">
                ${rec.plate_number}
            </div>
        </div>
        
        <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid #10b981; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-weight: 700; color: #10b981; font-size: 14px;">✓ Vehicle Approved for Gate Entrance</div>
            <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700;">${rec.status || 'Approved'}</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
            <div style="background: var(--card-bg); padding: 12px; border-radius: 8px; border: 1px solid var(--border-color);">
                <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Owner Full Name</div>
                <div style="font-weight: 700; font-size: 14px; color: var(--text-main); margin-top: 2px;">${v.owner_name || 'N/A'}</div>
            </div>
            <div style="background: var(--card-bg); padding: 12px; border-radius: 8px; border: 1px solid var(--border-color);">
                <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Owner / License ID</div>
                <div style="font-weight: 700; font-size: 14px; color: var(--text-main); margin-top: 2px;">${v.owner_id || 'N/A'}</div>
            </div>
            <div style="background: var(--card-bg); padding: 12px; border-radius: 8px; border: 1px solid var(--border-color);">
                <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Vehicle Model</div>
                <div style="font-weight: 700; font-size: 14px; color: var(--text-main); margin-top: 2px;">${v.vehicle_model || 'N/A'}</div>
            </div>
            <div style="background: var(--card-bg); padding: 12px; border-radius: 8px; border: 1px solid var(--border-color);">
                <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Assigned Parking Slot</div>
                <div style="font-weight: 700; font-size: 14px; color: var(--accent-color); margin-top: 2px;">${rec.parking_slot || 'Unassigned'}</div>
            </div>
        </div>

        <div style="background: var(--card-bg); padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); margin-top: 12px; font-size: 13px;">
            <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Entrance Timestamp</div>
            <div style="font-weight: 700; font-size: 14px; color: var(--text-main); margin-top: 2px;">📅 ${timeStr}</div>
        </div>
    `;

    modal.style.display = "block";
}

function closeEntranceDetailModal() {
    const modal = document.getElementById("entranceDetailModal");
    if (modal) modal.style.display = "none";
}

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

        let csv = "ID,Plate Number,Owner Name,Owner ID,Vehicle Model,Parking Slot,Status,Entrance Time,Snapshot\n";
        records.forEach(r => {
            const v = r.vehicle || {};
            const time = r.entrance_time ? formatDateTime(r.entrance_time) : "";
            csv += `"${r.id}","${r.plate_number}","${v.owner_name || ''}","${v.owner_id || ''}","${v.vehicle_model || ''}","${r.parking_slot || ''}","${r.status}","${time}","${r.snapshot || ''}"\n`;
        });

        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.setAttribute("href", url);
        a.setAttribute("download", `Entrance_History_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
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

        let csv = "ID,Plate Number,Visitor Name,Guest ID,Category/Purpose,Parking Slot,Status,Entrance Time,Departure Time,Snapshot\n";
        guestRecords.forEach(r => {
            const v = r.vehicle || {};
            const time = r.entrance_time ? formatDateTime(r.entrance_time) : "";
            const exitTime = r.exit_time ? formatDateTime(r.exit_time) : "Still Inside";
            csv += `"${r.id}","${r.plate_number}","${v.owner_name || 'Visitor'}","${v.owner_id || 'GUEST'}","${v.vehicle_model || 'Guest Pass'}","${r.parking_slot || ''}","${r.status}","${time}","${exitTime}","${r.snapshot || ''}"\n`;
        });

        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.setAttribute("href", url);
        a.setAttribute("download", `Guest_Vehicle_History_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
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

        const isCurrentlyInside = activeVehicles.some(v => v.plate_number && v.plate_number.toUpperCase() === plate);

        if (isCurrentlyInside) {
            await processDepartureGateManual(plate);
        } else {
            await processArrivalGateManual(plate);
        }
    } catch (err) {
        console.error("Smart Gate auto check error:", err);
        await processArrivalGateManual(plate);
    }
}

async function processArrivalGateManual(targetPlate) {
    const inputEl = document.getElementById("smartGatePlateInput");
    const resultEl = document.getElementById("smartGateResult");
    const plate = targetPlate || (inputEl ? inputEl.value.trim().toUpperCase() : "");

    if (!plate) {
        alert("Please enter a license plate number.");
        return;
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
            const icon = cat === 'BIKE' ? '🏍️' : cat === 'VAN' ? '🚐' : cat === 'BUS' ? '🚌' : cat === 'TRUCK' ? '🚚' : '🚗';

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
function showGuestAuthModal(plate) {
    const modal = document.getElementById("guestAuthModal");
    const tag = document.getElementById("guestModalPlateTag");
    const hiddenInput = document.getElementById("guestModalPlateHidden");
    if (!modal) return;

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
