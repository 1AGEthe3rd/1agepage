import * as THREE from '../shared/vendor/three.module.js';

const green = 0x1bfd9c;
const pale = 0xe2ffdc;
const center = new THREE.Vector3();
const discoveryCenter = new THREE.Vector3(22, 0, 0);
const angleOffsets = [3.59, 2.10, 5.64, 0.34];

function texture(width, height, paint) {
  const canvas = Object.assign(document.createElement('canvas'), { width, height });
  paint(canvas.getContext('2d'), width, height);
  const result = new THREE.CanvasTexture(canvas);
  result.colorSpace = THREE.SRGBColorSpace;
  return result;
}

function random(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function sphere(radius, color, roughness = .55) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius, 36, 24),
    new THREE.MeshStandardMaterial({ color, roughness, metalness: .26 }),
  );
}

function orbit(radius, color, opacity, y = 0, arc = Math.PI * 2, thickness = .009) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, thickness, 5, 100, arc),
    new THREE.MeshBasicMaterial({ color, opacity, transparent: opacity < 1, depthWrite: false }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = y;
  return ring;
}

function stars() {
  const next = random(183);
  const positions = [];
  const colors = [];
  for (let i = 0; i < 1750; i++) {
    positions.push((next() - .5) * 145 + 12, (next() - .5) * 93, (next() - .5) * 115);
    const sparkle = .15 + Math.pow(next(), 4) * .75;
    colors.push(sparkle * .77, sparkle, sparkle * .92);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return new THREE.Points(geometry, new THREE.PointsMaterial({ size: .09, vertexColors: true, opacity: .86, transparent: true, depthWrite: false }));
}

function coreTexture() {
  return texture(768, 384, (ctx, w, h) => {
    ctx.fillStyle = '#052019';
    ctx.fillRect(0, 0, w, h);
    const next = random(22);
    for (let i = 0; i < 60; i++) {
      const x = next() * w, y = next() * h, r = 20 + next() * 140;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
      glow.addColorStop(0, i % 4 ? 'rgba(37,166,111,.12)' : 'rgba(18,103,146,.28)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#66ffb544';
    for (let x = 0; x < w; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    for (let i = 0; i < 1300; i++) {
      ctx.fillStyle = i % 13 ? '#9bffd94b' : '#c2ffe8bd';
      ctx.fillRect(next() * w, next() * h, i % 13 ? 1 : 2, 1);
    }
  });
}

function glowSprite(color, scale) {
  const map = texture(128, 128, ctx => {
    const gradient = ctx.createRadialGradient(64, 64, 1, 64, 64, 64);
    gradient.addColorStop(0, '#afffd382');
    gradient.addColorStop(.40, '#afffd32c');
    gradient.addColorStop(.68, '#afffd310');
    gradient.addColorStop(1, '#afffd300');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
  });
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map, color, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .85 }));
  halo.scale.setScalar(scale);
  return halo;
}

function markSprite(map, size) {
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, depthTest: false }));
  sprite.scale.setScalar(size);
  return sprite;
}

function iconTexture(icon) {
  return texture(128, 128, ctx => {
    ctx.translate(64, 64);
    ctx.strokeStyle = '#edfff3';
    ctx.fillStyle = '#edfff3';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    if (icon === 'search') {
      ctx.arc(-4, -4, 21, 0, 2 * Math.PI);
      ctx.moveTo(12, 12);
      ctx.lineTo(29, 29);
    } else if (icon === 'world') {
      ctx.arc(0, 0, 27, 0, 2 * Math.PI);
      ctx.ellipse(0, 0, 11, 27, 0, 0, 2 * Math.PI);
      ctx.moveTo(-25, 0);
      ctx.lineTo(25, 0);
    } else if (icon === 'plus') {
      ctx.moveTo(-24, 0); ctx.lineTo(24, 0);
      ctx.moveTo(0, -24); ctx.lineTo(0, 24);
    } else {
      ctx.font = '700 38px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('GH', 0, 0);
    }
    ctx.stroke();
  });
}

