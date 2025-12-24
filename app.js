/* ================= FIREBASE IMPORTS ================= */
import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= CONSTANTS ================= */
const ADMIN_EMAIL = "rameshenterprises@protonmail.com";

/* ================= GLOBAL STATE ================= */
let currentUser = null;
let userData = null;

/* ================= PAGE DETECTION ================= */
const page = location.pathname;

/* ================= AUTH LISTENER ================= */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    if (page.includes("hub")) location.replace("login.html");
    return;
  }

  currentUser = user;

  if (!page.includes("hub")) {
    location.replace("hub.html");
    return;
  }

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    userData = createUser(user);
    await setDoc(ref, userData);
  } else {
    userData = snap.data();
  }

  initHub();
});

/* ================= LOGIN PAGE ================= */
if (page.includes("login")) {
  const loginBtn = document.getElementById("loginBtn");
  const googleBtn = document.getElementById("googleBtn");

  loginBtn?.addEventListener("click", async () => {
    try {
      await signInWithEmailAndPassword(
        auth,
        loginEmail.value,
        loginPassword.value
      );
    } catch (e) {
      authError.textContent = e.message;
    }
  });

  googleBtn?.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    const res = await signInWithPopup(auth, provider);

    const ref = doc(db, "users", res.user.uid);
    if (!(await getDoc(ref)).exists()) {
      await setDoc(ref, createUser(res.user));
    }
  });
}

/* ================= REGISTER PAGE ================= */
if (page.includes("register")) {
  registerBtn?.addEventListener("click", async () => {
    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        regEmail.value,
        regPassword.value
      );

      await setDoc(
        doc(db, "users", res.user.uid),
        createUser(res.user, regUsername.value)
      );
    } catch (e) {
      authError.textContent = e.message;
    }
  });
}

/* ================= HUB INIT ================= */
function initHub() {
  renderStats();

  document.getElementById("logoutBtn")
    ?.addEventListener("click", async () => {
      await signOut(auth);
      location.replace("login.html");
    });

  document.querySelectorAll("[data-panel]").forEach(btn => {
    btn.addEventListener("click", () => openPanel(btn.dataset.panel));
  });

  if (currentUser.email === ADMIN_EMAIL) {
    document.getElementById("adminBtn").style.display = "inline-block";
  }
}

/* ================= USER TEMPLATE ================= */
function createUser(user, username = "") {
  return {
    uid: user.uid,
    username: username || user.displayName || "Player",
    email: user.email,
    xp: 0,
    level: 1,
    coins: 0,
    gamesPlayed: 0,
    achievements: [],
    lastDaily: 0,
    createdAt: Date.now()
  };
}

/* ================= STATS ================= */
function renderStats() {
  document.getElementById("stats").innerHTML = `
    👤 ${userData.username}<br>
    ⭐ Level ${userData.level}<br>
    ⚡ XP: ${userData.xp}<br>
    💰 Coins: ${userData.coins}
  `;
}

/* ================= XP / LEVEL ================= */
async function reward(xp, coins) {
  userData.xp += xp;
  userData.coins += coins;
  userData.gamesPlayed++;

  userData.level = Math.floor(userData.xp / 100) + 1;

  checkAchievements();

  await updateDoc(doc(db, "users", currentUser.uid), userData);
  renderStats();
}

/* ================= PANELS ================= */
function openPanel(name) {
  if (name === "games") renderGames();
  if (name === "leaderboard") renderLeaderboard();
  if (name === "achievements") renderAchievements();
}

/* ================= GAMES ================= */
function renderGames() {
  panel.innerHTML = `
    <h2>🎮 Guess the Number</h2>
    <input id="guess" type="number" min="0" max="4">
    <button id="play">Play</button>
    <p id="result"></p>
  `;

  play.onclick = () => {
    const num = Math.floor(Math.random() * 5);
    if (+guess.value === num) {
      result.textContent = "🎉 Correct!";
      reward(20, 10);
    } else {
      result.textContent = "❌ Wrong! It was " + num;
      reward(5, 2);
    }
  };
}

/* ================= ACHIEVEMENTS ================= */
function checkAchievements() {
  const a = userData.achievements;

  unlock("First Game", userData.gamesPlayed >= 1);
  unlock("Level 5", userData.level >= 5);
  unlock("Daily Claimer", userData.lastDaily > 0);

  function unlock(name, ok) {
    if (ok && !a.includes(name)) a.push(name);
  }
}

function renderAchievements() {
  panel.innerHTML = `
    <h2>🏆 Achievements</h2>
    ${userData.achievements.length
      ? userData.achievements.join("<br>")
      : "No achievements yet"}
  `;
}

/* ================= LEADERBOARD ================= */
function renderLeaderboard() {
  panel.innerHTML = "<h2>🏆 Leaderboard</h2>";

  const q = query(collection(db, "users"), orderBy("xp", "desc"));
  onSnapshot(q, snap => {
    panel.innerHTML = `
      <h2>🏆 Leaderboard</h2>
      ${snap.docs.map((d, i) =>
        `${i + 1}. ${d.data().username} — ${d.data().xp} XP`
      ).join("<br>")}
    `;
  });
}
