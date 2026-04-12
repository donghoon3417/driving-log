// Firebase CDN 로드
const script1 = document.createElement("script");
script1.src = "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js";
document.head.appendChild(script1);

const script2 = document.createElement("script");
script2.src = "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js";
document.head.appendChild(script2);

// Firebase 초기화
script2.onload = () => {

    const firebaseConfig = {
        apiKey: "AIzaSyBUKtCNUrnSvaCTC6OUa49SrhCJDHc-HgM",
        authDomain: "driving-log-e15fc.firebaseapp.com",
        projectId: "driving-log-e15fc",
    };

    firebase.initializeApp(firebaseConfig);

    // 🔥 전역으로 사용 가능하게
    window.db = firebase.firestore();

    console.log("Firebase 연결 완료");
};