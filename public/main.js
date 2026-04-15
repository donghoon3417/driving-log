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
let editId = null;

let currentPage = 1;
const pageSize = 10;

// ⭐ 필터 상태
let headerFilters = {
    date: [],
    car: [],
    name: [],
    km: []
};

let activeFilter = null;
let filterSearch = "";
let filterPosition = { top: 0, left: 0 };

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
    const selectedDate = document.getElementById("date").value;

    const data = {
        car: selectedCar,
        name: selectedName,
        date: selectedDate || new Date().toISOString().split("T")[0],
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

    if (editId) {
        await db.collection("driveLogs").doc(editId).update({
            ...data,
            km: Number(data.km)
        });
        editId = null;
        alert("수정 완료");
    } else {
        await db.collection("driveLogs").add({
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

// ⭐ 필터 열기 (위치 포함)
function openFilter(key, event) {

    activeFilter = activeFilter === key ? null : key;
    filterSearch = "";

    if (event) {
        const rect = event.target.getBoundingClientRect();

        filterPosition = {
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX
        };
    }

    renderTable();
}

// ⭐ 필터 검색
function setFilterSearch(value) {
    filterSearch = value.toLowerCase();
    renderTable();
}

// ⭐ 체크 토글
function toggleFilter(key, value) {

    const arr = headerFilters[key];

    if (arr.includes(value)) {
        headerFilters[key] = arr.filter(v => v !== value);
    } else {
        headerFilters[key].push(value);
    }

    currentPage = 1;
    renderTable();
}

// ⭐ 전체 선택 / 해제
function toggleAllFilter(key, values) {

    if (headerFilters[key].length === values.length) {
        headerFilters[key] = [];
    } else {
        headerFilters[key] = [...values];
    }

    renderTable();
}

// ⭐ 필터 팝업
function renderFilterPopup() {

    if (!activeFilter) return "";

    let values = [...new Set(allData.map(d => d[activeFilter]))];

    if (filterSearch) {
        values = values.filter(v =>
            String(v).toLowerCase().includes(filterSearch)
        );
    }

    let html = `
    <div class="filter-popup"
      style="top:${filterPosition.top}px; left:${filterPosition.left}px;">
      
      <input type="text" placeholder="검색"
        oninput="setFilterSearch(this.value)"
        style="width:100%;margin-bottom:5px;">
      
      <label>
        <input type="checkbox"
          onchange='toggleAllFilter("${activeFilter}", ${JSON.stringify(values)})'
          ${headerFilters[activeFilter].length === values.length ? "checked" : ""}>
        전체선택
      </label>
      <hr>
    `;

    values.forEach(v => {
        html += `
        <label>
          <input type="checkbox"
            onchange="toggleFilter('${activeFilter}','${v}')"
            ${headerFilters[activeFilter].includes(v) ? "checked" : ""}>
          ${v}
        </label><br>`;
    });

    html += `</div>`;

    return html;
}

// ⭐ 테이블 렌더링
function renderTable() {

    const filtered = allData.filter(d => {
        return (
            (headerFilters.date.length === 0 || headerFilters.date.includes(d.date)) &&
            (headerFilters.car.length === 0 || headerFilters.car.includes(d.car)) &&
            (headerFilters.name.length === 0 || headerFilters.name.includes(d.name)) &&
            (headerFilters.km.length === 0 || headerFilters.km.includes(d.km))
        );
    });

    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const pageData = filtered.slice(startIdx, endIdx);

    let htmlTable = `
    <div class="table-wrap">
      ${renderFilterPopup()}
      <table>
        <tr>
          <th onclick="openFilter('date', event)">날짜 ▼</th>
          <th onclick="openFilter('car', event)">차량 ▼</th>
          <th onclick="openFilter('name', event)">이름 ▼</th>
          <th onclick="openFilter('km', event)">km ▼</th>
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

    htmlTable += `</table></div>`;

    let htmlPagination = `
    <div class="pagination">
      <button onclick="prevPage()">◀</button>
      <span> ${currentPage} / ${Math.ceil(filtered.length / pageSize) || 1} </span>
      <button onclick="nextPage()">▶</button>
    </div>`;

    document.getElementById("list").innerHTML =
        htmlTable + htmlPagination;
}

// 페이지 이동
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

function nextPage() {

    const filtered = allData.filter(d => {
        return (
            (headerFilters.date.length === 0 || headerFilters.date.includes(d.date)) &&
            (headerFilters.car.length === 0 || headerFilters.car.includes(d.car)) &&
            (headerFilters.name.length === 0 || headerFilters.name.includes(d.name)) &&
            (headerFilters.km.length === 0 || headerFilters.km.includes(d.km))
        );
    });

    if (currentPage < Math.ceil(filtered.length / pageSize)) {
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

// ⭐ 외부 클릭 시 닫기
document.addEventListener("click", (e) => {
    if (!e.target.closest(".filter-popup") &&
        !e.target.closest("th")) {
        activeFilter = null;
        renderTable();
    }
});

window.addEventListener("DOMContentLoaded", () => {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("date").value = today;
});
