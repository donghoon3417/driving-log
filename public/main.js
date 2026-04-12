const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "driving-log-e15fc.firebaseapp.com",
    projectId: "driving-log-e15fc",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ⭐ 전역 상태
let selectedCar = "";
let selectedName = "";
let allData = [];
let filteredData = [];
let editId = null;

let currentPage = 1;
const pageSize = 10;

// 차량 선택
function selectCar(btn, car) {
    document.querySelectorAll("#carSection button")
        .forEach(b => b.classList.remove("active"));

    selectedCar = car;
    btn.classList.add("active");
}

// 이름 선택
function selectName(btn, name) {
    document.querySelectorAll("#nameSection button")
        .forEach(b => b.classList.remove("active"));

    selectedName = name;
    btn.classList.add("active");
}

// 저장 (⭐ 수정/신규 통합)
async function save() {
    const selectedDate = document.getElementById("date").value;
    if (!db) {
        alert("Firebase 아직 로딩 안됨");
        return;
    }

    const data = {
        car: selectedCar,
        name: selectedName,
        date: selectedDate || new Date().toISOString().split("T")[0], // ⭐ 핵심
        start: start.value,
        end: end.value,
        km: km.value,
        note: note.value
    };

    if (!data.car || !data.name || !data.km) {
        alert("필수 입력");
        return;
    }

    const now = new Date();

    // ⭐ 수정 모드
    if (editId) {
        await db.collection("driveLogs").doc(editId).update({
            ...data,
            km: Number(data.km)
        });

        editId = null;
        alert("수정 완료");
    }
    // ⭐ 신규 저장
    else {
        await db.collection("driveLogs").add({
            date: selectedDate || new Date().toISOString().split("T")[0], // ⭐ 핵심,
            timestamp: now,
            ...data,
            km: Number(data.km)
        });

        alert("완료");
    }

    loadList();
    showPage("history");
}

// 목록 불러오기
async function loadList() {

    const snapshot = await db.collection("driveLogs")
        .orderBy("timestamp", "desc")
        .get();

    allData = [];

    snapshot.forEach(doc => {
        allData.push({
            id: doc.id,
            ...doc.data()
        });
    });

    currentPage = 1;
    renderTable();
}

// 테이블 렌더링 (⭐ 관리 열 추가)
function renderTable() {

    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const pageData = allData.slice(startIdx, endIdx);

    // 테이블 HTML
    let htmlTable = `
    <div class="table-wrap">
      <table>
        <tr>
          <th>날짜</th>
          <th>차량</th>
          <th>이름</th>
          <th>km</th>
          <th>관리</th>
        </tr>`;

    pageData.forEach(d => {
        htmlTable += `
        <tr>
          <td>${d.date}</td>
          <td>${d.car}</td>
          <td>${d.name}</td>
          <td>${d.km}</td>
          <td>
            <button onclick="editRow('${d.id}')">수정</button>
            <button onclick="deleteRow('${d.id}')" style="background:#ff4d4f;color:white;">삭제</button>
          </td>
        </tr>`;
    });

    htmlTable += `
      </table>
    </div>`;

    // 페이지 버튼 HTML
    let htmlPagination = `
    <div class="pagination">
      <button onclick="prevPage()">◀</button>
      <span> ${currentPage} / ${Math.ceil(allData.length / pageSize)} </span>
      <button onclick="nextPage()">▶</button>
    </div>`;

    // 최종 출력
    document.getElementById("list").innerHTML = htmlTable + htmlPagination;
}

// 페이지 이동
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

function nextPage() {
    if (currentPage < Math.ceil(allData.length / pageSize)) {
        currentPage++;
        renderTable();
    }
}

// 삭제
async function deleteRow(id) {

    if (!confirm("삭제하시겠습니까?")) return;

    await db.collection("driveLogs").doc(id).delete();

    alert("삭제 완료");
    loadList();
}

// 수정
function editRow(id) {

    const data = allData.find(d => d.id === id);

    selectedCar = data.car;
    selectedName = data.name;

    document.getElementById("date").value = data.date;

    start.value = data.start;
    end.value = data.end;
    km.value = data.km;
    note.value = data.note;

    editId = id;

    showPage("write");
}

// 탭 전환
function showPage(type) {

    document.getElementById("pageWrite").style.display =
        type === "write" ? "block" : "none";

    document.getElementById("pageHistory").style.display =
        type === "history" ? "block" : "none";

    document.getElementById("tabWrite").classList.toggle("active", type === "write");
    document.getElementById("tabHistory").classList.toggle("active", type === "history");

    if (type === "history") {
        loadList();
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("date").value = today;
});