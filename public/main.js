const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "driving-log-e15fc.firebaseapp.com",
    projectId: "driving-log-e15fc",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ⭐ 전역 상태 (여기에만 둠)
let selectedCar = "";
let selectedName = "";
let allData = [];
let filteredData = [];
let currentPage = 1;
const pageSize = 10;

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

    if (!db) {
        alert("Firebase 아직 로딩 안됨");
        return;
    }

    const data = {
        car: selectedCar,
        name: selectedName,
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

    await db.collection("driveLogs").add({
        date: now.toISOString().split("T")[0],
        timestamp: now,
        ...data,
        km: Number(data.km)
    });

    alert("완료");
    loadList();
}

// 목록 불러오기
async function loadList() {

    const snapshot = await db.collection("driveLogs")
        .orderBy("timestamp", "desc")
        .get();

    allData = [];

    snapshot.forEach(doc => {
        allData.push(doc.data());
    });

    currentPage = 1;

    // ⭐ UI 쪽 함수 호출
    renderTable();
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