import { lessonById, type Lesson, zoneCount, isGrouping, needsRemainderAnswer, placeName } from './lessons';
export type Phase = 'play' | 'predict' | 'question' | 'try' | 'restore' | 'explain' | 'added' | 'success';
export interface Board { locations: number[]; seats: (number|null)[]; phase: Phase; answer: number | null; remainderAnswer: number | null; prediction: number | null; helped: boolean; attempts: number; tutorialStep: number; message: string }
export interface Game extends Board { lessonId: string; history: Board[] }
export type Action = {type:'move'; item:number; to:number; seat?:number} | {type:'answer';value:number} | {type:'remainderAnswer';value:number} | {type:'predict';value:number} | {type:'check'} | {type:'hint'} | {type:'undo'} | {type:'restart'} | {type:'add'} | {type:'demo'};
export const newGame = (lesson: Lesson): Game => ({lessonId:lesson.id,locations:Array(lesson.total).fill(-1),seats:Array(lesson.total).fill(null),phase:lesson.kind==='predict'?'predict':'play',answer:null,remainderAnswer:null,prediction:null,helped:false,attempts:0,tutorialStep:0,message:'',history:[]});
export const counts = (g: Board, l: Lesson) => Array.from({length:zoneCount(l)},(_,i)=>g.locations.filter(x=>x===i).length);
export const poolCount = (g: Board) => g.locations.filter(x=>x===-1).length;
export function evaluate(g: Board, l: Lesson): {ok:boolean;expected:number;message:string} {
  const total=g.locations.length, c=counts(g,l), pool=poolCount(g);
  if(isGrouping(l)) {
    const full=c.filter(n=>n===l.divisor).length;
    const seatsOK=l.kind!=='train'||g.locations.every((z,i)=>z===-1?g.seats[i]===null:Number.isInteger(g.seats[i])&&g.seats[i]!>=0&&g.seats[i]!<l.divisor&&g.locations.every((other,j)=>i===j||other!==z||g.seats[j]!==g.seats[i]));
    const ok=seatsOK&&c.every(n=>n===0||n===l.divisor)&&pool===total%l.divisor&&full===Math.floor(total/l.divisor);
    const word=placeName(l);
    return {ok,expected:Math.floor(total/l.divisor),message:ok?`${full} ${word} дүүрлээ. ${l.kind==='train'?`Хүлээх талбайд ${pool} амьтан үлдсэн байна.`:`Сагс бүрд ${l.divisor} алим байна.`}`:`${word==='вагон'?'Вагон':'Сагс'} бүрд ${l.divisor} ${l.kind==='train'?'амьтан':'алим'} оруулаарай. Дутуу ${word}ыг дүүрсэнд тооцохгүй.${l.kind==='train'?' Дутуу вагоны амьтдыг хүлээх талбайд буцааж болно.':''}`};
  }
  const q=Math.floor(total/l.divisor), r=total%l.divisor;
  const ok=c.every(n=>n===q)&&pool===r;
  const same=c.every(n=>n===c[0]);
  return {ok,expected:q,message:ok?`${l.kind==='delivery'?'Байшин':'Найз'} бүр ${q}-ыг авлаа.${r?` ${r} үлдлээ.`:' Бүгд ижил тоотой боллоо.'}`:same&&pool>=l.divisor?'Бүгдэд нь дахиад нэг нэгийг өгч болох юм байна.':`${l.kind==='delivery'?'Байшинд':'Тавагт'} ${c.join(', ')} байна. ${l.kind==='delivery'?'Байшин':'Таваг'} бүрийг тоолоод ижил болгоё.`};
}
function remember(g: Game): Board {const {history:_,lessonId:__,...board}=g; return {...board,locations:[...g.locations],seats:[...g.seats]};}
function move(g: Game,item:number,to:number,requestedSeat?:number): Game {
  const l=lessonById(g.lessonId);
  if(['success','explain','predict'].includes(g.phase)||!Number.isInteger(item)||item<0||item>=g.locations.length||!Number.isInteger(to)||to< -1||to>=zoneCount(l)) return g;
  let seat:number|null=null;
  if(l.kind==='train'&&to>=0){
    seat=requestedSeat??Array.from({length:l.divisor},(_,i)=>i).find(s=>!g.locations.some((z,j)=>j!==item&&z===to&&g.seats[j]===s))??null;
    if(seat===null||!Number.isInteger(seat)||seat<0||seat>=l.divisor||g.locations.some((z,j)=>j!==item&&z===to&&g.seats[j]===seat))return {...g,message:'Энэ суудал эзэнтэй байна. Өөр хоосон суудал сонгоорой.'};
  }
  if(g.locations[item]===to&&g.seats[item]===seat)return g;
  const next={...g,locations:g.locations.map((v,i)=>i===item?to:v),seats:g.seats.map((v,i)=>i===item?seat:v),answer:null,remainderAnswer:null,message:'',history:[...g.history.slice(-99),remember(g)]};
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
    case 'move':return move(g,a.item,a.to,a.seat);
    case 'restart':return newGame(l);
    case 'undo': {const prev=g.history.at(-1);return prev?{...g,...prev,helped:g.helped||prev.helped,history:g.history.slice(0,-1)}:g;}
    case 'answer': return Number.isInteger(a.value)&&a.value>=0&&a.value<=12?{...g,answer:a.value,message:''}:g;
    case 'remainderAnswer': return Number.isInteger(a.value)&&a.value>=0&&a.value<=12?{...g,remainderAnswer:a.value,message:''}:g;
    case 'predict': return Number.isInteger(a.value)&&a.value>=0&&a.value<=12?{...g,prediction:a.value,phase:g.phase==='predict'?'play':g.phase,message:'Одоо хуваарилж, өөрийн хариуг шалгаарай.'}:g;
    case 'add':return l.kind==='special'&&g.phase==='explain'?{...g,locations:[...g.locations,-1],seats:[...g.seats,null],phase:'added',answer:null,history:[],message:'Одоо 8 луувантай боллоо. Үлдсэн хоёрыг хуваарилаарай.'}:g;
    case 'demo': {if(l.kind!=='tutorial'||g.tutorialStep>=2||g.phase!=='play')return g;const item=g.locations.findIndex(x=>x===-1);return {...move(g,item,g.tutorialStep),tutorialStep:g.tutorialStep+1};}
    case 'hint': {
      if(g.phase==='success'||g.phase==='explain')return g;
      if(!g.helped)return {...g,helped:true,message:l.hint};
      if(evaluate(g,l).ok&&!(l.kind==='special'&&g.locations.length===7))return {...g,message:'Хуваарилалт бэлэн байна. Одоо бүлгүүдээ, үлдсэн зүйлсээ тоолоод хариулаарай.'};
      const c=counts(g,l);let to=-1, item=-1;
      if(g.phase==='try'){to=0;item=g.locations.findIndex(x=>x===-1);}
      else if(g.phase==='restore'){const over=c.findIndex(x=>x>3);item=g.locations.findIndex(x=>x===over);}
      else if(isGrouping(l)){const over=c.findIndex(x=>x>l.divisor);if(over>=0)item=g.locations.findIndex(x=>x===over);else {to=c.findIndex(x=>x>0&&x<l.divisor);if(to<0)to=c.findIndex(x=>x===0);item=g.locations.findIndex(x=>x===-1);const partial=c.findLastIndex(x=>x>0&&x<l.divisor);if(item<0&&partial>=0){to=-1;item=g.locations.findIndex(x=>x===partial);}if(poolCount(g)+c.filter(n=>n<l.divisor).reduce((a,b)=>a+b,0)<l.divisor&&partial>=0){to=-1;item=g.locations.findIndex(x=>x===partial);}}}
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
      if(g.phase!=='question')return {...g,phase:'question',answer:null,message:isGrouping(l)?'Бүтэн бүлгүүд бэлэн боллоо. Дүүрсэн бүлгүүд болон үлдсэн зүйлсээ өөрөө тоолоорой.':'Тэнцүү хуваариллаа. Нэг бүлэгт ногдсон болон үлдсэн зүйлсээ өөрөө тоолоорой.'};
      if(g.answer===null)return {...g,message:'Тоон товчноос хариугаа сонгоорой.'};
      if(g.answer!==result.expected)return {...g,attempts:g.attempts+1,message:isGrouping(l)?`Дүүрсэн ${placeName(l)} хэд байна вэ? Бүтэн бүлгүүдээ тоолоод дахин сонгоё.`:`Нэг ${placeName(l)} дээр хэд байна вэ? Дахин тоолоод сонгоё.`};
      if(needsRemainderAnswer(l)&&g.remainderAnswer===null)return {...g,message:l.kind==='train'?'Хүлээх талбайд хэдэн амьтан үлдсэн бэ? Тоог сонгоорой.':'Агуулахад хэдэн алим үлдсэн бэ? Тоог сонгоорой.'};
      if(needsRemainderAnswer(l)&&g.remainderAnswer!==g.locations.length%l.divisor)return {...g,attempts:g.attempts+1,message:'Үлдсэн зүйлсээ дахин тоолоод үзье. Хуваарилсан болон үлдсэн нийлээд анхны нийттэй тэнцэнэ.'};
      if(l.kind==='predict'&&g.prediction!==result.expected)return {...g,message:'Таваг дээрх тоо анхны таамагтай чинь таарч байна уу? Таамгаа өөрчилж болно.'};
      return {...g,phase:'success',message:result.message};
    }
  }
}
