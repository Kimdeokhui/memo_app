const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 정적 파일 경로 설정
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 라우트 연결
app.use("/api/auth", require("./routes/auth"));
app.use("/api/memos", require("./routes/memos"));
app.use("/api/trash", require("./routes/trash"));
app.use("/api/label", require("./routes/label"));

// 존재하지 않는 API 처리
app.use("/api", (req, res) => {
    res.status(404).json({ success: false, message: "존재하지 않는 API 경로입니다." });
});

// 서버 실행
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
});
