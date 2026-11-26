import * as THREE from '../shared/vendor/three.module.js';
import {pageLinks} from '../orbit/profile-data.mjs';
import {createWalker} from './walking.mjs';
import {createFloorMaterial,addArchitecture,addContactShade} from './architecture.mjs';
const stage=document.querySelector('#scene'),status=document.querySelector('#status'),panel=document.querySelector('#panel'),body=document.querySelector('#panel-body');
try{
const scene=new THREE.Scene();scene.background=new THREE.Color(0x03060d);
const camera=new THREE.PerspectiveCamera(68,innerWidth/innerHeight,.08,260);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;stage.append(renderer.domElement);
const standard=(color,metalness=.2,roughness=.45)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
const dark=standard(0x192531,.55,.32),platinum=standard(0xb8c6ce,.65,.32),floor=createFloorMaterial(),blue=new THREE.MeshBasicMaterial({color:0x8cddff}),soft=new THREE.MeshBasicMaterial({color:0xd4ebf8}),glass=new THREE.MeshPhysicalMaterial({color:0x9edaff,transparent:true,opacity:.085,roughness:.15,metalness:.1,side:THREE.DoubleSide,depthWrite:false});
function mesh(g,m,x=0,y=0,z=0,parent=scene){const a=new THREE.Mesh(g,m);a.position.set(x,y,z);parent.add(a);return a;}
function box(w,h,d,m,x,y,z,parent=scene){return mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z,parent);}
function cyl(rt,rb,h,m,x,y,z,parent=scene){return mesh(new THREE.CylinderGeometry(rt,rb,h,64),m,x,y,z,parent);}
function ring(r,t,m,y,parent=scene){const a=mesh(new THREE.TorusGeometry(r,t,8,96),m,0,y,0,parent);a.rotation.x=Math.PI/2;return a;}
scene.add(new THREE.HemisphereLight(0xd9eaff,0x314051,1.55));const sun=new THREE.DirectionalLight(0xdcefff,1.7);sun.position.set(-10,14,5);scene.add(sun);
cyl(11.3,11.5,.32,floor,0,-.16,0);cyl(11.4,11.4,.35,dark,0,5.6,0);ring(10.65,.045,blue,.015);ring(10.7,.065,blue,5.39);ring(7.3,.022,soft,.018);ring(4,.022,blue,.019);
for(let i=0;i<16;i++){const a=i*Math.PI*2/16,x=Math.cos(a)*10.9,z=Math.sin(a)*10.9;const p=new THREE.Group();p.position.set(x,0,z);p.rotation.y=-a;p.add(new THREE.Mesh(new THREE.BoxGeometry(.33,5.4,.42),platinum));p.children[0].position.y=2.7;box(.39,.035,.47,blue,0,2.7,0,p);scene.add(p);const tile=box(1.9,.012,.035,soft,Math.cos(a)*8.8,.016,Math.sin(a)*8.8);tile.rotation.y=-a;}
mesh(new THREE.CylinderGeometry(10.95,10.95,4.95,96,1,true),glass,0,2.72,0);ring(10.95,.11,dark,.22);ring(10.95,.11,dark,5.17);ring(8.4,.09,platinum,5.38);ring(8.2,.04,soft,5.29);ring(3.1,.12,platinum,5.38);ring(2.9,.035,blue,5.26);
addArchitecture(scene);
const starPos=[];let seed=72;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);for(let i=0;i<2200;i++){const a=rand()*Math.PI*2,v=rand()*2-1,r=105+rand()*30;starPos.push(Math.cos(a)*Math.sqrt(1-v*v)*r,v*r,Math.sin(a)*Math.sqrt(1-v*v)*r);}
const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(starPos,3));scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xd6e8ff,size:.19,sizeAttenuation:true})));
const earthMat=standard(0x427fae,0,.87),earth=mesh(new THREE.SphereGeometry(14,48,32),earthMat,-16,9,-45);earth.rotation.z=.18;
new THREE.TextureLoader().load(pageLinks.earthTexture,t=>{t.colorSpace=THREE.SRGBColorSpace;earthMat.map=t;earthMat.color.set(0xffffff);earthMat.needsUpdate=true;},undefined,()=>{});
mesh(new THREE.SphereGeometry(2.8,24,16),standard(0xa4a5b0,0,1),18,8,-57);
// Thin atmospheric limb instead of tinting the full planet.
const atmosphere=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.FrontSide,blending:THREE.AdditiveBlending,vertexShader:'varying vec3 n; varying vec3 v; void main(){vec4 p=modelViewMatrix*vec4(position,1.0);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'varying vec3 n; varying vec3 v; void main(){float edge=pow(1.0-max(0.0,dot(normalize(n),normalize(v))),3.0);gl_FragColor=vec4(0.18,0.48,0.92,edge*0.52);}'});
mesh(new THREE.SphereGeometry(14.22,48,32),atmosphere,-16,9,-45);
const obstacles=[],targets=[],animated=[];
function label(text,sub,parent){const c=document.createElement('canvas');c.width=512;c.height=192;const ctx=c.getContext('2d');ctx.fillStyle='#071726dd';ctx.fillRect(3,3,506,186);ctx.strokeStyle='#8edcff';ctx.lineWidth=3;ctx.strokeRect(3,3,506,186);ctx.fillStyle='#e0f4ff';ctx.font='bold 47px system-ui';ctx.textAlign='center';ctx.fillText(text,256,83);ctx.fillStyle='#9cc5dc';ctx.font='25px system-ui';ctx.fillText(sub,256,133);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const sign=mesh(new THREE.PlaneGeometry(2.8,1.05),new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.DoubleSide}),0,2.18,0,parent);return sign;}
function station(x,z,name,subtitle,links){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=(x===0&&z===0)?0:Math.atan2(-x,-z);scene.add(g);addContactShade(scene,x,z,1.55);cyl(1.05,1.2,.15,dark,0,.075,0,g);cyl(.66,.93,.75,platinum,0,.48,0,g);cyl(.85,.85,.12,dark,0,.9,0,g);ring(.75,.025,blue,.98,g);const orb=mesh(new THREE.IcosahedronGeometry(.39,1),new THREE.MeshStandardMaterial({color:0x94deff,emissive:0x337da6,emissiveIntensity:.8,metalness:.4,roughness:.25}),0,1.43,0,g);animated.push(orb);label(name,subtitle,g);const data={g,x,z,name,links};g.traverse(o=>{if(o.isMesh){o.userData.station=data;targets.push(o);}});obstacles.push({x,z,r:1.15});return g;}
const stations=[
 station(0,0,'PROFILE','Orbital identity preview',[['Open profile orbit','../profile-orbit.html'],['Founder demonstration','../u/1agejames/'],['Existing profile tools','../application.html']]),
 station(-6,-3,'DISCOVER','People and social links',[['Explore existing profile discovery','../profile-orbit.html']]),
 station(6,-3,'WORLD','Return to the universe',[['Enter 1AGE World','https://1age.world/'],['1AGE home','https://1age.com/']])
];const records=targets.map(o=>o.userData.station).filter((s,i,a)=>a.indexOf(s)===i);
for(const side of [-1,1]){const g=new THREE.Group();g.position.set(side*6.7,0,4.5);g.rotation.y=side*-.5;scene.add(g);addContactShade(scene,side*6.7,4.5,2.05);const fabric=standard(0x536577,.03,.85);box(3.3,.24,1.05,dark,0,.25,0,g);box(3.2,.12,.98,platinum,0,.42,0,g);for(let i=-1;i<=1;i++){box(.99,.18,.88,fabric,i*1.04,.57,.02,g);box(.99,.66,.21,fabric,i*1.04,.91,-.45,g);}for(const a of [-1,1]){box(.16,.44,.95,platinum,a*1.58,.71,0,g);box(.13,.22,.70,dark,a*1.24,.11,0,g);}obstacles.push({x:side*6.7,z:4.5,r:1.8});}
function open(title,links,settings=false){document.querySelector('#panel-title').textContent=title;body.replaceChildren();for(const [name,url] of links){const a=document.createElement('a');a.textContent=name;a.href=url;body.append(a);}if(settings){const select=document.createElement('select');select.setAttribute('aria-label','Graphics resolution');for(const [name,value] of [['Low','0.8'],['Balanced','1.5'],['High','2']]){const o=new Option(name,value);select.add(o);}select.value=String(quality);select.onchange=()=>{quality=Number(select.value);resize();};body.append(select);}walker.clear();if(!panel.open)panel.showModal();}
let quality=1.5;const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
const distance=s=>Math.hypot(camera.position.x-s.x,camera.position.z-s.z);
function interact(s){if(!s||distance(s)>3.7){status.textContent='Walk closer to a station to interact.';return;}status.textContent='';open(s.name,s.links);}
const walker=createWalker(camera,renderer.domElement,{radius:10.15,obstacles,paused:()=>panel.open,onTap:e=>{const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(targets,false)[0];if(hit)interact(hit.object.userData.station);}});
document.querySelector('#interact').onclick=()=>interact([...records].sort((a,b)=>distance(a)-distance(b))[0]);document.querySelector('#reset').onclick=()=>{walker.clear();walker.reset();status.textContent='';};document.querySelector('#menu').onclick=()=>open('1AGE',[['1AGE World','https://1age.world/'],['1AGE.com','https://1age.com/'],['Original Page orbit','../profile-orbit.html']],true);
addEventListener('keydown',e=>{if(e.code==='KeyE'&&!panel.open&&!e.repeat&&!e.target?.closest?.('button,a,input,select'))document.querySelector('#interact').click();});
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,quality));renderer.setSize(innerWidth,innerHeight);}addEventListener('resize',resize);
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();status.textContent='Graphics context lost. Reload to restart the prototype.';renderer.setAnimationLoop(null);});
let last=performance.now();status.textContent='';renderer.setAnimationLoop(now=>{const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;walker.update(dt);earth.rotation.y+=dt*.025;for(const a of animated){a.rotation.y+=dt*.6;a.position.y=1.43+Math.sin(now*.0016)*.06;}renderer.render(scene,camera);});
}catch(error){console.error(error);status.textContent='3D could not start. Use the 1AGE menu or reload.';document.querySelector('#menu').onclick=()=>location.href='../profile-orbit.html';}
