// HUB NAV
function openSection(id){
  document.querySelectorAll(".section").forEach(s=>s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// DARK / LIGHT
const toggle=document.getElementById("themeToggle");
toggle.onclick=()=>{
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
  toggle.textContent=document.body.classList.contains("dark")
    ?"☀️ Light Mode":"🌙 Dark Mode";
};

// FAVOURITES
let favs=JSON.parse(localStorage.getItem("favs")||"[]");
function addFav(name){
  if(!favs.includes(name)){
    favs.push(name);
    localStorage.setItem("favs",JSON.stringify(favs));
    renderFavs();
  }
}
function renderFavs(){
  document.getElementById("favList").textContent=
    favs.length?favs.join(", "):"None yet";
}
renderFavs();
document.getElementById("clearFavs").onclick=()=>{
  favs=[];
  localStorage.removeItem("favs");
  renderFavs();
};

// NAUGHTY OR NICE (Indian themed)
const qData=[
 "Did you respect elders?",
 "Did you help at home?",
 "Did you waste food?",
 "Did you study honestly?",
 "Did you help friends?",
 "Did you avoid cheating?",
 "Did you say thank you?",
 "Did you help parents?",
 "Did you stay kind online?",
 "Did you avoid fights?"
];
const qDiv=document.getElementById("questions");
qData.forEach((q,i)=>{
  qDiv.innerHTML+=`
  <div>
    ${q}<br>
    <label><input type="radio" name="q${i}" value="1"> Yes</label>
    <label><input type="radio" name="q${i}" value="0"> No</label>
  </div>`;
});
function checkNice(){
  let score=0;
  for(let i=0;i<10;i++){
    const a=document.querySelector(`input[name="q${i}"]:checked`);
    if(a) score+=Number(a.value);
  }
  document.getElementById("nnResult").textContent=
    score>=6?"🎄 NICE – Santa approves!":"😈 NAUGHTY – Try better next year!";
}

// FORTUNE
const fortunes=[
 "A surprise guest will bring joy 🎁",
 "Good news is coming from family",
 "Hard work will pay off soon",
 "A happy moment awaits you",
 "You will make someone smile today"
];
function newFortune(){
  document.getElementById("fortuneText").textContent=
    fortunes[Math.floor(Math.random()*fortunes.length)];
}

// GENERATORS
function genJoke(){
  const j=[
    "Why did Santa go to school? To improve his elf-esteem!",
    "What do elves learn in school? The elf-abet!",
    "Why was the snowman smiling? He saw the snowblower!"
  ];
  document.getElementById("jokeOut").textContent=
    j[Math.floor(Math.random()*j.length)];
}
function genFact(){
  const f=[
    "Christmas is celebrated by billions worldwide.",
    "Santa Claus is based on St. Nicholas.",
    "India celebrates Christmas with regional traditions."
  ];
  document.getElementById("factOut").textContent=
    f[Math.floor(Math.random()*f.length)];
}
function genName(){
  const n=["Jolly","Snowy","Festive","Cheerful","Twinkly"];
  document.getElementById("nameOut").textContent=
    n[Math.floor(Math.random()*n.length)]+" "+(Math.random()*100|0);
}
