const express = require("express");
const router = express.Router();
const db = require("../db");

// [1] 삭제된 메모 목록 불러오기
router.get("/", async (req, res) => {
    console.log("[GET] /api/trash");

    const userId = req.query.user_id;
    if (!userId) {
        return res.status(400).json({ success: false, message: "user_id is required" });
    }

    const query = `SELECT * FROM memos WHERE is_deleted = TRUE AND user_id = ? ORDER BY created_at DESC`;

    try {
        const [results] = await db.query(query, [userId]);
        res.status(200).json({ success: true, memos: results });
    } catch (err) {
        console.error("휴지통 불러오기 오류:", err);
        res.status(500).json({ success: false });
    }
});

// [2] 전체 삭제 (휴지통 비우기)
router.delete("/", async (req, res) => {
    console.log("[DELETE] /api/trash");

    const userId = req.query.user_id;
    if (!userId) {
        return res.status(400).json({ success: false, message: "user_id is required" });
    }

    const query = `DELETE FROM memos WHERE is_deleted = TRUE AND user_id = ?`;

    try {
        await db.query(query, [userId]);
        res.status(200).json({ success: true, message: "휴지통 비움 완료" });
    } catch (err) {
        console.error("휴지통 비우기 실패:", err);
        res.status(500).json({ success: false, message: "삭제 실패" });
    }
});

// [3] 특정 메모 복원
router.post("/restore/:id", async (req, res) => {
    const memoId = req.params.id;
    const userId = req.query.user_id;

    console.log(`[RESTORE] 복원 시도 memo_id=${memoId}, user_id=${userId}`);

    if (!userId) {
        return res.status(400).json({ success: false, message: "user_id is required" });
    }

    try {
        const [result] = await db.query("UPDATE memos SET is_deleted = FALSE WHERE id = ? AND user_id = ?", [
            memoId,
            userId,
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "존재하지 않거나 권한이 없는 메모입니다.",
            });
        }

        res.json({ success: true, message: "복원되었습니다." });
    } catch (err) {
        console.error("복원 오류:", err);
        res.status(500).json({ success: false, message: "서버 오류" });
    }
});

module.exports = router;
