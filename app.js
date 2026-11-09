const cardsEl = document.getElementById("cards");
const filtersEl = document.getElementById("filters");

// Miniaturas de YouTube: prueba varias direcciones y, si ninguna carga, muestra una portada propia
const MINI = id => [`https://i.ytimg.com/vi/${id}/hqdefault.jpg`,`https://i.ytimg.com/vi/${id}/mqdefault.jpg`,`https://img.youtube.com/vi/${id}/hqdefault.jpg`,`https://i.ytimg.com/vi/${id}/0.jpg`];
function miniFallo(img){
  const urls = MINI(img.dataset.id), n = +img.dataset.n + 1;
  if(n < urls.length){ img.dataset.n = n; img.src = urls[n]; }
  else img.closest(".vthumb").classList.add("sinmini");
}
// YouTube devuelve una imagen gris de 120 px cuando no tiene miniatura: se trata como fallo
function miniOk(img){ if(img.naturalWidth <= 120) miniFallo(img); }

function vthumb(t){
  return `<a class="vthumb" data-yt="${t.yt}" href="https://www.youtube.com/watch?v=${t.yt}" target="_blank" rel="noopener" aria-label="Ver video de ${t.sigla} en YouTube"><img src="${MINI(t.yt)[0]}" data-id="${t.yt}" data-n="0" alt="Miniatura del video de ${t.sigla}" loading="lazy" referrerpolicy="no-referrer" onerror="miniFallo(this)" onload="miniOk(this)"><span class="vtit">${t.sigla}</span><span class="play"></span></a>`;
}

function ytBlock(t){
  const href = t.link || ("https://www.youtube.com/results?search_query="+encodeURIComponent(t.sigla+" soldadura español"));
  return `${vthumb(t)}<p class="masvideos"><a target="_blank" rel="noopener" href="${href}">Ver más videos en español</a></p>`;
}

// Al tocar una miniatura el video se reproduce ahí mismo (si la página está en un servidor); si no, abre YouTube
document.addEventListener("click",e=>{
  const a = e.target.closest(".vthumb[data-yt]");
  if(!a || !/^https?:$/.test(location.protocol)) return;
  e.preventDefault();
  const v = document.createElement("div");
  v.className = "vthumb";
  v.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${a.dataset.yt}?autoplay=1&rel=0" title="Video de soldadura" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  a.replaceWith(v);
});

// Sección Videos: todas las miniaturas juntas
document.getElementById("vgrid").innerHTML = TIPOS.map(t=>`<figure class="vitem">${vthumb(t)}<figcaption><strong>${t.sigla}</strong><span>${t.clase}</span></figcaption></figure>`).join("");

function renderCard(t){
  return `<article class="card" id="${t.id}">
    <span class="tag">${t.sigla}</span><span class="tag o">${t.clase}</span>
    <h3 style="margin-top:10px">${t.nombre}</h3>
    <p>${t.desc}</p>
    <div class="grid2">
      <div><strong>Equipo</strong><p>${t.equipo}</p><strong>Uso típico</strong><p>${t.uso}</p></div>
      <div><strong>Ventajas</strong><ul>${t.ventajas.map(v=>`<li>${v}</li>`).join("")}</ul>
      <strong>Desventajas</strong><ul>${t.desventajas.map(v=>`<li>${v}</li>`).join("")}</ul></div>
    </div>
    <div class="diag">${(typeof DIAG!=="undefined"&&DIAG[t.id])||""}</div>
    <div class="galeria">${(t.fotos||[]).map((s,i)=>`<figure><img src="${s}" alt="${t.nombre}, foto ${i+1}" loading="lazy"><figcaption>${t.sigla}</figcaption></figure>`).join("")}</div>
    <p class="warn" style="margin-top:12px"><strong>Seguridad:</strong> ${t.seguridad}</p>
    ${ytBlock(t)}
  </article>`;
}

function buildFilters(){
  filtersEl.innerHTML = TIPOS.map(t=>`<label><input type="checkbox" class="f" value="${t.id}" checked> ${t.sigla}</label>`).join("");
  filtersEl.querySelectorAll(".f").forEach(c=>c.addEventListener("change",applyFilter));
}

