import { subscribeInput } from '../shared/gamepad.mjs';
import { founder, findPreviews, pageLinks } from './profile-data.mjs';
import { buildScene } from './scene.mjs';

const app = document.querySelector('#page');
const founderRoute = app.dataset.mode === 'profile';
const icon = path => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' + path + '</svg>';
const magnifier = icon('<circle cx="10" cy="10" r="5.5"/><path d="m14.5 14.5 5 5"/>');
const settings = icon('<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2.5" fill="#07110e"/><circle cx="15" cy="17" r="2.5" fill="#07110e"/>');
const closeIcon = icon('<path d="m6 6 12 12M18 6 6 18"/>');
const outgoing = icon('<path d="M8 16 17 7M8 7h9v9"/>');
app.classList.add('ready');
app.innerHTML = `
  <div class="stage" aria-hidden="true"></div>
  <header class="mast">
    <a class="wordmark"><span aria-hidden="true"></span>1AGE Page</a>
    <button class="brand" type="button" aria-label="1AGE menu" aria-expanded="false" aria-controls="first-party">
      <img alt="" width="42" height="42">
    </button>
    <nav class="menu" id="first-party" aria-label="1AGE official content" hidden>
      <a href="https://1age.store/">Store</a><a href="https://1age.blog/">Blog</a>
    </nav>
    <div class="mast-actions">
      <button class="pill mode-toggle" type="button" aria-pressed="false"></button>
      <button class="icon-button settings-button" type="button" aria-label="Page settings"></button>
    </div>
  </header>
  <nav class="scene-labels" aria-label="Orbital destinations"></nav>
  <section class="identity" aria-label="Founder demonstration profile">
    <h1></h1><a class="handle"></a><p class="bio"></p>
    <span class="preview-status" aria-label="Demo profile. This is not a registered or verified Page account."></span>
  </section>
  <section class="discover" aria-label="People discovery" hidden>
    <label for="find-people">Find a demo profile</label>
    <input type="search" id="find-people" placeholder="Name or handle" autocomplete="off" maxlength="100">
    <p role="status"></p>
  </section>
  <section class="selection" aria-label="Selected destination" hidden>
    <div><strong></strong><small></small></div>
    <a class="link-button">Open</a>
    <button class="icon-button clear-selection" type="button" aria-label="Clear selection"></button>
  </section>
  <p class="notice" role="status" hidden></p>
  <span class="visually-hidden selection-status" aria-live="polite"></span>
  <dialog aria-labelledby="settings-label">
    <header><h2 id="settings-label">Page settings</h2><form method="dialog"><button class="icon-button dialog-close" aria-label="Close settings"></button></form></header>
    <menu>
      <button class="pill reset-camera" type="button">Reset orbital view</button>
      <a class="pill profile-tools">Existing profile tools</a>
      <a class="pill" href="https://1age.com/">Return to 1AGE.com</a>
    </menu>
  </dialog>`;

const get = selector => app.querySelector(selector);
const stage = get('.stage'), labels = get('.scene-labels'), identity = get('.identity');
const discover = get('.discover'), search = get('#find-people'), modeButton = get('.mode-toggle');
const menu = get('.menu'), menuButton = get('.brand'), settingsButton = get('.settings-button');
const dialog = get('dialog'), notice = get('.notice'), selection = get('.selection');
const open = get('.selection .link-button'), selectionStatus = get('.selection-status');
const labelNodes = new Map();

get('.wordmark').href = pageLinks.home;
get('.brand img').src = pageLinks.logo;
get('.identity h1').textContent = founder.name;
get('.handle').href = pageLinks.founder;
get('.handle').textContent = founder.handle;
if (founderRoute) get('.handle').setAttribute('aria-current', 'page');
get('.bio').textContent = founder.bio;
get('.preview-status').textContent = founder.status;
get('.profile-tools').href = pageLinks.tools;
modeButton.innerHTML = magnifier + 'Discover';
settingsButton.innerHTML = settings;
get('.dialog-close').innerHTML = closeIcon;
get('.clear-selection').innerHTML = closeIcon;
open.insertAdjacentHTML('beforeend', outgoing);

let view = 'identity', selected = null, resultVisible = true, nextLeft = 0;
let scene;

function destinationButton(destination) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'destination';
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-label', destination.name + ' · ' + destination.kind);
  button.style.setProperty('--planet-color', '#' + destination.tint.toString(16).padStart(6, '0'));
  const dot = document.createElement('span');
  dot.className = 'signal';
  button.append(dot, document.createTextNode(destination.name));
  button.addEventListener('click', () => select(destination.id, true));
  labels.append(button);
  labelNodes.set(destination.id, button);
}
for (const destination of founder.destinations) destinationButton(destination);
const founderLink = document.createElement('a');
founderLink.className = 'destination';
founderLink.href = pageLinks.founder;
founderLink.textContent = founder.name;
founderLink.hidden = true;
labels.append(founderLink);
labelNodes.set('founder', founderLink);

function status(message) {
  app.classList.toggle('no-webgl', Boolean(message));
  notice.textContent = message;
  notice.hidden = !message;
}

function placeLabels(positions) {
  for (const [id, element] of labelNodes) {
    if (element.hidden || !positions.has(id)) continue;
    const pos = positions.get(id);
    const x = Math.min(stage.clientWidth - 53, Math.max(53, pos.x));
    const bottomSpace = stage.clientHeight < 500 ? 140 : stage.clientWidth < 600 ? 245 : 155;
    const y = Math.min(stage.clientHeight - bottomSpace, Math.max(68, pos.y));
    element.style.left = x + 'px';
    element.style.top = y + 'px';
  }
}

