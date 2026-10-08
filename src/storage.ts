import {lessonById,lessons,zoneCount,needsRemainderAnswer} from './lessons';
import {newGame,evaluate,counts,poolCount,type Game} from './game';
export const STORAGE_KEY='animal-picnic-v1';
export interface RecordEntry {helped:boolean;attempts:number;completedAt:string}
export interface Saved {version:3;progress:Record<string,RecordEntry>;game:Game|null;sound:boolean;speechVolume:number;reduceMotion:boolean;fastMotion:boolean}
export const fresh=():Saved=>({version:3,progress:{},game:null,sound:true,speechVolume:.85,reduceMotion:false,fastMotion:false});
export function parseSaved(raw:string|null):Saved {
  const result=fresh();if(!raw)return result;
  try{
    const data=JSON.parse(raw);if(!data||![1,2,3].includes(data.version))return result;
    result.speechVolume=typeof data.speechVolume==='number'&&Number.isFinite(data.speechVolume)?Math.max(0,Math.min(1,data.speechVolume)):.85;
    result.sound=typeof data.sound==='boolean'?data.sound:true;result.reduceMotion=data.reduceMotion===true;result.fastMotion=data.fastMotion===true;
    for(const l of lessons){const p=data.progress?.[l.id];if(p&&typeof p.helped==='boolean'&&Number.isInteger(p.attempts)&&p.attempts>=0&&typeof p.completedAt==='string')result.progress[l.id]=p;}
    const g=data.game;if(!g||!lessons.some(l=>l.id===g.lessonId))return result;
    const l=lessonById(g.lessonId);const max=zoneCount(l);
    const validLength=g.locations?.length===l.total||(l.kind==='special'&&g.locations?.length===8);
    if(!Array.isArray(g.locations)||!validLength||!g.locations.every((x:unknown)=>typeof x==='number'&&Number.isInteger(x)&&x>=-1&&x<max))return result;
    const base=newGame(l);const phases=['play','predict','question','equal','leftover','unequal','try','restore','explain','added','success'];
    const validNumber=(v:unknown)=>typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<=12;
    let seats:(number|null)[]=Array(g.locations.length).fill(null);
    if(l.kind==='train'){
      if(!Array.isArray(g.seats)||g.seats.length!==g.locations.length)return result;
      seats=g.seats;
      if(!g.locations.every((z:number,i:number)=>z===-1?seats[i]===null:Number.isInteger(seats[i])&&seats[i]!>=0&&seats[i]!<l.divisor&&g.locations.every((other:number,j:number)=>i===j||other!==z||seats[j]!==seats[i])))return result;
    }
    result.game={...base,locations:g.locations,seats,phase:phases.includes(g.phase)?g.phase:'play',answer:validNumber(g.answer)?g.answer:null,remainderAnswer:validNumber(g.remainderAnswer)?g.remainderAnswer:null,prediction:validNumber(g.prediction)?g.prediction:null,helped:g.helped===true,attempts:Number.isInteger(g.attempts)&&g.attempts>=0?g.attempts:0,tutorialStep:l.kind==='tutorial'&&Number.isInteger(g.tutorialStep)?Math.max(0,Math.min(2,g.tutorialStep)):0};
    // Inconsistent old sessions are safely restarted; progress remains intact.
    const restored=result.game;
    restored.quotientChecked=g.quotientChecked===true&&restored.answer===evaluate(restored,l).expected;
    if(data.version<3&&l.kind==='special'){if(restored.phase==='try')restored.phase='equal';if(restored.phase==='restore')restored.phase='unequal';}
    if(data.version<3&&restored.phase==='success'&&evaluate(restored,l).ok){restored.quotientChecked=true;restored.remainderAnswer=restored.locations.length%l.divisor;}
    const c=counts(restored,l),pool=poolCount(restored),check=evaluate(restored,l);
    if((['equal','leftover','unequal','try','restore','explain','added'].includes(restored.phase)&&l.kind!=='special')
      ||(['equal','leftover'].includes(restored.phase)&&!(g.locations.length===7&&c.every(n=>n===3)&&pool===1))
      ||(restored.phase==='unequal'&&!(g.locations.length===7&&c.includes(3)&&c.includes(4)&&pool===0))
      ||(restored.phase==='predict'&&l.kind!=='predict')
      ||(restored.phase==='added'&&g.locations.length!==8)
      ||(restored.phase==='explain'&&!(g.locations.length===7&&c.every(n=>n===3)&&pool===1))
      ||(restored.phase==='success'&&(!check.ok||restored.answer!==check.expected||(l.kind==='predict'&&restored.prediction!==check.expected)||(needsRemainderAnswer(l)&&restored.remainderAnswer!==g.locations.length%l.divisor)))
      ||(restored.phase==='question'&&!check.ok))result.game=base;
    return result;
  }catch{return result;}
}
export const loadSaved=():Saved=>{try{return parseSaved(localStorage.getItem(STORAGE_KEY));}catch{return fresh();}};
export const save=(s:Saved):boolean=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(s));return true;}catch{return false;}};
