const cardsEl = document.getElementById("cards");
const filtersEl = document.getElementById("filters");

function ytBlock(t){
  const href = t.link || ("https://www.youtube.com/results?search_query="+encodeURIComponent(t.busqueda));
  if(t.yt) return `<a class="vthumb" href="https://www.youtube.com/watch?v=${t.yt}" target="_blank" rel="noopener" aria-label="Ver video de ${t.sigla} en YouTube"><img src="https://i.ytimg.com/vi/${t.yt}/hqdefault.jpg" alt="Miniatura del video de ${t.sigla}" loading="lazy"><span class="play"></span></a><p class="masvideos"><a target="_blank" rel="noopener" href="${href}">Ver más videos en español</a></p>`;
  return `<div class="video"><div class="video-empty"><p>Videos de este proceso en español</p><a target="_blank" rel="noopener" href="${href}">Ver en YouTube</a></div></div>`;
}

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
    <div class="galeria" data-id="${t.id}"></div>
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
  cargarGalerias();
}

// Imágenes automáticas desde la carpeta img/.
// Nombres esperados: smaw.jpg, smaw-2.jpg, smaw-3.jpg... (también .png, .webp o .jpeg).
// Si no existe una imagen, simplemente no se muestra.
const imgCache = {};
function probarImagen(src){
  return new Promise(res=>{
    const i = new Image();
    i.onload = ()=>res(src);
    i.onerror = ()=>res(null);
    i.src = src;
  });
}
async function buscarImagenes(id){
  if(imgCache[id]) return imgCache[id];
  const encontradas = [];
  for(let n=1; n<=8; n++){
    const base = n===1 ? id : `${id}-${n}`;
    let hit = null;
    for(const ext of ["jpg","jpeg","png","webp"]){
      hit = await probarImagen(`${base}.${ext}`);
      if(hit) break;
    }
    if(!hit) break;
    encontradas.push(hit);
  }
  imgCache[id] = encontradas;
  return encontradas;
}
async function cargarGalerias(){
  for(const t of TIPOS){
    const cont = document.querySelector(`.galeria[data-id="${t.id}"]`);
    if(!cont) continue;
    const srcs = await buscarImagenes(t.id);
    cont.innerHTML = srcs.map((s,i)=>`<figure><img src="${s}" alt="${t.nombre}, foto ${i+1}" loading="lazy"><figcaption>${t.sigla}</figcaption></figure>`).join("");
  }
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
clasPanel.innerHTML = CLAS.union;
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
