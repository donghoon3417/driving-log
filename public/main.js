const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "driving-log-e15fc.firebaseapp.com",
    projectId: "driving-log-e15fc",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let selectedCar = "";
let selectedName = "";
let allData = [];
let filteredData = [];
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

// 저장
async function save() {

    if (!db) {
        alert("Firebase 아직 로딩 안됨");
        return;
    }

    const data = {
        car: selectedCar,
        name: selectedName,
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

    await db.collection("driveLogs").add({
        date: now.toISOString().split("T")[0],
        timestamp: now,
        ...data,
        km: Number(data.km)
    });

    alert("완료");
    loadList();
}

// 목록 불러오기
async function loadList() {

    const snapshot = await db.collection("driveLogs")
        .orderBy("timestamp", "desc")
        .get();

    allData = [];

    snapshot.forEach(doc => {
        allData.push(doc.data());
    });

    currentPage = 1;
    renderTable();
}

// 테이블 렌더링
function renderTable() {

    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const pageData = allData.slice(startIdx, endIdx);

    let html = `
    <table>
      <tr>
        <th>날짜</th>
        <th>차량</th>
        <th>이름</th>
        <th>km</th>
      </tr>`;

    pageData.forEach(d => {
        html += `
        <tr>
          <td>${d.date}</td>
          <td>${d.car}</td>
          <td>${d.name}</td>
          <td>${d.km}</td>
        </tr>`;
    });

    html += "</table>";

    html += `
      <div style="margin-top:10px;">
        <button onclick="prevPage()">◀</button>
        <span> ${currentPage} / ${Math.ceil(allData.length / pageSize)} </span>
        <button onclick="nextPage()">▶</button>
      </div>
    `;

    document.getElementById("list").innerHTML = html;
}

// 이전 페이지
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

// 다음 페이지
function nextPage() {
    if (currentPage < Math.ceil(allData.length / pageSize)) {
        currentPage++;
        renderTable();
    }
}

// ⭐ 전체 인쇄
function printAll() {

    if (allData.length === 0) {
        alert("데이터 없음");
        return;
    }

    let html = `
  <table>
    <tr>
      <th>날짜</th>
      <th>차량</th>
      <th>이름</th>
      <th>km</th>
    </tr>`;

    allData.forEach(d => {
        html += `
    <tr>
      <td>${d.date}</td>
      <td>${d.car}</td>
      <td>${d.name}</td>
      <td>${d.km}</td>
    </tr>`;
    });

    html += "</table>";

    const area = document.getElementById("printArea");
    const original = area.innerHTML;

    area.innerHTML = html;

    setTimeout(() => {
        window.print();
        area.innerHTML = original;
    }, 200);
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

function filterByDate() {

    const start = document.getElementById("startDate").value;
    const end = document.getElementById("endDate").value;

    if (!start || !end) {
        alert("기간 선택");
        return;
    }

    filteredData = allData.filter(d => {
        return d.date >= start && d.date <= end;
    });

    currentPage = 1;
    renderFilteredTable();
}
function renderFilteredTable() {

    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const pageData = filteredData.slice(startIdx, endIdx);

    let html = `
    <table>
      <tr>
        <th>날짜</th>
        <th>차량</th>
        <th>이름</th>
        <th>km</th>
      </tr>`;

    pageData.forEach(d => {
        html += `
        <tr>
          <td>${d.date}</td>
          <td>${d.car}</td>
          <td>${d.name}</td>
          <td>${d.km}</td>
        </tr>`;
    });

    html += "</table>";

    html += `
      <div style="margin-top:10px;">
        <button onclick="prevFilteredPage()">◀</button>
        <span> ${currentPage} / ${Math.ceil(filteredData.length / pageSize)} </span>
        <button onclick="nextFilteredPage()">▶</button>
      </div>
    `;

    document.getElementById("list").innerHTML = html;
}
function prevFilteredPage() {
    if (currentPage > 1) {
        currentPage--;
        renderFilteredTable();
    }
}

function nextFilteredPage() {
    if (currentPage < Math.ceil(filteredData.length / pageSize)) {
        currentPage++;
        renderFilteredTable();
    }
}
function printFiltered() {

    if (filteredData.length === 0) {
        alert("데이터 없음");
        return;
    }

    let html = `
    <table>
      <tr>
        <th>날짜</th>
        <th>차량</th>
        <th>이름</th>
        <th>km</th>
      </tr>`;

    filteredData.forEach(d => {
        html += `
        <tr>
          <td>${d.date}</td>
          <td>${d.car}</td>
          <td>${d.name}</td>
          <td>${d.km}</td>
        </tr>`;
    });

    html += "</table>";

    const area = document.getElementById("printArea");
    const original = area.innerHTML;

    area.innerHTML = html;

    setTimeout(() => {
        window.print();
        area.innerHTML = original;
    }, 200);
}