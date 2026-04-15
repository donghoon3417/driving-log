function openFilter(key, event) {

    event.stopPropagation(); // ⭐ 필수

    activeFilter = activeFilter === key ? null : key;
    filterSearch = "";

    const th = event.currentTarget;
    const wrap = th.closest(".table-wrap");

    const thRect = th.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();

    filterPosition = {
        top: thRect.bottom - wrapRect.top,
        left: thRect.left - wrapRect.left
    };

    renderTable();
}



function setFilterSearch(value) {
    filterSearch = value.toLowerCase();
    updateFilterList(); // ⭐ 이걸로 교체
}

function updateFilterList() {

    let values = [...new Set(allData.map(d => String(d[activeFilter])))];

    if (filterSearch) {
        values = values.filter(v =>
            v.toLowerCase().includes(filterSearch)
        );
    }

    const list = document.querySelector(".filter-list");

    if (!list) return;

    let html = "";

    values.forEach(v => {
        html += `
        <div class="filter-item">
          <input type="checkbox"
            onchange="toggleFilter('${activeFilter}','${v}')"
            ${headerFilters[activeFilter].includes(v) ? "checked" : ""}>
          <span>${v}</span>
        </div>`;
    });

    list.innerHTML = html;
}


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

function toggleAllFilter(key, values) {

    if (headerFilters[key].length === values.length) {
        headerFilters[key] = [];
    } else {
        headerFilters[key] = [...values];
    }

    renderTable();
}

function renderFilterPopup() {

    if (!activeFilter) return "";

    let values = [...new Set(allData.map(d => String(d[activeFilter])))];


    if (filterSearch) {
        values = values.filter(v =>
            String(v).toLowerCase().includes(filterSearch)
        );
    }

    let html = `
 <div class="filter-popup"
  onclick="event.stopPropagation()"
    onmousedown="event.stopPropagation()"
  style="top:${filterPosition.top}px; left:${filterPosition.left}px;">

      
      <div class="filter-search">
        <input type="text" placeholder="검색"
          oninput="setFilterSearch(this.value)">
      </div>

    <div class="filter-all">
  <label class="filter-item">
    <input type="checkbox"
      onchange='toggleAllFilter("${activeFilter}", ${JSON.stringify(values)})'
      ${headerFilters[activeFilter].length === values.length ? "checked" : ""}>
    <span>전체선택</span>
  </label>
</div>


      <div class="filter-list">
    `;

    values.forEach(v => {
        html += `
        <div class="filter-item">
          <input type="checkbox"
            onchange="toggleFilter('${activeFilter}','${v}')"
            ${headerFilters[activeFilter].includes(v) ? "checked" : ""}>
          <span>${v}</span>
        </div>`;
    });

    html += `</div></div>`;

    return html;
}

// 외부 클릭 닫기
document.addEventListener("mousedown", (e) => {

    const popup = document.querySelector(".filter-popup");

    if (!popup) return;

    if (!popup.contains(e.target) && !e.target.closest("th")) {
        activeFilter = null;
        renderTable();
    }
});
