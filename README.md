# 🩺 TB Detection System - DenseNet121 Based Deep Learning

## 📌 Deskripsi Proyek

Sistem deteksi tuberkulosis otomatis menggunakan citra X-Ray dada berbasis deep learning dengan arsitektur **DenseNet-121**. Proyek ini merupakan implementasi skripsi dengan judul:

**"Deteksi Otomatis Tuberkulosis pada Citra X-Ray Dada Menggunakan DenseNet121 Berbasis Deep Learning"**

Sistem ini menyediakan platform web yang memungkinkan pengguna mengunggah citra X-Ray dan mendapatkan prediksi tuberkulosis secara real-time dengan confidence score dan visualisasi hasil.

---

## ✨ Fitur Utama

### 🤖 **Model Deep Learning**

- **Arsitektur**: DenseNet-121 yang dimodifikasi untuk klasifikasi biner (TB/Normal)
- **Input**: Citra X-Ray grayscale (single channel)
- **Output**: Prediksi dengan confidence score dan probabilitas
- **Format Model**: ONNX untuk optimasi inferensi

### 🌐 **Sistem Web**

- **Frontend**: Next.js dengan TypeScript, Tailwind CSS, dan Shadcn/UI
- **Backend**: FastAPI dengan Python
- **Database**: PostgreSQL dengan Alembic migration
- **Authentication**: JWT-based authentication system

### 👥 **Role-Based Dashboard**

- **Patient Dashboard**:
  - Upload citra X-Ray untuk deteksi
  - Lihat riwayat hasil deteksi
  - Download laporan hasil
- **Doctor Dashboard**:
  - Review hasil deteksi pasien
  - Manajemen data pasien
  - Analisis statistik deteksi

### 📊 **Fitur Tambahan**

- History hasil deteksi
- Confidence score dan visualisasi
- Export hasil dalam format csv

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Frontend      │◄──►│    Backend      │◄──►│   PostgreSQL    │
│   (Next.js)     │    │   (FastAPI)     │    │   Database      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │                 │
                       │   ML Model      │
                       │ (DenseNet-121)  │
                       │   ONNX Format   │
                       │                 │
                       └─────────────────┘
```

---

## � Struktur Proyek

```
NEW-tbc-detection-skripsi/
├── 📁 backend/                 # FastAPI Backend
│   ├── 📁 src/
│   │   ├── 📁 accounts/        # User authentication & management
│   │   ├── 📁 patients/        # Patient data management
│   │   ├── 📁 ml_model/        # ML model integration
│   │   │   ├── predict.py      # Prediction logic
│   │   │   └── tuberModel.onnx # Trained ONNX model
│   │   ├── main.py             # FastAPI application
│   │   ├── api_router.py       # API route definitions
│   │   ├── database.py         # Database configuration
│   │   └── config.py           # App configuration
│   ├── 📁 alembic/             # Database migrations
│   ├── requirements.txt        # Python dependencies
│   └── README.md
├── 📁 frontend/                # Next.js Frontend
│   ├── 📁 src/
│   │   ├── 📁 app/             # Next.js app router
│   │   │   ├── 📁 admin/       # Admin dashboard
│   │   │   ├── 📁 user/        # User dashboard
│   │   │   ├── 📁 login/       # Authentication pages
│   │   │   └── 📁 try-now/     # Prediction interface
│   │   ├── 📁 components/      # Reusable UI components
│   │   └── 📁 lib/             # Utility functions
│   ├── package.json            # Node.js dependencies
│   └── README.md
├── 📁 models/                  # Trained models
│   └── tuberModel.onnx
├── tbc_detection_skripsi_netebook.ipynb  # Research notebook
└── README.md                   # Project documentation
```

---

## � Instalasi dan Setup

### Prerequisites

Pastikan sistem Anda telah terinstall:

- **Python 3.8+**
- **Node.js 18+** dan **npm/yarn**
- **PostgreSQL 12+**
- **Git**

### 1. Clone Repository

```bash
git clone https://github.com/covryzne/tbc-detection-skripsi.git
cd NEW-tbc-detection-skripsi
```

### 2. Setup Database (PostgreSQL)

#### Windows (menggunakan PostgreSQL installer):

1. Download dan install PostgreSQL dari [postgresql.org](https://www.postgresql.org/download/windows/)
2. Buat database baru:

```sql
-- Login ke PostgreSQL sebagai superuser
psql -U postgres

-- Buat database
CREATE DATABASE tb_detection_db;

-- Buat user (opsional)
CREATE USER tb_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE tb_detection_db TO tb_user;
```

### 3. Setup Backend (FastAPI)

```bash
# Masuk ke direktori backend
cd backend

# Buat virtual environment
python -m venv venv

# Aktivasi virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Buat file .env untuk konfigurasi database
echo 'DATABASE_URL=postgresql://postgres:your_password@localhost:5432/tb_detection_db' > .env

# Jalankan migrasi database
alembic upgrade head

# Jalankan server development
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend akan berjalan di**: `http://localhost:8000`

### 4. Setup Frontend (Next.js)

