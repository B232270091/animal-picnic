import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {counts,poolCount,type Game} from './game';
import {poolName,zoneCount,type Lesson} from './lessons';
import {box,createAnimal,poseAnimal,walkAnimal,makeRoute,personality,type AnimalRig,type Route} from './rig';
import {addForest,disposeObject,makeBasket,makeFood,makeHouse,makeWagon} from './forest';
import {deliveryStage,MotionQueue,smooth} from './motion';
type Point={x:number;y:number};
type Props={game:Game;lesson:Lesson;selected:number|null;onSelect:(n:number|null)=>void;onMove:(n:number,to:number,seat?:number)=>void;reduced:boolean;fast:boolean;showCounts:boolean;epoch:number;reward:boolean;onPending:(ids:number[])=>void};
type Job={item:number;from:THREE.Vector3;to:THREE.Vector3;fromZone:number;toZone:number;elapsed:number;route?:Route;approach?:Route;retreat?:Route;durations?:number[];attached?:boolean;detached?:boolean;dropFrom?:THREE.Vector3};
type Layout={items:Point[];zones:Point[];labels:Point[];seats:Point[][];pool:Point};
const kinds=['rabbit','bear','fox'] as const;
export function forestZones(l:Lesson,mobile:boolean){
 if(l.kind==='delivery')return Array.from({length:l.divisor},(_,i)=>new THREE.Vector3((i-(l.divisor-1)/2)*(mobile?(l.divisor===3?2.9:4.5):5),.16,mobile?-1.25:-.55));
 const cols=mobile?2:3,n=zoneCount(l),rows=Math.ceil(n/cols);
 return Array.from({length:n},(_,i)=>{const inRow=Math.min(cols,n-Math.floor(i/cols)*cols);return new THREE.Vector3((i%cols-(inRow-1)/2)*(mobile?4.65:5.25),.1,Math.floor(i/cols)*(mobile?3.7:3.65)-(mobile?(rows===3?5.5:4.0):3.4));});
}
function waiting(l:Lesson,mobile:boolean,id:number){const cols=mobile?4:6,row=Math.floor(id/cols),rows=Math.ceil(l.total/cols),length=Math.min(cols,l.total-row*cols);return new THREE.Vector3((id%cols-(length-1)/2)*(mobile?1.32:1.28),l.kind==='delivery'?.35:0,(l.kind==='delivery'?(mobile?4.35:4.1):(mobile?6.4:4.4))+(row-(rows-1)/2)*(mobile?1.6:1.5));}
function itemPoints(g:Game,l:Lesson,mobile:boolean,zones:THREE.Vector3[],nudges:number[]){
 const used:Record<number,number>={};return g.locations.map((z,id)=>{if(z<0)return waiting(l,mobile,id);if(l.kind==='train')return zones[z].clone().add(new THREE.Vector3(((g.seats[id]??0)-(l.divisor-1)/2)*1.3+(nudges[z]??0),.47,0));
 const index=used[z]??0;used[z]=index+1;const count=g.locations.filter(n=>n===z).length,cols=count<=4?2:3,rows=Math.ceil(count/cols),row=Math.floor(index/cols),len=Math.min(cols,count-row*cols);return zones[z].clone().setY(.35).add(new THREE.Vector3((index%cols-(len-1)/2)*(mobile?1.15:.86),0,(row-(rows-1)/2)*(mobile?1.55:1.08)));});
}
// Cross the gaps between storage rows, then follow the outside aisle. Never walk
// lengthwise through a column of apples or through a house basket.
function deliveryRoute(a:THREE.Vector3,b:THREE.Vector3){const p=[a.clone().setY(0)];if(a.z>2.4)p.push(new THREE.Vector3(4.6,0,a.z),new THREE.Vector3(4.6,0,1.65));else p.push(new THREE.Vector3(a.x,0,1.65));if(b.z>2.4)p.push(new THREE.Vector3(4.6,0,1.65),new THREE.Vector3(4.6,0,b.z));else p.push(new THREE.Vector3(b.x,0,1.65));p.push(b.clone().setY(0));return makeRoute(p);}
export default function ForestScene(props:Props){
 const host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLDivElement>(null),latest=useRef(props);latest.current=props;
 const [layout,setLayout]=useState<Layout>({items:[],zones:[],labels:[],seats:[],pool:{x:50,y:80}}),[status,setStatus]=useState('loading'),[pending,setPending]=useState<number[]>([]),[hot,setHot]=useState<number|null>(null);
 const engine=useRef<{sync:()=>void;drag:(id:number,x:number,y:number)=>void;release:()=>void}|null>(null);
 const gesture=useRef<{id:number;pointer:number;x:number;y:number;dragged:boolean}|null>(null),suppress=useRef(false);
 const train=props.lesson.kind==='train',c=counts(props.game,props.lesson),frozen=['predict','explain','success'].includes(props.game.phase);
 useEffect(()=>{
  if(!host.current||!canvas.current)return;setStatus('loading');setPending([]);latest.current.onPending([]);
  let renderer:THREE.WebGLRenderer;try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});}catch{setStatus('error');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.35:1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;canvas.current.appendChild(renderer.domElement);
  const scene=new THREE.Scene();scene.background=new THREE.Color(train?'#dce7d2':'#e4e8d4');
  const camera=new THREE.OrthographicCamera(-9,9,6,-6,.1,90);camera.position.set(0,17,12);camera.lookAt(0,0,.95);
  scene.add(new THREE.HemisphereLight('#fff4d9','#779267',2));const sun=new THREE.DirectionalLight('#fff4df',2.3);sun.position.set(-6,13,8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-13,right:13,top:15,bottom:-14});sun.shadow.normalBias=.04;scene.add(sun);
  let world=new THREE.Group();scene.add(world);let foliage:THREE.Group[]=[],items:THREE.Object3D[]=[],animals:AnimalRig[]=[],wagons:THREE.Group[]=[],zones:THREE.Vector3[]=[],nudges:number[]=[],courier:AnimalRig|null=null,mobile=false,targets:THREE.Vector3[]=[],lastGame:Game=latest.current.game;
  const queue=new MotionQueue<Job>();let published='',dragId:number|null=null,dragPoint=new THREE.Vector3(),frame=0,last=0,celebration=0,lastPhase=lastGame.phase;
  const project=(v:THREE.Vector3):Point=>{const p=v.clone().project(camera);return {x:(p.x+1)*50,y:(1-p.y)*50};};
  const publish=()=>{const ids=queue.ids(),key=ids.join(',');if(key!==published){published=key;setPending(ids);latest.current.onPending(ids);}host.current?.setAttribute('data-pending',String(ids.length));};
  const labels=()=>{const l=latest.current.lesson;setLayout({items:targets.map(p=>project(p.clone().add(new THREE.Vector3(0,train?.85:.26,0)))),zones:zones.map(project),labels:zones.map((p,i)=>project(p.clone().add(new THREE.Vector3(nudges[i]??0,0,train?1.36:mobile?2.25:1.8)))),pool:project(new THREE.Vector3(0,.1,train?(mobile?6.4:4.4):(mobile?4.35:4.1))),seats:train?zones.map((p,z)=>Array.from({length:l.divisor},(_,s)=>project(p.clone().add(new THREE.Vector3((s-(l.divisor-1)/2)*1.3+(nudges[z]??0),.51,0))))):[]});};
  const build=()=>{
   queue.clear();published='reset';publish();disposeObject(world);scene.remove(world);world=new THREE.Group();scene.add(world);items=[];animals=[];wagons=[];
   const l=latest.current.lesson,g=latest.current.game;zones=forestZones(l,mobile);nudges=zones.map(()=>0);foliage=addForest(world,train?'station':'delivery',mobile);courier=null;
   if(train){
    zones.forEach((p,i)=>{const wagon=makeWagon(world,l.divisor,i,latest.current.reward);wagon.position.copy(p);wagons.push(wagon);for(const z of [-.65,.65])box(world,'#8a8d77',[mobile?4.9:5.5,.055,.06],[p.x,.025,p.z+z]);for(let k=0;k<7;k++)box(world,'#b09b71',[.12,.055,1.7],[p.x-2.2+k*.72,.015,p.z]);});
    const station=new THREE.Group();station.position.set(mobile?-3.9:-7.6,0,mobile?5:4);box(station,'#a0b592',[.12,1.5,.12],[0,.75,0]);box(station,'#ecdcae',[1.45,.68,.09],[0,1.6,0]);world.add(station);
    const platform=box(world,'#e8d8b7',[mobile?6.4:9,.07,mobile?5.4:4.1],[0,.005,mobile?6.4:4.4]);platform.receiveShadow=true;
   }else{
    zones.forEach((p,i)=>{makeHouse(world,p.x,p.z-2.35,i).scale.setScalar(mobile?.85:1);makeBasket(world,p.x,p.z,latest.current.reward?['#8fb09d','#d5a578','#a4b2c4'][i]:'#c79c65');});
    box(world,'#ba966a',[mobile?5.8:8.5,.19,mobile?4.9:3.9],[0,.08,mobile?4.35:4.1]);box(world,'#ecd5a7',[mobile?5.6:8.3,.04,mobile?4.7:3.7],[0,.2,mobile?4.35:4.1]);
    courier=createAnimal('fox',7);courier.root.scale.setScalar(mobile?.55:.63);courier.root.position.set(4.6,0,6.6);world.add(courier.root);
   }
   targets=itemPoints(g,l,mobile,zones,nudges);targets.forEach((p,i)=>{let mesh:THREE.Object3D;if(train){const rig=createAnimal(kinds[i%3],i);rig.root.scale.setScalar(.58);animals.push(rig);mesh=rig.root;}else mesh=makeFood('apple');mesh.position.copy(p);world.add(mesh);items.push(mesh);});
   lastGame=g;labels();
  };
  const sync=()=>{
   const g=latest.current.game,l=latest.current.lesson;if(g.locations.length!==items.length){build();return;}
   const oldTargets=targets;targets=itemPoints(g,l,mobile,zones,nudges);
   for(let id=0;id<g.locations.length;id++)if(g.locations[id]!==lastGame.locations[id]||g.seats[id]!==lastGame.seats[id]){
    if(latest.current.reduced){world.attach(items[id]);items[id].position.copy(targets[id]);}
    else queue.enqueue({item:id,from:oldTargets[id].clone(),to:targets[id].clone(),fromZone:lastGame.locations[id],toZone:g.locations[id],elapsed:0});
   }
   if(g.phase==='success'&&lastPhase!=='success')celebration=.85;lastPhase=g.phase;lastGame=g;labels();publish();
  };
  const resize=()=>{const rect=host.current!.getBoundingClientRect();mobile=rect.width<600;const width=mobile?10.8:18.6,height=width/(rect.width/rect.height);camera.left=-width/2;camera.right=width/2;camera.top=height/2;camera.bottom=-height/2;camera.updateProjectionMatrix();camera.updateMatrixWorld();renderer.setSize(rect.width,rect.height);sun.shadow.mapSize.set(mobile?512:1024,mobile?512:1024);build();};
  const ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),-.9);
  engine.current={sync,drag:(id,x,y)=>{const rect=host.current!.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((x-rect.left)/rect.width*2-1,1-(y-rect.top)/rect.height*2),camera);ray.ray.intersectPlane(plane,dragPoint);dragId=id;},release:()=>{dragId=null;}};
  const observer=new ResizeObserver(resize);observer.observe(host.current);resize();
  const animate=(ms:number)=>{
   frame=requestAnimationFrame(animate);if(last&&ms-last<30)return;const dt=last?Math.min(.5,(ms-last)/1000):0;last=ms;
   const time=ms/1000,now=latest.current,reduced=now.reduced,quiet=['question','try','restore','explain'].includes(now.game.phase),speed=now.fast?2:1;
   if(reduced&&queue.length){queue.clear();items.forEach((m,i)=>{world.attach(m);m.position.copy(targets[i]);});publish();}
   const ids=new Set(queue.ids()),job=queue.peek();let motion='wait';
   const selectedPoint=now.selected===null?undefined:items[now.selected]?.getWorldPosition(new THREE.Vector3());
   animals.forEach((r,i)=>{if(job?.item!==i)poseAnimal(r,{state:celebration>0?'celebrate':quiet?'wait':now.selected!==null?'attend':'idle',time,progress:1-celebration/.85,reduced,seated:now.game.locations[i]>=0&&!ids.has(i),look:selectedPoint});});
   if(courier)poseAnimal(courier,{state:celebration>0?'celebrate':quiet?'wait':selectedPoint?'attend':'idle',time,progress:1-celebration/.85,reduced,look:selectedPoint});
   if(job&&!reduced){
    job.elapsed+=dt*speed;
    if(train){
      const rig=animals[job.item];
      if(!job.route){const from=job.from.clone(),to=job.to.clone(),exit=from.z+(job.fromZone>=0?1.45:.8),entry=to.z+(job.toZone>=0?1.45:.8),aisle=(from.x<0?-1:1)*(mobile?4.75:8);job.route=makeRoute([from,new THREE.Vector3(from.x,0,exit),new THREE.Vector3(aisle,0,exit),new THREE.Vector3(aisle,0,entry),new THREE.Vector3(to.x,0,entry),to]);}
      const duration=Math.max(.85,Math.min(3.2,job.route.length/6))/personality[rig.kind].pace,p=job.elapsed/duration;
      if(p<.1){motion='attend';poseAnimal(rig,{state:'attend',time,look:job.to});}
      else if(p<.9){motion='walk';walkAnimal(rig,job.route,smooth((p-.1)/.8)*job.route.length,time);}
      else{motion='place';rig.root.position.copy(job.to);rig.root.rotation.y=0;poseAnimal(rig,{state:'place',time,seated:job.toZone>=0,progress:Math.min(1,(p-.9)/.1)});}
      if(p>=1){rig.root.position.copy(targets[job.item]);queue.finish();publish();labels();}
    }else if(courier){
      if(!job.route){const pickup=job.from.clone().setZ(job.fromZone<0?job.from.z+.78:zones[job.fromZone].z+1.7),drop=job.to.clone().setZ(job.toZone<0?job.to.z+.78:zones[job.toZone].z+1.7);job.approach=deliveryRoute(courier.root.position,pickup);job.route=deliveryRoute(pickup,drop);job.retreat=deliveryRoute(drop,new THREE.Vector3(mobile?4.6:7,0,1.65));job.durations=[Math.min(1.15,Math.max(.15,job.approach.length/12)),.30,Math.min(1.65,Math.max(.35,job.route.length/10)),.32,.45];}
      const state=deliveryStage(job.elapsed,job.durations!),item=items[job.item];motion=state.stage;
      if(state.stage==='walk')walkAnimal(courier,job.approach!,smooth(state.progress)*job.approach!.length,time);
      if(state.stage==='pick'){courier.root.position.copy(job.approach!.sample(job.approach!.length));courier.root.rotation.y=Math.PI;poseAnimal(courier,{state:'pick',time,progress:state.progress,look:job.from});const hand=courier.socket.getWorldPosition(new THREE.Vector3());item.position.copy(job.from).lerp(hand,smooth(state.progress));}
      if(state.stage==='carry'){
        walkAnimal(courier,job.route,smooth(state.progress)*job.route.length,time,true);
        if(!job.attached){courier.socket.add(item);item.position.set(0,.14,0);item.scale.setScalar(1/courier.root.scale.x);job.attached=true;}
      }
      if(state.stage==='place'||state.stage==='settle'){
        courier.root.position.copy(job.route.sample(job.route.length));courier.root.rotation.y=Math.PI;poseAnimal(courier,{state:'place',time,progress:state.stage==='place'?state.progress:1,look:job.to});
        if(!job.detached){world.attach(item);job.dropFrom=item.position.clone();item.scale.setScalar(1);job.detached=true;}
        item.position.copy(job.dropFrom!).lerp(job.to,smooth(state.stage==='place'?state.progress:1));
        if(state.stage==='settle')walkAnimal(courier,job.retreat!,smooth(state.progress)*job.retreat!.length,time);
      }
      if(state.done){world.attach(item);item.position.copy(targets[job.item]);item.scale.setScalar(1);queue.finish();publish();}
    }
   }
   host.current?.setAttribute('data-animation-state',motion);
   items.forEach((m,i)=>{if(ids.has(i))return;const target=dragId===i?dragPoint:targets[i];m.position.lerp(target,reduced?1:1-Math.exp(-16*dt));if(train&&dragId===i)poseAnimal(animals[i],{state:'attend',time,reduced});});
   if(train){let changed=false;const cc=counts(now.game,now.lesson);wagons.forEach((w,i)=>{const moving=queue.ids().some(id=>now.game.locations[id]===i);const desired=cc[i]===now.lesson.divisor&&!moving?.18:0;const before=nudges[i];nudges[i]=reduced?desired:THREE.MathUtils.lerp(before,desired,1-Math.exp(-10*dt));w.position.x=zones[i].x+nudges[i];if(Math.abs(before-nudges[i])>.0001)changed=true;});if(changed){targets=itemPoints(now.game,now.lesson,mobile,zones,nudges);labels();}}
   if(celebration>0)celebration=Math.max(0,celebration-dt);
   foliage.forEach((f,i)=>f.rotation.z=reduced||quiet?0:Math.sin(time*.7+i)*.012);
   renderer.render(scene,camera);
  };
  frame=requestAnimationFrame(animate);setStatus('ready');const lost=(e:Event)=>{e.preventDefault();setStatus('error');queue.clear();publish();};renderer.domElement.addEventListener('webglcontextlost',lost);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();queue.clear();engine.current=null;disposeObject(scene);renderer.dispose();renderer.domElement.remove();};
 },[props.lesson.id,props.epoch]);
 useEffect(()=>{engine.current?.sync();},[props.game.locations,props.game.seats,props.game.phase]);
 const hit=(x:number,y:number)=>{const r=host.current!.getBoundingClientRect(),px=(x-r.left)/r.width*100,py=(y-r.top)/r.height*100;if(train){for(let z=0;z<layout.seats.length;z++)for(let s=0;s<layout.seats[z].length;s++){const p=layout.seats[z][s];if(Math.hypot((p.x-px)*r.width/100,(p.y-py)*r.height/100)<30)return {to:z,seat:s};}}else{for(let z=0;z<layout.zones.length;z++){const p=layout.zones[z];if(Math.hypot((p.x-px)*r.width/100,(p.y-py)*r.height/100)<r.width*(r.width<600?.14:.09))return {to:z};}}if(Math.abs(layout.pool.x-px)<30&&Math.abs(layout.pool.y-py)<18)return {to:-1};return null;};
 const choose=(to:number,seat?:number)=>{if(props.selected!==null&&!frozen&&!pending.includes(props.selected))props.onMove(props.selected,to,seat);};
 return <div ref={host} className={`scene forest-scene ${train?'station-scene':'delivery-scene'} ${props.selected!==null?'has-selection':''}`} data-testid="scene" data-pending="0">
  <div ref={canvas} className="webgl" aria-hidden="true"/>
  {status==='loading'&&<div className="scene-status" role="status">{train?'Өртөөг':'Ойн хүргэлтийг'} бэлдэж байна…</div>}
  {status==='error'&&<div className="scene-status"><b>3D дүрслэл нээгдсэнгүй.</b><p>Доорх «Товчлуураар тоглох» хэсгээр үргэлжлүүлж болно.</p></div>}
  <span className="scene-note">{train?'ОЙН ӨРТӨӨ':'ОЙН ХҮРГЭЛТ'}</span>
  {status==='ready'&&<>
   {!train&&layout.zones.map((p,z)=><button key={z} data-testid={`zone-${z}`} className={`drop-zone ${hot===z?'hot':''}`} aria-label={`${z+1}-р байшинд хүргэх`} style={{left:`${p.x}%`,top:`${p.y}%`}} disabled={frozen} onClick={()=>choose(z)}/>)}
   {train&&layout.seats.map((row,z)=>row.map((p,s)=>{const occupant=props.game.locations.findIndex((n,i)=>n===z&&props.game.seats[i]===s);return <button className={`seat-control ${occupant>=0?'occupied':''} ${hot===z?'hot':''}`} key={`${z}-${s}`} style={{left:`${p.x}%`,top:`${p.y}%`}} data-testid={`seat-${z}-${s}`} disabled={frozen||occupant>=0} onClick={()=>choose(z,s)} aria-label={`${z+1}-р вагон, ${s+1}-р суудал${occupant>=0?', эзэнтэй':', хоосон'}`}>{occupant<0?<span>{s+1}</span>:null}</button>}))}
   {layout.labels.map((p,z)=><button key={z} data-testid={`plate-${z}`} className={`plate-label ${train&&c[z]===props.lesson.divisor?'full-wagon':''}`} style={{left:`${p.x}%`,top:`${p.y}%`}} disabled={frozen} onClick={()=>choose(z)} aria-label={`${z+1}-р ${train?'вагон':'байшин'}${props.showCounts?`, ${c[z]}`:''}`}><span>{z+1}-р {train?'вагон':'байшин'}{train&&c[z]===props.lesson.divisor&&!pending.some(i=>props.game.locations[i]===z)&&<small>✓ Дүүрлээ</small>}</span>{props.showCounts&&<b>{c[z]}</b>}</button>)}
   {layout.items.map((p,id)=><button key={id} data-testid={`item-${id}`} data-moving={pending.includes(id)} className={`food-handle ${train?'animal-handle':''} ${props.selected===id?'selected':''}`} style={{left:`${p.x}%`,top:`${p.y}%`}} disabled={frozen||pending.includes(id)} aria-label={`${id+1}-р ${train?'амьтан':'алим'}, ${props.game.locations[id]<0?poolName(props.lesson):`${props.game.locations[id]+1}-р ${train?'вагонд':'байшинд'}`}`}
    onPointerDown={e=>{if(e.button!==0||gesture.current)return;gesture.current={id,pointer:e.pointerId,x:e.clientX,y:e.clientY,dragged:false};e.currentTarget.setPointerCapture(e.pointerId);}}
    onPointerMove={e=>{const g=gesture.current;if(!g||g.pointer!==e.pointerId)return;if(Math.hypot(e.clientX-g.x,e.clientY-g.y)>7)g.dragged=true;if(g.dragged){props.onSelect(id);engine.current?.drag(id,e.clientX,e.clientY);setHot(hit(e.clientX,e.clientY)?.to??null);}}}
    onPointerUp={e=>{const g=gesture.current;if(!g||g.pointer!==e.pointerId)return;gesture.current=null;engine.current?.release();setHot(null);if(g.dragged){suppress.current=true;setTimeout(()=>suppress.current=false,0);const dest=hit(e.clientX,e.clientY);if(dest)props.onMove(id,dest.to,dest.seat);else props.onSelect(null);}}}
    onPointerCancel={()=>{gesture.current=null;engine.current?.release();setHot(null);props.onSelect(null);}}
    onClick={()=>{if(suppress.current)return;props.onSelect(props.selected===id?null:id);}}><span className="sr-only">Сонгох</span></button>)}
   <button className="pool-label" data-testid="plate--1" style={{left:`${layout.pool.x}%`,top:`${layout.pool.y+(train?16:18)}%`}} disabled={frozen} onClick={()=>choose(-1)}>{poolName(props.lesson)}{props.showCounts&&<b>{poolCount(props.game)}</b>}</button>
  </>}
  <div className="scene-bottom"><span>{train?`Вагон бүрд ${props.lesson.divisor} суудал`:'Алимыг бүтнээр нь хүргэнэ'}</span><span role="status">{pending.length?`${train?'Алхаж':'Хүргэж'} байна · ${pending.length}`:train?'Бүх амьтан хамтдаа':'Очих газрыг чи сонгоно'}</span></div>
 </div>;
}
