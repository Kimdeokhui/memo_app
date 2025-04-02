document.addEventListener("DOMContentLoaded", () => {
    // ✅ 사용자 정보 확인
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;

    if (!userId) {
        alert("로그인이 필요합니다.");
        window.location.href = "login.html";
        return;
    }

    window.userId = userId;

    // ✅ DOM 요소 캐싱
    const labelForm = document.getElementById("labelForm");
    const labelNameInput = document.getElementById("labelName");
    const labelList = document.getElementById("labelList");
    const API_URL = "/api/label";

    // ✅ 공통 API 호출 함수
    async function apiCall(url, options = {}) {
        try {
            const res = await fetch(url, options);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "API 오류");
            return data;
        } catch (err) {
            console.error("API 호출 실패:", err.message);
            alert(err.message);
            throw err;
        }
    }

    // ✅ 라벨 DOM 생성 (삭제 버튼 오른쪽 정렬)
    function createLabelElement(label) {
        const li = document.createElement("li");
        li.className = "label-item";
        li.dataset.id = label.id;

        const nameSpan = document.createElement("span");
        nameSpan.textContent = label.name;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "×";
        deleteBtn.dataset.id = label.id;

        li.appendChild(nameSpan);
        li.appendChild(deleteBtn);

        return li;
    }

    // ✅ 라벨 목록 렌더링
    function renderLabelList(labels) {
        labelList.innerHTML = "";
        labels.forEach((label) => {
            const labelEl = createLabelElement(label);
            labelList.appendChild(labelEl);
        });
    }

    // ✅ 라벨 목록 불러오기
    async function loadLabels() {
        try {
            const labels = await apiCall(`${API_URL}/list?user_id=${userId}`);
            renderLabelList(labels);
        } catch (err) {
            console.warn("라벨 목록 로딩 실패");
        }
    }

    // ✅ 라벨 추가
    labelForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = labelNameInput.value.trim();
        if (!name) return;

        try {
            await apiCall(`${API_URL}/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, name }),
            });
            labelNameInput.value = "";
            loadLabels();
        } catch (err) {
            console.warn("라벨 생성 실패");
        }
    });

    // ✅ 라벨 삭제 (이벤트 위임)
    labelList.addEventListener("click", async (e) => {
        if (!e.target.classList.contains("delete-btn")) return;

        const labelId = e.target.dataset.id;
        if (!confirm("이 라벨을 삭제하시겠습니까?")) return;

        try {
            await apiCall(`${API_URL}/delete/${labelId}`, { method: "DELETE" });
            loadLabels();
        } catch (err) {
            console.warn("라벨 삭제 실패");
        }
    });

    // ✅ (선택사항) 라벨 순서 저장
    async function saveLabelOrder() {
        const labelIds = Array.from(labelList.children).map((el) => parseInt(el.dataset.id));
        try {
            await apiCall(`${API_URL}/reorder`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, label_ids: labelIds }),
            });
            console.log("라벨 순서 저장 완료");
        } catch (err) {
            console.warn("라벨 순서 저장 실패");
        }
    }

    // ✅ 초기 로딩
    loadLabels();
});
