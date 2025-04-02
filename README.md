# 📝 Memo App

> A web application for saving and managing image and text memos

## 📌 Key Features

- User registration and login
- Create, edit, and delete memos
- Image attachment support (stored in the uploads folder)
- Labeling system for memo categorization
- Trash feature for recovering deleted memos
- User-specific memo management

## 💻 Tech Stack

### Frontend
- HTML, CSS, JavaScript

### Backend
- Node.js + Express
- MySQL + mysql2

## 📁 폴더 구조

```bash
memo_app/
├── backend/
│   ├── routes/         # API routes (auth, label, memos, etc.)
│   ├── uploads/        # Image upload folder
│   ├── index.js        # Server entry point
│   └── db.js           # Database connection
├── frontend/           # Frontend UI files
├── .env                # Environment variable settings
├── package.json
└── README.md
```

## ⚙️ How to Run

1. Clone the repository
```bash
git clone https://github.com/kimdeokhui/memo_app.git
cd memo_app
```
2. Install dependencies
```bash
npm install
```
3. Create a .env file and set your database environment variables
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=memo_app
PORT=3000
```
4. Start the server```bash
node backend/index.js
```
5. Open your browser and go to
```bash
http://localhost:3000
```
