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
let editId = null;

let currentPage = 1;
const pageSize = 10;

// 필터 상태
let headerFilters = {
    car: [],
    name: [],
    km: []
};

// 정렬
let sortOrder = {
    date: null,
    km: null   // ⭐ 추가
};

// 드롭다운 상태
let activeFilter = null;
let filterSearch = "";
let filterPosition = { top: 0, left: 0 };

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

// 목록
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

    // 차량 선택 유지
    document.querySelectorAll("#carSection button")
        .forEach(btn => {
            btn.classList.remove("active");
            if (data.car === btn.innerText.trim()) {
                btn.classList.add("active");
            }
        });

    // 운행자 선택 유지
    document.querySelectorAll("#nameSection button")
        .forEach(btn => {
            btn.classList.remove("active");
            if (btn.innerText === data.name) {
                btn.classList.add("active");
            }
        });

    editId = id;

    showPage("write");
}


// 탭
function showPage(type) {

    localStorage.setItem("currentPageTab", type);

    document.getElementById("pageWrite").style.display =
        type === "write" ? "block" : "none";

    document.getElementById("pageHistory").style.display =
        type === "history" ? "block" : "none";

    // ⭐ 추가 (핵심)
    document.getElementById("tabWrite").classList.remove("active");
    document.getElementById("tabHistory").classList.remove("active");

    if (type === "write") {
        document.getElementById("tabWrite").classList.add("active");
    } else {
        document.getElementById("tabHistory").classList.add("active");
    }

    if (type === "history") loadList();
}


window.addEventListener("DOMContentLoaded", () => {

    document.getElementById("date").value =
        new Date().toISOString().split("T")[0];

    const savedPage = localStorage.getItem("currentPageTab") || "write";
    showPage(savedPage);

    // ⭐ 추가 시작
    const savedCar = localStorage.getItem("selectedCar");
    const savedName = localStorage.getItem("selectedName");

    if (savedCar) {
        selectedCar = savedCar;

        document.querySelectorAll("#carSection button")
            .forEach(btn => {
                if (savedCar === btn.innerText.trim()) {
                    btn.classList.add("active");
                }
            });
    }

    if (savedName) {
        selectedName = savedName;

        document.querySelectorAll("#nameSection button")
            .forEach(btn => {
                if (btn.innerText === savedName) {
                    btn.classList.add("active");
                }
            });
    }
    // ⭐ 추가 끝
});
window.selectCar = function (btn, car) {
    document.querySelectorAll("#carSection button")
        .forEach(b => b.classList.remove("active"));

    selectedCar = car;
    btn.classList.add("active");

    localStorage.setItem("selectedCar", car); // ⭐ 추가
};

window.selectName = function (btn, name) {
    document.querySelectorAll("#nameSection button")
        .forEach(b => b.classList.remove("active"));

    selectedName = name;
    btn.classList.add("active");

    localStorage.setItem("selectedName", name); // ⭐ 추가
};