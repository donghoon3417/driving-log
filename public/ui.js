// =======================
// 상태값
// =======================
let dateFilter = {
  start: null,
  end: null
};

// =======================
// 정렬
// =======================
function sortByDate() {
  if (!sortOrder.date) sortOrder.date = "desc";
  else if (sortOrder.date === "desc") sortOrder.date = "asc";
  else sortOrder.date = null;

  renderTable();
}

function sortByKm() {
  if (!sortOrder.km) sortOrder.km = "desc";
  else if (sortOrder.km === "desc") sortOrder.km = "asc";
  else sortOrder.km = null;

  renderTable();
}

// =======================
// 필터 + 정렬 (핵심🔥)
// =======================
function getFilteredData() {

  let data = allData.filter(d => {

    // ⭐ 날짜 필터
    if (dateFilter.start && dateFilter.end) {
      const dDate = new Date(d.date);
      if (dDate < dateFilter.start || dDate > dateFilter.end) {
        return false;
      }
    }

    return (
      (headerFilters.car.length === 0 || headerFilters.car.includes(d.car)) &&
      (headerFilters.name.length === 0 || headerFilters.name.includes(d.name)) &&
      (headerFilters.km.length === 0 || headerFilters.km.includes(d.km))
    );
  });

  // 날짜 정렬
  if (sortOrder.date === "asc") {
    data.sort((a, b) => a.date.localeCompare(b.date));
  } else if (sortOrder.date === "desc") {
    data.sort((a, b) => b.date.localeCompare(a.date));
  }

  // km 정렬
  if (sortOrder.km === "asc") {
    data.sort((a, b) => a.km - b.km);
  } else if (sortOrder.km === "desc") {
    data.sort((a, b) => b.km - a.km);
  }

  return data;
}

// =======================
// 테이블 렌더링
// =======================
function renderTable() {

  const filtered = getFilteredData();

  const startIdx = (currentPage - 1) * pageSize;
  const pageData = filtered.slice(startIdx, startIdx + pageSize);

  let html = `
    <div class="table-wrap">
      ${renderFilterPopup()}
      <table>
        <tr>
          <th onclick="sortByDate()">날짜 ▲▼</th>
          <th onclick="openFilter('car', event)">차량 ▼</th>
          <th onclick="openFilter('name', event)">이름 ▼</th>
          <th onclick="sortByKm()">km ▲▼</th>
          <th>관리</th>
        </tr>`;

  pageData.forEach(d => {
    html += `
      <tr>
        <td>${d.date}</td>
        <td>${d.car}</td>
        <td>${d.name}</td>
        <td>${d.km}</td>
        <td>
          <button onclick="editRow('${d.id}')">수정</button>
          <button onclick="deleteRow('${d.id}')">삭제</button>
        </td>
      </tr>`;
  });

  html += `</table></div>`;

  html += `
    <div class="pagination">
      <button onclick="prevPage()">◀</button>
      <span>${currentPage} / ${Math.ceil(filtered.length / pageSize) || 1}</span>
      <button onclick="nextPage()">▶</button>
    </div>`;

  document.getElementById("list").innerHTML = html;
}

// =======================
// 페이지 이동
// =======================
function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
}

function nextPage() {
  const filtered = getFilteredData();

  if (currentPage < Math.ceil(filtered.length / pageSize)) {
    currentPage++;
    renderTable();
  }
}

function getBaseData() {
  return allData.filter(d => {
    if (dateFilter.start && dateFilter.end) {
      const dDate = new Date(d.date);
      return dDate >= dateFilter.start && dDate <= dateFilter.end;
    }
    return true;
  });
}

// =======================
// 날짜 조회
// =======================
window.filterByDate = function () {
  const start = document.getElementById("startDate").value;
  const end = document.getElementById("endDate").value;

  // ⭐ 둘 다 없으면 → 전체 초기화
  if (!start && !end) {
    dateFilter.start = null;
    dateFilter.end = null;

    currentPage = 1;
    renderTable();
    return;
  }

  // ⭐ 하나만 입력하면 막기
  if (!start || !end) {
    alert("시작/종료 날짜 모두 선택하세요");
    return;
  }

  dateFilter.start = new Date(start);
  dateFilter.end = new Date(end);

  currentPage = 1;
  renderTable();
};

// =======================
// 인쇄
// =======================
window.printFiltered = function () {

  const data = getFilteredData();

  if (!data.length) {
    alert("데이터 없음");
    return;
  }

  let html = `
    <h2 style="text-align:center; margin-bottom:10px;">
      운행일지
    </h2>

    <table>
      <tr>
        <th>날짜</th>
        <th>차량</th>
        <th>이름</th>
        <th>km</th>
      </tr>
  `;

  data.forEach(d => {
    html += `
      <tr>
        <td>${d.date}</td>
        <td>${d.car}</td>
        <td>${d.name}</td>
        <td>${d.km}</td>
      </tr>
    `;
  });

  html += `</table>`;

  // ⭐ 기존 화면 백업
  const original = document.getElementById("printArea").innerHTML;

  // ⭐ 인쇄용으로 교체
  document.getElementById("printArea").innerHTML = html;

  window.print();

  // ⭐ 다시 복원
  document.getElementById("printArea").innerHTML = original;

  // ⭐ UI 다시 렌더 (중요)
  renderTable();
};