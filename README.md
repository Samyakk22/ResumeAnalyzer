# ResumeIQ — ATS Resume Analyzer

A full-stack MERN application that analyzes resumes against job descriptions and provides detailed ATS compatibility scores, keyword analysis, and actionable recommendations.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| File Upload | Multer |
| PDF Parsing | pdf-parse + mammoth |
| PDF Reports | pdfkit |
| Charts | Recharts |

## 📁 Project Structure

```
ResumeIQ/
├── client/          # React frontend (Vite)
└── server/          # Express backend
```

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local) or MongoDB Atlas URI

### 1. Configure Environment

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/resumeiq
JWT_SECRET=your_secret_here
```

### 2. Start Backend

```bash
cd server
npm install
npm run dev
```

Backend runs at: http://localhost:5000

### 3. Start Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

## 🔐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| POST | /api/analyses | Analyze resume (multipart/form-data) |
| GET | /api/analyses | Get all analyses |
| GET | /api/analyses/:id | Get single analysis |
| GET | /api/reports | Get all reports |
| GET | /api/reports/:id/download | Download PDF report |
| GET | /api/versions | Get resume versions |
| PUT | /api/users/profile | Update profile |
| PUT | /api/users/password | Change password |

## 🏗️ Future Deployment

Structured for Docker + Nginx + AWS EC2 + CI/CD:
- Replace `server/uploads/` with AWS S3
- Use MongoDB Atlas connection string
- Add Nginx reverse proxy config
- Add Dockerfile for both client and server

## 📊 ATS Score Calculation

| Metric | Weight |
|--------|--------|
| Keyword Match | 40% |
| Format Quality | 20% |
| Readability | 20% |
| Experience Match | 20% |

| Score Range | Status |
|-------------|--------|
| 90–100 | Excellent |
| 75–89 | Good |
| 60–74 | Average |
| Below 60 | Needs Improvement |
