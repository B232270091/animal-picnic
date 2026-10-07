import {useEffect,useRef,useState} from 'react';
// Add recorded Mongolian instructions here, e.g. 'share-0': '/audio/share-0.mp3'.
export const mongolianRecordings:Record<string,string>={};
export function useSpeech(enabled:boolean){
 const [voice,setVoice]=useState<SpeechSynthesisVoice|null>(null),audio=useRef<HTMLAudioElement|null>(null),context=useRef<AudioContext|null>(null);
 useEffect(()=>{if(!('speechSynthesis' in window))return;const sync=()=>setVoice(speechSynthesis.getVoices().find(v=>/^mn(?:-|$)/i.test(v.lang))??null);sync();speechSynthesis.addEventListener('voiceschanged',sync);return()=>{speechSynthesis.removeEventListener('voiceschanged',sync);speechSynthesis.cancel();};},[]);
 useEffect(()=>{if(!enabled){audio.current?.pause();if('speechSynthesis' in window)speechSynthesis.cancel();}},[enabled]);
 useEffect(()=>()=>{audio.current?.pause();void context.current?.close();},[]);
 return {available:!!voice||Object.keys(mongolianRecordings).length>0,speak:(id:string,text:string)=>{if(!enabled)return;audio.current?.pause();if(mongolianRecordings[id]){audio.current=new Audio(mongolianRecordings[id]);void audio.current.play().catch(()=>{});}else if(voice){speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.voice=voice;utterance.lang='mn-MN';utterance.rate=.82;speechSynthesis.speak(utterance);}},tone:()=>{if(!enabled)return;try{context.current??=new AudioContext();const ctx=context.current;void ctx.resume();const oscillator=ctx.createOscillator(),gain=ctx.createGain();oscillator.type='sine';oscillator.frequency.setValueAtTime(580,ctx.currentTime);gain.gain.setValueAtTime(.035,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.13);oscillator.connect(gain);gain.connect(ctx.destination);oscillator.start();oscillator.stop(ctx.currentTime+.14);}catch{/* Game is always usable without sound. */}}};
}
