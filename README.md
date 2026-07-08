# SentryPlate - Automatic Number Plate Recognition (ANPR) System

SentryPlate is a modern, premium, glassmorphic security dashboard that integrates real-time Automatic Number Plate Recognition (ANPR) and vehicle registration. The system is designed to run entirely locally with zero cost ($0 budget).

## Features
- **Web-based Real-time Scanning**: Streams camera frames from any webcam directly in the browser and processes them in the backend.
- **Deep Learning OCR (CNN)**: Uses OpenCV for plate localization and EasyOCR (CNN-based character reader) for extremely high OCR accuracy.
- **Relational Registration System**: Allows registration of vehicle models, owner IDs, snapshots, and plate numbers in a local PostgreSQL database.
- **Security Alert siren dispatch**: Instant visual warnings and audio alerts trigger in the dashboard when an unregistered vehicle license plate is scanned.
- **Historical Scan Log Viewer**: Shows real-time capture times, matching registration details, and saved snapshots in a modal display.
- **Secure Authentication**: Protected dashboard routes utilizing JWT tokens.

---

## Technology Stack
- **Backend**: FastAPI (Python), SQLAlchemy, Uvicorn
- **AI/ML Engine**: EasyOCR (PyTorch CNN), OpenCV
- **Database**: PostgreSQL (relational)
- **Frontend**: HTML5, Vanilla CSS (Glassmorphism), JavaScript (browser Webcam API)

---

## Getting Started

### 1. Prerequisites
- **Python 3.8+** installed.
- **PostgreSQL** installed and running on your local machine.

### 2. Database Configuration
1. Open your PostgreSQL terminal (psql) or pgAdmin.
2. Create a new database named `anpr_db`:
   ```sql
   CREATE DATABASE anpr_db;
   ```
3. Set your database user password during installation.

### 3. Setup Project Configuration
1. Open [backend/.env](file:///C:/Users/imtel%20pro/.gemini/antigravity/scratch/anpr-system/backend/.env).
2. Edit the `DATABASE_URL` variable to insert your PostgreSQL password:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/anpr_db
   ```

### 4. Install Dependencies
Navigate to the `backend/` directory and install the required Python packages:
```bash
pip install -r requirements.txt
```
*Note: The first time you scan, EasyOCR will automatically download its pre-trained CNN model weights (approx. 30MB) to your machine. This happens completely automatically and cost-free.*

### 5. Launch the Backend Server
Run the FastAPI application from the `backend/` directory using uvicorn:
```bash
uvicorn app:app --reload
```
Once started, the backend automatically:
- Creates the necessary tables (`users`, `vehicles`, `scans`) in your PostgreSQL database.
- Seeds a default user: Username: `admin` | Password: `admin`.

### 6. Access the Dashboard
Open your web browser and navigate to:
```text
http://localhost:8000
```
Login using the default credentials:
- **Username**: `admin`
- **Password**: `admin`

---

## Project Structure
```text
anpr-system/
│
├── backend/
│   ├── app.py              # Main server entry & autoseeding
│   ├── database.py         # SQLAlchemy connection setup
│   ├── config.py           # Configuration loading
│   ├── models.py           # DB models (User, Vehicle, Scan)
│   ├── auth.py             # JWT & Password utility functions
│   │
│   ├── routes/             # FastAPI routers
│   │   ├── auth.py         # Login & Register endpoints
│   │   ├── vehicles.py     # Vehicle database endpoints
│   │   ├── detection.py    # Plate scanning API
│   │   └── alerts.py       # Alerts & logs retrieval
│   │
│   ├── ai/                 # OpenCV & EasyOCR modules
│   │   ├── detector.py     # Contour localization
│   │   ├── ocr.py          # EasyOCR text reader
│   │   └── camera.py       # Base64 decoder/image writer
│   │
│   ├── uploads/            # Snapshots directories (auto-created)
│   │   ├── vehicles/
│   │   ├── detections/
│   │   └── unknown/
│   │
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── index.html          # Dashboard HTML
│   ├── style.css           # Glassmorphism CSS theme
│   ├── api.js              # Auth-aware API client
│   └── app.js              # UI controller
│
└── database/
    └── create_tables.sql   # SQL DB schema documentation
```
