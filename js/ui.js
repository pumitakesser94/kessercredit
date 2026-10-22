/* ==========================================================================
   Utilidades de interfaz: iconos, gráficas SVG, formateo, modal, toasts.
   Sin librerías externas: todo funciona sin internet.
   ========================================================================== */
window.UI = (function(){

  /* ---------- formato ---------- */
  const money = n => (n<0?"-":"") + "$" + Math.abs(n).toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:0});
  const money2 = n => (n<0?"-":"") + "$" + Math.abs(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
  const pct = n => Math.round(n)+"%";
  const esc = s => String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function fecha(iso){
    if(!iso || iso==="—") return "—";
    const d = new Date(iso.length<=10 ? iso+"T12:00:00" : iso);
    if(isNaN(d)) return iso;
    return d.toLocaleDateString(window.I18N?I18N.locale():"es-US",{day:"2-digit",month:"short",year:"numeric"});
  }
  function hace(iso){
    const d = new Date(iso); const min = (Date.now()-d)/60000;
    if(isNaN(d)) return "";
    const en = window.I18N && I18N.lang === "en";
    if(min<60){ const m = Math.max(1,Math.round(min)); return en ? m+" min ago" : "hace "+m+" min"; }
    if(min<1440){ const h = Math.round(min/60); return en ? h+" h ago" : "hace "+h+" h"; }
    const dias = Math.round(min/1440);
    if(dias<30) return en ? dias+" day"+(dias>1?"s":"")+" ago" : "hace "+dias+" día"+(dias>1?"s":"");
    return fecha(iso);
  }

  /* ---------- clasificación de puntaje ---------- */
  const BANDAS = [
    {max:579, nombre:"Pobre",      color:"var(--s1)"},
    {max:669, nombre:"Regular",    color:"var(--s2)"},
    {max:739, nombre:"Bueno",      color:"var(--s3)"},
    {max:799, nombre:"Muy bueno",  color:"var(--s4)"},
    {max:850, nombre:"Excelente",  color:"var(--s5)"}
  ];
  const banda = s => BANDAS.find(b=>s<=b.max) || BANDAS[BANDAS.length-1];

  /* ---------- iconos (24px, stroke) ---------- */
  const P = {
    panel:'<path d="M3 3h7v7H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 14h7v7H3z"/>',
    score:'<path d="M3 17a9 9 0 1118 0"/><path d="M12 17l4.5-5"/><circle cx="12" cy="17" r="1.6"/>',
    reporte:'<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    alerta:'<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/>',
    accion:'<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>',
    sim:'<path d="M4 20V10M10 20V4M16 20v-7M22 20V8"/>',
    dinero:'<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/><circle cx="17" cy="15" r="1.4"/>',
    ofertas:'<path d="M20.6 13.4L13.4 20.6a2 2 0 01-2.8 0l-8.2-8.2V4a2 2 0 012-2h8.4l7.8 7.8a2 2 0 010 2.8z"/><circle cx="7.5" cy="7.5" r="1.4"/>',
    id:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9.5 12l1.8 1.8L15 10"/>',
    crm:'<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13A4 4 0 0119 7a4 4 0 01-3 3.87"/>',
    config:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.6 1.6 0 00-1-1.5 1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H3a2 2 0 110-4h.1a1.6 1.6 0 001.5-1 1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H9a1.6 1.6 0 001-1.5V3a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V10a1.6 1.6 0 001.5 1H21a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z"/>',
    buscar:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    campana:'<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/>',
    menu:'<path d="M3 12h18M3 6h18M3 18h18"/>',
    x:'<path d="M18 6L6 18M6 6l12 12"/>',
    mas:'<path d="M12 5v14M5 12h14"/>',
    arriba:'<path d="M12 19V5M5 12l7-7 7 7"/>',
    abajo:'<path d="M12 5v14M19 12l-7 7-7-7"/>',
    check:'<path d="M20 6L9 17l-5-5"/>',
    reloj:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    descargar:'<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    salir:'<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>',
    candado:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>',
    carta:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/>',
    escudo:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    rayo:'<path d="M13 2L3 14h8l-1 8 10-12h-8z"/>',
    tendencia:'<path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/>',
    ojo:'<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>',
    refrescar:'<path d="M21 12a9 9 0 11-2.6-6.4"/><path d="M21 3v6h-6"/>',
    tarjeta:'<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/>',
    auto:'<path d="M5 17h14M3 17v-4l2.2-5.3A2 2 0 017 6.4h10a2 2 0 011.8 1.3L21 13v4"/><circle cx="7.5" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/>',
    casa:'<path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.8V21h14V9.8"/><path d="M10 21v-6h4v6"/>',
    negocio:'<rect x="2.5" y="7" width="19" height="13" rx="2.5"/><path d="M9 7V5.2A1.7 1.7 0 0110.7 3.5h2.6A1.7 1.7 0 0115 5.2V7"/><path d="M2.5 12.5h19"/>',
    idea:'<path d="M9 18h6M10 21.5h4"/><path d="M12 2.5a6.5 6.5 0 00-3.7 11.8c.5.4.8 1 .8 1.7h5.8c0-.7.3-1.3.8-1.7A6.5 6.5 0 0012 2.5z"/>',
    meta:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1"/>'
  };
  function ico(nombre, size=18, cls=""){
    return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
      aria-hidden="true">${P[nombre]||""}</svg>`;
  }

  /* ---------- monograma KC ----------
     variante "marca"  = cuadro rojo con las letras en blanco (menú, portada)
     variante "linea"  = letras en rojo sin fondo (fondos oscuros, facturas) */
  function logo(size=38, variante="marca"){
    const fondo = variante==="marca"
      ? `<rect x="0" y="0" width="40" height="40" rx="11" fill="url(#kcg)"/>` : "";
    const trazo = variante==="marca" ? "#fff" : "var(--brand-accent)";
    return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none"
      role="img" aria-label="Kesser Credit">
      <defs><linearGradient id="kcg" x1="0" y1="0" x2="40" y2="40">
        <stop offset="0" stop-color="#E11D2E"/><stop offset="1" stop-color="#B20F1E"/>
      </linearGradient></defs>
      ${fondo}
      <g stroke="${trazo}" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11.6 11.4v17.2"/>
        <path d="M11.6 20.4L19.2 11.4"/>
        <path d="M11.6 20.4L19.2 28.6"/>
        <path d="M31.2 15.6a5.9 5.9 0 100 9.2"/>
      </g>
    </svg>`;
  }

  /* ---------- medidor circular de puntaje ---------- */
  function gauge(score, size=92, min=300, max=850){
    const r = size/2 - 8, c = size/2;
    const arco = Math.PI * r * 1.5;                   // 270°
    const frac = Math.max(0, Math.min(1,(score-min)/(max-min)));
    const b = banda(score);
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
      <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="var(--line-strong)" stroke-width="8" opacity=".45"
        stroke-linecap="round" stroke-dasharray="${arco} ${arco*3}"
        transform="rotate(135 ${c} ${c})"/>
      <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${b.color}" stroke-width="8"
        stroke-linecap="round" stroke-dasharray="${arco*frac} ${arco*3}"
        transform="rotate(135 ${c} ${c})"/>
    </svg>`;
  }

  /* ---------- VELOCÍMETRO GRANDE (estilo buró de crédito) ----------
     Medio círculo de 300 a 850, dividido en las 5 bandas de color,
     con aguja apuntando al puntaje. */
  function arco(cx,cy,r,a0,a1){
    const P = a => [cx + r*Math.cos(a*Math.PI/180), cy + r*Math.sin(a*Math.PI/180)];
    const [x0,y0] = P(a0), [x1,y1] = P(a1);
    return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${Math.abs(a1-a0)>180?1:0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  }

  function gaugeGrande(score, {min=300, max=850, w=272}={}){
    const cx = 136, cy = 142, r = 104, grosor = 15;
    const corte = [min,580,670,740,800,max];
    const col = ["var(--s1)","var(--s2)","var(--s3)","var(--s4)","var(--s5)"];
    const ang = v => 180 + ((v-min)/(max-min))*180;
    const segs = col.map((c,i)=>{
      const a0 = ang(corte[i]) + (i?1.2:0), a1 = ang(corte[i+1]) - (i<4?1.2:0);
      return `<path d="${arco(cx,cy,r,a0,a1)}" stroke="${c}" stroke-width="${grosor}"
                fill="none" stroke-linecap="butt"/>`;
    }).join("");
    const a = ang(Math.max(min,Math.min(max,score)));
    const rad = a*Math.PI/180;
    const px = cx + r*Math.cos(rad), py = cy + r*Math.sin(rad);
    const b = banda(score);
    const marcas = corte.slice(1,-1).map(v=>{
      const m = ang(v)*Math.PI/180;
      return `<line x1="${(cx+(r-grosor/2-3)*Math.cos(m)).toFixed(1)}" y1="${(cy+(r-grosor/2-3)*Math.sin(m)).toFixed(1)}"
                    x2="${(cx+(r+grosor/2+3)*Math.cos(m)).toFixed(1)}" y2="${(cy+(r+grosor/2+3)*Math.sin(m)).toFixed(1)}"
                    stroke="var(--surface)" stroke-width="2.5"/>`;
    }).join("");
    return `<svg viewBox="0 0 272 168" style="width:100%;max-width:${w}px;height:auto;display:block"
              role="img" aria-label="Puntaje ${score}">
      ${segs}${marcas}
      <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="11" fill="var(--surface)"
              stroke="${b.color}" stroke-width="4.5"/>
      <text x="${cx-r}" y="${cy+22}" text-anchor="middle" font-size="11" font-weight="700"
            fill="var(--text-3)">${min}</text>
      <text x="${cx+r}" y="${cy+22}" text-anchor="middle" font-size="11" font-weight="700"
            fill="var(--text-3)">${max}</text>
      <text x="${cx}" y="${cy-24}" text-anchor="middle" font-size="48" font-weight="800"
            letter-spacing="-2.5" fill="${b.color}">${score}</text>
      <text x="${cx}" y="${cy-4}" text-anchor="middle" font-size="11.5" font-weight="700"
            letter-spacing="1" fill="var(--text-3)">${b.nombre.toUpperCase()}</text>
    </svg>`;
  }

  /* ---------- CUADRÍCULA DE HISTORIAL DE PAGOS (24 meses) ---------- */
  const PAGO = {
    O:{c:"var(--s4)",  t:"Pagó a tiempo"},
    "3":{c:"var(--s2)",t:"30 días tarde"},
    "6":{c:"#E8590C",  t:"60 días tarde"},
    "9":{c:"var(--s1)",t:"90+ días tarde"},
    C:{c:"var(--s1)",  t:"En cobranza"},
    D:{c:"var(--info)",t:"Diferido"},
    "-":{c:"var(--surface-3)", t:"Sin información"}
  };
  function mesesAtras(n){
    const out = [], hoy = new Date();
    for(let i=n-1;i>=0;i--){
      const d = new Date(hoy.getFullYear(), hoy.getMonth()-i, 1);
      out.push(d.toLocaleDateString(window.I18N?I18N.locale():"es-US",{month:"short"})
               .replace(".","") + " " + String(d.getFullYear()).slice(2));
    }
    return out;
  }
  function histPagos(cadena, etiqueta, buró){
    const meses = mesesAtras(24);
    const celdas = cadena.split("").map((ch,i)=>{
      const p = PAGO[ch] || PAGO["-"];
      return `<i title="${meses[i]} · ${p.t}" style="background:${p.c}"></i>`;
    }).join("");
    return `<div class="hp"><span class="hp__lbl ${buró?"b-"+buró:""}">${etiqueta}</span>
      <div class="hp__row">${celdas}</div></div>`;
  }
  function histLeyenda(){
    return `<div class="hp-leg">${Object.entries(PAGO).map(([k,p])=>
      `<span><i style="background:${p.c}"></i>${p.t}</span>`).join("")}</div>`;
  }

  /* ---------- gráfica de líneas (historial 3 burós) ---------- */
  function lineChart(serie, {w=720,h=230,claves=[{k:"tu",color:"var(--tu)",nombre:"TransUnion"},
                                                  {k:"exp",color:"var(--exp)",nombre:"Experian"},
                                                  {k:"eqf",color:"var(--eqf)",nombre:"Equifax"}]}={}){
    const pad = {t:16,r:14,b:30,l:38};
    const todos = serie.flatMap(p=>claves.map(c=>p[c.k]));
    const lo = Math.floor((Math.min(...todos)-20)/20)*20;
    const hi = Math.ceil((Math.max(...todos)+20)/20)*20;
    const X = i => pad.l + i*((w-pad.l-pad.r)/Math.max(1,serie.length-1));
    const Y = v => pad.t + (1-(v-lo)/(hi-lo))*(h-pad.t-pad.b);
    const grid = [0,.25,.5,.75,1].map(f=>{
      const v = lo+(hi-lo)*f, y = Y(v);
      return `<line x1="${pad.l}" y1="${y}" x2="${w-pad.r}" y2="${y}" stroke="var(--line)" stroke-width="1"/>
              <text x="${pad.l-8}" y="${y+4}" text-anchor="end" font-size="10.5" fill="var(--text-3)">${Math.round(v)}</text>`;
    }).join("");
    const labels = serie.map((p,i)=>`<text x="${X(i)}" y="${h-8}" text-anchor="middle" font-size="10.5" fill="var(--text-3)">${esc(p.mes)}</text>`).join("");
    const lineas = claves.map(c=>{
      const d = serie.map((p,i)=>`${i?"L":"M"}${X(i).toFixed(1)},${Y(p[c.k]).toFixed(1)}`).join(" ");
      const pts = serie.map((p,i)=>`<circle cx="${X(i).toFixed(1)}" cy="${Y(p[c.k]).toFixed(1)}" r="3.2" fill="var(--surface)" stroke="${c.color}" stroke-width="2"/>`).join("");
      return `<path d="${d}" fill="none" stroke="${c.color}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>${pts}`;
    }).join("");
    const leyenda = claves.map(c=>
      `<span class="chip" style="background:color-mix(in srgb,${c.color} 13%,transparent);color:${c.color}">
         <i style="width:7px;height:7px;border-radius:9px;background:${c.color};display:inline-block"></i>${c.nombre}</span>`).join("");
    return `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">${leyenda}</div>
      <div style="overflow-x:auto"><svg viewBox="0 0 ${w} ${h}" style="width:100%;min-width:520px;height:auto;display:block">
        ${grid}${labels}${lineas}</svg></div>`;
  }

  /* ---------- números que suben contando ----------
     Si el usuario pidió menos animación en su sistema, se pone el valor directo. */
  function contar(el, hasta, ms=900){
    if(!el) return;
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(quieto){ el.textContent = hasta; return; }
    const desde = 0, t0 = performance.now();
    const paso = t => {
      const p = Math.min(1,(t-t0)/ms);
      const suave = 1 - Math.pow(1-p, 3);
      el.textContent = Math.round(desde + (hasta-desde)*suave);
      if(p < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  }

  /* ---------- barra de progreso 300 → 850 ---------- */
  function pista(marcas, {min=300,max=850}={}){
    const pos = v => ((Math.max(min,Math.min(max,v))-min)/(max-min))*100;
    const cortes = [min,580,670,740,800,max];
    const cols = ["var(--s1)","var(--s2)","var(--s3)","var(--s4)","var(--s5)"];
    const barras = cols.map((c,i)=>
      `<i style="background:${c};flex:${cortes[i+1]-cortes[i]} 1 0"></i>`).join("");
    return `<div class="track__rail">
      <div class="track__bar">${barras}</div>
      ${marcas.map(m=>`<div class="track__mk track__mk--${m.tipo}" style="left:${pos(m.valor).toFixed(1)}%"
            data-mk="${m.tipo}">
          <span class="track__dot"></span>
          <span class="track__lbl">${esc(m.texto)} ${m.valor}</span>
        </div>`).join("")}
      <div class="track__ends"><span>${min}</span><span>${max}</span></div>
    </div>`;
  }

  /* ---------- modal ---------- */
  let modalEl = null;
  function modal({titulo, cuerpo, pie, ancho}){
    cerrarModal();
    modalEl = document.createElement("div");
    modalEl.className = "modal-scrim";
    modalEl.innerHTML = `<div class="modal" ${ancho?`style="width:min(${ancho},100%)"`:""} role="dialog" aria-modal="true">
      <div class="modal__head"><h2>${titulo}</h2>
        <button class="icon-btn" data-cerrar aria-label="Cerrar">${ico("x",18)}</button></div>
      <div class="modal__body">${cuerpo}</div>
      ${pie?`<div class="modal__foot">${pie}</div>`:""}
    </div>`;
    modalEl.addEventListener("click", e=>{
      if(e.target === modalEl || e.target.closest("[data-cerrar]")) cerrarModal();
    });
    document.addEventListener("keydown", escCerrar);
    document.body.appendChild(modalEl);
    window.I18N?.aplicar(modalEl);
    return modalEl;
  }
  function escCerrar(e){ if(e.key==="Escape") cerrarModal(); }
  function cerrarModal(){
    if(modalEl){ modalEl.remove(); modalEl = null; document.removeEventListener("keydown", escCerrar); }
  }

  /* ---------- toasts ---------- */
  function toast(msg, tipo="ok"){
    let cont = document.querySelector(".toasts");
    if(!cont){ cont = document.createElement("div"); cont.className="toasts"; document.body.appendChild(cont); }
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<span style="color:${tipo==="bad"?"var(--bad)":"var(--brand-accent)"};flex:0 0 auto">
      ${ico(tipo==="bad"?"alerta":"check",17)}</span><span>${msg}</span>`;
    cont.appendChild(t);
    window.I18N?.aplicar(t);
    setTimeout(()=>{ t.style.opacity="0"; t.style.transition=".25s"; setTimeout(()=>t.remove(),260); }, 3400);
  }

  function skeleton(alto=180){
    return `<div class="card"><div class="card__body" style="height:${alto}px;display:grid;place-items:center;color:var(--text-3)">
      ${ico("reloj",20)} <span style="margin-top:8px">Cargando…</span></div></div>`;
  }

  return {money,money2,pct,esc,fecha,hace,banda,BANDAS,ico,logo,gauge,gaugeGrande,
          histPagos,histLeyenda,mesesAtras,lineChart,contar,pista,modal,cerrarModal,toast,skeleton};
})();
