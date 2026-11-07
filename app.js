const cardsEl = document.getElementById("cards");
const filtersEl = document.getElementById("filters");

function ytBlock(t){
  if(t.yt) return `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${t.yt}" title="Video ${t.sigla}" allowfullscreen loading="lazy"></iframe></div>`;
  const q = encodeURIComponent(t.busqueda);
  return `<div class="video"><div class="video-empty"><p>Video pendiente</p><a target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${q}">Buscar en YouTube</a></div></div>`;
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
    for(const ext of ["jpg","jpeg","png","webp","svg"]){
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
  {p:"¿Qué gas suele usarse como protección en TIG de aluminio?", ops:["Oxígeno","Argón","Hidrógeno","Nitrógeno puro"], ok:1, ex:"El argón es inerte y protege el charco de fusión del aire."}
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
  union:`<h3>Por tipo de unión</h3>
    <ul>
      <li><strong>Por fusión:</strong> las piezas se funden en la zona de unión. Ejemplos: arco, MIG, TIG, láser, oxigás.</li>
      <li><strong>Por presión o estado sólido:</strong> se unen sin fundir el metal base. Ejemplos: resistencia por puntos, fricción-agitación.</li>
    </ul>`,
  auto:`<h3>Por grado de automatización</h3>
    <ul>
      <li><strong>Manual:</strong> el operador controla todo el proceso.</li>
      <li><strong>Semiautomática:</strong> el equipo alimenta el material y el operador guía la pistola.</li>
      <li><strong>Automática o robotizada:</strong> el proceso sigue un programa, con poca intervención humana.</li>
    </ul>`
};
const clasPanel = document.getElementById("clasPanel");
clasPanel.innerHTML = CLAS.union;
document.querySelectorAll(".seg[data-clas]").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll(".seg[data-clas]").forEach(x=>x.classList.toggle("activo",x===b));
  clasPanel.innerHTML = CLAS[b.dataset.clas];
}));

// Esquemas: cambiar diagrama
document.querySelectorAll("#esqBotones .seg").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll("#esqBotones .seg").forEach(x=>x.classList.toggle("activo",x===b));
  const img = document.getElementById("esqImg");
  img.src = b.dataset.img;
  img.alt = "Diagrama del proceso " + b.textContent;
}));

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
