const express = require("express");
const router = express.Router();
const db = require("../db");

// 로그인
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const query = `SELECT * FROM users WHERE username = ? AND password = ?`;

    try {
        const [results] = await db.query(query, [username, password]);

        if (results.length > 0) {
            const user = results[0];
            res.status(200).json({
                success: true,
                message: "로그인 성공",
                user: {
                    id: user.id,
                    nickname: user.nickname,
                },
            });
        } else {
            res.status(401).json({ success: false, message: "아이디 또는 비밀번호 오류" });
        }
    } catch (err) {
        console.error("로그인 오류:", err);
        res.status(500).json({ success: false, message: "로그인 실패" });
    }
});

// 회원가입
router.post("/signup", async (req, res) => {
    const { username, password, nickname } = req.body;

    const query = `INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)`;

    try {
        await db.query(query, [username, password, nickname]);
        res.status(200).json({ success: true, message: "회원가입 성공" });
    } catch (err) {
        console.error("회원가입 실패:", err);
        res.status(500).json({ success: false, message: "회원가입 실패" });
    }
});

// 닉네임 수정
router.put("/update-nickname", async (req, res) => {
    const { id, nickname } = req.body;
    const query = `UPDATE users SET nickname = ? WHERE id = ?`;

    try {
        await db.query(query, [nickname, id]);
        res.status(200).json({ success: true, message: "닉네임 수정 완료" });
    } catch (err) {
        console.error("닉네임 수정 실패:", err);
        res.status(500).json({ success: false, message: "닉네임 수정 실패" });
    }
});

module.exports = router;
