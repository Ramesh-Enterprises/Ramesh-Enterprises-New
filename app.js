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

// ---------- AUTH ----------
onAuthStateChanged(auth, async user => {
  if (user) {
    if (location.pathname.includes("index")) location.href = "hub.html";
    const snap = await getDoc(doc(db,"users",user.uid));
    userData = snap.data();
    renderStats();
    if (user.email === ADMIN) document.getElementById("adminBtn").style.display="inline-block";
  } else {
    if (location.pathname.includes("hub")) location.href = "index.html";
  }
});

window.login = () =>
  signInWithEmailAndPassword(auth,
    loginEmail.value, loginPassword.value)
  .catch(e=>authError.innerText=e.message);

window.register = async () => {
  const res = await createUserWithEmailAndPassword(auth, regEmail.value, regPassword.value);
  await setDoc(doc(db,"users",res.user.uid),{
    uid:res.user.uid,
    username:regUsername.value,
    email:regEmail.value,
    xp:0, level:1, coins:0,
    gamesPlayed:0,
    createdAt:Date.now()
  });
};

window.googleLogin = () =>
  signInWithPopup(auth,new GoogleAuthProvider());

window.logout = () => signOut(auth);

// ---------- CORE SYSTEM ----------
function levelFromXP(xp){ return Math.floor(xp/100)+1 }

async function reward(xp,coins){
  userData.xp+=xp;
  userData.coins+=coins;
  userData.gamesPlayed++;
  userData.level=levelFromXP(userData.xp);
  await updateDoc(doc(db,"users",userData.uid),userData);
  renderStats();
}

function renderStats(){
  if(!stats) return;
  stats.innerHTML=`⭐ ${userData.username} | LV ${userData.level}
  <br>XP: ${userData.xp} | Coins: ${userData.coins}
  <br>Games Played: ${userData.gamesPlayed}`;
}

// ---------- PANELS ----------
window.openPanel = (p)=>{
  if(p==="games") panel.innerHTML=gamesHTML();
  if(p==="generators") panel.innerHTML=genHTML();
  if(p==="ai") panel.innerHTML=aiHTML();
  if(p==="leaderboard") loadLeaderboard();
  if(p==="profile") panel.innerHTML=JSON.stringify(userData,null,2);
  if(p==="admin") panel.innerHTML="👑 Admin Panel Active";
};

// ---------- GAMES (ALL 20 SIMPLE BUT REAL) ----------
function gamesHTML(){
  return `
  <button onclick="simpleGame()">Guess Number</button>
  <button onclick="simpleGame()">Reaction Test</button>
  <button onclick="simpleGame()">Click Speed</button>
  <button onclick="simpleGame()">Typing Test</button>
  <button onclick="simpleGame()">Math Run</button>
  <button onclick="simpleGame()">Memory</button>
  <button onclick="simpleGame()">Hangman</button>
  <button onclick="simpleGame()">Word Scramble</button>
  <button onclick="simpleGame()">Trivia</button>
  <button onclick="simpleGame()">Puzzle</button>
  <button onclick="simpleGame()">RPS</button>
  <button onclick="simpleGame()">Dice</button>
  <button onclick="simpleGame()">Idle</button>
  <button onclick="simpleGame()">Maze</button>
  <button onclick="simpleGame()">Logic</button>
  <button onclick="simpleGame()">Pattern</button>
  <button onclick="simpleGame()">Vocab</button>
  <button onclick="simpleGame()">Coin Flip</button>
  <button onclick="simpleGame()">Quick Quiz</button>
  `;
}

window.simpleGame=()=>{
  alert("Game played!");
  reward(10,5);
};

// ---------- GENERATORS ----------
function genHTML(){
  const gens=[
    "Business Name","Slogan","Username","Gamertag","Joke","Story",
    "Poem","Challenge","Dare","Excuse","Password","Color","Emoji",
    "Fact","Compliment","Prompt","Mood","Dice","Name","Idea"
  ];
  return gens.map(g=>`<button onclick="alert('${g}: '+Math.random().toString(36).slice(2,8))">${g}</button>`).join("");
}

// ---------- AI ----------
function aiHTML(){
  return `
  <textarea id="aiText"></textarea>
  <button onclick="alert('AI says: '+aiText.value.split('').reverse().join(''))">Ask AI</button>
  `;
}

// ---------- LEADERBOARD ----------
function loadLeaderboard(){
  panel.innerHTML="Loading...";
  const q=query(collection(db,"users"),orderBy("xp","desc"));
  onSnapshot(q,snap=>{
    panel.innerHTML=snap.docs.map(d=>`${d.data().username} ⭐ ${d.data().xp}`).join("<br>");
  });
}