export function buildScene(host, founder, logoUrl, onPick, onStatus, onFrame) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x010403);
  host.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(39, 1, .1, 180);
  const target = center.clone();
  const cameraTarget = new THREE.Vector3();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const tracker = new THREE.Raycaster();
  const point = new THREE.Vector3();
  const pointer = new THREE.Vector2();
  const background = stars();
  scene.add(background, new THREE.HemisphereLight(0xd3ffe7, 0x041518, 1.15));
  const key = new THREE.DirectionalLight(0xceffe1, 3.6);
  key.position.set(-5, 6, 8);
  const fill = new THREE.DirectionalLight(0x7297ff, 2.2);
  fill.position.set(8, 2, -5);
  scene.add(key, fill);

  const identity = new THREE.Group();
  const nucleus = sphere(1.62, 0x9bffe0, .32);
  nucleus.material.map = coreTexture();
  nucleus.material.emissive.setHex(0x0e7357);
  nucleus.material.emissiveMap = nucleus.material.map;
  nucleus.material.emissiveIntensity = .6;
  identity.add(nucleus, glowSprite(green, 10));
  const logoMap = new THREE.TextureLoader().load(founder.avatar || logoUrl);
  logoMap.colorSpace = THREE.SRGBColorSpace;
  const insignia = markSprite(logoMap, 1.22);
  identity.add(insignia);
  const scanRing = orbit(1.76, green, .7, 0, Math.PI * 1.67, .016);
  scanRing.rotation.set(1.22, -.23, .31);
  identity.add(scanRing);
  const rim = orbit(1.89, 0x88f8d1, .34, 0, Math.PI * 1.46, .01);
  rim.rotation.set(1.30, .30, -.15);
  identity.add(rim);

  const track = new THREE.Group();
  for (const radius of [2.63, 3.35, 4.12, 4.83, 5.32]) {
    track.add(orbit(radius, 0x58e1b5, radius === 4.83 ? .39 : .16, -.16));
  }
  const orbitAccent = orbit(4.83, 0x6affca, .65, -.135, Math.PI * .24, .016);
  orbitAccent.rotation.z = .52;
  track.add(orbitAccent);
  identity.add(track);
  const planets = founder.destinations.map((item, index) => {
    const node = new THREE.Group();
    const mesh = sphere(index === 0 ? .47 : .38, item.tint, .42);
    mesh.material.emissive.setHex(item.tint);
    mesh.material.emissiveIntensity = .12;
    mesh.userData.destination = item.id;
    const badge = markSprite(iconTexture(item.icon), index === 0 ? .62 : .53);
    const ring = orbit(.57, item.tint, .62, 0, 2 * Math.PI, .018);
    ring.rotation.x = 1.24;
    node.add(mesh, badge, ring);
    identity.add(node);
    return { node, mesh, badge, ring, item, angle: angleOffsets[index] };
  });
  scene.add(identity);

  const constellation = new THREE.Group();
  constellation.position.copy(discoveryCenter);
  const result = sphere(.82, founder.accent, .36);
  result.material.emissive.setHex(0x067957);
  result.material.emissiveIntensity = .42;
  result.userData.destination = 'founder';
  const resultRing = orbit(1.12, green, .7, 0, Math.PI * 1.52, .018);
  resultRing.rotation.x = 1.12;
  const resultLogo = markSprite(logoMap, .87);
  const resultGroup = new THREE.Group();
  resultGroup.add(result, resultRing, resultLogo, glowSprite(green, 5));
  constellation.add(resultGroup);
  const waypoints = [[-4, -.55, 2.25], [-3, .9, -.6], [-1, .75, -2.35], [2.8, 1.15, -1.8], [4, -.22, .55], [2, -.82, 2.35]];
  const lines = [];
  for (let i = 0; i < waypoints.length; i++) {
    const at = waypoints[i];
    const beacon = sphere(.075 + i % 3 * .018, 0x76e1c6);
    beacon.position.set(...at);
    constellation.add(beacon);
    lines.push(...at, ...waypoints[(i + 1) % waypoints.length], 0, 0, 0, ...at);
  }
  const paths = new THREE.BufferGeometry();
  paths.setAttribute('position', new THREE.Float32BufferAttribute(lines, 3));
  constellation.add(new THREE.LineSegments(paths, new THREE.LineBasicMaterial({ color: 0x63cca9, opacity: .43, transparent: true })));
  scene.add(constellation);

  let view = 'identity', selected = null, shown = true, frame = 0, last = 0;
  let yaw = 0, pitch = .52, zoom = 1, fittedDistance = 15, orbitScale = 1, cameraLift = 0;
  let contextLost = false, disposed = false;
  const project = new Map();
  const cameraDirection = new THREE.Vector3();
  const pointers = new Map();
  let dragged = false, pinchDistance = 0;

  function resize() {
    const { clientWidth: w, clientHeight: h } = host;
    if (!w || !h) return;
    camera.aspect = w / h;
    const portrait = camera.aspect < .8;
    const shortLandscape = h < 500 && w > h;
    orbitScale = portrait ? .65 : 1;
    cameraLift = shortLandscape ? -2.18 : 0;
    track.scale.set(orbitScale, 1, orbitScale);
    fittedDistance = Math.max(shortLandscape ? 17 : 13.7, (portrait ? 17.2 : 12.4) * orbitScale / Math.min(1, camera.aspect));
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, w < 700 || h < 500 ? 1.25 : 1.6));
    renderer.setSize(w, h, false);
  }
  function moveCamera(dx, dy) {
    yaw -= dx;
    pitch = THREE.MathUtils.clamp(pitch + dy, .11, 1.14);
  }
  function zoomCamera(delta) {
    zoom = THREE.MathUtils.clamp(zoom * Math.exp(delta), .82, 1.76);
  }
  function changeView(next) {
    if (view === next) return;
    view = next;
    zoom = 1;
  }
  function positionLabel(id, node, radius) {
    node.getWorldPosition(point);
    point.y -= radius;
    point.project(camera);
    project.set(id, {
      x: (point.x + 1) / 2 * host.clientWidth,
      y: (1 - point.y) / 2 * host.clientHeight + 8,
      visible: point.z > -1 && point.z < 1,
    });
  }
  function positionMark(mark, offset) {
    mark.position.copy(cameraDirection).multiplyScalar(offset);
  }
  function render(now) {
    if (disposed || contextLost) return;
    const dt = Math.min(.05, (now - (last || now)) / 1000);
    last = now;
    const destination = cameraTarget.copy(view === 'identity' ? center : discoveryCenter);
    destination.y = view === 'identity' ? cameraLift : 0;
    if (reduced.matches) target.copy(destination);
    else target.lerp(destination, 1 - Math.exp(-6 * dt));
    cameraDirection.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camera.position.copy(cameraDirection).multiplyScalar(fittedDistance * zoom).add(target);
    camera.lookAt(target);
    camera.updateMatrixWorld();
    if (!reduced.matches) {
      nucleus.rotation.y += dt * .15;
      orbitAccent.rotation.z += dt * .07;
      resultRing.rotation.z += dt * .21;
    }
    positionMark(insignia, 1.69);
    positionMark(resultLogo, .86);
    for (const [index, entry] of planets.entries()) {
      if (!reduced.matches && !selected && !pointers.size) entry.angle += dt * (.14 - .013 * index);
      const radius = (index === 0 ? 4.08 : 4.83) * orbitScale;
      entry.node.position.set(Math.cos(entry.angle) * radius, .22 + Math.sin(2 * entry.angle) * .26, Math.sin(entry.angle) * radius);
      const active = entry.item.id === selected;
      entry.ring.material.color.setHex(active ? green : entry.item.tint);
      entry.ring.material.opacity = active ? .97 : .42;
      entry.ring.scale.setScalar(active ? 1.20 : 1);
      entry.mesh.material.emissiveIntensity = active ? .44 : .12;
      positionMark(entry.badge, index === 0 ? .51 : .42);
    }
    resultGroup.visible = shown;
    scene.updateMatrixWorld();
    for (const entry of planets) positionLabel(entry.item.id, entry.node, .38);
    positionLabel('founder', result, .67);
    renderer.render(scene, camera);
    onFrame(project);
    frame = requestAnimationFrame(render);
  }
  function pick(event) {
    const { left, top, width, height } = renderer.domElement.getBoundingClientRect();
    pointer.set((event.clientX - left) / width * 2 - 1, -(event.clientY - top) / height * 2 + 1);
    tracker.setFromCamera(pointer, camera);
    const meshes = view === 'identity' ? planets.map(entry => entry.mesh) : shown ? [result] : [];
    const [hit] = tracker.intersectObjects(meshes, false);
    if (hit) onPick(hit.object.userData.destination);
  }
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    if (!pointers.size) dragged = false;
    pointers.set(event.pointerId, [event.clientX, event.clientY]);
    if (pointers.size > 1) dragged = true;
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    const previous = pointers.get(event.pointerId);
    if (!previous) return;
    const dx = event.clientX - previous[0], dy = event.clientY - previous[1];
    pointers.set(event.pointerId, [event.clientX, event.clientY]);
    if (pointers.size === 2) {
      const [a, b] = pointers.values();
      const distance = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (pinchDistance && distance) zoomCamera(Math.log(pinchDistance / distance));
      pinchDistance = distance;
    } else if (pointers.size === 1) {
      if (!dragged && Math.hypot(dx, dy) < 2) return;
      dragged = true;
      moveCamera(dx * .006, dy * .005);
    }
  });
  function release(event) {
    if (!pointers.delete(event.pointerId)) return;
    pinchDistance = 0;
    if (event.type === 'pointerup' && !pointers.size && !dragged) pick(event);
  }
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(event, release);
  canvas.addEventListener('wheel', event => {
    event.preventDefault();
    zoomCamera(event.deltaY * .001);
  }, { passive: false });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    contextLost = true;
    cancelAnimationFrame(frame);
    onStatus('Graphics paused. Profile links and discovery remain available.');
  });
  canvas.addEventListener('webglcontextrestored', () => {
    if (disposed || !contextLost) return;
    contextLost = false;
    onStatus('');
    last = 0;
    frame = requestAnimationFrame(render);
  });
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  frame = requestAnimationFrame(render);

  return {
    moveCamera, zoomCamera, changeView,
    setSelected(id) { selected = id; },
    showResult(value) { shown = value; },
    resetCamera() { yaw = 0; pitch = .52; zoom = 1; },
    dispose() {
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
      const resources = new Set();
      scene.traverse(node => {
        if (node.geometry) resources.add(node.geometry);
        if (!node.material) return;
        for (const material of [node.material].flat()) {
          for (const value of Object.values(material)) if (value?.isTexture) resources.add(value);
          resources.add(material);
        }
      });
      for (const resource of resources) resource.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
