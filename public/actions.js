// =======================
// 선택 상태
// =======================
let selectedRows = new Set();

// =======================
// 체크박스
// =======================
window.toggleRow = function (id, checked) {

  if (checked) {
    selectedRows.add(id);
  } else {
    selectedRows.delete(id);
  }
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

  renderTable();
};

// =======================
// 필터 체크
// =======================
window.toggleFilterValue = function (value) {

  const list = headerFilters[activeFilter];
  const idx = list.indexOf(value);

  if (idx > -1) {
    list.splice(idx, 1);
  } else {
    list.push(value);
  }

  renderTable();
};

window.toggleAllFilter = function (checked) {

  const values = [...new Set(getBaseData().map(d => d[activeFilter]))];

  if (checked) {
    headerFilters[activeFilter] = values;
  } else {
    headerFilters[activeFilter] = [];
  }

  renderTable();
};

// =======================
// 삭제
// =======================
window.deleteSelected = async function () {

  if (selectedRows.size === 0) {
    alert("선택된 항목 없음");
    return;
  }

  if (!confirm("선택된 항목 삭제하시겠습니까?")) {
    return;
  }

  for (const id of selectedRows) {
    await db.collection("driveLogs").doc(id).delete();
  }

  selectedRows.clear();

  alert("삭제 완료");

  loadList();
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
<th>출발지</th>
<th>도착지</th>
<th>km</th>
    </tr>
  `;

  data.forEach(d => {
    html += `
    <tr>
      <td>${d.date}</td>
      <td>${carMap[d.car] || d.car}</td>
      <td>${d.name}</td>
      <td>${d.start || ""}</td>
      <td>${d.end || ""}</td>
      <td>${Number(d.km).toLocaleString()} km</td>
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

// =======================
// CSV 다운로드
// =======================
window.downloadExcel = function () {

  const data = getFilteredData();

  if (!data.length) {
    alert("데이터 없음");
    return;
  }

  const rows = [
    ["날짜", "차량", "이름", "출발지", "도착지", "km", "비고"]
  ];

  data.forEach(d => {
    rows.push([
      d.date,
      carMap[d.car] || d.car,
      d.name,
      d.start || "",
      d.end || "",
      Number(d.km).toLocaleString() + " km",
      d.note || ""
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // 열 너비 지정
  ws["!cols"] = [
    { wch: 14 }, // 날짜
    { wch: 16 }, // 차량
    { wch: 12 }, // 이름
    { wch: 14 }, // 출발지
    { wch: 14 }, // 도착지
    { wch: 14 }, // km
    { wch: 30 }  // 비고
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "운행일지");

  XLSX.writeFile(wb, "운행일지.xlsx");
};

function handleNoteSearchPopup(event) {

  // ESC → 검색 해제
  if (event.key === "Escape") {

    noteSearch = "";

    activeFilter = null;

    currentPage = 1;

    renderTable();

    return;
  }

  // 엔터만 검색
  if (event.key !== "Enter") return;

  noteSearch = event.target.value
    .toLowerCase()
    .trim();

  activeFilter = null;

  currentPage = 1;

  renderTable();
}