function applyFilter(){
  const sel = [...document.querySelectorAll(".f:checked")].map(c=>c.value);
  const q = (document.getElementById("buscar")?.value || "").trim().toLowerCase();
  const visibles = TIPOS.filter(t=>sel.includes(t.id) && (!q || (t.sigla+" "+t.nombre+" "+t.desc+" "+t.uso).toLowerCase().includes(q)));
  cardsEl.innerHTML = visibles.length ? visibles.map(renderCard).join("") : `<p class="empty">Selecciona al menos un tipo de soldadura en el menú.</p>`;
}

buildFilters();
document.getElementById("buscar").addEventListener("input",applyFilter);
applyFilter();

document.getElementById("selAll").onclick = ()=>{document.querySelectorAll(".f").forEach(c=>c.checked=true);applyFilter();};
document.getElementById("selNone").onclick = ()=>{document.querySelectorAll(".f").forEach(c=>c.checked=false);applyFilter();};

// Menú lateral: se abre con clic/toque y, en equipos con mouse, al pasar el cursor
const side = document.getElementById("side");
const burger = document.getElementById("burger");
const overlay = document.getElementById("overlay");
function setMenu(open){
  side.classList.toggle("open",open);
  overlay.classList.toggle("show",open);
  burger.setAttribute("aria-expanded",open);
}
burger.addEventListener("click",()=>setMenu(!side.classList.contains("open")));
const canHover = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
if(canHover){
  burger.addEventListener("mouseenter",()=>setMenu(true));
  // Al llevar el cursor al borde izquierdo de la pantalla, el menú se abre solo
  document.addEventListener("mousemove",e=>{ if(e.clientX<=12 && !side.classList.contains("open")) setMenu(true); });
  side.addEventListener("mouseleave",()=>setMenu(false));
}
overlay.addEventListener("click",()=>setMenu(false));
side.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{ if(!canHover) setMenu(false); }));

// Navegación por secciones: solo se ve una sección a la vez, elegida desde el menú
const SECCIONES = [...document.querySelectorAll("main section")];
function mostrarSeccion(id){
  const destino = document.getElementById(id) ? id : "intro";
  SECCIONES.forEach(s=>s.classList.toggle("activa", s.id===destino));
  document.querySelectorAll("#side a").forEach(a=>a.classList.toggle("actual", a.getAttribute("href")==="#"+destino));
  window.scrollTo(0,0);
}
side.querySelectorAll("a").forEach(a=>a.addEventListener("click",e=>{
  e.preventDefault();
  const id = a.getAttribute("href").slice(1);
  location.hash = id;
  mostrarSeccion(id);
  setMenu(false);
}));
window.addEventListener("hashchange",()=>mostrarSeccion(location.hash.slice(1)||"intro"));
mostrarSeccion(location.hash.slice(1)||"intro");

