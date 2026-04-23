// =======================
// 상태값
// =======================
let dateFilter = {
  start: null,
  end: null
};

// ⭐ 추가 (선택된 row 저장)
let selectedRows = new Set();

const carMap = {
  "5653": "니로 5653",
  "5572": "니로 5572",
  "6785": "니로 6785",
  "3247": "EV3 3247",
  "1036": "스타 1036",
  "4356": "스타 4356",
  "0891": "윙 0891",
  "2092": "BYD 2092",
  "1951": "BYD 1951",
  "5318": "스타 5318",
  "5342": "스타 5342"
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
// 필터 + 정렬
// =======================
function getFilteredData() {

  let data = allData.filter(d => {

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

  if (sortOrder.date === "asc") {
    data.sort((a, b) => a.date.localeCompare(b.date));
  } else if (sortOrder.date === "desc") {
    data.sort((a, b) => b.date.localeCompare(a.date));
  }

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
  const isAllChecked = pageData.length > 0 &&
    pageData.every(d => selectedRows.has(d.id));


  let html = `
    <div class="table-wrap">
      ${renderFilterPopup()}
      <table>
      <tr>
        <th>
  <input type="checkbox"
  ${isAllChecked ? "checked" : ""}
  onclick="toggleAll(this.checked)">

</th>
  <th style="width:100px" onclick="sortByDate()">날짜 ▲▼</th>
  <th style="width:100px" onclick="openFilter('car', event)">차량 ▼</th>
  <th onclick="openFilter('name', event)">이름 ▼</th>
  <th onclick="sortByKm()">km ▲▼</th>
  <th>비고</th>


</tr>
`;

  pageData.forEach(d => {
    html += `
    <tr>
      <td>
    <input type="checkbox"
      ${selectedRows.has(d.id) ? "checked" : ""}
      onchange="toggleRow('${d.id}', this.checked)">
  </td>
  <td>${d.date}</td>
 <td style="width:80px">${carMap[d.car] || d.car}</td>

  <td>${d.name}</td>
  <td>${d.km}</td>
  <td>${d.note || ""}</td>

</tr>
`;
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
// 체크 핸들러
// =======================
window.toggleRow = function (id, checked) {
  if (checked) selectedRows.add(id);
  else selectedRows.delete(id);
};

// =======================
// 일괄 삭제
// =======================
window.deleteSelected = async function () {

  if (selectedRows.size === 0) {
    alert("선택된 항목 없음");
    return;
  }

  if (!confirm("선택된 항목 삭제하시겠습니까?")) return;

  for (const id of selectedRows) {
    await db.collection("driveLogs").doc(id).delete();
  }

  selectedRows.clear();

  alert("삭제 완료");
  loadList();
};

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

  if (!start && !end) {
    dateFilter.start = null;
    dateFilter.end = null;
    currentPage = 1;
    renderTable();
    return;
  }

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
       <td>${carMap[d.car] || d.car}</td>

        <td>${d.name}</td>
        <td>${d.km}</td>
      </tr>
    `;
  });

  html += `</table>`;

  const original = document.getElementById("printArea").innerHTML;

  document.getElementById("printArea").innerHTML = html;

  window.print();

  document.getElementById("printArea").innerHTML = original;

  renderTable();
};

window.downloadExcel = function () {

  const data = getFilteredData();

  if (!data.length) {
    alert("데이터 없음");
    return;
  }

  // 헤더
  let csv = "날짜,차량,이름,km,비고\n";

  data.forEach(d => {
    const carName = carMap[d.car] || d.car;

    csv += `${d.date},${carName},${d.name},${d.km},"${d.note || ""}"\n`;
  });

  // BOM 추가 (한글 깨짐 방지)
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "운행일지.csv";
  a.click();

  URL.revokeObjectURL(url);
};
window.toggleAll = function (checked) {

  const filtered = getFilteredData();

  const startIdx = (currentPage - 1) * pageSize;
  const pageData = filtered.slice(startIdx, startIdx + pageSize);

  pageData.forEach(d => {
    if (checked) {
      selectedRows.add(d.id);
    } else {
      selectedRows.delete(d.id);
    }
  });

  renderTable(); // UI 다시 반영
};

