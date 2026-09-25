const sections=[
  {name:"Ⅰ. 사회·문화 현상의 탐구", cls:"group-1", units:[
    "01 사회·문화 현상과 자연 현상",
    "02 사회·문화 현상을 바라보는 관점",
    "03 사회·문화 현상의 연구 방법",
    "04 자료 수집 방법",
    "05 사회·문화 현상의 연구 윤리와 탐구 태도"
  ]},
  {name:"Ⅱ. 개인과 사회 구조", cls:"group-2", units:[
    "06 사회적 존재로서의 인간",
    "07 사회 집단 및 사회 조직",
    "08 관료제와 탈관료제",
    "09 개인과 사회의 관계를 바라보는 관점",
    "10 일탈 이론"
  ]},
  {name:"Ⅲ. 문화와 일상 생활", cls:"group-3", units:[
    "11 문화의 이해",
    "12 문화 이해 태도 및 문화 이해 관점",
    "13 하위문화",
    "14 대중문화",
    "15 문화 변동"
  ]},
  {name:"Ⅳ. 사회 계층과 불평등", cls:"group-4", units:[
    "16 사회 불평등 현상의 이해",
    "17 사회적 소수자",
    "18 빈곤"
  ]},
  {name:"Ⅴ. 현대의 사회 변동", cls:"group-5", units:[
    "19 사회 변동 이론",
    "20 사회 운동",
    "21 정보화와 세계화"
  ]},
  {name:"Ⅵ. 고난도 길러", cls:"group-6", units:[
    "A 명제형",
    "B 사회 이동과 사회 계층 구조",
    "C 사회 보장 제도",
    "D 고령화",
    "E 성 불평등"
  ]}
];

const units=sections.flatMap(s=>s.units);
const UNIT_VERSION=2;
const KEY="socmun_v3";

