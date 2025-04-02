// 사용자 정보와 메모 ID 파악
const user = JSON.parse(localStorage.getItem("user"));
const userId = user?.id;
const memoId = getMemoIdFromURL();

const contentBox = document.getElementById("memoContent");
const preview = document.getElementById("previewImage");
const imageInput = document.getElementById("imageInput");
const labelListEl = document.getElementById("labelList");

// memoId 파싱 함수
function getMemoIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    return id && id !== "null" && id !== "undefined" ? id : null;
}

// 기존 메모 불러오기 (수정 모드일 경우)
async function loadMemoIfEditing() {
    if (!memoId) return;
    try {
        const res = await fetch(`/api/memos/${memoId}`);
        const data = await res.json();
        if (data.success) {
            contentBox.value = data.memo.content;
            if (data.memo.image_url) {
                preview.src = data.memo.image_url;
                preview.style.display = "block";
            }
        } else {
            alert("메모를 불러올 수 없습니다.");
        }
    } catch (err) {
        alert("메모 불러오기 오류: " + err.message);
    }
}

// 라벨 목록 불러오기 (수정 또는 신규 모두)
async function loadLabelsForMemo() {
    labelListEl.innerHTML = "";

    try {
        const res = await fetch(`/api/label/list?user_id=${userId}`);
        const allLabels = await res.json();
        let assignedLabels = [];

        if (memoId) {
            const assignedLabelsRes = await fetch(`/api/memos/${memoId}/labels`);
            assignedLabels = await assignedLabelsRes.json();
        }

        allLabels.forEach((label) => {
            const div = document.createElement("div");
            div.className = "label-item";
            const isChecked = memoId && assignedLabels.includes(label.id);
            div.innerHTML = `
                <input type="checkbox" class="label-checkbox" data-id="${label.id}" 
                    ${isChecked ? "checked" : ""}>
                <span>${label.name}</span>
            `;
            labelListEl.appendChild(div);
        });
    } catch (err) {
        console.error("라벨 로딩 오류:", err);
    }
}

// 이미지 미리보기
imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
});

// 메모 저장 (신규 or 수정)
document.getElementById("saveBtn").addEventListener("click", async () => {
    const content = contentBox.value.trim();
    if (!content) {
        alert("내용을 입력해주세요.");
        return;
    }

    const formData = new FormData();
    formData.append("content", content);
    if (imageInput.files[0]) {
        formData.append("image", imageInput.files[0]);
    }

    let url, method;
    if (memoId) {
        url = `/api/memos/${memoId}`;
        method = "PATCH";
    } else {
        if (!userId) {
            alert("로그인이 필요합니다.");
            location.href = "login.html";
            return;
        }
        formData.append("user_id", userId);
        url = "/api/memos";
        method = "POST";
    }

    try {
        const res = await fetch(url, { method, body: formData });
        const data = await res.json();

        if (data.success) {
            const newMemoId = memoId || data.memo.id;

            // 신규 메모일 경우: 체크된 라벨 연결
            if (!memoId) {
                const checkedLabels = Array.from(document.querySelectorAll(".label-checkbox:checked"));
                for (const checkbox of checkedLabels) {
                    const labelId = checkbox.dataset.id;
                    await fetch(`/api/label/assign`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ memo_id: newMemoId, label_id: labelId }),
                    });
                }
            }

            alert("저장 되었습니다.");
            location.href = "index.html";
        } else {
            alert("저장 실패: " + (data.message || "알 수 없는 오류"));
        }
    } catch (err) {
        alert("요청 실패: " + err.message);
    }
});

// 라벨 연결/해제 처리 (수정 모드일 경우만)
labelListEl.addEventListener("change", async (e) => {
    if (!memoId) return;
    if (e.target.classList.contains("label-checkbox")) {
        const labelId = e.target.dataset.id;
        const isChecked = e.target.checked;
        try {
            await fetch(`/api/label/${isChecked ? "assign" : "unassign"}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ memo_id: memoId, label_id: labelId }),
            });
        } catch (err) {
            console.error("라벨 연결 실패", err);
        }
    }
});

// 초기 실행
loadMemoIfEditing();
loadLabelsForMemo();
