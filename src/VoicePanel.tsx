import {Volume2,RotateCcw} from 'lucide-react';
import type {VoiceState} from './audioPlayer';
export default function VoicePanel({voice,enabled,volume,onVolume,onReplay}:{voice:VoiceState&{canReplay:boolean};enabled:boolean;volume:number;onVolume:(n:number)=>void;onReplay:()=>void}){
 return <section className="voice-panel" data-testid="voice-panel" data-audio-id={voice.clip?.id??''} data-audio-status={voice.status} aria-label="Дуут заавар">
  <div className="voice-controls"><button className="voice-replay" onClick={onReplay} disabled={!enabled||!voice.canReplay} aria-label="Зааврыг дахин сонсох"><Volume2 size={25}/><span>Дахин сонсох</span></button><label className="voice-volume"><span>Чанга сул</span><input type="range" min="0" max="1" step=".05" value={volume} onChange={e=>onVolume(Number(e.target.value))} aria-label="Ярианы чанга сул"/></label></div>
  {voice.text&&<p className="voice-caption" aria-live="polite">{voice.text}</p>}
  {voice.status==='error'?<div className="voice-error" role="status">Дуу ачаалагдсангүй. Тоглоомоо үргэлжлүүлж болно.<button onClick={onReplay}><RotateCcw size={16}/>Дахин оролдох</button></div>:!enabled?<small>Дуу хаалттай. Зураг, бичгээр үргэлжлүүлээрэй.</small>:!voice.canReplay&&<small>Энэ зааврын бичлэг хараахан байхгүй. Зураг, бичгээр үргэлжлүүлээрэй.</small>}
 </section>;
}
export function ComparisonChoices({onChoose}:{onChoose:(equal:boolean)=>void}){
 return <div className="comparison-choices" role="group" aria-label="Хоёр тавгийг харьцуулах">{[true,false].map(equal=><button key={String(equal)} onClick={()=>onChoose(equal)} aria-label={equal?'Ижил тоотой':'Өөр тоотой'}><svg viewBox="0 0 150 76" aria-hidden="true">{[3,equal?3:4].map((n,index)=><g key={index} transform={`translate(${index*76},0)`}><ellipse cx="36" cy="38" rx="33" ry="30" fill="#fff4d5" stroke="#77956d" strokeWidth="2"/>{Array.from({length:n},(_,i)=><circle key={i} cx={n===3&&i===2?36:25+(i%2)*22} cy={28+Math.floor(i/2)*21} r="7" fill="#ce793d"/>)}</g>)}</svg><strong>{equal?'Ижил тоотой':'Өөр тоотой'}</strong></button>)}</div>;
}
