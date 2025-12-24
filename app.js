// LOADER
window.onload=()=>setTimeout(()=>loader.remove(),800);

// OFFLINE
function checkOnline(){offlineMsg.classList.toggle("hidden",navigator.onLine);}
addEventListener("online",checkOnline);
addEventListener("offline",checkOnline);
checkOnline();

// HOME
function goHome(){document.querySelectorAll(".section").forEach(s=>s.classList.add("hidden"));}

// THEME AUTO
const hour=new Date().getHours();
if(hour>=18||hour<=6)document.body.classList.replace("light","dark");
themeToggle.onclick=()=>{document.body.classList.toggle("dark");document.body.classList.toggle("light");};

// SECTIONS
function openSection(id){document.querySelectorAll(".section").forEach(s=>s.classList.add("hidden"));document.getElementById(id).classList.remove("hidden");}

// PREFERENCES
function savePref(k,v){localStorage.setItem(k,v)}
function loadPref(k,d){return localStorage.getItem(k)||d}
bgSelect.value=loadPref("bg","default");bgSelect.onchange=e=>savePref("bg",e.target.value);
snowEmoji.value=loadPref("snow","❄️");snowEmoji.onchange=e=>savePref("snow",e.target.value);
windDir.value=loadPref("wind","down");windDir.onchange=e=>savePref("wind",e.target.value);

// SNOW
let snow=[];
function makeSnow(){snow.forEach(s=>s.remove());snow=[];
for(let i=0;i<40;i++){
const s=document.createElement("div");s.textContent=snowEmoji.value;s.style.position="fixed";s.style.left=Math.random()*100+"vw";s.style.animation=`fall ${5+Math.random()*10}s linear infinite`;
document.body.appendChild(s);snow.push(s);}}
makeSnow();
const style=document.createElement("style");
style.innerHTML=`@keyframes fall{to{transform:translate(${windDir.value=="left"?"-":"+"}20vw,110vh)}}`;
document.head.appendChild(style);

// GAMES
let timer=0;
setInterval(()=>{timer++;playTimer.textContent=`⏱️ Play Time: ${timer}s`},1000);
function playGame(n){recentPlay.textContent="Recently Played: "+n;
let f=JSON.parse(localStorage.getItem("favs")||"[]");if(!f.includes(n)){f.push(n);localStorage.setItem("favs",JSON.stringify(f))}renderFavs();}
function renderFavs(){const ul=favList;ul.innerHTML="";JSON.parse(localStorage.getItem("favs")||"[]").forEach(f=>ul.innerHTML+=`<li>${f}</li>`);}
renderFavs();

// NAUGHTY/NICE
const qs=["Respect elders?","Help parents?","Waste food?","Study honestly?","Help friends?","Cheat?","Say thank you?","Kind online?","Avoid fights?","Help others?"];
qs.forEach((q,i)=>{questions.innerHTML+=`${q}<br><input type="radio" name="q${i}" value="1">Yes<input type="radio" name="q${i}" value="0">No<br>`});
function checkNice(){let s=0;for(let i=0;i<10;i++){const a=document.querySelector(`input[name=q${i}]:checked`);if(a)s+=+a.value}nnResult.textContent=s>=6?"🎄 NICE":"😈 NAUGHTY";confetti();}

// CERTIFICATE
function downloadCert(){
  const c=certCanvas,ctx=c.getContext("2d");c.style.display="block";
  ctx.fillStyle="#fff8dc";ctx.fillRect(0,0,900,600);
  ctx.fillStyle="#b30000";ctx.font="48px serif";ctx.fillText("Christmas Certificate",220,100);
  ctx.fillStyle="#000";ctx.font="36px serif";ctx.fillText(userName.value,350,260);
  ctx.fillText(nnResult.textContent,380,330);
  if(sigSanta.checked)ctx.fillText("🎅 Santa",150,480);
  if(sigRamesh.checked)ctx.fillText("✍️ Ramesh",600,480);
  const a=document.createElement("a");a.download="certificate.png";a.href=c.toDataURL();a.click();
}

// CONFETTI
function confetti(){for(let i=0;i<30;i++){const d=document.createElement("div");d.textContent="🎉";d.style.position="fixed";d.style.left=Math.random()*100+"vw";d.style.top="0";d.style.animation="fall 2s linear";document.body.appendChild(d);setTimeout(()=>d.remove(),2000);}}

// FORTUNE + LUCKY
const fortunes=["Joy ahead","Good news","Family happiness","Success coming"];
function newFortune(){
  fortuneText.textContent=fortunes[Math.random()*fortunes.length|0];
  if(!localStorage.getItem("lucky")){
    const n=Math.floor(Math.random()*100)+1;
    localStorage.setItem("lucky",n);
    luckyNum.textContent="🎁 Lucky Christmas Number: "+n;
  }
}

// CODE GENERATOR - FIXED ONE
const SPECIAL_CODE = "RAMESH-XMAS-2025";
function genCode(){
  localStorage.setItem("specialCode", SPECIAL_CODE);
  codeOut.textContent = "🎁 Your Christmas Code: " + SPECIAL_CODE +
    "\n\nDM this code to Ramesh on Discord to claim your role!";
}
if(localStorage.getItem("specialCode")){
  codeOut.textContent = "🎁 Your Christmas Code: " + localStorage.getItem("specialCode") +
    "\n\nDM this code to Ramesh on Discord to claim your role!";
}
