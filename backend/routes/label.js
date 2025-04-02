const express = require("express");
const router = express.Router();
const db = require("../db");

// 라벨 생성
router.post("/add", async (req, res) => {
    const { user_id, name } = req.body;
    try {
        const [existing] = await db.query("SELECT * FROM labels WHERE user_id = ? AND name = ?", [user_id, name]);

        if (existing.length > 0) {
            return res.status(400).json({ message: "같은 이름의 라벨이 이미 존재합니다." });
        }

        // 현재 max sort_order 가져오기
        const [max] = await db.query("SELECT COALESCE(MAX(sort_order), 0) as maxOrder FROM labels WHERE user_id = ?", [
            user_id,
        ]);
        const nextOrder = max[0].maxOrder + 1;

        await db.query("INSERT INTO labels (user_id, name, sort_order) VALUES (?, ?, ?)", [user_id, name, nextOrder]);

        res.status(201).json({ message: "라벨이 생성되었습니다." });
    } catch (err) {
        console.error("라벨 생성 오류:", err);
        res.status(500).json({ message: "서버 오류" });
    }
});

// 라벨 전체 조회
router.get("/list", async (req, res) => {
    const { user_id } = req.query;
    try {
        const [labels] = await db.query("SELECT * FROM labels WHERE user_id = ? ORDER BY sort_order ASC", [user_id]);
        res.json(labels);
    } catch (err) {
        console.error("라벨 조회 오류:", err);
        res.status(500).json({ message: "서버 오류" });
    }
});

// 라벨 순서 저장
router.post("/reorder", async (req, res) => {
    const { user_id, label_ids } = req.body;
    if (!Array.isArray(label_ids)) {
        return res.status(400).json({ message: "label_ids는 배열이어야 합니다." });
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        for (let i = 0; i < label_ids.length; i++) {
            const id = label_ids[i];
            await conn.query("UPDATE labels SET sort_order = ? WHERE id = ? AND user_id = ?", [i, id, user_id]);
        }
        await conn.commit();
        res.json({ success: true, message: "순서 저장 완료" });
    } catch (err) {
        await conn.rollback();
        console.error("순서 저장 오류:", err);
        res.status(500).json({ message: "서버 오류" });
    } finally {
        conn.release();
    }
});

// 라벨 삭제
router.delete("/delete/:id", async (req, res) => {
    const labelId = req.params.id;
    try {
        await db.query("DELETE FROM labels WHERE id = ?", [labelId]);
        res.json({ message: "라벨이 삭제되었습니다." });
    } catch (err) {
        console.error("라벨 삭제 오류:", err);
        res.status(500).json({ message: "서버 오류" });
    }
});

// 메모에 라벨 연결
router.post("/assign", async (req, res) => {
    const { memo_id, label_id } = req.body;
    try {
        await db.query("INSERT IGNORE INTO memo_labels (memo_id, label_id) VALUES (?, ?)", [memo_id, label_id]);
        res.json({ message: "메모에 라벨이 연결되었습니다." });
    } catch (err) {
        console.error("라벨 연결 오류:", err);
        res.status(500).json({ message: "서버 오류" });
    }
});

// 메모에서 라벨 제거
router.post("/unassign", async (req, res) => {
    const { memo_id, label_id } = req.body;
    try {
        await db.query("DELETE FROM memo_labels WHERE memo_id = ? AND label_id = ?", [memo_id, label_id]);
        res.json({ message: "메모에서 라벨이 제거되었습니다." });
    } catch (err) {
        console.error("라벨 제거 오류:", err);
        res.status(500).json({ message: "서버 오류" });
    }
});

module.exports = router;