function localToday(){
  const d=new Date();
  const y=d.getFullYear();
  const m=String(d.getMonth()+1).padStart(2,"0");
  const day=String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
const valid=d=>/^\d{4}-\d{2}-\d{2}$/.test(d);

let data=JSON.parse(localStorage.getItem(KEY)||"null");
if(!data || !Array.isArray(data.exams) || !data.cells){
  data={version:UNIT_VERSION,exams:[],cells:{},recent:false};
} else if(data.version!==UNIT_VERSION){
  // 기존 모의고사 이름/날짜는 유지하되, 이전 목차와 새 목차의 항목이 달라
  // 기존 체크표시는 잘못된 단원에 연결될 수 있으므로 체크 데이터만 초기화한다.
  data={version:UNIT_VERSION,exams:data.exams,cells:{},recent:false};
}
data.version=UNIT_VERSION;

const save=()=>localStorage.setItem(KEY,JSON.stringify(data));

function sort(){
  data.exams.sort((a,b)=>a.date.localeCompare(b.date)||a.name.localeCompare(b.name));
}

function recent(d){
  const end=new Date();
  end.setHours(23,59,59,999);
  const start=new Date(end);
  start.setDate(start.getDate()-6);
  start.setHours(0,0,0,0);
  const x=new Date(d+"T00:00:00");
  return x>=start&&x<=end;
}

function cycle(k){
  data.cells[k]=(data.cells[k]||0)%3+1;
  if(data.cells[k]===3)data.cells[k]=0;
  save(); render();
}

function add(){
  const name=prompt("모의고사 이름을 입력하세요.","9월 평가원");
  if(name===null)return;
  const date=prompt("응시 날짜(YYYY-MM-DD)",localToday());
  if(date===null)return;
  if(!valid(date)){
    alert("날짜 형식이 올바르지 않아 오늘 날짜로 저장합니다.");
  }
  data.exams.push({
    id:String(Date.now()+Math.random()),
    name:name.trim()||"모의고사",
    date:valid(date)?date:localToday()
  });
  sort(); save(); render();
}

function rate(ui){
  let total=0,wrong=0;
  data.exams.forEach(e=>{
    if(data.recent&&!recent(e.date))return;
    const v=data.cells[e.id+":"+ui]||0;
    if(v===1||v===2){
      total++;
      if(v===2)wrong++;
    }
  });
  return total?((wrong/total)*100).toFixed(1)+"%":"—";
}

function esc(s){
  return String(s).replace(/[&<>"']/g,m=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[m]));
}

function header(){
  let h='<thead><tr><th class="group">대단원</th><th class="unit">소단원</th>';
  data.exams.forEach((e,i)=>{
    h+=`<th class="exam">
      <input class="exam-name" value="${esc(e.name)}" data-i="${i}">
      <input class="date-input" type="date" value="${e.date}" data-i="${i}">
      <br><button class="delete" data-i="${i}">삭제</button>
    </th>`;
  });
  h+=`<th class="rate rate-header">오답률
    <div class="rate-toggle">
      <label class="switch">
        <input id="sw" type="checkbox" ${data.recent?"checked":""}>
        <span class="slider"></span>
      </label>
      최근 1주 오답률
    </div>
  </th></tr></thead>`;
  return h;
}

function render(){
  sort();
  const t=document.querySelector("#tbl");
  const recentExams=data.exams.filter(e=>recent(e.date));

  if(data.recent && !recentExams.length){
    t.innerHTML=`<thead><tr>
      <th class="group">대단원</th><th class="unit">소단원</th>
      <th class="rate rate-header">오답률
        <div class="rate-toggle">
          <label class="switch">
            <input id="sw" type="checkbox" checked>
            <span class="slider"></span>
          </label>
          최근 1주 오답률
        </div>
      </th>
    </tr></thead>
    <tbody><tr><td colspan="3" class="empty-message">최근 1주동안 응시한 모의고사가 없습니다</td></tr></tbody>`;
    document.querySelector("#sw").onchange=e=>{
      data.recent=e.target.checked;save();render();
    };
    return;
  }

  let h=header()+"<tbody>";
  let ui=0;

  sections.forEach((section,si)=>{
    section.units.forEach((u,localIndex)=>{
      h+=`<tr class="${localIndex===0?"group-start":""}">`;
      if(localIndex===0){
        h+=`<td class="group ${section.cls}" rowspan="${section.units.length}">${section.name}</td>`;
      }
      h+=`<td class="unit">${u}</td>`;
      data.exams.forEach(e=>{
        const v=data.cells[e.id+":"+ui]||0;
        h+=`<td class="cell ${v===1?"white":v===2?"black":"empty"}" data-k="${e.id}:${ui}">
          ${v===1?"⚪️":v===2?"⚫️":"·"}
        </td>`;
      });
      h+=`<td class="rate">${rate(ui)}</td></tr>`;
      ui++;
    });
  });

  t.innerHTML=h+"</tbody>";

  document.querySelectorAll(".cell").forEach(x=>x.onclick=()=>cycle(x.dataset.k));

  document.querySelectorAll(".exam-name").forEach(x=>{
    x.onchange=()=>{
      data.exams[+x.dataset.i].name=x.value||"모의고사";
      save();render();
    };
  });

  document.querySelectorAll(".date-input").forEach(x=>{
    x.onchange=()=>{
      if(valid(x.value)){
        data.exams[+x.dataset.i].date=x.value;
        save();render();
      }
    };
  });

  document.querySelectorAll(".delete").forEach(x=>{
    x.onclick=()=>{
      if(confirm("이 모의고사를 삭제할까요?")){
        const e=data.exams.splice(+x.dataset.i,1)[0];
        Object.keys(data.cells).forEach(k=>{
          if(k.startsWith(e.id+":"))delete data.cells[k];
        });
        save();render();
      }
    };
  });

  document.querySelector("#sw").onchange=e=>{
    data.recent=e.target.checked;
    save();render();
  };
}

function backup(){
  const payload={...data,unitVersion:UNIT_VERSION};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="사회문화_오답기록.json";
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}

function restore(){
  const i=document.createElement("input");
  i.type="file";i.accept=".json,application/json";
  i.onchange=()=>{
    const file=i.files[0];
    if(!file)return;
    const r=new FileReader();
    r.onload=()=>{
      try{
        const x=JSON.parse(r.result);
        if(x.unitVersion!==UNIT_VERSION){
          alert("이 백업 파일은 현재 목차 버전과 달라 복원할 수 없습니다.");
          return;
        }
        if(!Array.isArray(x.exams)||!x.cells)throw 0;
        data={
          version:UNIT_VERSION,
          exams:x.exams,
          cells:x.cells,
          recent:!!x.recent
        };
        data.exams.forEach((e,i)=>{
          e.id=String(e.id||Date.now()+i);
          e.date=valid(e.date)?e.date:localToday();
          e.name=String(e.name||"모의고사");
        });
        save();render();alert("복원되었습니다.");
      }catch{
        alert("올바른 JSON 백업 파일이 아닙니다.");
      }
    };
    r.readAsText(file);
  };
  i.click();
}

document.querySelector("#add").onclick=add;
document.querySelector("#backup").onclick=backup;
document.querySelector("#restore").onclick=restore;
document.querySelector("#reset").onclick=()=>{
  if(confirm("전체 데이터를 삭제할까요?")){
    data={version:UNIT_VERSION,exams:[],cells:{},recent:false};
    save();render();
  }
};

render();
