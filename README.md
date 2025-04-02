# 📝 Memo App

> 이미지와 텍스트 메모를 저장하고 관리할 수 있는 웹 애플리케이션

## 📌 주요 기능

- 회원가입 / 로그인
- 메모 생성, 수정, 삭제
- 이미지 첨부 기능 (uploads 폴더에 저장)
- 라벨(Label) 분류 기능
- 휴지통 기능 (삭제된 메모 복구)
- 사용자별 메모 관리

## 💻 사용 기술

### Frontend
- HTML, CSS, JavaScript

### Backend
- Node.js + Express
- MySQL + mysql2

## 📁 폴더 구조

```bash
memo_app/
├── backend/
│   ├── routes/         # API 라우터 (auth, label, memos 등)
│   ├── uploads/        # 이미지 업로드 폴더
│   ├── index.js        # 서버 진입점
│   └── db.js           # DB 연결
├── frontend/           # 프론트엔드 UI 파일
├── .env                # 환경변수 설정
├── package.json
└── README.md
```

## ⚙️ 실행 방법

1. 프로젝트 클론
```bash
git clone https://github.com/kimdeokhui/memo_app.git
cd memo_app
```
2. 패키지 설치
```bash
npm install
```
3. .env 파일 생성 및 설정
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=memo_app
PORT=3000
```
4. 서버 실행
```bash
node backend/index.js
```
5. 브라우저 접속
```bash
http://localhost:3000
```
