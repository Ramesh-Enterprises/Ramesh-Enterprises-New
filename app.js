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

/* ================= CONFIG ================= */
const ADMIN_EMAIL = "rameshenterprises@protonmail.com";
let userData = null;

/* ================= AUTH STATE ================= */
onAuthStateChanged(auth, async user => {
  const path = location.pathname;

  if (user) {
    // Logged in
    if (!path.includes("hub.html")) {
      location.replace("hub.html");
      return;
    }

    const snap = await getDoc(doc(db, "users", user.uid));
    userData = snap.data();

    renderStats();

    const adminBtn = document.getElementById("adminBtn");
    if (adminBtn && user.email === ADMIN_EMAIL) {
      adminBtn.style.display = "inline-block";
    }

  } else {
    // Logged out
    if (path.includes("hub.html")) {
      location.replace("login.html");
    }
  }
});

/* ================= LOGIN ================= */
window.login = async () => {
  try {
    await signInWithEmailAndPassword(
      auth,
      loginEmail.value.trim(),
      loginPassword.value
    );
  } catch (e) {
    authError.innerText = e.message;
  }
};

/* ================= REGISTER ================= */
window.register = async () => {
  try {
    const res = await createUserWithEmailAndPassword(
      auth,
      regEmail.value.trim(),
      regPassword.value
    );

    await setDoc(doc(db, "users", res.user.uid), {
      uid: res.user.uid,
      username: regUsername.value.trim(),
      email: regEmail.value.trim(),
      xp: 0,
      level: 1,
      coins: 0,
      gamesPlayed: 0,
      createdAt: Date.now()
    });

  } catch (e) {
    authError.innerText = e.message;
  }
};

/* ================= GOOGLE LOGIN ================= */
window.googleLogin = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const res = await signInWithPopup(auth, provider);

    const ref = doc(db, "users", res.user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        uid: res.user.uid,
        username: res.user.displayName || "Player",
        email: res.user.email,
        xp: 0,
        level: 1,
        coins: 0,
        gamesPlayed: 0,
        createdAt: Date.now()
      });
    }
  } catch (e) {
    authError.innerText = e.message;
  }
};

/* ================= LOGOUT ================= */
window.logout = () => signOut(auth);

/* ================= CORE PROGRESSION ================= */
const levelFromXP = xp => Math.floor(Math.sqrt(xp / 25)) + 1;

async function reward(xp, coins) {
  userData.xp += xp;
  userData.coins += coins;
  userData.gamesPlayed++;
  userData.level = levelFromXP(userData.xp);

  await updateDoc(doc(db, "users", userData.uid), {
    xp: userData.xp,
    coins: userData.coins,
    gamesPlayed: userData.gamesPlayed,
    level: userData.level
  });

  renderStats();
}

function renderStats() {
  if (!window.stats || !userData) return;

  stats.innerHTML = `
    ⭐ <b>${userData.username}</b> — Level ${userData.level}<br>
    XP: ${userData.xp} | Coins: ${userData.coins}<br>
    Games Played: ${userData.gamesPlayed}
  `;
}

/* ================= HUB NAV ================= */
window.openPanel = section => {
  if (!userData) return;

  if (section === "games") panel.innerHTML = gamesHTML();
  if (section === "generators") panel.innerHTML = generatorHTML();
  if (section === "ai") panel.innerHTML = aiHTML();
  if (section === "leaderboard") loadLeaderboard();
  if (section === "profile") panel.innerHTML =
    `<pre>${JSON.stringify(userData, null, 2)}</pre>`;
  if (section === "admin") panel.innerHTML = "👑 ADMIN PANEL ACTIVE";
};

/* ================= ENDLESS GAMES ================= */
function gamesHTML() {
  const list = [
    ["Guess Number", guessNumber],
    ["Reaction Test", reactionTest],
    ["Click Speed", clickSpeed],
    ["Typing Speed", typingTest],
    ["Math Speed Run", mathRun],
    ["Memory Pattern", memoryPattern],
    ["Hangman+", hangman],
    ["Word Scramble+", scramble],
    ["Trivia", trivia],
    ["Puzzle", genericReward],
    ["Rock Paper Scissors", genericReward],
    ["Dice Strategy", dice],
    ["Idle Clicker", idle],
    ["Maze", genericReward],
    ["Logic Riddle", genericReward],
    ["Pattern Recall", memoryPattern],
    ["Vocabulary", genericReward],
    ["Coin Flip", coinFlip],
    ["Quick Quiz", trivia],
    ["Endless Challenge", endless]
  ];

  return list.map(g =>
    `<button onclick="${g[1].name}()">${g[0]}</button>`
  ).join("");
}

