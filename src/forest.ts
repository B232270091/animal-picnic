import * as THREE from 'three';
import {ball,box,tube,clay} from './rig';
export function makeTree(parent:THREE.Object3D,x:number,z:number,s=1){const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(s);tube(g,'#957858',.12,1.8,[0,.8,0],.22);const leaves=new THREE.Group();leaves.position.y=1.65;g.add(leaves);ball(leaves,'#65874b',[.9,1.2,.8],[0,.7,0]);ball(leaves,'#83a65d',[.75,.9,.7],[-.45,.2,.1]);ball(leaves,'#9ab674',[.6,.8,.6],[.45,.35,.12]);parent.add(g);return leaves;}
export function makeHouse(parent:THREE.Object3D,x:number,z:number,index:number){const g=new THREE.Group();g.position.set(x,0,z);box(g,['#edd6ad','#e4c8b7','#d9dcc1'][index%3],[1.9,1.6,1.55],[0,.8,0]);const roof=new THREE.Mesh(new THREE.ConeGeometry(1.52,.94,4),clay(['#809777','#bb8771','#8da1ad'][index%3]));roof.rotation.y=Math.PI/4;roof.position.y=2.06;roof.castShadow=true;g.add(roof);box(g,'#916e48',[.45,.85,.07],[0,.43,.8]);for(const s of [-1,1]){box(g,'#f7efcf',[.36,.4,.08],[s*.6,1,.8]);box(g,'#809c9d',[.25,.29,.09],[s*.6,1,.85]);}tube(g,'#f2d28c',.07,.03,[.13,.46,.866]).rotation.x=Math.PI/2;parent.add(g);return g;}
export function makeBasket(parent:THREE.Object3D,x:number,z:number,color='#c79c65'){const g=new THREE.Group();g.position.set(x,.1,z);tube(g,color,1.31,.19,[0,0,0],1.17);tube(g,'#eed8ae',1.20,.05,[0,.12,0]);for(let i=0;i<2;i++){const m=new THREE.Mesh(new THREE.TorusGeometry(1.28,.035,6,32),clay('#987349'));m.rotation.x=Math.PI/2;m.position.y=i*.1;g.add(m);}parent.add(g);return g;}
export function makeFood(kind:'apple'|'carrot'){
 const g=new THREE.Group();
 if(kind==='apple'){ball(g,'#d86442',[.245,.255,.23],[0,.22,0]);ball(g,'#e7865f',[.13,.19,.17],[-.11,.23,.055]);tube(g,'#785e40',.025,.17,[0,.49,0]);const leaf=ball(g,'#6f984f',[.14,.038,.065],[.11,.51,0]);leaf.rotation.z=.3;}
 else {const carrot=new THREE.Mesh(new THREE.ConeGeometry(.19,.68,16),clay('#e88e37'));carrot.rotation.z=Math.PI;carrot.position.y=.16;g.add(carrot);for(let i=0;i<3;i++){const leaf=ball(g,'#73944b',[.05,.18,.055],[(i-1)*.06,.59,0]);leaf.rotation.z=(i-1)*.4;}g.rotation.x=-1.35;g.rotation.y=-.35;}
 return g;
}
export function makeWagon(parent:THREE.Object3D,capacity:number,index:number,unlocked:boolean){
 const g=new THREE.Group(),width=capacity===3?3.95:3.15,color=(unlocked?['#739f9a','#dfa165','#95a76e','#b28c9d']:['#85a296','#d2a773','#91a6ad'])[index%(unlocked?4:3)];
 box(g,'#637575',[width,.17,1.9],[0,.26,0]);box(g,color,[width,.25,.12],[0,.47,-.92]);box(g,color,[.13,.38,1.88],[-width/2,.53,0]);box(g,color,[.13,.38,1.88],[width/2,.53,0]);
 // Open front and low rails keep every seated passenger visible.
 for(const x of [-width*.35,width*.35])for(const z of [-.94,.94]){const wheel=tube(g,'#596467',.22,.15,[x,.2,z]);wheel.rotation.x=Math.PI/2;tube(wheel,'#c7ae72',.065,.16,[0,0,0]);}
 for(let i=0;i<capacity;i++){const x=(i-(capacity-1)/2)*1.3;box(g,'#f5e9c8',[.85,.15,.82],[x,.45,0]);box(g,'#d1ba8f',[.85,.54,.09],[x,.69,-.4]);}
 parent.add(g);return g;
}
export function addForest(scene:THREE.Object3D,world:'picnic'|'station'|'delivery',mobile:boolean){
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(100,100),clay('#ccd9b2'));ground.rotation.x=-Math.PI/2;ground.position.y=-.08;ground.receiveShadow=true;scene.add(ground);
 const foliage:THREE.Group[]=[];
 for(const [x,z,s] of [[-7,-6,1.2],[7,-7,1.35],[-9,3,1],[9,3,1.3],[-5,-8,1],[4,-9,1.1]])foliage.push(makeTree(scene,x,z,s));
 for(let i=0;i<15;i++){const x=(i%2?-1:1)*(mobile?5.4:8.2),z=-6+i*.9;const tuft=new THREE.Group();tuft.position.set(x,0,z);for(let j=0;j<3;j++){const leaf=ball(tuft,'#8da664',[.035,.19,.035],[(j-1)*.07,.16,0]);leaf.rotation.z=(j-1)*.3;}scene.add(tuft);foliage.push(tuft);}
 if(world==='delivery'){box(scene,'#ddca9f',[mobile?10:16,.025,.9],[0,-.025,1.65]);for(const x of [-4.6,4.6])box(scene,'#ddca9f',[.8,.025,6.1],[x,-.02,4.5]);box(scene,'#ddca9f',[9.8,.025,.8],[0,-.02,7.2]);}
 return foliage;
}
export function disposeObject(object:THREE.Object3D){object.traverse(o=>{const mesh=o as THREE.Mesh;mesh.geometry?.dispose();if(mesh.material)(Array.isArray(mesh.material)?mesh.material:[mesh.material]).forEach(m=>m.dispose());});}
