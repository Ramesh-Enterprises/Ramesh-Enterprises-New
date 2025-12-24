// ❄️ Snowfall
for(let i=0;i<40;i++){
  const s=document.createElement("div");
  s.textContent="❄️";
  s.style.position="fixed";
  s.style.left=Math.random()*100+"vw";
  s.style.top="-10px";
  s.style.fontSize=12+Math.random()*20+"px";
  s.style.animation=`fall ${5+Math.random()*10}s linear infinite`;
  document.body.appendChild(s);
}

const style=document.createElement("style");
style.innerHTML=`
@keyframes fall{
  to{transform:translateY(110vh);}
}`;
document.head.appendChild(style);

// 🎅 Questions
const questionsData=[
 "Did you help someone this year?",
 "Did you share your snacks?",
 "Were you kind online?",
 "Did you say thank you often?",
 "Did you avoid cheating?",
 "Did you help at home?",
 "Did you forgive someone?",
 "Did you donate or help?",
 "Did you respect elders?",
 "Did you stay honest?"
];

const qDiv=document.getElementById("questions");
questionsData.forEach((q,i)=>{
  qDiv.innerHTML+=`
  <div class="question">
    ${i+1}. ${q}<br>
    <label><input type="radio" name="q${i}" value="1"> Yes</label>
    <label><input type="radio" name="q${i}" value="0"> No</label>
  </div>`;
});

// 🎁 Certificate Logic
function generateResult(){
  const name=document.getElementById("nameInput").value.trim();
  if(!name){alert("Enter your name");return;}

  let score=0;
  for(let i=0;i<10;i++){
    const a=document.querySelector(`input[name="q${i}"]:checked`);
    if(a) score+=Number(a.value);
  }

  const result=score>=6?"NICE 🎄":"NAUGHTY 😈";
  drawCertificate(name,result);
}

// 🖼️ Certificate Canvas
function drawCertificate(name,result){
  const c=document.getElementById("certificateCanvas");
  const ctx=c.getContext("2d");
  c.classList.remove("hidden");

  ctx.fillStyle="#fff8dc";
  ctx.fillRect(0,0,c.width,c.height);

  ctx.fillStyle="#b30000";
  ctx.font="48px serif";
  ctx.fillText("🎄 Christmas Certificate 🎄",180,100);

  ctx.fillStyle="#000";
  ctx.font="32px serif";
  ctx.fillText("This certifies that",330,220);

  ctx.font="42px serif";
  ctx.fillText(name,350,280);

  ctx.font="32px serif";
  ctx.fillText("has been",380,340);

  ctx.font="50px serif";
  ctx.fillText(result,320,410);

  ctx.font="20px serif";
  ctx.fillText("— Ramesh Christmas Fun Hub",280,520);

  const link=document.createElement("a");
  link.download=`${name}_Christmas_Certificate.png`;
  link.href=c.toDataURL();
  link.click();
}

// 🔮 Fortune Scroll
const fortunes=[
 "A joyful surprise awaits you before Christmas 🎁",
 "Kindness you give will return doubled ❄️",
 "A new friendship is coming 🎄",
 "Your holiday season will be peaceful ✨",
 "Good news arrives soon 🎅",
 "Laughter will fill your days 🎶",
 "You will succeed in something important ⭐"
];

function newFortune(){
  document.getElementById("fortuneText").textContent=
    fortunes[Math.floor(Math.random()*fortunes.length)];
}
