import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import type {Lesson} from './lessons';
import {zoneCount} from './lessons';
import {counts,poolCount,type Game} from './game';
import {createAnimal,poseAnimal,type AnimalRig} from './rig';

type Point={x:number;y:number};
type Props={game:Game;lesson:Lesson;selected:number|null;onSelect:(id:number|null)=>void;onMove:(id:number,to:number)=>void;reduced:boolean;flowers:boolean;mat:boolean;disabled?:boolean;showCounts?:boolean};
const palette=['#f1c777','#d59879','#b5bf94','#e8ae95','#a3bac9','#c4abd0'];
const animalNames={rabbit:'Туулай',bear:'Бамбарууш',fox:'Үнэг'};
export function zonePositions(l:Lesson,mobile:boolean):THREE.Vector3[]{
  const n=zoneCount(l);
  if(l.kind==='group')return Array.from({length:n},(_,i)=>new THREE.Vector3((i%3-1)*(mobile?2.8:3.7),.18,Math.floor(i/3)*(mobile?3.2:2.5)-(mobile?3.8:2.7)));
  return Array.from({length:n},(_,i)=>new THREE.Vector3((i-(n-1)/2)*(mobile?(n===3?2.8:4.4):4.7),.18,mobile?-1.5:-.65));
}
function foodPositions(g:Game,l:Lesson,mobile:boolean){
  const zones=zonePositions(l,mobile),seen:Record<number,number>={};
  return g.locations.map(loc=>{
    const index=seen[loc]??0;seen[loc]=index+1;
    const n=g.locations.filter(v=>v===loc).length;
    const cols=loc===-1?(mobile?4:6):n<=4?2:3;
    const rows=Math.ceil(n/cols),row=Math.floor(index/cols);
    const rowLength=Math.min(cols,n-row*cols);
    const base=loc===-1?new THREE.Vector3(0,.35,mobile?4:3.2):zones[loc].clone().setY(.39);
    const gap=mobile?(loc===-1?1.28:1.18):(loc===-1?1.04:.65);
    const rowGap=mobile?1.62:.82;
    return base.add(new THREE.Vector3((index%cols-(rowLength-1)/2)*gap,0,(row-(rows-1)/2)*rowGap));
  });
}
function material(color:string){return new THREE.MeshStandardMaterial({color,roughness:.83});}
function sphere(parent:THREE.Object3D,color:string,scale:[number,number,number],position:[number,number,number]){
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),material(color));mesh.scale.set(...scale);mesh.position.set(...position);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function cylinder(parent:THREE.Object3D,color:string,r1:number,r2:number,height:number,position:[number,number,number]){
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,height,36),material(color));mesh.position.set(...position);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function food(kind:string){
  const g=new THREE.Group();
  if(kind==='carrot'){
    const body=new THREE.Mesh(new THREE.ConeGeometry(.19,.74,16),material('#ef8e32'));body.rotation.z=Math.PI;body.position.y=.19;g.add(body);
    for(let i=0;i<3;i++){const leaf=sphere(g,['#5c9541','#719e4c','#3e7139'][i],[.055,.21,.06],[(i-1)*.06,.66,0]);leaf.rotation.z=(i-1)*.45;}
    g.rotation.x=-1.35;g.rotation.y=-.35;
  }else{
    sphere(g,'#e97859',[.245,.25,.23],[0,.2,0]);sphere(g,'#ec8a62',[.17,.21,.19],[-.095,.22,.035]);
    const stem=cylinder(g,'#715c3f',.025,.03,.16,[0,.49,0]);stem.rotation.z=-.2;
    const leaf=sphere(g,'#628443',[.15,.045,.075],[.11,.49,.01]);leaf.rotation.z=.3;
  }
  return g;
}
function tree(scene:THREE.Scene,x:number,z:number,scale:number){
  const g=new THREE.Group();cylinder(g,'#b8996f',.15,.23,2.2,[0,1,0]);
  sphere(g,'#779957',[1.05,1.3,.9],[0,2.6,0]);sphere(g,'#8fab65',[.85,.9,.8],[-.6,2.1,.15]);sphere(g,'#96ad70',[.77,1,.75],[.5,2.2,.05]);g.position.set(x,0,z);g.scale.setScalar(scale);scene.add(g);
}
export default function Scene(props:Props){
  const host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLDivElement>(null),latest=useRef(props);latest.current=props;
  const [layout,setLayout]=useState<{items:Point[];zones:Point[];pool:Point;labels:Point[]}>({items:[],zones:[],pool:{x:50,y:75},labels:[]});
  const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading');
  const [hot,setHot]=useState<number|null>(null);
  const api=useRef<{update:()=>void;drag:(id:number,x:number,y:number)=>void;release:()=>void}|null>(null);
  const gesture=useRef<{id:number;x:number;y:number;dragged:boolean;pointer:number}|null>(null);
  const clickBlocked=useRef(false);
  useEffect(()=>{
    if(!canvas.current||!host.current)return;
    let renderer:THREE.WebGLRenderer;
    try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch{setStatus('error');return;}
    const scene=new THREE.Scene();scene.background=new THREE.Color('#e5ebd3');scene.fog=new THREE.Fog('#e5ebd3',26,53);
    const camera=new THREE.OrthographicCamera(-8,8,5,-5,.1,80);camera.position.set(0,13,11);camera.lookAt(0,0,0);
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.setClearColor('#e5ebd3');canvas.current.appendChild(renderer.domElement);
    const ambient=new THREE.HemisphereLight('#fff8e5','#73895c',2);scene.add(ambient);
    const sun=new THREE.DirectionalLight('#fff2d9',2.2);sun.position.set(-5,12,7);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12});sun.shadow.normalBias=.035;scene.add(sun);
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(90,90),material('#d4dfb8'));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;ground.position.y=-.12;scene.add(ground);
    const rug=new THREE.Mesh(new THREE.BoxGeometry(15,.08,9.9),material(latest.current.mat?'#cbd29c':'#f0dfb9'));rug.position.set(0,-.04,1.2);rug.receiveShadow=true;scene.add(rug);
    const border=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(14.7,.03,9.6)),new THREE.LineBasicMaterial({color:'#d1b590'}));border.position.set(0,.02,1.2);scene.add(border);
    for(const x of [-10,-8.5,8.7,11])tree(scene,x,-5.8,1+(Math.abs(x)%2)*.23);
    for(let i=0;i<12;i++){const x=Math.sin(i*2.8)*10,z=-5+Math.cos(i*1.8)*2;if(Math.abs(x)<5)continue;sphere(scene,'#b1c28d',[.6,.3,.45],[x,.1,z]);}
    if(latest.current.flowers)for(const x of [-6.7,6.8])for(let i=0;i<4;i++){const z=-1+i*1.1;for(let p=0;p<5;p++)sphere(scene,'#f6d37c',[.12,.04,.12],[x+Math.cos(p*1.26)*.13,.09,z+Math.sin(p*1.26)*.13]);sphere(scene,'#d09540',[.07,.06,.07],[x,.12,z]);}
    const interactive=new THREE.Group();scene.add(interactive);let itemMeshes:THREE.Group[]=[],targets:THREE.Vector3[]=[],rings:THREE.Mesh[]=[],friends:AnimalRig[]=[],mobile=false,dragId:number|null=null,dragPoint=new THREE.Vector3();let frame=0;let previousLocations=[...latest.current.game.locations],reactions:number[]=[],celebrate=0,previousPhase=latest.current.game.phase;
    const project=(v:THREE.Vector3):Point=>{const p=v.clone().project(camera);return {x:(p.x+1)*50,y:(1-p.y)*50};};
    const dispose=(obj:THREE.Object3D)=>obj.traverse(child=>{const m=child as THREE.Mesh;if(m.geometry)m.geometry.dispose();if(m.material)(Array.isArray(m.material)?m.material:[m.material]).forEach(mat=>mat.dispose());});
    const build=()=>{
      dispose(interactive);interactive.clear();rings=[];itemMeshes=[];friends=[];
      const {game:g,lesson:l}=latest.current,positions=zonePositions(l,mobile);
      positions.forEach((pos,i)=>{
        const plate=new THREE.Group();plate.position.copy(pos);interactive.add(plate);
        if(l.kind==='group'){
          cylinder(plate,'#b58854',1.25,1.15,.23,[0,0,0]);cylinder(plate,'#e3bc82',1.13,1.13,.24,[0,.035,0]);
          for(let k=0;k<2;k++){const ring=new THREE.Mesh(new THREE.TorusGeometry(1.23,.045,6,40),material('#986e46'));ring.rotation.x=Math.PI/2;ring.position.y=.05+k*.10;plate.add(ring);}
        }else {
          cylinder(plate,palette[i],1.48,1.30,.14,[0,0,0]);cylinder(plate,'#fff5dd',1.32,1.29,.08,[0,.08,0]);
          const friend=createAnimal(l.animals[i],i);friend.root.position.set(pos.x,0,pos.z-1.75);if(mobile&&positions.length===3)friend.root.scale.setScalar(.85);interactive.add(friend.root);friends.push(friend);
        }
        const ring=new THREE.Mesh(new THREE.TorusGeometry(l.kind==='group'?1.35:1.57,.055,6,48),material('#5c8350'));ring.rotation.x=Math.PI/2;ring.position.set(pos.x,.27,pos.z);ring.visible=false;rings.push(ring);interactive.add(ring);
      });
      const tray=new THREE.Mesh(new THREE.BoxGeometry(mobile?5.7:7,.18,mobile?4.8:2.65),material('#c89b6c'));tray.position.set(0,.08,mobile?4:3.2);tray.receiveShadow=true;interactive.add(tray);
      const trayTop=new THREE.Mesh(new THREE.BoxGeometry(mobile?5.45:6.75,.04,mobile?4.55:2.4),material('#ebca91'));trayTop.position.set(0,.185,mobile?4:3.2);interactive.add(trayTop);
      targets=foodPositions(g,l,mobile);targets.forEach(p=>{const m=food(l.food);m.position.copy(p);itemMeshes.push(m);interactive.add(m);});
      update();
    };
    const update=()=>{
      const {game:g,lesson:l}=latest.current;
      if(itemMeshes.length!==g.locations.length){build();return;}
      targets=foodPositions(g,l,mobile);
      g.locations.forEach((z,i)=>{if(z>=0&&previousLocations[i]!==z)reactions[z]=.7;});previousLocations=[...g.locations];
      const pos=zonePositions(l,mobile);
      setLayout({items:targets.map(p=>project(p.clone().add(new THREE.Vector3(0,.28,0)))),zones:pos.map(project),pool:project(new THREE.Vector3(0,.2,mobile?4:3.2)),labels:pos.map(p=>project(p.clone().add(new THREE.Vector3(0,0,1.35))))});
    };
    const resize=()=>{
      const rect=host.current!.getBoundingClientRect();mobile=rect.width<600;const w=mobile?10.2:17.5,h=w/Math.max(.5,rect.width/rect.height);camera.left=-w/2;camera.right=w/2;camera.top=h/2;camera.bottom=-h/2;camera.updateProjectionMatrix();camera.updateMatrixWorld();renderer.setSize(rect.width,rect.height);build();
    };
    const ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),-.8);
    api.current={update,drag:(id,x,y)=>{const rect=host.current!.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((x-rect.left)/rect.width*2-1,1-(y-rect.top)/rect.height*2),camera);ray.ray.intersectPlane(plane,dragPoint);dragId=id;},release:()=>{dragId=null;}};
    const observer=new ResizeObserver(resize);observer.observe(host.current);resize();
    let last=0;const animate=(time:number)=>{
      frame=requestAnimationFrame(animate);if(time-last<30)return;const dt=last?Math.min(.5,(time-last)/1000):0;last=time;
      const {selected,reduced,game}=latest.current;
      itemMeshes.forEach((m,i)=>{const target=dragId===i?dragPoint:targets[i].clone().add(new THREE.Vector3(0,selected===i?.23:0,0));if(reduced)m.position.copy(target);else m.position.lerp(target,1-Math.exp(-12*dt));m.scale.setScalar(selected===i?1.18:1);});
      if(game.phase==='success'&&previousPhase!=='success')celebrate=.85;previousPhase=game.phase;
      friends.forEach((r,i)=>{const react=reactions[i]??0,quiet=['question','try','restore','explain'].includes(game.phase);const point=selected===null?undefined:itemMeshes[selected]?.position;
        poseAnimal(r,{state:celebrate>0?'celebrate':react>0?'pick':quiet?'wait':point?'attend':'idle',time:time/1000,progress:celebrate>0?1-celebrate/.85:1-react/.7,reduced,look:point??(react>0?zonePositions(latest.current.lesson,mobile)[i]:undefined)});reactions[i]=Math.max(0,react-dt);});celebrate=Math.max(0,celebrate-dt);
      rings.forEach(r=>r.visible=selected!==null);
      if(game.phase==='explain')itemMeshes.forEach((m,i)=>{if(game.locations[i]===-1)m.scale.setScalar(reduced?1.25:1.2+Math.sin(time*.004)*.1);});
      renderer.render(scene,camera);
    };frame=requestAnimationFrame(animate);setStatus('ready');
    const contextLost=(event:Event)=>{event.preventDefault();setStatus('error');};renderer.domElement.addEventListener('webglcontextlost',contextLost);
    return()=>{cancelAnimationFrame(frame);observer.disconnect();api.current=null;dispose(scene);renderer.dispose();renderer.domElement.remove();};
  },[props.lesson.id,props.flowers,props.mat]);
  useEffect(()=>{api.current?.update();},[props.game.locations]);
  const toZone=(x:number,y:number):number|null=>{
    const rect=host.current!.getBoundingClientRect(),px=(x-rect.left)/rect.width*100,py=(y-rect.top)/rect.height*100;
    const candidates=[...layout.zones.map((p,i)=>({...p,id:i})),{...layout.pool,id:-1}];
    const width=rect.width<600?27:18;
    return candidates.filter(p=>Math.abs(p.x-px)<(p.id===-1?width:width*.52)&&Math.abs(p.y-py)<(rect.width<600?(p.id===-1?18:10):12)).sort((a,b)=>Math.hypot(a.x-px,a.y-py)-Math.hypot(b.x-px,b.y-py))[0]?.id??null;
  };
  const c=counts(props.game,props.lesson);const blocked=props.disabled||['predict','success','explain'].includes(props.game.phase);
  return <div className={`scene ${props.selected!==null?'has-selection':''}`} ref={host} data-testid="scene">
    <div className="webgl" ref={canvas} aria-hidden="true"/>
    {status==='loading'&&<div className="scene-status" role="status">Пикникийн талбайгаа бэлдэж байна…</div>}
    {status==='error'&&<div className="scene-status error"><strong>3D дүрслэл нээгдсэнгүй.</strong><span>Таны хөтөч WebGL дэмжихгүй байна. Доорх «Товчлуураар тоглох» хэсгээр үргэлжлүүлж болно.</span></div>}
    <span className="scene-note">{props.lesson.kind==='group'?'САГСНУУДАА ДҮҮРГЭЕ':'МАНАЙ ПИКНИК'}</span>
    {status==='ready'&&<div className="scene-controls">
      {[...layout.zones.map((p,i)=>({...p,id:i})),{...layout.pool,id:-1}].map(p=><button key={p.id} className={`drop-zone ${p.id===-1?'pool-zone':''} ${hot===p.id?'hot':''}`} style={{left:`${p.x}%`,top:`${p.y}%`}} onClick={()=>{if(props.selected!==null&&!blocked)props.onMove(props.selected,p.id);}} disabled={blocked} aria-label={p.id===-1?'Төв тавцанд буцаах':`${props.lesson.kind==='group'?'Сагс':'Таваг'} ${p.id+1}: ${c[p.id]} зүйл. Сонгосон зүйлийг энд тавих`} data-testid={`zone-${p.id}`}/>)}
      {layout.labels.map((p,i)=><button className="plate-label" data-testid={`plate-${i}`} key={i} disabled={blocked} onClick={()=>props.selected!==null&&props.onMove(props.selected,i)} style={{left:`${p.x}%`,top:`${p.y}%`}} aria-label={`${i+1}-р ${props.lesson.kind==='group'?'сагс':'таваг'}т тавих${props.showCounts!==false?`, ${c[i]} зүйлтэй`:''}`}>{props.lesson.kind==='group'?`${i+1}-р сагс`:animalNames[props.lesson.animals[i]]} {props.showCounts!==false&&<b>{c[i]}</b>}</button>)}
      {layout.items.map((p,i)=><button key={i} aria-label={`${i+1}-р ${props.lesson.food==='carrot'?'лууван':'алим'}, ${props.game.locations[i]===-1?'төв тавцанд':`${props.game.locations[i]+1}-р ${props.lesson.kind==='group'?'сагсанд':'тавагт'}`}`} data-testid={`item-${i}`} className={`food-handle ${props.selected===i?'selected':''}`} style={{left:`${p.x}%`,top:`${p.y}%`}} disabled={blocked}
        onPointerDown={e=>{if(e.button!==0||gesture.current)return;gesture.current={id:i,x:e.clientX,y:e.clientY,dragged:false,pointer:e.pointerId};e.currentTarget.setPointerCapture(e.pointerId);}}
        onPointerMove={e=>{const g=gesture.current;if(!g||g.pointer!==e.pointerId)return;if(Math.hypot(e.clientX-g.x,e.clientY-g.y)>7)g.dragged=true;if(g.dragged){props.onSelect(i);api.current?.drag(i,e.clientX,e.clientY);setHot(toZone(e.clientX,e.clientY));}}}
        onPointerUp={e=>{const g=gesture.current;if(!g||g.pointer!==e.pointerId)return;gesture.current=null;api.current?.release();setHot(null);if(g.dragged){clickBlocked.current=true;setTimeout(()=>{clickBlocked.current=false;},0);const to=toZone(e.clientX,e.clientY);if(to!==null)props.onMove(i,to);else props.onSelect(null);} }}
        onPointerCancel={()=>{gesture.current=null;api.current?.release();setHot(null);props.onSelect(null);}}
        onClick={()=>{if(clickBlocked.current){clickBlocked.current=false;return;}if(props.selected!==null&&props.game.locations[props.selected]!==props.game.locations[i])props.onMove(props.selected,props.game.locations[i]);else props.onSelect(props.selected===i?null:i);}}><span className="sr-only">Сонгох</span></button>)}
    </div>}
    <button className="pool-label" data-testid="plate--1" disabled={blocked} onClick={()=>props.selected!==null&&props.onMove(props.selected,-1)} style={{left:`${layout.pool.x}%`,top:`${layout.pool.y+13}%`}}>Төв тавцанд {props.showCounts!==false&&<b>{poolCount(props.game)}</b>}</button>
    <div className="scene-bottom"><span>✦ Хоолыг бүтнээр нь өгнө</span><span>{props.game.locations.length} {props.lesson.food==='carrot'?'лууван':'алим'} · {props.lesson.kind==='group'?`сагс бүрд ${props.lesson.divisor}`:`${props.lesson.divisor} найз`}</span></div>
  </div>;
}
