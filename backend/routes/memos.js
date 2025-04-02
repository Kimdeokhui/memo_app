const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");

// multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads"));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// 메모 추가
router.post("/", upload.single("image"), async (req, res) => {
    try {
        const { user_id, content } = req.body;

        if (!user_id || !content) {
            return res.status(400).json({ success: false, message: "user_id와 content는 필수입니다." });
        }

        const image_url = req.file ? `/uploads/${req.file.filename}` : null;

        const [result] = await db.query("INSERT INTO memos (user_id, content, image_url) VALUES (?, ?, ?)", [
            user_id,
            content,
            image_url,
        ]);

        const insertedId = result.insertId;
        const [rows] = await db.query("SELECT * FROM memos WHERE id = ?", [insertedId]);
        res.status(200).json({ success: true, memo: rows[0] });
    } catch (err) {
        console.error("메모 추가 오류:", err);
        res.status(500).json({ success: false, message: "DB 저장 중 오류 발생" });
    }
});

// 메모 수정 (이미지 포함)
router.patch("/:id", upload.single("image"), async (req, res) => {
    const { content } = req.body;
    const id = req.params.id;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const query = image_url
        ? "UPDATE memos SET content=?, image_url=?, updated_at=NOW() WHERE id=?"
        : "UPDATE memos SET content=?, updated_at=NOW() WHERE id=?";
    const params = image_url ? [content, image_url, id] : [content, id];

    try {
        await db.query(query, params);
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("메모 수정 오류:", err);
        res.status(500).json({ success: false });
    }
});

// 메모 하나 불러오기
router.get("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const [rows] = await db.query("SELECT * FROM memos WHERE id=?", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "메모 없음" });
        }
        res.status(200).json({ success: true, memo: rows[0] });
    } catch (err) {
        console.error("메모 조회 오류:", err);
        res.status(500).json({ success: false });
    }
});

// 해당 유저의 메모 불러오기 (삭제되지 않은 것만)
router.get("/", async (req, res) => {
    const { user_id, label_id } = req.query;

    try {
        let query = "SELECT * FROM memos WHERE user_id = ? AND is_deleted = FALSE ORDER BY created_at ASC";
        const params = [user_id];

        // 라벨 필터가 있을 경우
        if (label_id && label_id !== "all") {
            query = `
        SELECT m.* FROM memos m
        JOIN memo_labels ml ON m.id = ml.memo_id
        WHERE m.user_id = ? AND ml.label_id = ? AND m.is_deleted = FALSE
        ORDER BY m.created_at ASC
      `;
            params.push(label_id);
        }

        const [rows] = await db.query(query, params);
        res.status(200).json({ success: true, memos: rows });
    } catch (err) {
        console.error("메모 불러오기 오류:", err);
        res.status(500).json({ success: false });
    }
});

// 메모 삭제
router.delete("/:id", async (req, res) => {
    const memoId = req.params.id;
    try {
        await db.query("UPDATE memos SET is_deleted = TRUE WHERE id=?", [memoId]);
        res.status(200).json({ success: true, message: "휴지통으로 이동됨" });
    } catch (err) {
        console.error("메모 삭제 오류:", err);
        res.status(500).json({ success: false, message: "삭제 실패" });
    }
});

// 특정 메모에 연결된 라벨 조회
router.get("/:id/labels", async (req, res) => {
    const memoId = req.params.id;
    try {
        const [rows] = await db.query("SELECT label_id FROM memo_labels WHERE memo_id = ?", [memoId]);
        const labelIds = rows.map((row) => row.label_id);
        res.json(labelIds);
    } catch (err) {
        console.error("라벨 조회 오류:", err);
        res.status(500).json({ message: "서버 오류" });
    }
});

module.exports = router;
