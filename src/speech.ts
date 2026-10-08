import {useEffect,useRef,useState} from 'react';
import {audioCatalog,type AudioId} from './audioCatalog';
import {VoicePlayer,type VoiceState} from './audioPlayer';
export interface Cue {ids:AudioId[];text:string}
export function useSpeech(enabled:boolean,volume:number){
 const [state,setState]=useState<VoiceState>({clip:null,text:'',status:'idle',highlight:''});
 const player=useRef<VoicePlayer|null>(null),context=useRef<AudioContext|null>(null),warm=useRef<HTMLAudioElement|null>(null),playing=useRef(false),settings=useRef({enabled,volume});settings.current={enabled,volume};
 const getPlayer=()=>{if(!player.current)player.current=new VoicePlayer(()=>new Audio(),s=>{playing.current=s.status==='playing';setState(s);},path=>new URL(import.meta.env.BASE_URL+path,document.baseURI).href,url=>{if(!url){warm.current?.removeAttribute('src');return;}warm.current??=new Audio();if(warm.current.src!==url){warm.current.preload='metadata';warm.current.src=url;}});player.current.setVolume(settings.current.volume);player.current.setEnabled(settings.current.enabled);return player.current;};
 useEffect(()=>{player.current?.setEnabled(enabled);},[enabled]);
 useEffect(()=>{player.current?.setVolume(volume);},[volume]);
 useEffect(()=>()=>{player.current?.stop();void context.current?.close();},[]);
 const cue=(value:Cue,autoplay=true)=>{getPlayer().setCue(value.ids.map(id=>audioCatalog[id]),value.text,autoplay);};
 return {...state,available:true,canReplay:!!state.clip,cue,stop:()=>player.current?.stop(),replay:()=>getPlayer().replay(),tone:()=>{if(!enabled)return;try{context.current??=new AudioContext();const ctx=context.current;void ctx.resume();const oscillator=ctx.createOscillator(),gain=ctx.createGain();oscillator.type='sine';oscillator.frequency.setValueAtTime(580,ctx.currentTime);gain.gain.setValueAtTime((playing.current?.008:.035)*volume,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.13);oscillator.connect(gain);gain.connect(ctx.destination);oscillator.start();oscillator.stop(ctx.currentTime+.14);}catch{/* Text and controls remain available. */}}};
}
