import {useEffect,useRef,useState} from 'react';
import {Leaf,TrainFront,House,Play} from 'lucide-react';
import * as THREE from 'three';
import {createAnimal,poseAnimal} from './rig';
import {addForest,disposeObject,makeHouse,makeBasket,makeFood,makeWagon} from './forest';
import type {World} from './lessons';
export const worlds:[World,string,string][]=[['picnic','Пикникийн талбай','Найз бүрд хэд ногдох вэ?'],['delivery','Ойн хүргэлт','Байшин бүрд тэнцүү хүргэе'],['station','Ойн өртөө','Хэдэн вагон дүүрэх вэ?']];
function Preview({world}:{world:World}){
 const host=useRef<HTMLDivElement>(null),[failed,setFailed]=useState(false);
 useEffect(()=>{if(!host.current)return;let renderer:THREE.WebGLRenderer;try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch{setFailed(true);return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
  host.current.appendChild(renderer.domElement);const scene=new THREE.Scene();scene.background=new THREE.Color(world==='station'?'#d8e3d1':world==='delivery'?'#eae1cd':'#e1e7cc');scene.add(new THREE.HemisphereLight('#fff4dc','#8da175',2));const sun=new THREE.DirectionalLight('#fff7e9',2);sun.position.set(-3,8,6);scene.add(sun);
  const camera=new THREE.OrthographicCamera(-4,4,3,-3,.1,30);camera.position.set(6,9,10);camera.lookAt(0,.6,0);addForest(scene,world,true);
  if(world==='picnic'){for(const [i,x] of [-1.6,1.6].entries()){const r=createAnimal(i?'bear':'rabbit',i);r.root.position.set(x,0,-.5);scene.add(r.root);poseAnimal(r,{state:'idle',time:1,reduced:true});makeBasket(scene,x,1.1);for(let j=0;j<2;j++){const f=makeFood('carrot');f.position.set(x+(j-.5)*.65,.35,1.1);scene.add(f);}}}
  if(world==='delivery'){makeHouse(scene,0,-.7,0).scale.setScalar(1.35);makeBasket(scene,0,1.3);const r=createAnimal('fox',1);r.root.position.set(-2,0,1.15);scene.add(r.root);poseAnimal(r,{state:'carry',time:0,reduced:true});const apple=makeFood('apple');r.socket.add(apple);apple.position.set(0,.1,0);for(let i=0;i<3;i++){const f=makeFood('apple');f.position.set((i-1)*.55,.36,1.3);scene.add(f);}}
  if(world==='station'){const w=makeWagon(scene,3,0,true);w.position.z=.1;for(let i=0;i<3;i++){const r=createAnimal((['rabbit','bear','fox'] as const)[i],i);r.root.scale.setScalar(.7);r.root.position.set((i-1)*1.3,.58,.1);scene.add(r.root);poseAnimal(r,{state:'idle',time:1,reduced:true});}}
  const draw=()=>{const {width,height}=host.current!.getBoundingClientRect();const aspect=width/height;camera.left=-3.7*aspect;camera.right=3.7*aspect;camera.updateProjectionMatrix();renderer.setSize(width,height);renderer.render(scene,camera);};const observer=new ResizeObserver(draw);observer.observe(host.current);draw();return()=>{observer.disconnect();disposeObject(scene);renderer.dispose();renderer.domElement.remove();};
 },[world]);
 return <div ref={host} className={`world-preview ${world}`} aria-hidden="true">{failed&&(world==='station'?<TrainFront size={80}/>:world==='delivery'?<House size={80}/>:<Leaf size={80}/>)}</div>;
}
export default function WorldChooser({onWorld,onStart,onContinue,canContinue}:{onWorld:(w:World)=>void;onStart:()=>void;onContinue:()=>void;canContinue:boolean}){return <><div className="journey-actions"><button className="primary" onClick={onStart}><Play size={19}/>Тоглож эхлэх</button>{canContinue&&<button className="secondary" onClick={onContinue}>Үргэлжлүүлэх</button>}</div><div className="world-grid">{worlds.map(([id,title,description],i)=><button className={`world-card ${id}`} key={id} onClick={()=>onWorld(id)}><Preview world={id}/><div><span className="world-number">0{i+1}</span><h2>{title}</h2><p>{description}</p><span className="world-enter">Хичээлээ сонгох</span></div></button>)}</div></>;}
