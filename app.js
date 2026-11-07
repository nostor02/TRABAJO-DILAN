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
  const visibles = TIPOS.filter(t=>sel.includes(t.id));
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
      hit = await probarImagen(`img/${base}.${ext}`);
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
