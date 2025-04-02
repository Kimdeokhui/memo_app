// DOM 로드 후 유저 메모 불러오기
document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
        alert("로그인이 필요합니다.");
        return (window.location.href = "login.html");
    }

    fetch(`http://localhost:4000/api/memos?user_id=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                const container = document.getElementById("memoContainer");

                container.innerHTML = `<div class="memo-card dummy" style="display: none;"></div>`;

                data.memos.forEach((memo) => {
                    const div = document.createElement("div");
                    div.className = "memo-card";
                    div.dataset.id = memo.id;

                    div.innerHTML = `
                        <p>${memo.content}</p>
                        <button class="delete-btn">🗑</button>
                    `;
                    container.appendChild(div);
                });
            } else {
                alert("메모를 불러올 수 없습니다.");
            }
        });
});

// 새 메모 추가 버튼 클릭
document.getElementById("addMemoBtn").addEventListener("click", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
        alert("로그인 후 사용 가능합니다!");
        return (window.location.href = "login.html");
    }

    fetch("http://localhost:4000/api/memos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user_id: user.id,
            content: "",
        }),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                const memo = data.memo;
                const container = document.getElementById("memoContainer");

                const div = document.createElement("div");
                div.className = "memo-card";
                div.dataset.id = memo.id;
                div.innerHTML = `
                    <p>${memo.content}</p>
                    <button class="delete-btn">🗑</button>
                `;
                container.appendChild(div);
            } else {
                alert("메모 추가 실패");
            }
        });
});

// 유저 버튼 클릭 시 로그인 여부 확인
document.getElementById("userBtn").addEventListener("click", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id) {
        window.location.href = "register.html";
    } else {
        window.location.href = "login.html";
    }
});

// 메모 삭제 버튼
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("delete-btn")) {
        const memoCard = e.target.closest(".memo-card");
        const memoId = memoCard.dataset.id;

        fetch(`http://localhost:4000/api/memos/${memoId}`, {
            method: "DELETE",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    alert("삭제되었습니다");
                    memoCard.remove();
                } else {
                    alert("삭제 실패: " + data.message);
                }
            })
            .catch((err) => {
                alert("요청 실패: " + err.message);
            });
    }
});

// 메모 클릭 시 open.html로 이동
document.addEventListener("click", function (e) {
    const card = e.target.closest(".memo-card");
    if (card && !e.target.classList.contains("delete-btn") && !card.classList.contains("dummy")) {
        const id = card.dataset.id;
        window.location.href = `open.html?id=${id}`;
    }
});

// 메모 검색 기능
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", function () {
    const keyword = this.value.toLowerCase();
    const cards = document.querySelectorAll(".memo-card:not(.dummy)");

    cards.forEach((card) => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(keyword) ? "block" : "none";
    });
});

// 휴지통 페이지 이동
document.getElementById("trashBtn").addEventListener("click", () => {
    window.location.href = "./trash.html";
});
