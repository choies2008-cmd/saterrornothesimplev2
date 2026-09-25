const units=[
"01 사회문화 현상의 이해","02 사회화와 사회화 기관","03 사회 집단과 사회 조직","04 일탈 행동과 사회 통제",
"05 문화의 이해","06 현대 사회의 문화 양상","07 문화 변동","08 사회 불평등 현상의 이해",
"09 사회 계층 구조와 사회 이동","10 다양한 사회 불평등","11 사회 복지와 복지 제도","12 사회 변동과 사회 운동",
"13 현대 사회의 변화","14 전 지구적 수준의 문제","15 사회 조사 방법","16 사회문화 현상의 탐구"
];

let data=JSON.parse(localStorage.getItem("soc_mun_table")||"null")||{exams:[], cells:{}};

function save(){localStorage.setItem("soc_mun_table",JSON.stringify(data));}
function cycle(key){
  const v=data.cells[key]||0;
  data.cells[key]=v===0?1:v===1?2:0;
  save(); render();
}
function addExam(){
  const name=prompt("모의고사 이름을 입력하세요.","9월 평가원");
  if(name===null)return;
  data.exams.push(name.trim()||`모의고사 ${data.exams.length+1}`);
  save();render();
}
function delExam(i){
  if(!confirm(`"${data.exams[i]}" 모의고사를 삭제할까요?`))return;
  const old=data.exams[i];
  data.exams.splice(i,1);
  Object.keys(data.cells).forEach(k=>{if(k.startsWith(i+":"))delete data.cells[k]});
  // 인덱스 기반 키 재정렬
  const nc={};
  Object.entries(data.cells).forEach(([k,v])=>{
    const [ei,ui]=k.split(":").map(Number);
    if(ei>i) nc[(ei-1)+":"+ui]=v; else nc[k]=v;
  });
  data.cells=nc;save();render();
}
function render(){
  const t=document.getElementById("tbl");
  let h='<thead><tr><th class="unit">단원</th>';
  data.exams.forEach((name,i)=>{
    h+=`<th class="exam"><input class="exam-name" value="${esc(name)}" data-i="${i}"><br><button class="delete" data-del="${i}">삭제</button></th>`;
  });
  h+='<th class="rate">오답률</th></tr></thead><tbody>';
  units.forEach((u,ui)=>{
    h+=`<tr><td class="unit">${u}</td>`;
    data.exams.forEach((_,ei)=>{
      const v=data.cells[ei+":"+ui]||0;
      const cls=v===1?"white":v===2?"black":"empty";
      const symbol=v===1?"⚪️":v===2?"⚫️":"·";
      h+=`<td class="cell ${cls}" data-key="${ei}:${ui}">${symbol}</td>`;
    });
    let wrong=0,total=0;
    data.exams.forEach((_,ei)=>{
      const v=data.cells[ei+":"+ui]||0;
      if(v===1||v===2){total++;if(v===2)wrong++;}
    });
    h+=`<td class="rate">${total?((wrong/total)*100).toFixed(1):"—"}${total?"%":""}</td></tr>`;
  });
  h+='</tbody>';t.innerHTML=h;

  t.querySelectorAll(".cell").forEach(x=>x.onclick=()=>cycle(x.dataset.key));
  t.querySelectorAll(".exam-name").forEach(x=>x.onchange=()=>{
    data.exams[+x.dataset.i]=x.value.trim()||`모의고사 ${+x.dataset.i+1}`;save();render();
  });
  t.querySelectorAll("[data-del]").forEach(x=>x.onclick=()=>delExam(+x.dataset.del));
}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
document.getElementById("add").onclick=addExam;
document.getElementById("reset").onclick=()=>{
  if(confirm("모든 모의고사와 기록을 삭제할까요?")){
    data={exams:[],cells:{}};save();render();
  }
};
render();
