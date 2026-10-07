import { lessonById, type Lesson, zoneCount } from './lessons';
export type Phase = 'play' | 'predict' | 'question' | 'try' | 'restore' | 'explain' | 'added' | 'success';
export interface Board { locations: number[]; phase: Phase; answer: number | null; prediction: number | null; helped: boolean; attempts: number; tutorialStep: number; message: string }
export interface Game extends Board { lessonId: string; history: Board[] }
export type Action = {type:'move'; item:number; to:number} | {type:'answer';value:number} | {type:'predict';value:number} | {type:'check'} | {type:'hint'} | {type:'undo'} | {type:'restart'} | {type:'add'} | {type:'demo'};
export const newGame = (lesson: Lesson): Game => ({lessonId:lesson.id,locations:Array(lesson.total).fill(-1),phase:lesson.kind==='predict'?'predict':'play',answer:null,prediction:null,helped:false,attempts:0,tutorialStep:0,message:'',history:[]});
export const counts = (g: Board, l: Lesson) => Array.from({length:zoneCount(l)},(_,i)=>g.locations.filter(x=>x===i).length);
export const poolCount = (g: Board) => g.locations.filter(x=>x===-1).length;
export function evaluate(g: Board, l: Lesson): {ok:boolean;expected:number;message:string} {
  const total=g.locations.length, c=counts(g,l), pool=poolCount(g);
  if(l.kind==='group') {
    const full=c.filter(n=>n===l.divisor).length;
    const ok=c.every(n=>n===0||n===l.divisor)&&pool===total%l.divisor&&full===Math.floor(total/l.divisor);
    return {ok,expected:Math.floor(total/l.divisor),message:ok?`${full} сагс дүүрлээ. Сагс бүрд ${l.divisor} алим байна.`:`Сагс бүрд ${l.divisor} алим хийгээрэй. Дутуу сагсыг дүүрсэнд тооцохгүй.`};
  }
  const q=Math.floor(total/l.divisor), r=total%l.divisor;
  const ok=c.every(n=>n===q)&&pool===r;
  const same=c.every(n=>n===c[0]);
  return {ok,expected:q,message:ok?`Найз бүр ${q}-ыг авлаа.${r?` ${r} үлдлээ.`:' Бүгд ижил тоотой боллоо.'}`:same&&pool>=l.divisor?'Бүгдэд нь дахиад нэг нэгийг өгч болох юм байна.':`Тавагт ${c.join(', ')} байна. Таваг бүрийг тоолоод ижил болгоё.`};
}
function remember(g: Game): Board {const {history:_,lessonId:__,...board}=g; return {...board,locations:[...g.locations]};}
function move(g: Game,item:number,to:number): Game {
  const l=lessonById(g.lessonId);
  if(['success','explain','predict'].includes(g.phase)||!Number.isInteger(item)||item<0||item>=g.locations.length||!Number.isInteger(to)||to< -1||to>=zoneCount(l)||g.locations[item]===to) return g;
  const next={...g,locations:g.locations.map((v,i)=>i===item?to:v),answer:null,message:'',history:[...g.history.slice(-99),remember(g)]};
  if(g.phase==='question') next.phase='play';
  if(l.kind==='special'&&next.locations.length===7){
    const c=counts(next,l), pool=poolCount(next);
    if(g.phase==='play'&&c.every(n=>n===3)&&pool===1)next.phase='try';
    if(g.phase==='try'&&c.includes(4)&&c.includes(3)&&pool===0)next.phase='restore';
    if(g.phase==='restore'&&c.every(n=>n===3)&&pool===1)next.phase='explain';
  }
  return next;
}
export function reducer(g: Game,a: Action): Game {
  const l=lessonById(g.lessonId);
  switch(a.type){
    case 'move':return move(g,a.item,a.to);
    case 'restart':return newGame(l);
    case 'undo': {const prev=g.history.at(-1);return prev?{...g,...prev,helped:g.helped||prev.helped,history:g.history.slice(0,-1)}:g;}
    case 'answer': return Number.isInteger(a.value)&&a.value>=0&&a.value<=12?{...g,answer:a.value,message:''}:g;
    case 'predict': return Number.isInteger(a.value)&&a.value>=0&&a.value<=12?{...g,prediction:a.value,phase:g.phase==='predict'?'play':g.phase,message:'Одоо хуваарилж, өөрийн хариуг шалгаарай.'}:g;
    case 'add':return l.kind==='special'&&g.phase==='explain'?{...g,locations:[...g.locations,-1],phase:'added',answer:null,history:[],message:'Одоо 8 луувантай боллоо. Үлдсэн хоёрыг хуваарилаарай.'}:g;
    case 'demo': {if(l.kind!=='tutorial'||g.tutorialStep>=2||g.phase!=='play')return g;const item=g.locations.findIndex(x=>x===-1);return {...move(g,item,g.tutorialStep),tutorialStep:g.tutorialStep+1};}
    case 'hint': {
      if(g.phase==='success'||g.phase==='explain')return g;
      if(!g.helped)return {...g,helped:true,message:l.hint};
      const c=counts(g,l);let to=-1, item=-1;
      if(g.phase==='try'){to=0;item=g.locations.findIndex(x=>x===-1);}
      else if(g.phase==='restore'){const over=c.findIndex(x=>x>3);item=g.locations.findIndex(x=>x===over);}
      else if(l.kind==='group'){const over=c.findIndex(x=>x>l.divisor);if(over>=0)item=g.locations.findIndex(x=>x===over);else {to=c.findIndex(x=>x<l.divisor);item=g.locations.findIndex(x=>x===-1);}}
      else {const q=Math.floor(g.locations.length/l.divisor);to=c.findIndex(x=>x<q);const over=c.findIndex(x=>x>q);item=g.locations.findIndex(x=>x===(over>=0?over:-1));}
      if(item<0||(['question','predict'].includes(g.phase)))return {...g,helped:true,message:'Таваг эсвэл дүүрсэн сагснуудаа тоолоод тоон хариугаа сонгоорой.'};
      return {...move(g,item,to),helped:true,message:'Нэг зүйлийг шилжүүлж үзүүллээ. Одоо чи үргэлжлүүлээрэй.'};
    }
    case 'check': {
      if(g.phase==='success'||g.phase==='explain')return g;
      if(g.phase==='predict')return {...g,message:'Эхлээд өөрийн бодсон хариуг сонгоорой.'};
      if(l.kind==='special'&&g.locations.length===7)return {...g,message:g.phase==='try'?'Үлдсэн лууванг нэг тавагт өгч туршаарай.':g.phase==='restore'?'4 луувантай тавагнаас нэгийг төв рүү буцаагаарай.':'Туулай бүрд нэг нэгээр нь өгөөд үзье.'};
      const result=evaluate(g,l);
      if(!result.ok)return {...g,attempts:g.attempts+1,message:result.message};
      if(g.phase!=='question')return {...g,phase:'question',answer:null,message:result.message};
      if(g.answer===null)return {...g,message:'Тоон товчноос хариугаа сонгоорой.'};
      if(g.answer!==result.expected)return {...g,attempts:g.attempts+1,message:l.kind==='group'?'Дүүрсэн сагс хэд байна вэ? Сагснуудаа тоолоод дахин сонгоё.':'Нэг таваг дээр хэд байна вэ? Дахин тоолоод сонгоё.'};
      if(l.kind==='predict'&&g.prediction!==result.expected)return {...g,message:'Таваг дээрх тоо анхны таамагтай чинь таарч байна уу? Таамгаа өөрчилж болно.'};
      return {...g,phase:'success',message:result.message};
    }
  }
}