function setMenu(value) {
  menu.hidden = !value;
  menuButton.setAttribute('aria-expanded', String(value));
}
function goToFounder() {
  if (resultVisible) location.href = pageLinks.founder;
}
function select(id, confirm) {
  if (id === 'founder') {
    goToFounder();
    return;
  }
  const entry = founder.destinations.find(item => item.id === id);
  if (!entry || view !== 'identity') return;
  if (confirm && selected === id) {
    open.click();
    return;
  }
  selected = id;
  for (const destination of founder.destinations) {
    labelNodes.get(destination.id).setAttribute('aria-pressed', String(destination.id === selected));
  }
  selection.hidden = false;
  identity.hidden = true;
  get('.selection strong').textContent = entry.name;
  get('.selection small').textContent = entry.kind;
  open.href = entry.url;
  open.setAttribute('aria-label', 'Open ' + entry.name);
  selectionStatus.textContent = entry.name + ' selected';
  scene?.setSelected(id);
}

function clearSelection(restoreFocus = false) {
  const previous = selected;
  selected = null;
  selection.hidden = true;
  identity.hidden = view !== 'identity';
  for (const button of founder.destinations) labelNodes.get(button.id).setAttribute('aria-pressed', 'false');
  scene?.setSelected(null);
  if (previous && restoreFocus) labelNodes.get(previous).focus();
}

function filterPeople() {
  const results = findPreviews(search.value);
  resultVisible = Boolean(results.length);
  founderLink.hidden = view !== 'discovery' || !resultVisible;
  discover.querySelector('p').textContent = resultVisible ? '1 demo profile' : 'No matching demo profiles';
  scene?.showResult(resultVisible);
}

function changeView(next, focusSearch = false) {
  view = next;
  app.dataset.view = next;
  setMenu(false);
  clearSelection();
  const discovering = next === 'discovery';
  discover.hidden = !discovering;
  modeButton.setAttribute('aria-pressed', String(discovering));
  modeButton.innerHTML = discovering ? 'Identity' : magnifier + 'Discover';
  for (const item of founder.destinations) labelNodes.get(item.id).hidden = discovering;
  filterPeople();
  scene?.changeView(next);
  if (discovering && focusSearch) search.focus({ preventScroll: true });
}

try {
  scene = buildScene(stage, founder, pageLinks.logo, id => select(id, true), status, placeLabels);
} catch {
  status('3D is unavailable on this device. You can still use the profile links.');
}

menuButton.addEventListener('click', () => setMenu(menu.hidden));
document.addEventListener('pointerdown', event => {
  if (!menu.hidden && !menu.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
});
modeButton.addEventListener('click', event => changeView(view === 'identity' ? 'discovery' : 'identity', event.detail === 0));
search.addEventListener('input', filterPeople);
search.addEventListener('keydown', event => {
  if (event.key === 'Enter' && resultVisible) founderLink.focus();
});
get('.clear-selection').addEventListener('click', () => clearSelection(true));
settingsButton.addEventListener('click', () => {
  setMenu(false);
  dialog.showModal();
});
get('.reset-camera').addEventListener('click', () => {
  scene?.resetCamera();
  dialog.close();
});
dialog.addEventListener('close', () => settingsButton.focus());

document.addEventListener('keydown', event => {
  if (dialog.open || event.defaultPrevented) return;
  if (event.key === 'Escape') {
    if (!menu.hidden) { setMenu(false); menuButton.focus(); }
    else if (view === 'discovery') { changeView('identity'); modeButton.focus(); }
    else clearSelection(true);
    return;
  }
  if (event.target instanceof Element && event.target.closest('input, textarea, #oneage-controller')) return;
  if (event.key === '+' || event.key === '=') scene?.zoomCamera(-.12);
  if (event.key === '-') scene?.zoomCamera(.12);
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key) && view === 'identity') {
    event.preventDefault();
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') moveSelection(event.key === 'ArrowLeft' ? -1 : 1);
    else scene?.moveCamera(0, event.key === 'ArrowUp' ? -.12 : .12);
  }
});

function moveSelection(direction) {
  if (view === 'discovery') {
    if (resultVisible) founderLink.focus({ preventScroll: true });
    return;
  }
  const list = founder.destinations;
  const index = selected ? list.findIndex(item => item.id === selected) : direction === 1 ? -1 : 0;
  const entry = list[(index + direction + list.length) % list.length];
  select(entry.id, false);
  labelNodes.get(entry.id).focus({ preventScroll: true });
}

const unsubscribe = subscribeInput((input, dt) => {
  if (dialog.open || !menu.hidden || document.activeElement === search) return;
  scene?.moveCamera(input.look.x * dt * 1.7, input.look.y * dt * 1.5);
  const axis = Math.abs(input.move.x) >= Math.abs(input.move.y) ? input.move.x : input.move.y;
  if (Math.abs(axis) < .35) nextLeft = 0;
  else if (performance.now() >= nextLeft) {
    moveSelection(Math.sign(axis));
    nextLeft = performance.now() + 265;
  }
});
addEventListener('pagehide', event => {
  if (event.persisted) return;
  unsubscribe();
  scene?.dispose();
});
