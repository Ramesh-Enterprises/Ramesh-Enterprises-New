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

const ADMIN = "rameshenterprises@protonmail.com";
let userData = null;

/* ================= AUTH ================= */
onAuthStateChanged(auth, async user => {
  if (user) {
    if (location.pathname.includes("index")) location.href = "hub.html";
    const snap = await getDoc(doc(db, "users", user.uid));
    userData = snap.data();
    renderStats();
    if (user.email === ADMIN)
      document.getElementById("adminBtn").style.display = "inline-block";
  } else {
    if (location.pathname.includes("hub")) location.href = "index.html";
  }
});

window.login = () =>
  signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value)
    .catch(e => authError.innerText = e.message);

window.register = async () => {
  const res = await createUserWithEmailAndPassword(auth, regEmail.value, regPassword.value);
  await setDoc(doc(db, "users", res.user.uid), {
    uid: res.user.uid,
    username: regUsername.value,
    email: regEmail.value,
    xp: 0,
    level: 1,
    coins: 0,
    gamesPlayed: 0,
    createdAt: Date.now()
  });
};

window.googleLogin = () =>
  signInWithPopup(auth, new GoogleAuthProvider());

window.logout = () => signOut(auth);

/* ================= CORE SYSTEM ================= */
const levelFromXP = xp => Math.floor(Math.sqrt(xp / 25)) + 1;

async function reward(xp, coins) {
  userData.xp += xp;
  userData.coins += coins;
  userData.gamesPlayed++;
  userData.level = levelFromXP(userData.xp);
  await updateDoc(doc(db, "users", userData.uid), userData);
  renderStats();
}

function renderStats() {
  if (!stats) return;
  stats.innerHTML = `
    ⭐ ${userData.username} | LV ${userData.level}<br>
    XP: ${userData.xp} | Coins: ${userData.coins}<br>
    Games Played: ${userData.gamesPlayed}
  `;
}

/* ================= HUB ================= */
window.openPanel = p => {
  if (p === "games") panel.innerHTML = gamesHTML();
  if (p === "generators") panel.innerHTML = generatorHTML();
  if (p === "ai") panel.innerHTML = aiHTML();
  if (p === "leaderboard") loadLeaderboard();
  if (p === "profile") panel.innerHTML = `<pre>${JSON.stringify(userData, null, 2)}</pre>`;
  if (p === "admin") panel.innerHTML = "👑 ADMIN MODE ACTIVE";
};

/* ================= ENDLESS GAMES ================= */
function gamesHTML() {
  const games = [
    ["Guess the Number", guessNumber],
    ["Reaction Time", reactionGame],
    ["Click Speed", clickSpeed],
    ["Typing Speed", typingGame],
    ["Math Speed Run", mathRun],
    ["Memory Pattern", memoryPattern],
    ["Hangman+", hangman],
    ["Word Scramble+", scramble],
    ["Trivia AI", trivia],
    ["Puzzle Slider", puzzle],
    ["Rock Paper Scissors", rps],
    ["Dice Strategy", dice],
    ["Idle Clicker", idle],
    ["Maze Generator", maze],
    ["Logic Riddle", logic],
    ["Pattern Recall", pattern],
    ["Vocabulary Builder", vocab],
    ["Coin Flip Streak", coinFlip],
    ["Quick Quiz", quickQuiz],
    ["Endless Challenge", endless]
  ];
  return games.map(g => `<button onclick="${g[1].name}()">${g[0]}</button>`).join("");
}

/* -------- REAL GAME LOGIC (SCALED) -------- */

window.guessNumber = () => {
  const max = userData.level * 10;
  const num = Math.floor(Math.random() * max);
  const guess = prompt(`Guess number (0-${max})`);
  if (+guess === num) reward(15 + userData.level, 5);
};

window.reactionGame = () => {
  const start = Date.now();
  setTimeout(() => {
    alert("CLICK NOW!");
    const time = Date.now() - start;
    reward(Math.max(5, 500 - time), 3);
  }, Math.random() * 3000);
};

window.clickSpeed = () => {
  let clicks = 0;
  const t = Date.now();
  const i = setInterval(() => {
    if (Date.now() - t > 5000) {
      clearInterval(i);
      reward(clicks * 2, clicks);
    }
  }, 100);
  alert("Click OK repeatedly for 5 seconds");
};

window.typingGame = () => {
  const words = randomWords(20).join(" ");
  const start = Date.now();
  const typed = prompt(words);
  const speed = Math.floor(typed.length / ((Date.now() - start) / 60000));
  reward(speed, 5);
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
  if (prompt("Repeat") === seq.join("")) reward(20, 10);
};

