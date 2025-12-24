/* ================== IMPORTS ================== */
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
  doc, setDoc, getDoc, updateDoc,
  collection, query, orderBy, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================== GLOBAL STATE ================== */
let currentUser = null;
let userData = null;

/* ================== AUTH STATE ================== */
onAuthStateChanged(auth, async (user) => {
  const page = location.pathname;

  if (!user) {
    if (page.includes("hub")) location.href = "login.html";
    return;
  }

  currentUser = user;

  if (!page.includes("hub")) {
    location.href = "hub.html";
    return;
  }

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) {
    await setDoc(doc(db, "users", user.uid), createBaseUser(user));
    userData = createBaseUser(user);
  } else {
    userData = snap.data();
  }

  renderStats();
});

/* ================== LOGIN ================== */
if (document.getElementById("loginBtn")) {
  loginBtn.onclick = async () => {
    try {
      await signInWithEmailAndPassword(
        auth,
        email.value,
        password.value
      );
    } catch (e) {
      error.innerText = e.message;
    }
  };

  googleBtn.onclick = async () => {
    const provider = new GoogleAuthProvider();
    const res = await signInWithPopup(auth, provider);
    const ref = doc(db, "users", res.user.uid);

    if (!(await getDoc(ref)).exists()) {
      await setDoc(ref, createBaseUser(res.user));
    }
  };
}

/* ================== REGISTER ================== */
if (document.getElementById("registerBtn")) {
  registerBtn.onclick = async () => {
    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        email.value,
        password.value
      );

      await setDoc(
        doc(db, "users", res.user.uid),
        createBaseUser(res.user, username.value)
      );
    } catch (e) {
      error.innerText = e.message;
    }
  };
}

/* ================== HUB ================== */
if (document.getElementById("logoutBtn")) {
  logoutBtn.onclick = () => signOut(auth);

  document.querySelectorAll("[data-panel]").forEach(btn => {
    btn.onclick = () => openPanel(btn.dataset.panel);
  });

  dailyBtn.onclick = claimDailyReward;
}

/* ================== USER TEMPLATE ================== */
function createBaseUser(user, name = "") {
  return {
    uid: user.uid,
    username: name || user.displayName || "Player",
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

/* ================== UI ================== */
function renderStats() {
  stats.innerHTML = `
    ⭐ <b>${userData.username}</b><br>
    Level ${userData.level} | XP ${userData.xp}<br>
    💰 Coins: ${userData.coins}
  `;
}

/* ================== GAME REWARDS ================== */
async function giveReward(xp, coins) {
  userData.xp += xp;
  userData.coins += coins;
  userData.gamesPlayed++;

  userData.level = Math.floor(userData.xp / 100) + 1;

  checkAchievements();

  await updateDoc(doc(db, "users", currentUser.uid), userData);
  renderStats();
}

/* ================== PANELS ================== */
function openPanel(panelName) {
  if (panelName === "games") renderGames();
  if (panelName === "achievements") renderAchievements();
  if (panelName === "leaderboard") renderLeaderboard();
}

/* ================== GAMES ================== */
function renderGames() {
  panel.innerHTML = `
    <h3>🎮 Games</h3>

    <div class="game-card">
      <h4>Guess the Number (0–4)</h4>
      <input id="guessInput" type="number" min="0" max="4">
      <button id="guessBtn">Play</button>
      <p id="gameResult"></p>
    </div>
  `;

  guessBtn.onclick = () => {
    const random = Math.floor(Math.random() * 5);
    const guess = Number(guessInput.value);

    if (guess === random) {
      gameResult.innerText = "🎉 Correct! +20 XP";
      giveReward(20, 10);
    } else {
      gameResult.innerText = `❌ Wrong! Number was ${random}`;
      giveReward(5, 2);
    }
  };
}

/* ================== ACHIEVEMENTS ================== */
function checkAchievements() {
  const a = userData.achievements;

  unlock("First Game", userData.gamesPlayed >= 1);
  unlock("Level 5", userData.level >= 5);
  unlock("Level 10", userData.level >= 10);
  unlock("Daily Claimer", userData.lastDaily !== 0);

  function unlock(name, condition) {
    if (condition && !a.includes(name)) {
      a.push(name);
    }
  }
}

function renderAchievements() {
  if (userData.achievements.length === 0) {
    panel.innerHTML = "<h3>No achievements yet 😕</h3>";
    return;
  }

  panel.innerHTML = `
    <h3>🏆 Achievements</h3>
    ${userData.achievements.map(a => `✔ ${a}`).join("<br>")}
  `;
}

/* ================== DAILY REWARD ================== */
async function claimDailyReward() {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  if (now - userData.lastDaily < DAY) {
    alert("⏳ Daily reward already claimed");
    return;
  }

  userData.lastDaily = now;
  await giveReward(50, 25);
  alert("🎁 Daily reward claimed!");
}

/* ================== LEADERBOARD ================== */
function renderLeaderboard() {
  panel.innerHTML = "<h3>🏆 Leaderboard</h3>";

  const q = query(
    collection(db, "users"),
    orderBy("xp", "desc")
  );

  onSnapshot(q, snap => {
    panel.innerHTML = `
      <h3>🏆 Leaderboard</h3>
      ${snap.docs.map((d, i) =>
        `${i + 1}. ${d.data().username} — XP ${d.data().xp}`
      ).join("<br>")}
    `;
  });
}
