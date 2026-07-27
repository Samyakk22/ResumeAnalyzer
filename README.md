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
