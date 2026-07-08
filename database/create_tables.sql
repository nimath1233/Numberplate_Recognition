-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL
);

-- Vehicles Table
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    owner_id VARCHAR(50) NOT NULL,
    vehicle_model VARCHAR(100),
    vehicle_image VARCHAR(255),
    registered_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Detection Logs Table
CREATE TABLE detection_logs (
    id SERIAL PRIMARY KEY,
    plate_number VARCHAR(20) NOT NULL,
    snapshot VARCHAR(255),
    detection_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL
);

-- Alerts Table
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    plate_number VARCHAR(20),
    snapshot VARCHAR(255),
    alert_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason VARCHAR(255)
);