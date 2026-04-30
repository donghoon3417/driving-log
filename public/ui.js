// =======================
// 상태값
// =======================
let dateFilter = {
  start: null,
  end: null
};

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
// 데이터 필터
// =======================
function getBaseData() {
  return allData.filter(d => {
    if (dateFilter.start && dateFilter.end) {
      const dDate = new Date(d.date);
      return dDate >= dateFilter.start && dDate <= dateFilter.end;
    }
    return true;
  });
}

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
// 테이블 출력
// =======================
function renderTable() {


  const filtered = getFilteredData();

  const startIdx = (currentPage - 1) * pageSize;
  const pageData = filtered.slice(startIdx, startIdx + pageSize);

  const isAllChecked =
    pageData.length > 0 &&
    pageData.every(d => selectedRows.has(d.id));

  let html = `
  <div class="table-wrap">
    ${renderFilterPopup()}

    <table>


      <thead>
        <tr>
          <th>
            <input type="checkbox"
              ${isAllChecked ? "checked" : ""}
              onclick="toggleAll(this.checked)">
          </th>
          <th onclick="sortByDate()">날짜 ▲▼</th>
<th onclick="openFilter('car', event)">차량 ▼</th>
<th onclick="openFilter('name', event)">이름 ▼</th>

<th>출발지</th>
<th>도착지</th>

<th onclick="sortByKm()">km ▲▼</th>
<th>비고</th>
        </tr>
      </thead>

      <tbody>
  `;

  const emptyCount = pageSize - pageData.length;

  pageData.forEach(d => {
    html += `
    <tr>
      <td>
        <input type="checkbox"
          ${selectedRows.has(d.id) ? "checked" : ""}
          onchange="toggleRow('${d.id}', this.checked)">
      </td>
      <td>${d.date}</td>
<td>${carMap[d.car] || d.car}</td>
<td>${d.name}</td>

<td>${d.start || ""}</td>
<td>${d.end || ""}</td>

<td>${Number(d.km).toLocaleString()} km</td>
<td>${d.note || ""}</td>
    </tr>
    `;
  });

  for (let i = 0; i < emptyCount; i++) {
    html += `
 <tr class="empty-row">
  <td>&nbsp;</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
    `;
  }

  html += `
      </tbody>
    </table>
  </div>
  `;

  html += `
  <div class="pagination">
    <button onclick="prevPage()">◀</button>
    <span>${currentPage} / ${Math.ceil(filtered.length / pageSize) || 1}</span>
    <button onclick="nextPage()">▶</button>
  </div>
  `;

  document.getElementById("list").innerHTML = html;
}

// =======================
// 필터 팝업
// =======================
function renderFilterPopup() {
  if (!activeFilter) return "";

  return `
  <div class="filter-popup"
    style="top:${filterPosition.top}px; left:${filterPosition.left}px;">

    <div class="filter-search">
      <input type="text" placeholder="검색..."
        oninput="filterSearch = this.value; renderTable();">
    </div>

    <div class="filter-list">
      ${getFilterItems()}
    </div>
  </div>
  `;
}

function getFilterItems() {

  let values = [];

  if (activeFilter === "car") {
    values = [...new Set(getBaseData().map(d => d.car))];
  } else if (activeFilter === "name") {
    values = [...new Set(getBaseData().map(d => d.name))];
  } else if (activeFilter === "km") {
    values = [...new Set(getBaseData().map(d => d.km))];
  }

  if (filterSearch) {
    values = values.filter(v => {
      const label = activeFilter === "car"
        ? (carMap[v] || v)
        : v;

      return String(label)
        .toLowerCase()
        .includes(filterSearch.toLowerCase());
    });
  }

  const isAllChecked =
    values.length > 0 &&
    values.every(v => headerFilters[activeFilter].includes(v));

  return `
  <div class="filter-all">
    <label>
      <input type="checkbox"
        ${isAllChecked ? "checked" : ""}
        onchange="toggleAllFilter(this.checked)">
      전체선택
    </label>
  </div>

  ${values.map(v => {

    const label = activeFilter === "car"
      ? (carMap[v] || v)
      : v;

    return `
    <div class="filter-item">
      <input type="checkbox"
        ${headerFilters[activeFilter].includes(v) ? "checked" : ""}
        onchange='toggleFilterValue(${JSON.stringify(v)})'>
      <span>${label}</span>
    </div>
    `;
  }).join("")}
  `;
}

function openFilter(type, event) {

  activeFilter = type;

  const wrap = event.target.closest(".table-wrap");
  const rect = event.target.getBoundingClientRect();
  const wrapRect = wrap.getBoundingClientRect();

  filterPosition = {
    top: rect.bottom - wrapRect.top,
    left: rect.left - wrapRect.left
  };

  renderTable();
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