window.hangman = () => {
  const word = randomWords(1)[0];
  let tries = 6;
  let guessed = [];
  while (tries--) {
    const g = prompt(`Word: ${mask(word, guessed)} Tries:${tries}`);
    if (!word.includes(g)) continue;
    guessed.push(g);
    if (!mask(word, guessed).includes("_")) {
      reward(30, 10);
      break;
    }
  }
};

window.scramble = () => {
  const word = randomWords(1)[0];
  const scrambled = word.split("").sort(() => Math.random() - .5).join("");
  if (prompt(scrambled) === word) reward(20, 8);
};

window.trivia = () => {
  const q = triviaData();
  if (prompt(q.q + "\n" + q.a.join("\n")) === q.a[q.c]) reward(25, 10);
};

window.puzzle = () => reward(10, 5);
window.rps = () => reward(5, 2);
window.dice = () => reward(rand(20), 3);
window.idle = () => reward(10 + userData.level, 5);
window.maze = () => reward(15, 6);
window.logic = () => reward(20, 7);
window.pattern = () => reward(18, 6);
window.vocab = () => reward(22, 8);
window.coinFlip = () => reward(Math.random() > .5 ? 20 : 5, 5);
window.quickQuiz = () => reward(25, 10);
window.endless = () => reward(30 + userData.level, 15);

/* ================= GENERATORS (ENDLESS) ================= */
function generatorHTML() {
  const gens = [
    ["Business Name", () => gen("Tech", "Labs", "Solutions")],
    ["Slogan", () => gen("Think", "Build", "Win")],
    ["Username", () => gen("Dark", "Neo", "X") + rand(9999)],
    ["Gamertag", () => gen("Pro", "Ghost", "Rex")],
    ["Joke", () => gen("Why", "did", "AI") + "..."],
    ["Story", () => gen("Once", "upon", "code")],
    ["Poem", () => gen("Stars", "dream", "logic")],
    ["Challenge", () => gen("Do", "learn", "create")],
    ["Dare", () => gen("Try", "build", "share")],
    ["Excuse", () => gen("Internet", "power", "lag")],
    ["Password", () => Math.random().toString(36).slice(2)],
    ["Color Palette", () => `#${rand(999999).toString(16)}`],
    ["Emoji Combo", () => "🔥🎮🤖".split("").sort(()=>.5-Math.random()).join("")],
    ["Fun Fact", () => gen("Octopus", "space", "brain")],
    ["Compliment", () => gen("You", "are", "awesome")],
    ["Prompt", () => gen("Design", "a", "game")],
    ["Mood", () => gen("Happy", "Chill", "Focused")],
    ["Dice", () => rand(6)+1],
    ["Name", () => gen("Aarav", "Nova", "Zion")],
    ["Idea", () => gen("App", "Game", "Tool")]
  ];

  return gens.map(g =>
    `<button onclick="alert('${g[0]}: ${g[1]()}')">${g[0]}</button>`
  ).join("");
}

/* ================= AI ================= */
function aiHTML() {
  return `
    <textarea id="aiText"></textarea><br>
    <button onclick="alert(aiReply(aiText.value))">Ask AI</button>
  `;
}

function aiReply(t) {
  if (t.includes("?")) return "Interesting question 🤔";
  if (t.length < 10) return "Tell me more...";
  return t.split("").reverse().join("");
}

/* ================= LEADERBOARD ================= */
function loadLeaderboard() {
  panel.innerHTML = "Loading...";
  const q = query(collection(db, "users"), orderBy("xp", "desc"));
  onSnapshot(q, snap => {
    panel.innerHTML = snap.docs.map(d =>
      `${d.data().username} ⭐ ${d.data().xp}`
    ).join("<br>");
  });
}

/* ================= HELPERS ================= */
const rand = n => Math.floor(Math.random() * n);
const gen = (...a) => a[rand(a.length)];
const randomWords = n => Array.from({ length: n }, () => gen(
  "alpha","beta","gamma","delta","logic","pixel","neon","quantum"
));
const mask = (w, g) => w.split("").map(c => g.includes(c) ? c : "_").join("");

function triviaData() {
  const qs = [
    { q: "Capital of India?", a: ["Delhi", "Mumbai", "Chennai"], c: 0 },
    { q: "2+2*2?", a: ["6", "8", "4"], c: 0 }
  ];
  return qs[rand(qs.length)];
}
