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
  renderFilteredTable();
}

// 필터 테이블
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

// 필터 페이지 이동
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

// 필터 인쇄
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
        <th>관리</th>
      </tr>`;

  filteredData.forEach(d => {
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