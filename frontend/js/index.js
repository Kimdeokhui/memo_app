const user = JSON.parse(localStorage.getItem("user"));
if (!user || !user.id) {
    alert("로그인이 필요합니다.");
    window.location.href = "login.html";
}

const container = document.getElementById("memoContainer");
const labelList = document.getElementById("filterLabelList");
let currentFilterLabelId = "all";

// 메모 불러오기
function loadMemos() {
    let url = `/api/memos?user_id=${user.id}`;
    if (currentFilterLabelId !== "all") {
        url += `&label_id=${currentFilterLabelId}`;
    }

    fetch(url)
        .then((res) => res.json())
        .then((data) => {
            container.innerHTML = `<div class="memo-card dummy" style="display: none;"></div>`;
            const memos = data.memos || data; // API 케이스별 대응
            memos.forEach((memo) => {
                const div = document.createElement("div");
                div.className = "memo-card";
                div.dataset.id = memo.id;
                div.innerHTML = `<p>${memo.content}</p><button class="delete-btn">🗑</button>`;
                container.appendChild(div);
            });
        })
        .catch((err) => {
            console.error("메모 로딩 오류:", err);
        });
}

// 라벨 필터 목록 불러오기
function loadFilterLabels() {
    fetch(`/api/label/list?user_id=${user.id}`)
        .then((res) => res.json())
        .then((labels) => {
            labels.forEach((label) => {
                const li = document.createElement("li");
                li.innerHTML = `<button data-id="${label.id}" class="filter-btn">${label.name}</button>`;
                labelList.appendChild(li);
            });
        });
}

// 라벨 필터 버튼 클릭
document.querySelector(".label-filter").addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
        currentFilterLabelId = e.target.dataset.id;
        document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"));
        e.target.classList.add("active");
        loadMemos();
    }
});

// 메모 클릭 → open.html 이동
document.addEventListener("click", (e) => {
    const card = e.target.closest(".memo-card");
    if (card && !e.target.classList.contains("delete-btn")) {
        const id = card.dataset.id;
        if (id) window.location.href = `open.html?id=${id}`;
    }
});

// 메모 삭제
container.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
        const card = e.target.closest(".memo-card");
        const memoId = card.dataset.id;
        if (confirm("메모를 삭제하시겠습니까?")) {
            fetch(`/api/memos/${memoId}`, {
                method: "DELETE",
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.success) {
                        fetch("/api/trash", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ memo_id: memoId, user_id: user.id }),
                        });
                        card.remove();
                    } else {
                        alert("삭제 실패");
                    }
                });
        }
    }
});

// 사이드바 토글
const toggleSidebar = () => {
    document.getElementById("sidebar").classList.toggle("active");
};
document.getElementById("menuBtn").onclick = toggleSidebar;
document.getElementById("menuBtnInside").onclick = toggleSidebar;

// 상단바 버튼 동작
document.getElementById("addMemoBtn").addEventListener("click", () => {
    window.location.href = "open.html";
});
document.getElementById("trashBtn").addEventListener("click", () => {
    window.location.href = "trash.html";
});
document.getElementById("userBtn").addEventListener("click", () => {
    window.location.href = "register.html";
});

// 검색 필터
document.getElementById("searchInput").addEventListener("input", (e) => {
    const keyword = e.target.value.toLowerCase();
    const cards = document.querySelectorAll(".memo-card");
    cards.forEach((card) => {
        if (card.classList.contains("dummy")) return;

        const content = card.textContent.toLowerCase();
        card.style.display = content.includes(keyword) ? "" : "none";
    });
});

// 초기 로딩
loadFilterLabels();
loadMemos();
