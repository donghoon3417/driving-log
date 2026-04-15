let currentPage = 1;
const pageSize = 10;

let filteredData = [];
let headerFilters = {
  date: "",
  car: "",
  name: "",
  km: ""
};

// 테이블 렌더링
function renderTable() {

  const baseData = filteredData.length > 0 ? filteredData : allData;

  const headerFiltered = baseData.filter(d => {
    return (
      (!headerFilters.date || d.date.includes(headerFilters.date)) &&
      (!headerFilters.car || d.car.includes(headerFilters.car)) &&
      (!headerFilters.name || d.name.includes(headerFilters.name)) &&
      (!headerFilters.km || String(d.km).includes(headerFilters.km))
    );
  });

  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pageData = headerFiltered.slice(startIdx, endIdx);

  let html = `
    <table>
      <tr>
        <th>날짜</th>
        <th>차량</th>
        <th>이름</th>
        <th>km</th>
        <th>관리</th>
      </tr>
      <tr>
        <th><input oninput="setFilter('date', this.value)" placeholder="검색"></th>
        <th><input oninput="setFilter('car', this.value)" placeholder="검색"></th>
        <th><input oninput="setFilter('name', this.value)" placeholder="검색"></th>
        <th><input oninput="setFilter('km', this.value)" placeholder="검색"></th>
        <th></th>
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

  html += "</table>";

  html += `
    <div style="margin-top:10px;">
      <button onclick="prevPage()">◀</button>
      <span> ${currentPage} / ${Math.ceil(headerFiltered.length / pageSize) || 1} </span>
      <button onclick="nextPage()">▶</button>
    </div>
  `;

  document.getElementById("list").innerHTML = html;
}

// 필터 입력
function setFilter(key, value) {
  headerFilters[key] = value;
  currentPage = 1;
  renderTable();
}

// 페이지 이동
function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
}

function nextPage() {
  const baseData = filteredData.length > 0 ? filteredData : allData;

  const headerFiltered = baseData.filter(d => {
    return (
      (!headerFilters.date || d.date.includes(headerFilters.date)) &&
      (!headerFilters.car || d.car.includes(headerFilters.car)) &&
      (!headerFilters.name || d.name.includes(headerFilters.name)) &&
      (!headerFilters.km || String(d.km).includes(headerFilters.km))
    );
  });

  if (currentPage < Math.ceil(headerFiltered.length / pageSize)) {
    currentPage++;
    renderTable();
  }
}

// 전체 인쇄
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
        <th>관리</th>
      </tr>`;

  allData.forEach(d => {
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

  html += "</table>";

  const area = document.getElementById("printArea");
  const original = area.innerHTML;

  area.innerHTML = html;

  setTimeout(() => {
    window.print();
    area.innerHTML = original;
  }, 200);
}

// 날짜 필터
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
  renderTable();
}

// 필터 초기화 (추가)
function resetFilters() {
  filteredData = [];
  headerFilters = { date: "", car: "", name: "", km: "" };
  currentPage = 1;
  renderTable();
}
