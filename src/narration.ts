import {audioCatalog,type AudioId} from './audioCatalog';
import {counts,evaluate,poolCount,type Action,type Game} from './game';
import {isGrouping,worldOf,type Lesson} from './lessons';
import {lessonCopy} from './lessonCopy';
import type {Cue} from './speech';
export const cue=(ids:AudioId[],text=''):Cue=>({ids,text:text||ids.map(id=>audioCatalog[id].text).join(' ')});
const rabbits=(g:Game,l:Lesson,n:number)=>g.locations.length===n&&l.divisor===2&&l.food==='carrot'&&l.animals.length===2&&l.animals.every(a=>a==='rabbit');
const train83=(l:Lesson)=>l.kind==='train'&&l.total===8&&l.divisor===3;
const delivery=(l:Lesson,n:number)=>l.kind==='delivery'&&l.total===n&&l.divisor===3;
export function entryCue(l:Lesson):Cue {
 if(l.kind==='special')return cue([24,6]);
 if(l.kind==='tutorial')return cue([5,6,7]);
 if(l.total===6&&l.divisor===2&&l.food==='carrot'&&l.animals.every(a=>a==='rabbit'))return cue([21]);
 if(train83(l))return cue([38,39]);
 if(l.kind==='train')return cue([39],l.instruction);
 if(delivery(l,9))return cue([46,47]);
 if(delivery(l,10))return cue([50,47]);
 if(l.kind==='delivery')return cue([47],l.instruction);
 return cue([],l.instruction);
}
export const worldCue=(world:ReturnType<typeof worldOf>)=>cue([world==='picnic'?2:world==='station'?3:4]);
export function currentCue(g:Game,l:Lesson):Cue {
 if(g.phase==='equal')return cue([25]);
 if(g.phase==='leftover')return cue([27]);
 if(g.phase==='try')return cue([28]);
 if(g.phase==='unequal')return cue([29]);
 if(g.phase==='restore')return cue([30]);
 if(g.phase==='explain')return cue([31,32,33,34]);
 if(g.phase==='added')return cue([35]);
 if(g.phase==='success'){
  if(rabbits(g,l,6))return cue([23]);
  if(rabbits(g,l,8))return cue([37]);
  if(train83(l))return cue([44,45]);
  if(delivery(l,9))return cue([49]);
  if(g.remainderAnswer!==null&&g.remainderAnswer===poolCount(g))return cue([18]);
  return cue(isGrouping(l)?[]:[17],lessonCopy(g,l,false).explanation);
 }
 if(g.phase==='question'){
  if(g.quotientChecked){if(train83(l))return cue([43]);if(delivery(l,10))return cue([52]);return cue([],g.message||'Үлдсэн зүйлсээ тоолоод хариулаарай.');}
  if(rabbits(g,l,6))return cue([22]);if(rabbits(g,l,8))return cue([36]);
  if(train83(l))return cue([42]);if(delivery(l,9))return cue([48]);if(delivery(l,10))return cue([51]);
  return cue([],lessonCopy(g,l,false).title+' '+lessonCopy(g,l,false).explanation);
 }
 return entryCue(l);
}
/** Called only for a committed user action, never for an ordinary React render. */
export function actionCue(before:Game,after:Game,action:Action,l:Lesson):Cue|null {
 if(action.type==='compare'){
  if(after.attempts>before.attempts)return cue([12]);
  return after.phase==='leftover'?cue([26,27]):after.phase==='restore'?cue([30]):null;
 }
 if(action.type==='hint'){
  if(['equal','leftover','unequal','question'].includes(before.phase)||evaluate(before,l).ok)return cue([12]);
  if(l.kind==='train'){const partial=counts(before,l).some(n=>n>0&&n<l.divisor&&poolCount(before)>=l.divisor-n);return cue(partial?[41]:[39]);}
  if(l.kind==='delivery')return cue([47]);
  if(l.kind==='group')return cue([12]);
  return cue(before.helped&&before.locations.some(z=>z>=0)?[16]:[10]);
 }
 if(action.type==='check'&&after.attempts>before.attempts){
  if(before.phase==='question')return cue(!isGrouping(l)&&l.kind!=='delivery'&&!before.quotientChecked?[14]:[12]);
  if(before.phase==='leftover')return cue([12,27]);
  if(!isGrouping(l)&&l.kind!=='delivery'){const c=counts(before,l);return cue(c.every(n=>n===c[0])&&poolCount(before)>=l.divisor?[15]:[13]);}
  return cue([12]);
 }
 if(before.phase!==after.phase)return currentCue(after,l);
 if(!before.quotientChecked&&after.quotientChecked)return currentCue(after,l);
 return null;
}