```bash
# Buka terminal baru, masuk ke direktori frontend
cd frontend

# Install dependencies
npm install
# atau menggunakan yarn:
yarn install

# Jalankan development server
npm run dev
# atau:
yarn dev
```

**Frontend akan berjalan di**: `http://localhost:3000`

---

## 🔧 Konfigurasi Environment

### Backend Environment Variables (.env)

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/tb_detection_db

# JWT Configuration (opsional, akan menggunakan default jika tidak diset)
JWT_SECRET_KEY=your-super-secret-jwt-key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Configuration (opsional)
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Frontend Environment Variables (.env.local)

```env
# API Base URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Other configurations (jika diperlukan)
NEXT_PUBLIC_APP_NAME=TB Detection System
```

---

## 🎯 Cara Menggunakan Sistem

### 1. **Akses Aplikasi**

- Buka browser dan kunjungi `http://localhost:3000`
- Sistem akan menampilkan halaman landing page

### 2. **Registrasi/Login**

- Klik tombol "Login" atau "Register"
- Daftar sebagai Patient atau Doctor
- Login menggunakan credentials yang telah dibuat

### 3. **Upload dan Prediksi X-Ray**

- Setelah login, akses menu "Try Now" atau "Detection"
- Upload file citra X-Ray (format: JPG, PNG, JPEG)
- Klik "Predict" untuk mendapatkan hasil
- Sistem akan menampilkan:
  - Prediksi: TB atau Normal
  - Confidence score (0-1)
  - Probability percentages
  - Visualization (jika tersedia)

### 4. **Dashboard Features**

- **Patient**: Lihat riwayat deteksi, download hasil
- **Doctor**: Review hasil pasien, manajemen data

---

## 📚 API Documentation

Backend menyediakan API endpoints yang dapat diakses di:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Key Endpoints:

```
POST /api/v1/predict              # Upload X-Ray untuk prediksi
POST /api/v1/accounts/register    # Registrasi user baru
POST /api/v1/accounts/login       # Login user
GET  /api/v1/patients/            # Get patient data
POST /api/v1/patients/            # Create patient record
```

---

## 🧪 Testing

### Backend Testing

```bash
cd backend
python -m pytest tests/ -v
```

### Frontend Testing

```bash
cd frontend
npm run test
# atau
yarn test
```

---

## 🚀 Production Deployment

### 1. Backend Deployment

```bash
# Build production
pip install gunicorn
gunicorn src.main:app -w 4 -k uvicorn.workers.UvicornWorker

# Atau menggunakan Docker (jika tersedia Dockerfile)
docker build -t tb-detection-backend .
docker run -p 8000:8000 tb-detection-backend
```

### 2. Frontend Deployment

```bash
# Build untuk production
npm run build
npm start

# Deploy ke Vercel/Netlify
npm install -g vercel
vercel --prod
```

---

## 📊 Model Performance

Model DenseNet-121 yang digunakan memiliki performa:

- **Accuracy**: 97%
- **AUC-ROC**: 0.96
- **Precision**: 94-99%
- **Recall**: 94-99%
- **F1-Score**: 94-99%

---

## 🛠️ Troubleshooting

### Common Issues:

1. **Database Connection Error**

   ```bash
   # Pastikan PostgreSQL running
   # Windows:
   net start postgresql-x64-12

   # Periksa connection string di .env
   ```

2. **CORS Error pada Frontend**

   ```bash
   # Pastikan backend running di port 8000
   # Periksa ALLOWED_ORIGINS di backend config
   ```

3. **Model Loading Error**

   ```bash
   # Pastikan file tuberModel.onnx ada di backend/src/ml_model/
   # Install onnxruntime: pip install onnxruntime
   ```

4. **Frontend Build Error**
   ```bash
   # Clear cache dan reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

---

## 👥 Tim Pengembang

- **Peneliti**: Shendi Teuku Maulana Efendi
- **Pembimbing**: Puguh Jayadi, S.Kom., M.Kom.
- **Institusi**: Universitas PGRI Madiun

---

## � Lisensi

Proyek ini dibuat untuk keperluan akademis (skripsi). Silakan hubungi pengembang untuk penggunaan lebih lanjut.

---

## 🙏 Acknowledgments

- Dataset: [![Indonesia TB Report](https://img.shields.io/badge/Kaggle-20BEFF?style=for-the-badge&logo=Kaggle&logoColor=white)](https://www.kaggle.com/datasets/tawsifurrahman/tuberculosis-tb-chest-xray-dataset) dan [![Mendeley Data](https://img.shields.io/badge/Mendeley-FF4C4C?style=for-the-badge&logo=Mendeley&logoColor=white)](https://data.mendeley.com/datasets/8j2g3csprk/2)
- DenseNet-121 Architecture: Densely Connected Convolutional Networks (Huang et al.)
- Framework: FastAPI, Next.js, PostgreSQL

---

**⚡ Quick Start Commands:**

```bash
# Terminal 1 - Backend
cd backend && python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt && alembic upgrade head
uvicorn src.main:app --reload

# Terminal 2 - Frontend
cd frontend && npm install && npm run dev
```

**🌐 Access URLs:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 📜 Lisensi

Proyek ini dibuat untuk keperluan akademik dan masih dalam tahap pengembangan.