/* -------- GAME LOGIC -------- */

window.guessNumber = () => {
  const max = userData.level * 10;
  const num = rand(max);
  const g = +prompt(`Guess a number (0-${max})`);
  if (g === num) reward(15 + userData.level, 5);
};

window.reactionTest = () => {
  const start = Date.now();
  setTimeout(() => {
    alert("CLICK NOW!");
    const time = Date.now() - start;
    reward(Math.max(5, 400 - time), 3);
  }, rand(3000));
};

window.clickSpeed = () => {
  let clicks = 0;
  const start = Date.now();
  while (Date.now() - start < 5000) {
    if (confirm("Click fast!")) clicks++;
  }
  reward(clicks * 2, clicks);
};

window.typingTest = () => {
  const text = randomWords(15).join(" ");
  const start = Date.now();
  const typed = prompt(text);
  const wpm = Math.floor(
    typed.split(" ").length / ((Date.now() - start) / 60000)
  );
  reward(wpm, 5);
};

window.mathRun = () => {
  let score = 0;
  for (let i = 0; i < 5 + userData.level; i++) {
    const a = rand(10 * userData.level);
    const b = rand(10);
    if (+prompt(`${a} + ${b}`) === a + b) score++;
  }
  reward(score * 10, score * 2);
};

window.memoryPattern = () => {
  const seq = Array.from({ length: userData.level + 2 }, () => rand(9));
  alert(seq.join(" "));
  if (prompt("Repeat the sequence") === seq.join("")) {
    reward(25, 10);
  }
};

window.hangman = () => {
  const word = randomWords(1)[0];
  let tries = 6;
  let guessed = [];
  while (tries--) {
    const g = prompt(`Word: ${mask(word, guessed)} | Tries: ${tries}`);
    if (word.includes(g)) guessed.push(g);
    if (!mask(word, guessed).includes("_")) {
      reward(30, 12);
      break;
    }
  }
};

window.scramble = () => {
  const w = randomWords(1)[0];
  const s = w.split("").sort(() => Math.random() - .5).join("");
  if (prompt(s) === w) reward(20, 8);
};

window.trivia = () => {
  const q = triviaData();
  if (prompt(q.q + "\n" + q.a.join("\n")) === q.a[q.c]) {
    reward(25, 10);
  }
};

window.dice = () => reward(rand(20), 5);
window.idle = () => reward(10 + userData.level, 5);
window.coinFlip = () => reward(Math.random() > 0.5 ? 20 : 5, 5);
window.endless = () => reward(30 + userData.level, 15);
window.genericReward = () => reward(10, 5);

/* ================= GENERATORS ================= */
function generatorHTML() {
  const gens = [
    "Business Name","Slogan","Username","Gamertag","Joke","Story",
    "Poem","Challenge","Dare","Excuse","Password","Color Palette",
    "Emoji Combo","Fun Fact","Compliment","Prompt","Mood","Dice",
    "Name","Idea"
  ];

  return gens.map(g =>
    `<button onclick="alert('${g}: ${generate(g)}')">${g}</button>`
  ).join("");
}

function generate() {
  return Math.random().toString(36).slice(2, 10);
}

/* ================= AI ================= */
function aiHTML() {
  return `
    <textarea id="aiText" placeholder="Talk to AI..."></textarea><br>
    <button onclick="alert(aiReply(aiText.value))">Ask AI</button>
  `;
}

function aiReply(text) {
  if (text.includes("?")) return "Interesting question 🤔";
  if (text.length < 8) return "Tell me more...";
  return text.split("").reverse().join("");
}

/* ================= LEADERBOARD ================= */
function loadLeaderboard() {
  panel.innerHTML = "Loading leaderboard...";
  const q = query(collection(db, "users"), orderBy("xp", "desc"));
  onSnapshot(q, snap => {
    panel.innerHTML = snap.docs
      .map(d => `${d.data().username} ⭐ ${d.data().xp}`)
      .join("<br>");
  });
}

/* ================= HELPERS ================= */
const rand = n => Math.floor(Math.random() * n);

const randomWords = n =>
  Array.from({ length: n }, () =>
    ["alpha","neon","pixel","logic","quantum","vector","nova","byte"]
      [rand(8)]
  );

const mask = (w, g) =>
  w.split("").map(c => g.includes(c) ? c : "_").join("");

function triviaData() {
  const qs = [
    { q: "Capital of India?", a: ["Delhi", "Mumbai", "Kolkata"], c: 0 },
    { q: "2 + 2 × 2 ?", a: ["6", "8", "4"], c: 0 }
  ];
  return qs[rand(qs.length)];
}