// Introducción: mini quiz
const PREGUNTAS = [
  {p:"¿Qué proceso usa un electrodo de tungsteno que no se consume?", ops:["SMAW","GTAW (TIG)","SAW","Resistencia"], ok:1, ex:"En TIG el tungsteno no se consume; el aporte va con varilla."},
  {p:"¿Cuál proceso une sin fundir el metal base?", ops:["MIG","Láser","Fricción-agitación (FSW)","Plasma"], ok:2, ex:"FSW mezcla el material en estado sólido con una herramienta giratoria."},
  {p:"¿Qué gas suele usarse como protección en TIG de aluminio?", ops:["Oxígeno","Argón","Hidrógeno","Nitrógeno puro"], ok:1, ex:"El argón es inerte y protege el charco de fusión del aire."},
  {p:"¿Qué significa ZAC en un cordón?", ops:["Zona de aporte controlado","Zona afectada por el calor","Zona de arco continuo","Zona de acero cementado"], ok:1, ex:"Es el metal base que no se fundió, pero cambió su estructura por el calor."},
  {p:"¿Qué proceso protege el arco con una capa de fundente granular?", ops:["SAW","GTAW","OAW","RSW"], ok:0, ex:"En arco sumergido el arco queda oculto bajo el fundente."},
  {p:"¿Qué posición de soldadura es la más difícil de controlar?", ops:["1G plana","2G horizontal","4G sobrecabeza","Todas por igual"], ok:2, ex:"En sobrecabeza la gravedad juega en contra del charco de fusión."}
];
const quizEl = document.getElementById("quizPreguntas");
const quizRes = document.getElementById("quizRes");
let aciertos = 0, respondidas = 0;
PREGUNTAS.forEach((q,i)=>{
  const bloque = document.createElement("div");
  bloque.className = "pregunta";
  bloque.innerHTML = `<p><strong>${i+1}. ${q.p}</strong></p><div class="opciones">${q.ops.map((o,j)=>`<button class="opcion" data-i="${i}" data-j="${j}">${o}</button>`).join("")}</div><p class="feedback" id="fb${i}"></p>`;
  quizEl.appendChild(bloque);
});
quizEl.addEventListener("click",e=>{
  const b = e.target.closest(".opcion");
  if(!b || b.disabled) return;
  const i = +b.dataset.i, j = +b.dataset.j, q = PREGUNTAS[i];
  const botones = quizEl.querySelectorAll(`.opcion[data-i="${i}"]`);
  botones.forEach(x=>x.disabled=true);
  const ok = j===q.ok;
  b.classList.add(ok?"ok":"mal");
  if(!ok) botones[q.ok].classList.add("ok");
  document.getElementById("fb"+i).textContent = (ok?"Correcto. ":"Casi. ")+q.ex;
  respondidas++; if(ok) aciertos++;
  if(respondidas===PREGUNTAS.length) quizRes.textContent = `Acertaste ${aciertos} de ${PREGUNTAS.length}.`;
});

// Clasificación: cambiar entre vistas
const CLAS = {
  mecanismo:`<h3>Por mecanismo de unión</h3><ul>
  <li><strong>Por fusión:</strong> el metal base y el de aporte se funden y solidifican formando el cordón. Es el grupo más amplio: arco, oxigás, plasma y láser.</li>
  <li><strong>En estado sólido:</strong> la unión ocurre por presión o fricción sin fundir el metal base. Ejemplos: fricción-agitación, ultrasonido y difusión.</li>
  <li><strong>Por resistencia:</strong> el paso de corriente genera el calor y se aplica presión. Ejemplos: puntos, costura y proyección.</li></ul>
  <p>Aparte están la soldadura fuerte (brazing) y la blanda, donde solo se funde el aporte y el metal base no. Se separan por temperatura: unos 450 °C.</p>`,
  energia:`<h3>Por fuente de energía</h3><ul>
  <li><strong>Arco eléctrico:</strong> SMAW, GMAW (MIG/MAG), GTAW (TIG), FCAW, SAW y PAW.</li>
  <li><strong>Llama de gas:</strong> oxiacetilénica (OAW).</li>
  <li><strong>Resistencia eléctrica:</strong> por puntos (RSW), costura y proyección.</li>
  <li><strong>Haz de alta energía:</strong> láser (LBW) y haz de electrones (EBW).</li>
  <li><strong>Fricción:</strong> fricción-agitación (FSW) y fricción rotatoria.</li></ul>`,
  auto:`<h3>Por grado de automatización</h3><ul>
  <li><strong>Manual:</strong> el operador controla la antorcha o el electrodo y todos los parámetros.</li>
  <li><strong>Semiautomática:</strong> el equipo alimenta el alambre y el operador guía la pistola, como en MIG.</li>
  <li><strong>Mecanizada:</strong> una máquina mueve la antorcha, pero un operador observa y ajusta durante el proceso.</li>
  <li><strong>Automática o robotizada:</strong> el ciclo sigue un programa, con poca o ninguna intervención.</li></ul>`,
  union:`<h3>Por tipo de unión</h3><ul>
  <li><strong>A tope:</strong> dos piezas en el mismo plano. En espesores grandes se les hace bisel.</li>
  <li><strong>A traslape:</strong> las piezas se superponen y se sueldan por el borde. Es común en lámina.</li>
  <li><strong>En T:</strong> una pieza perpendicular sobre otra, como en vigas y refuerzos.</li>
  <li><strong>En esquina:</strong> dos piezas formando un ángulo de 90°, usada en marcos y cajas.</li>
  <li><strong>De borde:</strong> se sueldan los bordes de dos láminas apoyadas una sobre otra.</li></ul>`,
  posicion:`<h3>Por posición de soldadura</h3><ul>
  <li><strong>Plana (1G / 1F):</strong> la más sencilla, porque la gravedad ayuda al charco.</li>
  <li><strong>Horizontal (2G / 2F):</strong> el cordón corre en horizontal sobre una pieza vertical.</li>
  <li><strong>Vertical (3G / 3F):</strong> exige controlar el goteo del metal fundido.</li>
  <li><strong>Sobrecabeza (4G / 4F):</strong> la más difícil: la gravedad actúa contra el charco.</li>
  <li><strong>Tubería (5G / 6G):</strong> el tubo queda fijo y el soldador rodea la unión.</li></ul>
  <p>G indica soldadura de ranura (groove) y F de filete (fillet), según la nomenclatura AWS y ASME.</p>`
};
const clasPanel = document.getElementById("clasPanel");
clasPanel.innerHTML = CLAS.mecanismo;
document.querySelectorAll(".seg[data-clas]").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll(".seg[data-clas]").forEach(x=>x.classList.toggle("activo",x===b));
  clasPanel.innerHTML = CLAS[b.dataset.clas];
}));

