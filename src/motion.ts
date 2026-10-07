export type DeliveryStage='walk'|'pick'|'carry'|'place'|'settle';
export const smooth=(x:number)=>{const p=Math.min(1,Math.max(0,x));return p*p*(3-2*p);};
export function deliveryStage(elapsed:number,durations:number[]):{stage:DeliveryStage;progress:number;done:boolean}{
 let left=elapsed;const names:DeliveryStage[]=['walk','pick','carry','place','settle'];
 for(let i=0;i<durations.length;i++){if(left<durations[i])return {stage:names[i],progress:Math.min(1,left/durations[i]),done:false};left-=durations[i];}
 return {stage:'settle',progress:1,done:true};
}
// The queue contains visual jobs only. Mathematical ownership is never changed here.
export class MotionQueue<T extends {item:number}>{
 private jobs:T[]=[];
 enqueue(job:T){this.jobs=this.jobs.filter(j=>j.item!==job.item);this.jobs.push(job);}
 peek(){return this.jobs[0];}
 finish(){return this.jobs.shift();}
 clear(){this.jobs=[];}
 ids(){return this.jobs.map(j=>j.item);}
 get length(){return this.jobs.length;}
}
