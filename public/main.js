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
    km: null
};

// 드롭다운 상태
let activeFilter = null;
let filterSearch = "";
let filterPosition = { top: 0, left: 0 };

// =======================
// 저장 (항상 추가만)
// =======================
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

    await db.collection("driveLogs").add({
        timestamp: now,
        ...data,
        km: Number(data.km)
    });

    alert("완료");

    loadList();
    showPage("history");
}

// =======================
// 목록
// =======================
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

// =======================
// 삭제 (단건)
// =======================
async function deleteRow(id) {
    if (!confirm("삭제하시겠습니까?")) return;

    await db.collection("driveLogs").doc(id).delete();
    alert("삭제 완료");
    loadList();
}

// =======================
// 탭
// =======================
function showPage(type) {

    localStorage.setItem("currentPageTab", type);

    document.getElementById("pageWrite").style.display =
        type === "write" ? "block" : "none";

    document.getElementById("pageHistory").style.display =
        type === "history" ? "block" : "none";

    document.getElementById("tabWrite").classList.remove("active");
    document.getElementById("tabHistory").classList.remove("active");

    if (type === "write") {
        document.getElementById("tabWrite").classList.add("active");
    } else {
        document.getElementById("tabHistory").classList.add("active");
    }

    if (type === "history") {
        loadList();
    } else {
        setTimeout(applySelectedUI, 0); // ⭐ 이게 핵심
    }
}

// =======================
// 초기 로드
// =======================
window.addEventListener("DOMContentLoaded", () => {

    document.getElementById("date").value =
        new Date().toISOString().split("T")[0];

    const savedPage = localStorage.getItem("currentPageTab") || "write";
    showPage(savedPage);

    setTimeout(applySelectedUI, 0);

    // ⭐ 여기 추가
    document.getElementById("excelFile").addEventListener("change", function () {
        if (this.files.length > 0) {
            uploadExcel();
            this.value = ""; // 초기화 (추천)
        }
    });
});

// =======================
// 차량 선택
// =======================
window.selectCar = function (btn, carId) {
    document.querySelectorAll("#carSection button")
        .forEach(b => b.classList.remove("active"));

    selectedCar = carId;
    btn.classList.add("active");

    localStorage.setItem("selectedCar", carId);
};

// =======================
// 운행자 선택
// =======================
window.selectName = function (btn, name) {
    document.querySelectorAll("#nameSection button")
        .forEach(b => b.classList.remove("active"));

    selectedName = name;
    btn.classList.add("active");

    localStorage.setItem("selectedName", name);
};

function applySelectedUI() {

    const savedCar = localStorage.getItem("selectedCar");
    const savedName = localStorage.getItem("selectedName");

    // 차량
    if (savedCar) {
        selectedCar = savedCar;

        document.querySelectorAll("#carSection button")
            .forEach(btn => {
                btn.classList.remove("active");

                if (btn.dataset.car === savedCar) {
                    btn.classList.add("active");
                }
            });
    }

    // 운행자
    if (savedName) {
        selectedName = savedName;

        document.querySelectorAll("#nameSection button")
            .forEach(btn => {
                btn.classList.remove("active");

                if (btn.innerText.trim() === savedName.trim()) {
                    btn.classList.add("active");
                }
            });
    }
}

function uploadExcel() {
    const file = document.getElementById("excelFile").files[0];
    if (!file) return alert("파일 선택하세요");

    const reader = new FileReader();

    reader.onload = async function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        for (const row of rows) {
            await saveToFirebase(row); // ⭐ 순차 처리
        }

        alert("엑셀 업로드 완료");
        loadList(); // ⭐ 자동 갱신
    };

    reader.readAsArrayBuffer(file);
}

function saveToFirebase(row) {
    const now = new Date();

    let dateValue = row["날짜"];

    // ⭐ 숫자면 변환
    if (typeof dateValue === "number") {
        dateValue = excelDateToJSDate(dateValue);
    }

    db.collection("driveLogs").add({
        timestamp: now,
        date: dateValue,
        car: row["차량"],
        name: row["이름"],
        km: Number(row["km"]),
        note: row["비고"] || ""
    });
}

function excelDateToJSDate(serial) {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date = new Date(utc_value * 1000);

    return date.toISOString().split("T")[0];
}

function triggerFile() {
    document.getElementById("excelFile").click();
}