// Esquemas: diagramas didácticos
const esqBox = document.getElementById("esqBox");
function verEsquema(k){
  if(typeof ESQ==="undefined") return;
  const e = ESQ[k];
  esqBox.innerHTML = `<h3>${e.t}</h3>${e.svg}<p style="margin-top:14px">${e.txt}</p>`;
  document.querySelectorAll("#esqBotones .seg").forEach(x=>x.classList.toggle("activo",x.dataset.e===k));
}
document.querySelectorAll("#esqBotones .seg").forEach(b=>b.addEventListener("click",()=>verEsquema(b.dataset.e)));
verEsquema("circuito");

// Comparativa: sugerencia según material y lugar
const SUG = {
  acero:{taller:"GMAW (MIG/MAG) por su velocidad y facilidad. Para piezas gruesas en serie, SAW.", campo:"SMAW (electrodo revestido), porque es robusto y funciona con viento y en exteriores."},
  inox:{taller:"GTAW (TIG) para acabados limpios y precisos. GMAW si necesitas producción rápida.", campo:"SMAW con electrodo para inoxidable, o FCAW si el trabajo es grande y a la intemperie."},
  aluminio:{taller:"GTAW (TIG) con corriente alterna, que es el método más usado para aluminio fino.", campo:"Es difícil soldar aluminio en exteriores por el viento. Mejor llevar la pieza al taller."},
  lamina:{taller:"Resistencia por puntos si la producción es en serie. GMAW con alambre fino para piezas sueltas.", campo:"Lámina delgada en exteriores es complicado; SMAW con electrodo fino o plasma, según el equipo."}
};
const selMat = document.getElementById("selMat"), selAmb = document.getElementById("selAmb");
function sugerir(){
  document.getElementById("sugerencia").textContent = "Punto de partida: " + SUG[selMat.value][selAmb.value];
}
selMat.addEventListener("change",sugerir); selAmb.addEventListener("change",sugerir); sugerir();

// Seguridad: lista de verificación
const checks = [...document.querySelectorAll(".chk")];
function actualizarProgreso(){
  const n = checks.filter(c=>c.checked).length;
  document.getElementById("progBarra").style.width = (n/checks.length*100)+"%";
  document.getElementById("progTexto").textContent = n===checks.length ? "Listo para soldar. Revisa el área una vez más." : `${n} de ${checks.length} puntos revisados`;
}
checks.forEach(c=>c.addEventListener("change",actualizarProgreso));
actualizarProgreso();

// Glosario: búsqueda
const bGlos = document.getElementById("bGlos");
bGlos.addEventListener("input",()=>{
  const q = bGlos.value.toLowerCase();
  document.querySelectorAll("#glosario .term").forEach(t=>t.style.display = t.textContent.toLowerCase().includes(q) ? "" : "none");
});

