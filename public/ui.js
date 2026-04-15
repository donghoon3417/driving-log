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


function getFilteredData() {

  let data = allData.filter(d => {
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

  // ⭐ km 정렬 추가
  if (sortOrder.km === "asc") {
    data.sort((a, b) => a.km - b.km);
  } else if (sortOrder.km === "desc") {
    data.sort((a, b) => b.km - a.km);
  }

  return data;
}

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
