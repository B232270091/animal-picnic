import * as THREE from 'three';
export type AnimalKind='rabbit'|'bear'|'fox';
export type AnimalState='idle'|'attend'|'walk'|'pick'|'carry'|'place'|'wait'|'celebrate';
const UP=new THREE.Vector3(0,1,0);
export const clay=(color:string)=>new THREE.MeshStandardMaterial({color,roughness:.78,metalness:0});
export function ball(parent:THREE.Object3D,color:string,size:[number,number,number],at:[number,number,number]){const m=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),clay(color));m.scale.set(...size);m.position.set(...at);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
export function box(parent:THREE.Object3D,color:string,size:[number,number,number],at:[number,number,number]){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),clay(color));m.position.set(...at);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
export function tube(parent:THREE.Object3D,color:string,r:number,height:number,at:[number,number,number],rBottom=r){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,rBottom,height,24),clay(color));m.position.set(...at);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function joint(parent:THREE.Object3D,x:number,y:number,z:number){const j=new THREE.Bone();j.position.set(x,y,z);parent.add(j);return j;}
export interface Leg {hip:THREE.Bone;knee:THREE.Bone;ankle:THREE.Bone;side:number}
export interface AnimalRig {root:THREE.Group;torso:THREE.Bone;head:THREE.Bone;ears:THREE.Bone[];tail:THREE.Bone;eyes:THREE.Group[];arms:THREE.Bone[];elbows:THREE.Bone[];legs:Leg[];socket:THREE.Bone;kind:AnimalKind;seed:number;state:AnimalState}
export function createAnimal(kind:AnimalKind,seed=0):AnimalRig{
 const root=new THREE.Group(),torso=joint(root,0,.9,0),head=joint(torso,0,.77,.025);
 const fur=kind==='rabbit'?'#f2e6d2':kind==='bear'?'#a97043':'#d67d3e',cream=kind==='bear'?'#deb784':'#fff0d5';
 const wide=kind==='bear'?1.13:kind==='fox'?.87:1;
 ball(torso,fur,[.49*wide,.57,.37],[0,0,0]);ball(torso,cream,[.34*wide,.37,.10],[0,-.02,.34]);
 ball(head,fur,[.57*wide,.52,.45],[0,.03,0]);
 if(kind==='fox'){for(const s of [-1,1])ball(head,cream,[.29,.25,.17],[s*.22,-.15,.33]);}
 else ball(head,cream,[.31,.19,.13],[0,-.18,.39]);
 const ears:THREE.Bone[]=[],eyes:THREE.Group[]=[],arms:THREE.Bone[]=[],elbows:THREE.Bone[]=[],legs:Leg[]=[];
 let socket:THREE.Bone|undefined;
 for(const s of [-1,1]){
   const ear=joint(head,s*.32,.44,-.06);ear.rotation.z=-s*.12;ears.push(ear);
   if(kind==='rabbit'){ball(ear,fur,[.16,.58,.13],[0,.42,0]);ball(ear,'#dda99c',[.077,.40,.035],[0,.46,.115]);}
   else if(kind==='bear'){ball(ear,fur,[.24,.25,.15],[s*.09,.02,0]);ball(ear,'#cc9972',[.125,.13,.04],[s*.09,.035,.137]);}
   else{const m=new THREE.Mesh(new THREE.ConeGeometry(.24,.55,3),clay(fur));m.position.set(s*.04,.16,0);m.rotation.y=Math.PI/2;ear.add(m);const inner=new THREE.Mesh(new THREE.ConeGeometry(.13,.31,3),clay('#efc5a4'));inner.rotation.y=Math.PI/2;inner.position.set(s*.04,.15,.07);ear.add(inner);}
   const eye=new THREE.Group();eye.position.set(s*.205,.07,.408);head.add(eye);eyes.push(eye);
   ball(eye,'#fff9eb',[.1,.12,.048],[0,0,0]);ball(eye,'#352b22',[.071,.095,.044],[0,-.01,.035]);ball(eye,'#ffffff',[.022,.029,.015],[-.022,.025,.076]);
   ball(head,'#dc9b86',[.09,.045,.023],[s*.34,-.14,.351]);
   const shoulder=joint(torso,s*.44*wide,.25,.03),elbow=joint(shoulder,0,-.29,0);arms.push(shoulder);elbows.push(elbow);
   ball(shoulder,fur,[.145,.22,.145],[0,-.14,0]);ball(elbow,fur,[.14,.20,.14],[0,-.10,0]);const wrist=joint(elbow,0,-.25,.025);ball(wrist,fur,[.17,.145,.17],[0,0,.01]);ball(wrist,cream,[.09,.055,.06],[0,-.10,.1]);
   if(s===-1)socket=joint(wrist,.12,.1,.10);
   const hip=joint(root,s*.24*wide,.72,0),knee=joint(hip,0,-.35,0),ankle=joint(knee,0,-.34,0);
   ball(hip,fur,[.20,.24,.2],[0,-.14,0]);ball(knee,fur,[.17,.22,.17],[0,-.13,0]);ball(ankle,fur,[.20,.12,.30],[0,.025,.13]);ball(ankle,cream,[.12,.032,.16],[0,-.065,.16]);legs.push({hip,knee,ankle,side:s});
 }
 ball(head,kind==='rabbit'?'#b77973':'#39291f',[.066,.046,.049],[0,-.19,.514]);
 const smile=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.11,-.28,.433),new THREE.Vector3(0,-.315,.465),new THREE.Vector3(.11,-.28,.433)]),new THREE.LineBasicMaterial({color:'#73503d'}));head.add(smile);
 const tail=joint(torso,kind==='fox'?.25:0,-.22,-.3);
 if(kind==='fox'){const base=ball(tail,fur,[.23,.28,.55],[.3,.05,-.30]);base.rotation.y=-.65;ball(tail,cream,[.2,.23,.28],[.62,.11,-.61]);}else ball(tail,kind==='rabbit'?cream:fur,kind==='rabbit'?[.24,.24,.24]:[.16,.17,.16],[0,0,-.12]);
 const scarf=['#71949a','#d99759','#728d53'][kind==='rabbit'?0:kind==='bear'?1:2];tube(torso,scarf,.43,.10,[0,.42,0]);const tie=box(torso,scarf,[.13,.32,.08],[.16,.23,.37]);tie.rotation.z=-.2;
 root.userData.animalKind=kind;
 return {root,torso,head,ears,tail,eyes,arms,elbows,legs,socket:socket!,kind,seed,state:'idle'};
}
export const personality={rabbit:{pace:1.12,stride:.59,bob:.028},bear:{pace:.84,stride:.48,bob:.016},fox:{pace:1.03,stride:.64,bob:.022}};
export interface RigPose {state:AnimalState;time:number;progress?:number;reduced?:boolean;seated?:boolean;look?:THREE.Vector3;feet?:[THREE.Vector3,THREE.Vector3]}
export function poseAnimal(r:AnimalRig,{state,time,progress=0,reduced=false,seated=false,look,feet}:RigPose){
 r.state=state;r.root.userData.motionState=state;
 const p=personality[r.kind],wave=reduced?0:Math.sin(time*2.2+r.seed),quiet=state==='wait'||state==='pick'||state==='place';
 r.torso.position.y=(seated?.66:.9)+(quiet?0:wave*.013);r.torso.scale.set(1,1+(quiet?0:wave*.01),1);
 r.torso.rotation.set(0,0,0);r.head.rotation.set(0,0,0);
 const blink=reduced?1:((time+r.seed*1.77)%4.9>.12?1:.09);r.eyes.forEach(e=>e.scale.y=blink);
 r.ears.forEach((e,i)=>{e.rotation.z=(i===0?1:-1)*(.12+(!quiet&&!reduced?.045*Math.sin(time*1.5+r.seed+i):0));e.rotation.x=0;});
 r.tail.rotation.y=reduced?0:Math.sin(time*(r.kind==='fox'?2:1.4)+r.seed-.5)*(r.kind==='fox'?.23:.08);
 r.arms.forEach((a,i)=>{a.rotation.set(0,0,(i===0?-1:1)*.11);r.elbows[i].rotation.x=0;});
 if(look){r.root.updateWorldMatrix(true,false);const local=r.root.worldToLocal(look.clone());r.head.rotation.y=THREE.MathUtils.clamp(Math.atan2(local.x,local.z),-.55,.55);r.head.rotation.x=THREE.MathUtils.clamp((1.6-local.y)*.18,-.22,.32);}
 const walk=state==='walk'||state==='carry';
 if(walk&&!reduced){r.torso.rotation.z=wave*.04;r.torso.rotation.x=.05;r.arms.forEach((a,i)=>a.rotation.x=Math.sin(time*9*p.pace+i*Math.PI)*.43);}
 if(state==='pick'||state==='place'){const reach=Math.sin(progress*Math.PI);r.torso.rotation.x=reach*.25;r.head.rotation.x=reach*.22;r.arms.forEach((a,i)=>{a.rotation.x=-reach*1.18;a.rotation.z=(i===0?-1:1)*.15;r.elbows[i].rotation.x=-reach*.3;});}
 if(state==='carry'){r.arms.forEach((a,i)=>{a.rotation.x=-1.02;a.rotation.z=(i===0?1:-1)*.22;r.elbows[i].rotation.x=-.34;});}
 if(state==='celebrate'&&!reduced){const settle=Math.sin(Math.min(1,progress)*Math.PI);r.torso.position.y+=Math.abs(Math.sin(progress*Math.PI*2))*p.bob*3;r.arms.forEach((a,i)=>{a.rotation.x=-.8*settle;a.rotation.z=(i===0?1:-1)*(.4+Math.sin(progress*Math.PI*6)*.2)*settle;});r.head.rotation.z=Math.sin(progress*Math.PI*2)*.1;}
 r.legs.forEach((leg,i)=>{
   leg.hip.position.y=seated?.46:.72;
   const target=feet?.[i]??new THREE.Vector3(leg.hip.position.x,.10,seated?.42:.05);
   const dy=leg.hip.position.y-target.y,dx=target.x-leg.hip.position.x,dz=target.z,forward=Math.hypot(dx,dz)*(dz<0?-1:1),dist=Math.min(.688,Math.max(.12,Math.hypot(dy,forward))),l1=.35,l2=.34;
   const a=Math.acos(THREE.MathUtils.clamp((l1*l1+dist*dist-l2*l2)/(2*l1*dist),-1,1));
   const knee=Math.PI-Math.acos(THREE.MathUtils.clamp((l1*l1+l2*l2-dist*dist)/(2*l1*l2),-1,1));
   leg.hip.rotation.set(-(Math.atan2(forward,dy)+a),Math.atan2(dx*(dz<0?-1:1),Math.abs(dz)),0,'YXZ');leg.knee.rotation.x=knee;leg.ankle.rotation.x=-leg.hip.rotation.x-knee;
 });
}
export interface Route {length:number;sample:(distance:number)=>THREE.Vector3;tangent:(distance:number)=>THREE.Vector3}
export function makeRoute(points:THREE.Vector3[]):Route{
 const lengths=points.slice(1).map((p,i)=>p.distanceTo(points[i])),length=lengths.reduce((a,b)=>a+b,0);
 const sample=(d:number)=>{let rest=THREE.MathUtils.clamp(d,0,length);for(let i=0;i<lengths.length;i++){if(rest<=lengths[i]||i===lengths.length-1)return points[i].clone().lerp(points[i+1],lengths[i]?rest/lengths[i]:1);rest-=lengths[i];}return points[0].clone();};
 return {length,sample,tangent:d=>{const a=sample(Math.max(0,d-.025)),b=sample(Math.min(length,d+.025));return b.sub(a).normalize();}};
}
// During stance, each paw samples a fixed world-space distance on the route.
// Only swing paws move forward. This avoids sliding even with variable frame rates.
export function walkAnimal(r:AnimalRig,route:Route,distance:number,time:number,carrying=false,reduced=false){
 r.root.position.copy(route.sample(distance));const tangent=route.tangent(distance);if(tangent.lengthSq()>0)r.root.rotation.y=Math.atan2(tangent.x,tangent.z);
 r.root.updateMatrixWorld(true);const stride=personality[r.kind].stride*r.root.scale.x;
 const feet=r.legs.map((leg,i)=>{const offset=i*.5,phase=distance/stride+offset,cycle=Math.floor(phase),f=phase-cycle;
   const plant=(cycle-offset+.3)*stride;
   const swing=f<.6?0:(f-.6)/.4;
   const anchor=route.sample(plant+(swing?swing*swing*(3-2*swing)*stride:0));const side=new THREE.Vector3().crossVectors(UP,route.tangent(Math.max(0,plant))).multiplyScalar(leg.side*.24*r.root.scale.x);anchor.add(side);anchor.y=r.root.position.y+(swing?Math.sin(swing*Math.PI)*.16:0)+.10*r.root.scale.x;
   return r.root.worldToLocal(anchor);
 }) as [THREE.Vector3,THREE.Vector3];
 poseAnimal(r,{state:carrying?'carry':'walk',time,reduced,feet});
}
