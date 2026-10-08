export interface VoiceMedia {
 src:string; currentTime:number; volume:number; preload:string;
 onended:((event:Event)=>unknown)|null; onerror:OnErrorEventHandler;
 play:()=>Promise<void>; pause:()=>void;
}
export interface VoiceClip {id:number;path:string;text:string;highlight:string}
export interface VoiceState {clip:VoiceClip|null;text:string;status:'idle'|'playing'|'muted'|'error'|'text';highlight:string}
/** One reusable speech element; only ended advances an explanation, never a question. */
export class VoicePlayer {
 private generation=0;
 private queue:VoiceClip[]=[];
 private index=0;
 private enabled=true;
 private volume=.85;
 private fallback='';
 private media:VoiceMedia|null=null;
 constructor(private create:()=>VoiceMedia,private emit:(state:VoiceState)=>void,private resolve:(path:string)=>string,private preload?:(url:string)=>void){}
 private cancel(){this.generation++;if(this.media){this.media.onended=null;this.media.onerror=null;this.media.pause();try{this.media.currentTime=0;}catch{/* Unloaded media. */}}}
 private publish(status:VoiceState['status']){const clip=this.queue[this.index]??null;this.emit({clip,text:clip?.text??this.fallback,status,highlight:clip?.highlight??''});}
 stop(){this.cancel();this.queue=[];this.index=0;this.fallback='';this.preload?.('');this.publish('idle');}
 setEnabled(enabled:boolean){if(enabled===this.enabled)return;this.enabled=enabled;this.cancel();this.publish(enabled?(this.queue.length?'idle':'text'):'muted');}
 setVolume(value:number){this.volume=Math.max(0,Math.min(1,value));if(this.media)this.media.volume=this.volume;}
 setCue(clips:VoiceClip[],fallback:string,autoplay=true){this.cancel();this.queue=[...clips];this.index=0;this.fallback=fallback;this.publish(!this.enabled?'muted':clips.length?'idle':'text');if(autoplay&&this.enabled&&clips.length)this.start();}
 replay(){if(!this.enabled||!this.queue.length)return;this.cancel();this.start();}
 private start(){
  const clip=this.queue[this.index];if(!clip)return;
  const token=++this.generation,media=this.media??=this.create();
  media.pause();media.src=this.resolve(clip.path);media.currentTime=0;media.volume=this.volume;media.preload='auto';
  const fail=()=>{if(token!==this.generation)return;media.pause();media.onended=null;media.onerror=null;this.queue=this.queue.slice(0,this.index+1);this.publish('error');};
  media.onerror=fail;
  media.onended=()=>{if(token!==this.generation)return;media.onended=null;media.onerror=null;if(this.index+1<this.queue.length){this.index++;this.start();}else this.publish('idle');};
  this.publish('playing');
  const next=this.queue[this.index+1];this.preload?.(next?this.resolve(next.path):'');
  try{void media.play().catch(fail);}catch{fail();}
 }
}