// Inicio: estadísticas animadas y cronología en barras
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.getElementById("nTipos").dataset.n = TIPOS.length;
document.getElementById("nTipos").textContent = TIPOS.length;
function alEntrar(el,fn){
  if(!("IntersectionObserver" in window)){ fn(); return; }
  const o = new IntersectionObserver(es=>{ if(es[0].isIntersecting){ fn(); o.disconnect(); } },{threshold:.3});
  o.observe(el);
}
function contar(el){
  const fin = +el.dataset.n, pre = el.dataset.pre || "";
  if(reduceMotion) return;
  const t0 = performance.now();
  (function paso(t){
    const k = Math.min((t-t0)/1200,1);
    el.textContent = pre + Math.round(fin*(1-Math.pow(1-k,3)));
    if(k<1) requestAnimationFrame(paso);
  })(t0);
}
const statsEl = document.querySelector(".stats");
alEntrar(statsEl,()=>statsEl.querySelectorAll(".num").forEach(contar));

const CRONO = [
  {a:"~1800", n:"Arco eléctrico", t:"Humphry Davy demuestra el arco eléctrico, base de toda la soldadura por arco."},
  {a:"1881", n:"Arco de carbón", t:"Auguste de Méritens une placas de plomo con un arco de carbón. En 1885 Benardos y Olszewski patentan el proceso."},
  {a:"1903", n:"Oxiacetileno", t:"Fouché y Picard desarrollan el soplete oxiacetilénico."},
  {a:"1904", n:"Electrodo revestido", t:"Oscar Kjellberg inventa el electrodo revestido."},
  {a:"1930s", n:"Arco sumergido", t:"Aparece el arco sumergido (SAW) para fabricar piezas grandes y gruesas."},
  {a:"1941", n:"TIG", t:"Se desarrolla el TIG para soldar aluminio y magnesio en la industria aeronáutica."},
  {a:"1948", n:"MIG", t:"Nace el MIG, con alambre continuo y gas protector."},
  {a:"1991", n:"Fricción-agitación", t:"El instituto TWI (Reino Unido) inventa la fricción-agitación."}
];
const cronoEl = document.getElementById("crono"), cronoDet = document.getElementById("cronoDet");
cronoEl.innerHTML = CRONO.map((c,i)=>`<div class="col"><button class="barra" data-i="${i}" style="--h:${70+i*29}px;--i:${i}" aria-label="${c.a}: ${c.n}"><span>${c.a}</span></button><span class="lab">${c.n}</span></div>`).join("");
function verCrono(i){
  const c = CRONO[i];
  cronoEl.querySelectorAll(".barra").forEach((b,k)=>b.classList.toggle("sel",k===i));
  cronoDet.innerHTML = `<strong>${c.a} · ${c.n}</strong><p>${c.t}</p>`;
}
cronoEl.querySelectorAll(".barra").forEach(b=>{
  const i = +b.dataset.i;
  ["click","mouseenter","focus"].forEach(ev=>b.addEventListener(ev,()=>verCrono(i)));
});
verCrono(0);
alEntrar(cronoEl,()=>cronoEl.classList.add("on"));

// Chispas del arco: se animan con SMIL dentro del propio SVG, sin depender del CSS ni de la configuración de movimiento del sistema
document.querySelectorAll(".hero-svg .sp").forEach(c=>{
  const dx = parseFloat(c.style.getPropertyValue("--dx")), dy = parseFloat(c.style.getPropertyValue("--dy"));
  const begin = c.style.animationDelay || "0s", ns = "http://www.w3.org/2000/svg";
  c.style.animation = "none";
  const mov = document.createElementNS(ns,"animateTransform");
  mov.setAttribute("attributeName","transform"); mov.setAttribute("type","translate");
  mov.setAttribute("from","0 0"); mov.setAttribute("to",`${dx*1.2} ${dy+70}`);
  mov.setAttribute("calcMode","spline"); mov.setAttribute("keyTimes","0;1"); mov.setAttribute("keySplines",".2 .6 .4 1");
  const op = document.createElementNS(ns,"animate");
  op.setAttribute("attributeName","opacity"); op.setAttribute("values","1;.9;0"); op.setAttribute("keyTimes","0;.7;1");
  [mov,op].forEach(a=>{ a.setAttribute("dur","1.4s"); a.setAttribute("begin",begin); a.setAttribute("repeatCount","indefinite"); c.appendChild(a); });
});
