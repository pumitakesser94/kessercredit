/* ==========================================================================
   PANTALLAS DE LA PLATAFORMA
   Cada vista: { titulo, sub, icono, async render(), montar?(root) }
   ========================================================================== */
window.VIEWS = {};
(function(){
const {money,money2,pct,esc,fecha,hace,banda,ico,gauge,lineChart,modal,cerrarModal,toast} = UI;

const BUROS = {tu:{n:"TransUnion",s:"TU",c:"var(--tu)"},exp:{n:"Experian",s:"EX",c:"var(--exp)"},eqf:{n:"Equifax",s:"EQ",c:"var(--eqf)"}};
const buroChip = id => `<span class="chip chip--${id}">${BUROS[id]?.s||id}</span>`;
const delta = n => n>0 ? `<span class="delta delta--up">${ico("arriba",13)}+${n}</span>`
                 : n<0 ? `<span class="delta delta--down">${ico("abajo",13)}${n}</span>`
                 : `<span class="delta delta--flat">0</span>`;

/* =========================================================================
   1. PANEL DE PRESENTACIÓN
   Lo primero que ve el cliente cuando entra. Orden: puntaje incluido
   (TransUnion) → lo que puede ganar → puntaje proyectado → precalificaciones
   → consejos.
   ========================================================================= */
VIEWS.panel = {
  titulo:"Panel", sub:"Resumen de tu crédito", icono:"panel",
  async render(){
    const [sc, det, cats, ofs, cons, al] = await Promise.all([
      KESSER.credito.scores(), KESSER.credito.detalle(),
      KESSER.credito.categorias(), KESSER.ofertas.listar(),
      KESSER.credito.consejos(), KESSER.alertas.listar()
    ]);
    const u = KESSER.sesion.actual() || MOCK.user;
    const b = banda(det.actual);
    const proyectado = Math.max(300, Math.min(850, det.actual + det.planAccion + det.impulso));
    const restantes = det.refrescosDelMes - det.refrescosUsados;
    const nuevas = al.filter(a=>!a.leida).length;
    const topConsejos = [...cons].sort((x,y)=>y.impacto-x.impacto).slice(0,3);

    return `
      <div class="page__head">
        <div><h1><span>Hola,</span> ${esc(u.nombre)} 👋</h1>
          <p><span>Este es tu puntaje de TransUnion, el que viene incluido en tu plan.</span></p></div>
      </div>

      <div class="hero-score" style="margin-bottom:18px">
        <div class="hero-score__head">
          <div style="flex:1 1 auto;min-width:0">
            <h2>Tu puntaje de crédito</h2>
            <div class="hero-score__asof">
              <span>Al</span> ${fecha(det.actualizado)}
              <button class="refresh" id="btnRefrescar" ${restantes<=0?"disabled":""}
                title="Actualizar mi puntaje" aria-label="Actualizar mi puntaje">
                ${ico("refrescar",16)}</button>
              <span style="color:var(--text-3)">· <span>Te quedan ${restantes} de ${det.refrescosDelMes} actualizaciones este mes</span></span>
            </div>
          </div>
          <span class="chip chip--tu" style="height:28px">TransUnion · ${esc(sc.modelo)}</span>
        </div>

        <div class="srow">
          <div class="srow__ico" style="background:color-mix(in srgb,${b.color} 14%,transparent);color:${b.color}">
            ${ico("meta",22)}</div>
          <div>
            <div class="srow__t">Puntaje actual</div>
            <div class="srow__d"><span>Tu puntaje inicial fue</span> <b>${det.inicial}</b>
              <span>· has subido</span> <b style="color:var(--ok)">+${det.actual-det.inicial}</b> <span>puntos</span></div>
          </div>
          <div class="srow__n" style="color:${b.color}" data-contar="${det.actual}">0</div>
          <button class="btn" data-ir="puntajes">Ver detalle</button>
        </div>

        <div class="srow">
          <div class="srow__ico" style="background:var(--brand-soft);color:var(--brand-accent-dark)">
            ${ico("rayo",22)}</div>
          <div>
            <div class="srow__t">Plan de acción</div>
            <div class="srow__d"><span>Actuar directamente con tus acreedores y con tus saldos
              puede subirte hasta</span> <b>+${det.planAccion} puntos</b>.</div>
          </div>
          <div class="srow__n" style="color:var(--ok)">+${det.planAccion}</div>
          <button class="btn btn--primary" data-ir="consejos">Ver qué hacer</button>
        </div>

        <div class="srow">
          <div class="srow__ico" style="background:var(--info-soft);color:var(--info)">
            ${ico("dinero",22)}</div>
          <div>
            <div class="srow__t">Impulso de pagos</div>
            <div class="srow__d"><span>Tus pagos al día pueden sumarte</span> <b style="color:var(--ok)">+${det.impulso} puntos</b>.
              <span>Un gasto fuerte, un saldo que se dispara o un robo de tarjeta pueden costarte</span>
              <b style="color:var(--bad)">${det.riesgo} puntos</b>.</div>
          </div>
          <div class="srow__n" style="color:var(--ok)">+${det.impulso}</div>
          <button class="btn" data-ir="dinero">Crear mi plan</button>
        </div>

        <div class="srow srow--future">
          <div>
            <div class="srow__t">Tu puntaje proyectado</div>
            <div class="srow__d"><span>Marca lo que vas a hacer y mira hasta dónde llega tu puntaje.
              Es una estimación, no una promesa.</span></div>
            <div class="sw">
              <label class="is-on"><input type="checkbox" id="swPlan" checked
                data-pts="${det.planAccion}"> <span>Plan de acción</span> +${det.planAccion}</label>
              <label class="is-on"><input type="checkbox" id="swImp" checked
                data-pts="${det.impulso}"> <span>Impulso de pagos</span> +${det.impulso}</label>
            </div>
          </div>
          <div class="srow__n" id="numProyectado">${proyectado}</div>
        </div>

        <div class="track">
          <div class="track__top">
            <h4>Tu recorrido</h4>
            <span>· <span>de dónde saliste, dónde estás y hasta dónde puedes llegar</span></span>
          </div>
          ${UI.pista([
            {tipo:"inicio", texto:"Empezaste en", valor:det.inicial},
            {tipo:"hoy",    texto:"Hoy",          valor:det.actual},
            {tipo:"meta",   texto:"Puedes llegar a", valor:proyectado}
          ])}
        </div>
      </div>

      <div class="card" style="margin-bottom:18px">
        <div class="card__head">
          <span style="color:var(--brand-accent);flex:0 0 auto">${ico("ofertas",19)}</span>
          <h3>Kesser Match</h3>
          <span class="sub">Para qué calificas hoy · verlo no genera consulta dura</span></div>
        <div class="card__body">
          <div class="pq-grid">
            ${cats.map(c=>{
              const dela = ofs.filter(o=>o.cat===c.id);
              const puedo = dela.filter(o=>det.actual >= o.scoreMin);
              const falta = dela.length ? Math.min(...dela.map(o=>o.scoreMin)) : 0;
              return `<div class="pq ${puedo.length?"":"pq--no"}" data-ir="ofertas" data-cat="${c.id}"
                        role="button" tabindex="0">
                <div class="pq__ico">${ico(c.icono,21)}</div>
                <div class="pq__n">${esc(c.nombre)}</div>
                <div class="pq__v">${puedo.length ? puedo.length+" ofertas" : "Desde "+falta}</div>
              </div>`;
            }).join("")}
          </div>
          <button class="btn btn--block" style="margin-top:14px" data-ir="ofertas">
            Comparar mis ofertas precalificadas</button>
        </div>
      </div>

      <div class="card" style="margin-bottom:18px">
        <div class="card__head">
          <span style="color:var(--brand-accent);flex:0 0 auto">${ico("idea",19)}</span>
          <h3>Consejos para subir tu puntaje</h3>
          <span class="sub">Los 3 de mayor impacto</span>
        </div>
        <div class="card__body">
          <div class="tips">
            ${topConsejos.map(c=>`
              <article class="tip ${c.tipo==="proteger"?"tip--prot":""}">
                <div class="tip__pts"><b>${c.tipo==="proteger"?"":"+"}${c.impacto}</b><span>pts</span></div>
                <div>
                  <div class="tip__t">${esc(c.titulo)}</div>
                  <div class="tip__meta">
                    <span class="chip">${esc(c.factor)}</span>
                    <span class="chip ${c.dificultad==="Alta prioridad"?"chip--bad":c.dificultad==="Media"?"chip--warn":"chip--ok"}">${esc(c.dificultad)}</span>
                    <span class="chip">${ico("reloj",13)}${esc(c.plazo)}</span>
                  </div>
                </div>
                <button class="btn btn--sm" data-ir="consejos">Ver cómo</button>
              </article>`).join("")}
          </div>
          <button class="btn btn--block" style="margin-top:14px" data-ir="consejos">
            Ver los ${cons.length} consejos completos</button>
        </div>
      </div>

      <div class="navcards">
        <div class="navcard" data-ir="reporte" role="button" tabindex="0">
          <div class="navcard__ico">${ico("reporte",20)}</div>
          <b>Reporte de los 3 burós</b>
          <p>Cada cuenta con lo que dice TransUnion, Experian y Equifax, y el historial de pagos de 24 meses.</p>
          <span class="go">Abrir reporte →</span>
        </div>
        <div class="navcard" data-ir="alertas" role="button" tabindex="0">
          <div class="navcard__ico">${ico("campana",20)}</div>
          <b>Alertas y monitoreo</b>
          <p>${nuevas ? nuevas+" alertas nuevas esperando" : "Sin alertas nuevas. Vigilamos tus tres reportes todos los días."}</p>
          <span class="go">Ver alertas →</span>
        </div>
        <div class="navcard" data-ir="identidad" role="button" tabindex="0">
          <div class="navcard__ico">${ico("escudo",20)}</div>
          <b>Protección de identidad</b>
          <p>Tu correo y tu número de seguro social vigilados en la web oscura, con seguro de $1,000,000.</p>
          <span class="go">Revisar →</span>
        </div>
      </div>`;
  },

  montar(root){
    const btn = root.querySelector("#btnRefrescar");
    btn?.addEventListener("click", async ()=>{
      btn.classList.add("is-spin"); btn.disabled = true;
      try{
        await KESSER.credito.refrescar();
        toast("Puntaje actualizado");
        APP.render();
      }catch(err){
        btn.classList.remove("is-spin"); btn.disabled = false;
        toast(err.message, "bad");
      }
    });
    root.querySelectorAll('[role="button"][data-ir]').forEach(el=>
      el.addEventListener("keydown", e=>{
        if(e.key==="Enter"||e.key===" "){ e.preventDefault(); APP.ir(el.dataset.ir); }
      }));

    /* el puntaje sube contando al entrar */
    root.querySelectorAll("[data-contar]").forEach(el=>
      UI.contar(el, +el.dataset.contar, 1000));

    /* interruptores: el puntaje proyectado y la barra se mueven en vivo */
    const swPlan = root.querySelector("#swPlan");
    const swImp  = root.querySelector("#swImp");
    const num    = root.querySelector("#numProyectado");
    const marca  = root.querySelector('[data-mk="meta"]');
    const base   = +root.querySelector("[data-contar]").dataset.contar;

    function recalcular(){
      [swPlan, swImp].forEach(sw=> sw.closest("label").classList.toggle("is-on", sw.checked));
      let v = base;
      if(swPlan.checked) v += +swPlan.dataset.pts;
      if(swImp.checked)  v += +swImp.dataset.pts;
      v = Math.max(300, Math.min(850, v));
      num.textContent = v;
      if(marca){
        marca.style.left = (((v-300)/550)*100).toFixed(1) + "%";
        marca.querySelector(".track__lbl").textContent =
          (I18N.lang==="en" ? "You can reach " : "Puedes llegar a ") + v;
      }
    }
    [swPlan, swImp].forEach(sw=> sw?.addEventListener("change", recalcular));
  }
};

/* =========================================================================
   1b. CONSEJOS  —  la pantalla completa
   ========================================================================= */
VIEWS.consejos = {
  titulo:"Consejos", sub:"Qué hacer para subir tu puntaje", icono:"idea",
  async render(){
    const [cons, det] = await Promise.all([KESSER.credito.consejos(), KESSER.credito.detalle()]);
    const orden = [...cons].sort((a,b)=>b.impacto-a.impacto);
    const ganar = orden.filter(c=>c.tipo==="ganar").reduce((a,c)=>a+c.impacto,0);
    const proteger = orden.filter(c=>c.tipo==="proteger").reduce((a,c)=>a+c.impacto,0);

    return `
      <div class="page__head">
        <div><h1>Consejos para subir tu puntaje</h1>
          <p><span>Ordenados por cuánto te pueden mover el número. Cada uno te dice por qué
             te está afectando y exactamente qué hacer.</span></p></div>
      </div>

      <div class="grid g-3" style="margin-bottom:18px">
        <div class="card"><div class="card__body"><div class="stat">
          <span class="stat__k">Puntos por ganar</span>
          <span class="stat__v" style="color:var(--ok)">+${ganar}</span>
          <span class="stat__d">Sumando los ${orden.filter(c=>c.tipo==="ganar").length} consejos</span></div></div></div>
        <div class="card"><div class="card__body"><div class="stat">
          <span class="stat__k">Puntos por proteger</span>
          <span class="stat__v" style="color:var(--info)">${proteger}</span>
          <span class="stat__d">Lo que perderías si te descuidas</span></div></div></div>
        <div class="card"><div class="card__body"><div class="stat">
          <span class="stat__k">Solo con estos consejos</span>
          <span class="stat__v">${Math.min(850, det.actual + ganar)}</span>
          <span class="stat__d">Hoy estás en ${det.actual}</span></div></div></div>
      </div>

      <div class="tips">
        ${orden.map((c,i)=>`
          <article class="tip ${c.tipo==="proteger"?"tip--prot":""}">
            <div class="tip__pts"><b>${c.tipo==="proteger"?"":"+"}${c.impacto}</b><span>pts</span></div>
            <div>
              <div class="tip__t">${i+1}. ${esc(c.titulo)}</div>
              <div class="tip__meta">
                <span class="chip">${esc(c.factor)}</span>
                <span class="chip ${c.dificultad==="Alta prioridad"?"chip--bad":c.dificultad==="Media"?"chip--warn":"chip--ok"}">${esc(c.dificultad)}</span>
                <span class="chip">${ico("reloj",13)}${esc(c.plazo)}</span>
                ${c.tipo==="proteger"?'<span class="chip chip--info">Para no perder puntos</span>':""}
              </div>
              <div class="tip__body">
                <p>${esc(c.porque)}</p>
                <div class="tip__do"><b>Qué hacer</b><p>${esc(c.queHacer)}</p></div>
              </div>
            </div>
          </article>`).join("")}
      </div>

      <div class="callout callout--warn" style="margin-top:18px">
        <span style="color:var(--warn);flex:0 0 auto">${ico("alerta",18)}</span>
        <div><b>Los puntos son estimaciones</b>
          <p>Los modelos reales de puntaje son propiedad de FICO y de VantageScore.
             Estos números te dicen qué mover primero y qué tanto pesa, no son una promesa
             de resultado. Nadie puede garantizarte un puntaje.</p></div>
      </div>`;
  }
};

/* =========================================================================
   2. MIS PUNTAJES  —  velocímetro grande por buró
   ========================================================================= */
VIEWS.puntajes = {
  titulo:"Mis puntajes", sub:"Los 3 burós y qué mueve tu número", icono:"score",
  async render(){
    const [sc, hist, fact] = await Promise.all([
      KESSER.credito.scores(), KESSER.credito.historial(), KESSER.credito.factores()
    ]);
    const orden = ["tu","exp","eqf"];
    const burós = orden.map(id=>sc.burós.find(b=>b.id===id)).filter(Boolean);

    return `
      <div class="page__head">
        <div><h1>Mis puntajes</h1>
          <p><span>Actualizado el</span> ${fecha(sc.actualizado)} <span>· modelo</span> ${esc(sc.modelo)}<span>.
             Cada buró recibe información distinta, por eso los tres números no son iguales.</span></p></div>
        <div class="spacer"></div>
        <button class="btn">${ico("descargar",16)} Descargar PDF</button>
      </div>

      <div class="sc-grid" style="margin-bottom:18px">
        ${burós.map(b2=>{
          const bb = banda(b2.score);
          const d = b2.score - b2.prev;
          const principal = b2.id === "tu";
          return `<div class="sc-card ${principal?"sc-card--main":""}">
            ${principal?`<span class="sc-card__tag">Incluido en tu plan</span>`:""}
            <div class="sc-card__top">
              <div class="sc-card__logo" style="background:color-mix(in srgb,${BUROS[b2.id].c} 14%,transparent);color:${BUROS[b2.id].c}">
                ${BUROS[b2.id].s}</div>
              <div class="sc-card__who"><b>${esc(b2.nombre)}</b><span>${esc(sc.modelo)}</span></div>
            </div>
            ${UI.gaugeGrande(b2.score,{min:b2.min,max:b2.max})}
            <div class="sc-card__band">
              <span class="chip" style="background:color-mix(in srgb,${bb.color} 14%,transparent);color:${bb.color};height:27px;font-size:12.5px">
                ${bb.nombre}</span>
              ${delta(d)}
              <span style="color:var(--text-3);font-size:12.5px;font-weight:600">este mes</span>
            </div>
            <div class="sc-card__meta">
              <div><span>Mes pasado</span><b>${b2.prev}</b></div>
              <div><span>Cambio en 7 meses</span><b style="color:var(--ok)">+${b2.score - (hist[0]?hist[0][b2.id]:b2.score)}</b></div>
              <div><span>Rango del modelo</span><b>${b2.min}–${b2.max}</b></div>
            </div>
          </div>`;
        }).join("")}
      </div>

      <div class="grid g-main" style="margin-bottom:16px">
        <div class="card">
          <div class="card__head"><h3>Evolución de tu puntaje</h3><span class="sub">Últimos 7 meses</span></div>
          <div class="card__body">${lineChart(hist)}</div>
        </div>
        <div class="grid" style="gap:16px;align-content:start">
          <div class="card"><div class="card__head"><h3>Rangos de puntaje</h3></div>
            <div class="card__body"><div class="sc-scale">
              ${UI.BANDAS.map((b3,i)=>{
                const lo = i?UI.BANDAS[i-1].max+1:300;
                const quien = burós.filter(x=>x.score>=lo && x.score<=b3.max).map(x=>BUROS[x.id].s);
                return `<div class="sc-scale__row ${quien.length?"is-you":""}">
                  <i style="background:${b3.color}"></i>
                  <span>${b3.nombre}</span>
                  <span class="r">${lo}–${b3.max}</span>
                  ${quien.length?`<span class="chip chip--ok" style="height:21px;font-size:10.5px">${quien.join(" ")}</span>`:""}
                </div>`;
              }).join("")}
            </div></div>
          </div>
          <div class="callout">
            <span style="color:var(--info);flex:0 0 auto">${ico("escudo",18)}</span>
            <div><b>Revisar tu puntaje aquí no te baja puntos</b>
              <p>Las consultas que tú haces sobre tu propio crédito son “consultas suaves” y no afectan tu número.</p></div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card__head"><h3>Qué está afectando tu puntaje</h3>
          <span class="sub">Ordenado por peso real en el cálculo</span></div>
        <div class="card__body card__body--flush">
          <div class="table-wrap"><table class="tbl">
            <thead><tr><th>Factor</th><th>Peso</th><th>Situación</th><th>Nota</th><th class="num">Salud</th></tr></thead>
            <tbody>${fact.map(f=>`
              <tr><td class="cell-strong">${esc(f.nombre)}</td>
                <td>${esc(f.peso)}</td>
                <td style="color:var(--text-2)">${esc(f.detalle)}</td>
                <td><div class="grade grade--${f.nota}">${f.nota}</div></td>
                <td class="num" style="min-width:140px">
                  <div class="meter ${f.pct<50?"meter--bad":f.pct<75?"meter--warn":""}"><i style="width:${f.pct}%"></i></div>
                  <div class="cell-sub">${f.pct}/100</div></td></tr>`).join("")}
            </tbody></table></div>
        </div>
      </div>`;
  }
};

/* =========================================================================
   3. REPORTE DE CRÉDITO  —  tri-merge: cada cuenta con los 3 burós en columnas
   ========================================================================= */
const FILAS_TRI = [
  ["Número de cuenta",        (d,c)=> d.numero],
  ["Tipo de cuenta",          (d,c)=> c.tipo],
  ["Responsabilidad",         (d,c)=> c.responsable],
  ["Fecha de apertura",       (d)=> fecha(d.abierta)],
  ["Último reporte del buró", (d)=> fecha(d.reportado)],
  ["Estado de pago",          (d)=> d.estado],
  ["Saldo actual",            (d)=> money(d.saldo)],
  ["Límite / monto original", (d)=> d.limite ? money(d.limite) : "—"],
  ["Uso del límite",          (d)=> d.limite ? Math.round(d.saldo/d.limite*100)+"%" : "—"],
  ["Pago mensual",            (d)=> d.pago ? money(d.pago) : "—"],
  ["Último pago recibido",    (d)=> d.ultimoPago === "—" ? "—" : fecha(d.ultimoPago)],
  ["Atrasos de 30 días",      (d)=> String(d.d30)],
  ["Atrasos de 60 días",      (d)=> String(d.d60)],
  ["Atrasos de 90+ días",     (d)=> String(d.d90)]
];

/* cuántos datos no coinciden entre los burós que reportan la cuenta */
function diferencias(c, visibles){
  const cols = visibles.filter(id => c.burós[id]);
  if(cols.length < 2) return 0;
  return FILAS_TRI.filter(([,fn]) =>
    new Set(cols.map(id => String(fn(c.burós[id], c)))).size > 1).length;
}

function bloqueCuenta(c, visibles, abierto){
  const cols   = visibles.filter(id => c.burós[id]);
  const faltan = visibles.filter(id => !c.burós[id]);
  const algun  = cols.length ? c.burós[cols[0]] : null;
  if(!algun) return "";
  const difs = diferencias(c, visibles);

  const filas = FILAS_TRI.map(([etiqueta, fn])=>{
    const vals = cols.map(id => String(fn(c.burós[id], c)));
    const distintos = new Set(vals).size > 1;
    return `<tr><th>${esc(etiqueta)}</th>${
      visibles.map(id=>{
        const d = c.burós[id];
        if(!d) return `<td class="nd b-${id}">No reportada</td>`;
        return `<td class="b-${id} ${distintos?"dif":""}">${esc(String(fn(d,c)))}</td>`;
      }).join("")}</tr>`;
  }).join("");

  const estado = algun.estado;
  const chipEstado =
    estado==="Al día" ? '<span class="chip chip--ok">Al día</span>' :
    estado==="En cobranza" ? '<span class="chip chip--bad">En cobranza</span>' :
    estado==="Cerrada" ? '<span class="chip">Cerrada</span>' :
    `<span class="chip chip--warn">${esc(estado)}</span>`;

  const esRevolvente = c.tipo === "Tarjeta revolvente" && algun.limite;
  const uso = esRevolvente ? Math.round(algun.saldo / algun.limite * 100) : null;

  return `<article class="acct ${abierto?"is-open":""}" data-acct="${c.id}">
    <button class="acct__head" aria-expanded="${abierto}">
      <div class="ico ${c.negativa?"ico--bad":""}">${ico(c.tipo==="Cobranza"?"alerta":c.tipo==="Préstamo de auto"?"auto":c.tipo==="Tarjeta revolvente"?"tarjeta":"reporte",17)}</div>
      <div class="acct__name">
        <b>${esc(c.acreedor)}</b>
        <span>${esc(c.tipo)} · ${esc(algun.numero)}${c.nota?" · "+esc(c.nota):""}</span>
      </div>
      <div class="acct__tags">
        ${chipEstado}
        ${c.negativa?'<span class="chip chip--bad">Renglón negativo</span>':""}
        ${difs?`<span class="chip chip--warn">${difs} <span>${difs===1?"dato no coincide":"datos no coinciden"}</span></span>`:""}
      </div>
      <svg class="acct__car" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M6 9l6 6 6-6"/></svg>
    </button>

    <div class="acct__sum">
      <div><dt>Saldo</dt><dd>${money(algun.saldo)}</dd></div>
      ${algun.limite?`<div><dt>Límite</dt><dd>${money(algun.limite)}</dd></div>`:""}
      ${algun.pago?`<div><dt>Pago mensual</dt><dd>${money(algun.pago)}</dd></div>`:""}
      ${uso!==null?`<div class="acct__use"><dt>Uso del límite · ${uso}%</dt>
        <dd><div class="meter ${uso>70?"meter--bad":uso>30?"meter--warn":""}">
          <i style="width:${Math.min(100,uso)}%"></i></div></dd></div>`:""}
      <div class="acct__dots">
        ${["tu","exp","eqf"].map(id=>
          `<i class="${c.burós[id]?"":"off"}" style="${c.burós[id]?`background:var(--${id==="exp"?"exp":id==="eqf"?"eqf":"tu"})`:""}"
             title="${BUROS[id].n}">${BUROS[id].s}</i>`).join("")}
      </div>
    </div>

    <div class="acct__body">
      <div class="table-wrap"><table class="tri">
        <thead><tr><th>Dato</th>
          ${visibles.map(id=>`<th class="b b-${id}">
            <span class="tri-bureau"><i></i>${BUROS[id].n}</span></th>`).join("")}
        </tr></thead>
        <tbody>${filas}</tbody>
      </table></div>

      <footer class="acct__foot">
        <h4>Historial de pagos · 24 meses</h4>
        ${visibles.map(id=> c.burós[id]
            ? UI.histPagos(c.burós[id].historial, BUROS[id].s, id)
            : `<div class="hp"><span class="hp__lbl b-${id}">${BUROS[id].s}</span>
                 <div class="hp__row" style="align-items:center"><span style="font-size:11.5px;color:var(--text-3);font-weight:600">No reportada</span></div></div>`
          ).join("")}
        <div class="hp-meses">${UI.mesesAtras(24).map((m,i)=>
          `<span>${i%4===0?esc(m):""}</span>`).join("")}</div>
      </footer>
    </div>
  </article>`;
}

VIEWS.reporte = {
  titulo:"Reporte de crédito", sub:"Los 3 burós lado a lado", icono:"reporte",
  async render(){
    const r = await KESSER.credito.reporte();
    const tab = sessionStorage.getItem("kesser.tabReporte") || "cuentas";
    const filtro = sessionStorage.getItem("kesser.buroReporte") || "todos";
    const visibles = filtro === "todos" ? ["tu","exp","eqf"] : [filtro];
    const vista = sessionStorage.getItem("kesser.filtroCuentas") || "todas";

    /* qué cuentas están desplegadas; la primera vez, las negativas */
    let abiertas;
    try{ abiertas = JSON.parse(sessionStorage.getItem("kesser.acctAbiertas")); }catch{}
    if(!Array.isArray(abiertas)){
      abiertas = r.cuentas.filter(c=>c.negativa).map(c=>c.id);
      sessionStorage.setItem("kesser.acctAbiertas", JSON.stringify(abiertas));
    }

    const prim = c => c.burós.tu || c.burós.exp || c.burós.eqf;
    const vivas = r.cuentas.filter(c => prim(c).estado !== "Cerrada");
    const neg = r.cuentas.filter(c => c.negativa);
    const totalSaldo = r.cuentas.reduce((a,c)=> a + prim(c).saldo, 0);
    const revolv = r.cuentas.filter(c => c.tipo === "Tarjeta revolvente" && prim(c).estado !== "Cerrada");
    const uso = Math.round(revolv.reduce((a,c)=>a+prim(c).saldo,0) /
                Math.max(1, revolv.reduce((a,c)=>a+prim(c).limite,0)) * 100);

    const grupos = [
      ["Tarjetas y líneas revolventes", c => c.tipo === "Tarjeta revolvente"],
      ["Préstamos a plazo",            c => c.tipo === "Préstamo de auto" || c.tipo === "Préstamo estudiantil"],
      ["Cuentas en cobranza",          c => c.tipo === "Cobranza"]
    ];

    const FILTROS = {
      todas:      ()=> true,
      negativas:  c => c.negativa,
      abiertas:   c => prim(c).estado !== "Cerrada",
      difieren:   c => diferencias(c, visibles) > 0
    };
    const pasa = FILTROS[vista] || FILTROS.todas;
    const visiblesCuentas = r.cuentas.filter(pasa);
    const todasAbiertas = visiblesCuentas.length > 0 &&
      visiblesCuentas.every(c => abiertas.includes(c.id));

    const paneles = {
      cuentas: `
        <div class="rep-tools">
          ${[["todas","Todas"],["negativas","Negativas"],["abiertas","Abiertas"],["difieren","No coinciden"]]
            .map(([k,n])=>{
              const cuantas = r.cuentas.filter(FILTROS[k]).length;
              return `<button class="pill ${vista===k?"is-active":""}" data-filtroc="${k}">
                ${n} <span class="pill__n">${cuantas}</span></button>`;
            }).join("")}
          <button class="pill" data-todas="${todasAbiertas?"cerrar":"abrir"}" style="margin-left:auto">
            ${ico(todasAbiertas?"abajo":"mas",14)} ${todasAbiertas?"Cerrar todas":"Abrir todas"}</button>
        </div>
        ${visiblesCuentas.length ? grupos.map(([titulo, test])=>{
            const lista = visiblesCuentas.filter(test);
            if(!lista.length) return "";
            return `<h2 style="font-size:15px;margin:22px 0 12px;color:var(--text-2)">
                ${esc(titulo)} <span style="color:var(--text-3);font-weight:600">(${lista.length})</span></h2>
              ${lista.map(c=>bloqueCuenta(c, visibles, abiertas.includes(c.id))).join("")}`;
          }).join("")
        : `<div class="card"><div class="empty"><h3>Nada con ese filtro</h3>
             <p>Prueba con “Todas”.</p></div></div>`}
        <div class="card"><div class="card__body">${UI.histLeyenda()}</div></div>`,

      personal:`
        <div class="grid g-2">
          <div class="card"><div class="card__head"><h3>Nombres en archivo</h3></div>
            <div class="card__body card__body--flush"><div class="list">
              ${r.personal.nombres.map(n=>`<div class="list__row">
                <div class="list__main"><b>${esc(n)}</b></div></div>`).join("")}
            </div></div></div>
          <div class="card"><div class="card__head"><h3>Empleadores reportados</h3></div>
            <div class="card__body card__body--flush"><div class="list">
              ${r.personal.empleadores.map(e=>`<div class="list__row">
                <div class="list__main"><b>${esc(e.valor)}</b><span><span>Reportado</span> ${esc(e.reportado)}</span></div>
                <div class="list__meta">${e.burós.map(buroChip).join(" ")}</div></div>`).join("")}
            </div></div></div>
          <div class="card" style="grid-column:1/-1">
            <div class="card__head"><h3>Direcciones en archivo</h3>
              <span class="sub">Una dirección que no reconoces puede ser señal de fraude</span></div>
            <div class="card__body card__body--flush"><div class="list">
              ${r.personal.direcciones.map(d=>`<div class="list__row">
                <div class="list__ico ${d.sospechosa?"list__ico--bad":""}">${ico(d.sospechosa?"alerta":"check",16)}</div>
                <div class="list__main"><b>${esc(d.valor)}</b><span><span>Desde</span> ${esc(d.desde)}</span></div>
                <div class="list__meta">${d.burós.map(buroChip).join(" ")}
                  ${d.sospechosa?'<br><span class="chip chip--bad" style="height:20px;font-size:10.5px">No reconocida</span>':""}</div>
              </div>`).join("")}
            </div></div></div>
        </div>`,

      consultas:`
        <div class="card"><div class="card__body card__body--flush">
          <div class="table-wrap"><table class="tbl">
            <thead><tr><th>Empresa</th><th>Fecha</th><th>Tipo</th><th>Buró</th><th>Motivo</th></tr></thead>
            <tbody>${r.consultas.map(q=>`<tr>
              <td class="cell-strong">${esc(q.empresa)}</td>
              <td>${fecha(q.fecha)}</td>
              <td>${q.tipo==="Dura"?'<span class="chip chip--warn">Dura</span>':'<span class="chip chip--ok">Suave</span>'}</td>
              <td>${buroChip(q.buró)}</td>
              <td style="color:var(--text-2)">${esc(q.motivo)}</td>
            </tr>`).join("")}</tbody></table></div>
        </div></div>
        <div class="callout callout--warn" style="margin-top:14px">
          <span style="color:var(--warn);flex:0 0 auto">${ico("alerta",18)}</span>
          <div><b>Las consultas duras restan puntos</b>
            <p>Se quedan 2 años en tu reporte y pesan ~8% de tu puntaje.
               Las consultas suaves (pre-aprobaciones, tus propias revisiones) no afectan.</p></div>
        </div>`,

      publicos:`
        <div class="card"><div class="card__body card__body--flush">
          ${r.publicos.length ? `<div class="table-wrap"><table class="tbl">
            <thead><tr><th>Tipo</th><th>Entidad</th><th>Fecha</th><th class="num">Monto</th><th>Estado</th><th>Buró</th></tr></thead>
            <tbody>${r.publicos.map(p=>`<tr>
              <td class="cell-strong">${esc(p.tipo)}</td><td>${esc(p.entidad)}</td>
              <td>${fecha(p.fecha)}</td><td class="num">${money(p.monto)}</td>
              <td><span class="chip chip--ok">${esc(p.estado)}</span></td>
              <td>${p.burós.map(buroChip).join(" ")}</td>
            </tr>`).join("")}</tbody></table></div>`
          : `<div class="empty"><h3>Sin registros públicos</h3><p>No hay quiebras, gravámenes ni juicios en tu reporte.</p></div>`}
        </div></div>`
    };

    return `
      <div class="page__head">
        <div><h1>Reporte de crédito</h1>
          <p><span>Reporte combinado de TransUnion, Experian y Equifax. Cuando los burós no dicen
             lo mismo, el dato aparece</span> <b style="color:var(--brand-accent-dark)">resaltado</b>.</p></div>
        <div class="spacer"></div>
        <div class="pick">
          <label for="pickBuro">Ver</label>
          <select id="pickBuro">
            <option value="todos" ${filtro==="todos"?"selected":""}>Los 3 burós</option>
            <option value="tu"  ${filtro==="tu"?"selected":""}>Solo TransUnion</option>
            <option value="exp" ${filtro==="exp"?"selected":""}>Solo Experian</option>
            <option value="eqf" ${filtro==="eqf"?"selected":""}>Solo Equifax</option>
          </select>
        </div>
        <button class="btn">${ico("descargar",16)} Exportar PDF</button>
      </div>

      <div class="grid g-4" style="margin-bottom:18px">
        <div class="card"><div class="card__body"><div class="stat">
          <span class="stat__k">Cuentas totales</span><span class="stat__v">${r.cuentas.length}</span>
          <span class="stat__d">${vivas.length} activas</span></div></div></div>
        <div class="card"><div class="card__body"><div class="stat">
          <span class="stat__k">Renglones negativos</span>
          <span class="stat__v" style="color:var(--bad)">${neg.length}</span>
          <span class="stat__d">${money(neg.reduce((a,c)=>a+prim(c).saldo,0))} en cuentas negativas</span></div></div></div>
        <div class="card"><div class="card__body"><div class="stat">
          <span class="stat__k">Deuda total</span><span class="stat__v">${money(totalSaldo)}</span>
          <span class="stat__d">Todas las cuentas</span></div></div></div>
        <div class="card"><div class="card__body"><div class="stat">
          <span class="stat__k">Uso de tarjetas</span>
          <span class="stat__v" style="color:${uso>30?"var(--bad)":"var(--ok)"}">${uso}%</span>
          <span class="stat__d">Meta recomendada: menos de 30%</span></div></div></div>
      </div>

      <div class="tabs">
        ${[["cuentas","Cuentas"],["personal","Datos personales"],["consultas","Consultas"],["publicos","Registros públicos"]]
          .map(([k,n])=>`<button class="tab ${tab===k?"is-active":""}" data-tab="${k}">${n}</button>`).join("")}
      </div>
      <div id="panelReporte">${paneles[tab]}</div>`;
  },
  montar(root){
    root.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>{
      sessionStorage.setItem("kesser.tabReporte", b.dataset.tab); APP.render();
    }));
    root.querySelector("#pickBuro")?.addEventListener("change", e=>{
      sessionStorage.setItem("kesser.buroReporte", e.target.value); APP.render();
    });
    root.querySelectorAll("[data-filtroc]").forEach(b=>b.addEventListener("click",()=>{
      sessionStorage.setItem("kesser.filtroCuentas", b.dataset.filtroc); APP.render();
    }));

    const leer = ()=>{ try{ return JSON.parse(sessionStorage.getItem("kesser.acctAbiertas"))||[]; }catch{ return []; } };
    const guardar = a => sessionStorage.setItem("kesser.acctAbiertas", JSON.stringify(a));

    /* desplegar una cuenta sin recargar la pantalla */
    root.querySelectorAll(".acct").forEach(art=>{
      const head = art.querySelector(".acct__head");
      head.addEventListener("click",()=>{
        const abierto = art.classList.toggle("is-open");
        head.setAttribute("aria-expanded", abierto);
        const a = leer(), id = art.dataset.acct;
        guardar(abierto ? [...new Set([...a,id])] : a.filter(x=>x!==id));
      });
    });

    root.querySelector("[data-todas]")?.addEventListener("click", e=>{
      const abrir = e.currentTarget.dataset.todas === "abrir";
      guardar(abrir ? [...root.querySelectorAll(".acct")].map(a=>a.dataset.acct) : []);
      APP.render();
    });
  }
};

/* =========================================================================
   4. ALERTAS / MONITOREO
   ========================================================================= */
VIEWS.alertas = {
  titulo:"Alertas", sub:"Monitoreo diario de los 3 burós", icono:"alerta",
  async render(){
    const al = await KESSER.alertas.listar();
    const filtro = sessionStorage.getItem("kesser.filtroAlertas") || "todas";
    const vista = filtro==="todas" ? al
      : filtro==="nuevas" ? al.filter(a=>!a.leida)
      : al.filter(a=>a.nivel==="bad"||a.nivel==="warn");
    const nuevas = al.filter(a=>!a.leida).length;

    return `
      <div class="page__head">
        <div><h1>Alertas</h1>
          <p>Vigilamos tus tres reportes todos los días. Cuando algo cambia, lo ves aquí primero.</p></div>
        <div class="spacer"></div>
        <button class="btn" data-leer-todo>${ico("check",16)} Marcar todas como leídas</button>
      </div>

      <div class="grid g-3" style="margin-bottom:18px">
        <div class="card"><div class="card__body"><div class="stat">
          <span class="stat__k">Sin leer</span><span class="stat__v">${nuevas}</span></div></div></div>
        <div class="card"><div class="card__body"><div class="stat">
          <span class="stat__k">Requieren acción</span>
          <span class="stat__v" style="color:var(--bad)">${al.filter(a=>a.accionable).length}</span></div></div></div>
        <div class="card"><div class="card__body"><div class="stat">
          <span class="stat__k">Monitoreo activo</span>
          <span class="stat__v" style="color:var(--ok);font-size:20px">3 burós · 24/7</span></div></div></div>
      </div>

      <div class="tabs">
        ${[["todas","Todas ("+al.length+")"],["nuevas","Sin leer ("+nuevas+")"],["criticas","Críticas"]]
          .map(([k,n])=>`<button class="tab ${filtro===k?"is-active":""}" data-filtro="${k}">${n}</button>`).join("")}
      </div>

      <div class="card"><div class="card__body card__body--flush"><div class="list">
        ${vista.length ? vista.map(a=>`
          <div class="list__row" style="${a.leida?"":"background:var(--surface-2)"}">
            <div class="list__ico list__ico--${a.nivel}">${ico(a.nivel==="ok"?"check":a.nivel==="info"?"ojo":"alerta",16)}</div>
            <div class="list__main">
              <b>${esc(a.titulo)} ${a.leida?"":'<span class="chip chip--bad" style="height:18px;font-size:10px">NUEVA</span>'}</b>
              <span>${esc(a.detalle)}</span>

            </div>
            <div class="list__meta">${buroChip(a.buró)}<br>${hace(a.fecha)}</div>
          </div>`).join("")
        : `<div class="empty"><h3>Nada por aquí</h3><p>No hay alertas con ese filtro.</p></div>`}
      </div></div></div>`;
  },
  montar(root){
    root.querySelectorAll("[data-filtro]").forEach(b=>b.addEventListener("click",()=>{
      sessionStorage.setItem("kesser.filtroAlertas", b.dataset.filtro); APP.render();
    }));
    root.querySelector("[data-leer-todo]")?.addEventListener("click", async()=>{
      await KESSER.alertas.marcarTodas();
      toast("Todas las alertas quedaron marcadas como leídas"); APP.render();
    });
  }
};

/* =========================================================================
   6. SIMULADOR DE PUNTAJE
   ========================================================================= */
VIEWS.simulador = {
  titulo:"Simulador de puntaje", sub:"Qué pasa si…", icono:"sim",
  async render(){
    const sc = await KESSER.credito.scores();
    const base = Math.round(sc.burós.reduce((a,b)=>a+b.score,0)/sc.burós.length);
    return `
      <div class="page__head">
        <div><h1>Simulador de puntaje</h1>
          <p>Prueba decisiones antes de tomarlas. Marca las acciones y mira el efecto estimado en tu puntaje.</p></div>
      </div>
      <div class="sim-grid">
        <div class="card"><div class="card__head"><h3>Elige tus acciones</h3></div>
          <div class="card__body" style="display:grid;gap:11px">
            <label class="sim-opt"><input type="checkbox" id="sPagar">
              <div><b>Pagar mis tarjetas de crédito</b>
                <span>Hoy usas el 81% de tu límite. Bajarlo es el movimiento más rápido.</span>
                <div style="margin-top:11px">
                  <input type="range" id="sPagarPct" min="10" max="100" value="60" step="10">
                  <div class="hint">Pagar <b id="sPagarLbl">60%</b> del saldo de tarjetas (<span id="sPagarUSD">$2,418</span>)</div>
                </div></div></label>

            <label class="sim-opt"><input type="checkbox" id="sCobranza">
              <div><b>Eliminar una cuenta en cobranza</b>
                <span>Portfolio Recovery · $1,847 · no validada</span></div></label>

            <label class="sim-opt"><input type="checkbox" id="sTardio">
              <div><b>Quitar un pago tardío</b>
                <span>Synchrony/Amazon · 30 días de atraso</span></div></label>

            <label class="sim-opt"><input type="checkbox" id="sAutorizado">
              <div><b>Ser usuario autorizado en una cuenta sana</b>
                <span>Un familiar con historial largo y uso bajo te agrega</span></div></label>

            <label class="sim-opt"><input type="checkbox" id="sNueva">
              <div><b>Abrir una tarjeta nueva</b>
                <span>Genera una consulta dura y baja tu antigüedad promedio</span></div></label>

            <label class="sim-opt"><input type="checkbox" id="sCerrar">
              <div><b>Cerrar mi tarjeta más antigua</b>
                <span>Casi siempre es mala idea: pierdes historial y límite</span></div></label>

            <div style="border-top:1px solid var(--line);padding-top:14px">
              <label style="font-size:12.5px;font-weight:700;color:var(--text-2)">
                Meses pagando todo a tiempo: <b id="sMesesLbl">6</b></label>
              <input type="range" id="sMeses" min="0" max="12" value="6" step="1">
            </div>
          </div>
        </div>

        <div class="grid" style="gap:16px;align-content:start">
          <div class="sim-result" id="simOut">
            <small>Puntaje proyectado</small>
            <div class="big">${base}</div>
            <small>Hoy: ${base} · sin cambios</small>
          </div>
          <div class="card"><div class="card__head"><h3>Desglose</h3></div>
            <div class="card__body" id="simNotas">
              <p style="color:var(--text-3)">Marca una acción para ver cuántos puntos aporta.</p></div></div>
          <div class="callout callout--warn">
            <span style="color:var(--warn);flex:0 0 auto">${ico("alerta",18)}</span>
            <div><b>Es una estimación</b>
              <p>Los modelos reales de puntaje son propiedad de FICO y VantageScore.
                 Esto te orienta sobre la dirección y el tamaño del cambio, no es una promesa.</p></div>
          </div>
        </div>
      </div>`;
  },
  montar(root){
    const saldoTarjetas = 2840+1190;
    const ids = ["sPagar","sCobranza","sTardio","sAutorizado","sNueva","sCerrar"];
    const g = id => root.querySelector("#"+id);

    async function recalc(){
      ids.forEach(i=>g(i).closest(".sim-opt").classList.toggle("is-on", g(i).checked));
      const pctV = +g("sPagarPct").value, meses = +g("sMeses").value;
      g("sPagarLbl").textContent = pctV+"%";
      g("sPagarUSD").textContent = money(Math.round(saldoTarjetas*pctV/100));
      g("sMesesLbl").textContent = meses;

      const sc = await KESSER.credito.scores();
      const base = Math.round(sc.burós.reduce((a,b)=>a+b.score,0)/sc.burós.length);
      const res = await KESSER.credito.simular(base,{
        pagarTarjetas:g("sPagar").checked, pagarTarjetasPct:pctV,
        eliminarCobranza:g("sCobranza").checked, eliminarTardio:g("sTardio").checked,
        autorizado:g("sAutorizado").checked, nuevaTarjeta:g("sNueva").checked,
        cerrarTarjeta:g("sCerrar").checked, meses
      });
      const b = banda(res.proyectado);
      root.querySelector("#simOut").innerHTML = `
        <small>Puntaje proyectado</small>
        <div class="big" style="color:${res.delta>=0?"var(--brand-accent)":"#FF8E8E"}">${res.proyectado}</div>
        <small>Hoy ${res.base} · <b style="color:${res.delta>=0?"var(--brand-accent)":"#FF8E8E"}">${res.delta>=0?"+":""}${res.delta} puntos</b></small>
        <div class="chip" style="margin-top:8px;background:rgba(255,255,255,.12);color:#fff">${b.nombre}</div>`;
      root.querySelector("#simNotas").innerHTML = res.notas.length
        ? `<div class="list" style="margin:-18px">${res.notas.map(n=>`
            <div class="list__row"><div class="list__main"><b style="font-weight:600;font-size:13px">${esc(n)}</b></div></div>`).join("")}</div>`
        : `<p style="color:var(--text-3)">Marca una acción para ver cuántos puntos aporta.</p>`;
    }
    [...ids,"sPagarPct","sMeses"].forEach(i=>{
      g(i).addEventListener("input", recalc); g(i).addEventListener("change", recalc);
    });
    recalc();
  }
};

/* =========================================================================
   7. MONEY MANAGER
   ========================================================================= */
VIEWS.dinero = {
  titulo:"Money Manager", sub:"Tus cuentas, gastos y presupuesto", icono:"dinero",
  async render(){
    const f = await KESSER.dinero.resumen();
    const maxBar = Math.max(...f.porMes.flatMap(m=>[m.ingreso,m.gasto]));
    const ahorro = f.ingresoMes - f.gastoMes;
    return `
      <div class="page__head">
        <div><h1>Money Manager</h1>
          <p>Conecta tus cuentas y mira a dónde se va el dinero. Lo que controlas aquí
             es lo que hace subir tu puntaje allá.</p></div>
        <div class="spacer"></div>
        <button class="btn btn--primary">${ico("mas",16)} Conectar cuenta</button>
      </div>

      <div class="grid g-4" style="margin-bottom:16px">
        <div class="card"><div class="card__body"><div class="stat">
          <span class="stat__k">Patrimonio neto</span><span class="stat__v">${money(f.netWorth)}</span>
          <span class="stat__d">Activos menos deudas</span></div></div></div>
        <div class="card"><div class="card__body"><div class="stat">
          <span class="stat__k">Ingresos del mes</span>
          <span class="stat__v" style="color:var(--ok)">${money(f.ingresoMes)}</span></div></div></div>
        <div class="card"><div class="card__body"><div class="stat">
          <span class="stat__k">Gastos del mes</span>
          <span class="stat__v" style="color:var(--bad)">${money(f.gastoMes)}</span></div></div></div>
        <div class="card"><div class="card__body"><div class="stat">
          <span class="stat__k">Te queda</span>
          <span class="stat__v" style="color:${ahorro>0?"var(--ok)":"var(--bad)"}">${money(ahorro)}</span>
          <span class="stat__d">${pct(ahorro/f.ingresoMes*100)} de tu ingreso</span></div></div></div>
      </div>

      <div class="grid g-main" style="margin-bottom:16px">
        <div class="card">
          <div class="card__head"><h3>Ingresos vs. gastos</h3><span class="sub">6 meses</span></div>
          <div class="card__body">
            <div class="bars">
              ${f.porMes.map(m=>`
                <div class="bars__col" style="display:flex;flex-direction:column;justify-content:flex-end;height:100%">
                  <div style="display:flex;gap:4px;align-items:flex-end;width:100%;justify-content:center;flex:1">
                    <div class="bars__bar" style="height:${m.ingreso/maxBar*100}%" title="Ingreso ${money(m.ingreso)}"></div>
                    <div class="bars__bar bars__bar--muted" style="height:${m.gasto/maxBar*100}%" title="Gasto ${money(m.gasto)}"></div>
                  </div>
                  <div class="bars__lbl" style="margin-top:7px">${esc(m.mes)}</div>
                </div>`).join("")}
            </div>
            <div style="display:flex;gap:14px;margin-top:14px">
              <span class="chip chip--ok">Ingreso</span><span class="chip">Gasto</span></div>
          </div>
        </div>

        <div class="card">
          <div class="card__head"><h3>Cuentas conectadas</h3></div>
          <div class="card__body card__body--flush"><div class="list">
            ${f.cuentas.map(c=>`<div class="list__row">
              <div class="list__ico">${ico("dinero",15)}</div>
              <div class="list__main"><b>${esc(c.nombre)}</b><span>${esc(c.tipo)} · ${esc(c.institucion)}</span></div>
              <div class="list__meta" style="font-weight:800;font-size:14px;color:${c.saldo<0?"var(--bad)":"var(--text)"}">
                ${money2(c.saldo)}</div></div>`).join("")}
          </div></div>
        </div>
      </div>

      <div class="grid g-2">
        <div class="card">
          <div class="card__head"><h3>Presupuesto por categoría</h3></div>
          <div class="card__body" style="display:grid;gap:14px">
            ${f.categorias.map(c=>{
              const p = Math.round(c.monto/c.presupuesto*100);
              return `<div>
                <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px">
                  <b>${esc(c.nombre)}</b>
                  <span style="color:${p>100?"var(--bad)":"var(--text-2)"}">${money(c.monto)} / ${money(c.presupuesto)}</span></div>
                <div class="meter ${p>100?"meter--bad":p>90?"meter--warn":""}"><i style="width:${Math.min(100,p)}%"></i></div>
              </div>`;
            }).join("")}
          </div>
        </div>
        <div class="card">
          <div class="card__head"><h3>Movimientos recientes</h3></div>
          <div class="card__body card__body--flush"><div class="table-wrap">
            <table class="tbl" style="min-width:420px">
              <thead><tr><th>Fecha</th><th>Descripción</th><th>Categoría</th><th class="num">Monto</th></tr></thead>
              <tbody>${f.movimientos.map(m=>`<tr>
                <td style="color:var(--text-3);white-space:nowrap">${fecha(m.fecha)}</td>
                <td class="cell-strong">${esc(m.desc)}</td>
                <td><span class="chip">${esc(m.cat)}</span></td>
                <td class="num" style="font-weight:700;color:${m.monto<0?"var(--text)":"var(--ok)"}">${money2(m.monto)}</td>
              </tr>`).join("")}</tbody></table>
          </div></div>
        </div>
      </div>`;
  }
};

/* =========================================================================
   8. KESSER MATCH  —  comparación de ofertas precalificadas
   ========================================================================= */
VIEWS.ofertas = {
  titulo:"Kesser Match", sub:"Ofertas para las que ya calificas", icono:"ofertas",
  async render(){
    const [ofs, cats, det] = await Promise.all([
      KESSER.ofertas.listar(), KESSER.credito.categorias(), KESSER.credito.detalle()
    ]);
    const cat = sessionStorage.getItem("kesser.catMatch") || cats[0].id;
    const meta = cats.find(c=>c.id===cat) || cats[0];
    const mios = ofs.filter(o=>o.cat===cat)
                    .map(o=>({...o, califico: det.actual >= o.scoreMin}))
                    .sort((a,b)=> (b.califico - a.califico) || (a.aprOrden - b.aprOrden));
    const mejor = mios.find(o=>o.califico);
    const totalSi = ofs.filter(o=>det.actual >= o.scoreMin).length;

    const esTarjeta = meta.clase === "tarjeta";
    const columnas = esTarjeta
      ? ["Producto","Tasa (APR)","Límite estimado","Anualidad","Por qué conviene","¿Calificas?",""]
      : ["Producto","Tasa (APR)","Monto máximo","Plazo","Cuota estimada","Por qué conviene","¿Calificas?",""];

    const fila = o => {
      const logo = `<div class="cmp__logo" style="background:${o.color}">${esc(o.emisor[0])}</div>`;
      const prod = `<td><div class="cmp__prod">${logo}
          <div><b>${esc(o.producto)}</b><span>${esc(o.emisor)}</span>
          ${o===mejor?'<span class="cmp__best" style="margin-top:4px">'+ico("check",11)+'Mejor tasa</span>':""}</div>
        </div></td>`;
      const apr = `<td><span class="cmp__apr" style="color:${o.califico?"var(--text)":"var(--text-3)"}">${esc(o.apr)}</span></td>`;
      const califica = `<td>${o.califico
          ? '<span class="chip chip--ok">'+ico("check",13)+'Calificas</span>'
          : '<span class="chip chip--warn">Desde '+o.scoreMin+'</span>'}</td>`;
      const cta = `<td><button class="btn btn--sm ${o.califico?"btn--primary":""}" ${o.califico?"":"disabled"}>
          ${o.califico?"Ver oferta":"No calificas"}</button></td>`;
      const ventaja = `<td style="color:var(--text-2);max-width:280px">${esc(o.extra)}</td>`;

      return `<tr class="${o.califico?(o===mejor?"top":""):"no"}">
        ${prod}${apr}
        ${esTarjeta
          ? `<td class="cell-strong">${esc(o.limite)}</td>
             <td>${o.anualidad ? money(o.anualidad) : '<span class="chip chip--ok">Sin anualidad</span>'}</td>`
          : `<td class="num cell-strong">${money(o.monto)}</td>
             <td class="num" style="color:var(--text-2)">${o.plazo} meses</td>
             <td class="num cell-strong">${money(o.cuota)}<div class="cell-sub">al mes</div></td>`}
        ${ventaja}${califica}${cta}
      </tr>`;
    };

    return `
      <div class="km-head">
        <div style="flex:1 1 320px;min-width:0">
          <h1>Kesser Match</h1>
          <p><span>Comparamos las ofertas reales contra el puntaje que tienes hoy y te decimos
             para cuáles ya calificas. Mirar esto no deja consulta dura en tu reporte.</span></p>
        </div>
        <div class="km-head__score">
          <span>Tu puntaje</span>
          <b>${det.actual}</b>
          <span>TransUnion</span>
        </div>
      </div>

      <div class="callout" style="margin-bottom:18px">
        <span style="color:var(--info);flex:0 0 auto">${ico("check",18)}</span>
        <div><b><span>Calificas para</span> ${totalSi} <span>de</span> ${ofs.length} <span>ofertas</span></b>
          <p><span>Cada punto que subas abre más opciones y te baja la tasa. Por eso la tasa importa
             más que el límite: es lo que de verdad pagas.</span></p></div>
      </div>

      <div class="km-cats">
        ${cats.map(c=>{
          const dela = ofs.filter(o=>o.cat===c.id);
          const puedo = dela.filter(o=>det.actual >= o.scoreMin).length;
          return `<button class="km-cat ${c.id===cat?"is-active":""}" data-cat="${c.id}">
            ${ico(c.icono,17)} ${esc(c.nombre)}
            <span class="km-cat__n">${puedo}/${dela.length}</span></button>`;
        }).join("")}
      </div>

      <div class="card">
        <div class="card__head"><h3>${esc(meta.nombre)}</h3>
          <span class="sub">Ordenadas por tasa, de la más barata a la más cara</span></div>
        <div class="card__body card__body--flush">
          <div class="table-wrap"><table class="cmp">
            <thead><tr>${columnas.map(c=>`<th class="${c==="Monto máximo"||c==="Plazo"||c==="Cuota estimada"?"num":""}">${c}</th>`).join("")}</tr></thead>
            <tbody>${mios.map(fila).join("")}</tbody>
          </table></div>
        </div>
      </div>

      <div class="callout callout--warn" style="margin-top:18px">
        <span style="color:var(--warn);flex:0 0 auto">${ico("alerta",18)}</span>
        <div><b>Precalificado no es aprobado</b>
          <p><span>Precalificar significa que tu puntaje cumple lo mínimo que pide el emisor.
             La aprobación final depende de tus ingresos, tu deuda y la verificación que ellos
             hagan, y ahí sí te harán una consulta dura. Kesser Credit puede recibir una comisión
             si contratas por estos enlaces: eso no cambia el orden, que va siempre por tasa.</span></p></div>
      </div>`;
  },
  montar(root){
    root.querySelectorAll("[data-cat]").forEach(b=>b.addEventListener("click",()=>{
      sessionStorage.setItem("kesser.catMatch", b.dataset.cat); APP.render();
    }));
  }
};

/* =========================================================================
   9. PROTECCIÓN DE IDENTIDAD
   ========================================================================= */
VIEWS.identidad = {
  titulo:"Protección de identidad", sub:"Dark web, SSN y seguro", icono:"id",
  async render(){
    const i = await KESSER.identidad.estado();
    const alertas = i.monitoreo.filter(m=>m.estado==="alerta").length;
    return `
      <div class="page__head">
        <div><h1>Protección de identidad</h1>
          <p>Vigilamos tu nombre, tu correo y tu número de seguro social en la web oscura y en registros públicos.</p></div>
      </div>
      <div class="grid g-3" style="margin-bottom:18px">
        <div class="card"><div class="card__body"><div class="stat">
          <span class="stat__k">Estado</span>
          <span class="stat__v" style="color:${alertas?"var(--warn)":"var(--ok)"};font-size:21px">
            ${alertas?alertas+" hallazgo(s)":"Protegido"}</span></div></div></div>
        <div class="card"><div class="card__body"><div class="stat">
          <span class="stat__k">Seguro contra robo de identidad</span>
          <span class="stat__v">${money(i.seguro)}</span>
          <span class="stat__d">Incluido en tu plan</span></div></div></div>
        <div class="card"><div class="card__body"><div class="stat">
          <span class="stat__k">Monitores activos</span>
          <span class="stat__v">${i.monitoreo.length}</span></div></div></div>
      </div>

      <div class="grid g-main">
        <div class="card">
          <div class="card__head"><h3>Monitoreo</h3></div>
          <div class="card__body card__body--flush"><div class="list">
            ${i.monitoreo.map(m=>`<div class="list__row">
              <div class="list__ico list__ico--${m.estado==="alerta"?"bad":"ok"}">
                ${ico(m.estado==="alerta"?"alerta":"check",16)}</div>
              <div class="list__main"><b>${esc(m.nombre)}</b><span>${esc(m.detalle)}</span></div>
              <div class="list__meta">${m.estado==="alerta"
                ? '<span class="chip chip--bad">Revisar</span>'
                : '<span class="chip chip--ok">Limpio</span>'}</div></div>`).join("")}
          </div></div>
        </div>

        <div class="grid" style="gap:16px;align-content:start">
          <div class="card"><div class="card__head"><h3>Herramientas de defensa</h3></div>
            <div class="card__body" style="display:grid;gap:9px">
              <button class="btn btn--block">${ico("candado",15)} Congelar mi crédito en los 3 burós</button>
              <button class="btn btn--block">${ico("escudo",15)} Poner alerta de fraude (1 año)</button>
              <button class="btn btn--block">${ico("campana",15)} Quitarme de listas de pre-aprobación</button>
              <button class="btn btn--block">${ico("carta",15)} Reportar robo de identidad (FTC)</button>
            </div></div>
          <div class="callout callout--warn">
            <span style="color:var(--warn);flex:0 0 auto">${ico("alerta",18)}</span>
            <div><b>Tu correo está en una filtración</b>
              <p>Cambia la contraseña de ese correo y activa verificación en dos pasos hoy mismo.</p></div>
          </div>
        </div>
      </div>`;
  }
};

/* =========================================================================
   10. CLIENTES (CRM interno — solo admin/agente)
   ========================================================================= */
VIEWS.clientes = {
  titulo:"Clientes", sub:"CRM interno de Kesser Credit", icono:"crm", soloAdmin:true,
  async render(){
    const crm = await KESSER.crm.clientes();
    const vista = sessionStorage.getItem("kesser.vistaCRM") || "pipeline";
    const activos = crm.clientes.filter(c=>c.etapa==="Activo");
    const mrr = crm.clientes.reduce((a,c)=>a+(c.valor||0),0);
    const subidaProm = Math.round(
      activos.concat(crm.clientes.filter(c=>c.etapa==="Graduado"))
        .filter(c=>c.scoreInicial).reduce((a,c)=>a+(c.score-c.scoreInicial),0) /
      Math.max(1, activos.concat(crm.clientes.filter(c=>c.etapa==="Graduado")).filter(c=>c.scoreInicial).length));

    const tabla = `
      <div class="card"><div class="card__body card__body--flush"><div class="table-wrap">
        <table class="tbl"><thead><tr>
          <th>Cliente</th><th>Contacto</th><th>Etapa</th><th>Plan</th>
          <th class="num">Puntaje</th><th class="num">Mejora</th><th>Alertas</th><th>Agente</th><th>Último contacto</th>
        </tr></thead><tbody>
        ${crm.clientes.map(c=>`<tr style="cursor:pointer" data-cliente="${c.id}">
          <td><div class="cell-strong">${esc(c.nombre)}</div><div class="cell-sub">${esc(c.id)} · <span>desde</span> ${fecha(c.desde)}</div></td>
          <td><div style="font-size:12.5px">${esc(c.tel)}</div><div class="cell-sub">${esc(c.email)}</div></td>
          <td><span class="chip ${c.etapa==="Activo"?"chip--ok":c.etapa==="Graduado"?"chip--info":c.etapa==="Lead nuevo"?"chip--warn":""}">${esc(c.etapa)}</span></td>
          <td>${esc(c.plan)}</td>
          <td class="num cell-strong">${c.score||"—"}</td>
          <td class="num">${c.scoreInicial?`<span class="delta delta--up">+${c.score-c.scoreInicial}</span>`:"—"}</td>
          <td>${c.alertasAbiertas?`<span class="chip chip--warn">${c.alertasAbiertas}</span>`:"—"}</td>
          <td style="color:var(--text-2)">${esc(c.agente)}</td>
          <td style="color:var(--text-3);white-space:nowrap">${fecha(c.ultimoContacto)}</td>
        </tr>`).join("")}
        </tbody></table></div></div></div>`;

    const pipeline = `
      <div class="pipeline">
        ${crm.etapas.map(e=>{
          const ene = crm.clientes.filter(c=>c.etapa===e);
          return `<div class="pipe-col">
            <div class="pipe-col__head">${esc(e)}<b>${ene.length}</b></div>
            ${ene.map(c=>`<div class="deal" data-cliente="${c.id}">
              <b>${esc(c.nombre)}</b>
              <small>${esc(c.tel)}</small>
              <div style="display:flex;gap:6px;margin-top:7px;flex-wrap:wrap">
                ${c.score?`<span class="chip chip--ok" style="height:20px;font-size:10.5px">${c.score}</span>`:""}
                ${c.plan!=="—"?`<span class="chip" style="height:20px;font-size:10.5px">${esc(c.plan)}</span>`:""}
                ${c.alertasAbiertas?`<span class="chip chip--warn" style="height:20px;font-size:10.5px">${c.alertasAbiertas} alertas</span>`:""}
              </div></div>`).join("") || `<div style="color:var(--text-3);font-size:12px;padding:8px">Vacío</div>`}
          </div>`;
        }).join("")}
      </div>`;

    return `
      <div class="page__head">
        <div><h1>Clientes</h1>
          <p>Tu cartera completa: desde el lead que entró hoy hasta el cliente que ya se graduó.</p></div>
        <div class="spacer"></div>
        <button class="btn">${ico("descargar",16)} Exportar CSV</button>
        <button class="btn btn--primary" data-nuevo-cliente>${ico("mas",16)} Nuevo cliente</button>
      </div>

      <div class="grid g-4" style="margin-bottom:18px">
        <div class="card"><div class="card__body"><div class="stat">
          <span class="stat__k">Clientes activos</span><span class="stat__v">${activos.length}</span>
          <span class="stat__d">${crm.clientes.length} en total</span></div></div></div>
        <div class="card"><div class="card__body"><div class="stat">
          <span class="stat__k">Ingreso recurrente</span>
          <span class="stat__v" style="color:var(--ok)">${money2(mrr)}</span>
          <span class="stat__d">por mes</span></div></div></div>
        <div class="card"><div class="card__body"><div class="stat">
          <span class="stat__k">Mejora promedio</span>
          <span class="stat__v">+${subidaProm}</span>
          <span class="stat__d">puntos por cliente</span></div></div></div>
        <div class="card"><div class="card__body"><div class="stat">
          <span class="stat__k">Leads sin asignar</span>
          <span class="stat__v" style="color:var(--warn)">${crm.clientes.filter(c=>c.agente==="—").length}</span>
          <span class="stat__d">Requieren llamada</span></div></div></div>
      </div>

      <div class="tabs">
        <button class="tab ${vista==="pipeline"?"is-active":""}" data-vista="pipeline">Embudo</button>
        <button class="tab ${vista==="tabla"?"is-active":""}" data-vista="tabla">Tabla</button>
      </div>
      ${vista==="pipeline"?pipeline:tabla}`;
  },
  montar(root){
    root.querySelectorAll("[data-vista]").forEach(b=>b.addEventListener("click",()=>{
      sessionStorage.setItem("kesser.vistaCRM", b.dataset.vista); APP.render();
    }));
    root.querySelectorAll("[data-cliente]").forEach(el=>el.addEventListener("click",()=>{
      const c = MOCK.crm.clientes.find(x=>x.id===el.dataset.cliente);
      if(!c) return;
      modal({
        titulo:esc(c.nombre), ancho:"560px",
        cuerpo:`<dl class="kv">
            <dt>ID</dt><dd>${esc(c.id)}</dd>
            <dt>Teléfono</dt><dd>${esc(c.tel)}</dd>
            <dt>Correo</dt><dd>${esc(c.email)}</dd>
            <dt>Etapa</dt><dd>${esc(c.etapa)}</dd>
            <dt>Plan</dt><dd>${esc(c.plan)} ${c.valor?`· ${money2(c.valor)}<span>/ mes</span>`:""}</dd>
            <dt>Puntaje</dt><dd>${c.score||"—"} ${c.scoreInicial?`(<span>empezó en ${c.scoreInicial}</span>)`:""}</dd>
            <dt>Alertas sin revisar</dt><dd>${c.alertasAbiertas}</dd>
            <dt>Agente</dt><dd>${esc(c.agente)}</dd>
            <dt>Cliente desde</dt><dd>${fecha(c.desde)}</dd>
          </dl>
          <div class="field"><label>Nota de seguimiento</label>
            <textarea class="input" rows="3" placeholder="Qué se habló, qué sigue…"></textarea></div>`,
        pie:`<button class="btn" data-cerrar>Cerrar</button>
             <button class="btn">Ver su reporte</button>
             <button class="btn btn--primary" data-cerrar>Guardar nota</button>`
      });
    }));
    root.querySelector("[data-nuevo-cliente]")?.addEventListener("click",()=>{
      modal({
        titulo:"Nuevo cliente", ancho:"540px",
        cuerpo:`<div class="grid g-2" style="gap:14px">
            <div class="field"><label>Nombre completo</label><input class="input" id="ncNombre"></div>
            <div class="field"><label>Teléfono</label><input class="input" id="ncTel"></div>
            <div class="field" style="grid-column:1/-1"><label>Correo</label><input class="input" id="ncEmail" type="email"></div>
            <div class="field"><label>Etapa</label><select class="input" id="ncEtapa">
              ${MOCK.crm.etapas.map(e=>`<option>${e}</option>`).join("")}</select></div>
            <div class="field"><label>Plan</label><select class="input" id="ncPlan">
              <option>—</option><option>Básico</option><option>Premium</option></select></div>
          </div>`,
        pie:`<button class="btn" data-cerrar>Cancelar</button>
             <button class="btn btn--primary" id="ncGuardar">Guardar cliente</button>`
      });
      document.getElementById("ncGuardar").onclick = async ()=>{
        const nombre = document.getElementById("ncNombre").value.trim();
        if(!nombre){ toast("Falta el nombre","bad"); return; }
        const plan = document.getElementById("ncPlan").value;
        await KESSER.crm.guardar({
          id:"CL-"+Math.floor(10500+Math.random()*400), nombre,
          tel:document.getElementById("ncTel").value||"—",
          email:document.getElementById("ncEmail").value||"—",
          etapa:document.getElementById("ncEtapa").value, plan,
          score:0, scoreInicial:0, desde:new Date().toISOString().slice(0,10),
          agente:"—", alertasAbiertas:0,
          valor: plan==="Premium"?34.99:plan==="Básico"?19.99:0, ultimoContacto:"—"
        });
        cerrarModal(); toast("Cliente agregado"); APP.render();
      };
    });
  }
};

/* =========================================================================
   11. CONFIGURACIÓN
   ========================================================================= */
VIEWS.configuracion = {
  titulo:"Configuración", sub:"Cuenta, plan e integración", icono:"config",
  async render(){
    const u = KESSER.sesion.actual() || MOCK.user;
    const tab = sessionStorage.getItem("kesser.tabConfig") || "perfil";

    const paneles = {
      perfil:`
        <div class="grid g-2">
          <div class="card"><div class="card__head"><h3>Datos personales</h3></div>
            <div class="card__body grid" style="gap:14px">
              <div class="grid g-2" style="gap:14px">
                <div class="field"><label>Nombre</label><input class="input" value="${esc(u.nombre)}"></div>
                <div class="field"><label>Apellido</label><input class="input" value="${esc(u.apellido)}"></div>
              </div>
              <div class="field"><label>Correo</label><input class="input" value="${esc(u.email)}"></div>
              <div class="field"><label>Teléfono</label><input class="input" value="${esc(u.telefono)}"></div>
              <div class="field"><label>Dirección</label><input class="input" value="${esc(u.direccion)}"></div>
              <div class="grid g-2" style="gap:14px">
                <div class="field"><label>Seguro Social</label><input class="input" value="${esc(u.ssnMask)}" disabled></div>
                <div class="field"><label>Fecha de nacimiento</label><input class="input" value="${esc(u.nacimiento)}" type="date"></div>
              </div>
              <button class="btn btn--primary" style="justify-self:start">Guardar cambios</button>
            </div></div>
          <div class="grid" style="gap:16px;align-content:start">
            <div class="card"><div class="card__head"><h3>Seguridad</h3></div>
              <div class="card__body grid" style="gap:10px">
                <button class="btn btn--block">${ico("candado",15)} Cambiar contraseña</button>
                <button class="btn btn--block">${ico("escudo",15)} Activar verificación en dos pasos</button>
                <button class="btn btn--block">${ico("ojo",15)} Ver sesiones activas</button>
              </div></div>
            <div class="card"><div class="card__head"><h3>Notificaciones</h3></div>
              <div class="card__body grid" style="gap:11px">
                ${[["Cambios en mi puntaje",1],["Nuevas cuentas o cobranzas",1],
                   ["Consultas a mi crédito",1],["Cambios en mi reporte",1],
                   ["Ofertas y productos",0],["Resumen mensual por correo",1]].map(([n,on])=>`
                  <label style="display:flex;align-items:center;gap:10px;font-size:13.5px;font-weight:600;cursor:pointer">
                    <input type="checkbox" ${on?"checked":""} style="width:17px;height:17px;accent-color:var(--brand-accent-dark)">
                    ${n}</label>`).join("")}
              </div></div>
          </div>
        </div>`,

      plan:`
        <div class="grid g-2">
          <div class="card"><div class="card__head"><h3>Tu plan</h3></div>
            <div class="card__body grid" style="gap:14px">
              <div style="display:flex;align-items:center;gap:13px">
                <div style="width:46px;height:46px;border-radius:12px;background:var(--brand-800);color:#fff;display:grid;place-items:center">
                  ${ico("rayo",20)}</div>
                <div><b style="font-size:17px;display:block">${esc(u.plan)}</b>
                  <span style="color:var(--text-3);font-size:13px">${money2(u.planPrecio)} <span>/ mes · próximo cobro</span> ${fecha(u.proximoCobro)}</span></div>
              </div>
              <div class="list" style="border:1px solid var(--line);border-radius:12px">
                ${["Monitoreo diario de los 3 burós","Puntaje actualizado cada mes",
                   "Reporte tri-merge cuenta por cuenta","Historial de pagos de 24 meses",
                   "Simulador de puntaje","Money Manager",
                   "Seguro de identidad por $1,000,000"].map(t=>`
                  <div class="list__row" style="padding:11px 14px">
                    <span style="color:var(--ok);flex:0 0 auto">${ico("check",16)}</span>
                    <div class="list__main"><b style="font-weight:600;font-size:13px">${t}</b></div></div>`).join("")}
              </div>
              <div style="display:flex;gap:9px"><button class="btn">Cambiar plan</button>
                <button class="btn btn--danger">Cancelar suscripción</button></div>
            </div></div>
          <div class="card"><div class="card__head"><h3>Método de pago e historial</h3></div>
            <div class="card__body card__body--flush">
              <div class="list">
                <div class="list__row"><div class="list__ico">${ico("dinero",15)}</div>
                  <div class="list__main"><b>Visa •••• 4417</b><span>Vence 09/2029</span></div>
                  <div class="list__meta"><button class="btn btn--sm">Cambiar</button></div></div>
                ${[["2026-10-14",34.99],["2026-09-14",34.99],["2026-08-14",34.99]].map(([f,m])=>`
                  <div class="list__row"><div class="list__ico list__ico--ok">${ico("check",15)}</div>
                    <div class="list__main"><b style="font-weight:600;font-size:13px">Pago mensual</b><span>${fecha(f)}</span></div>
                    <div class="list__meta">${money2(m)}<br><a href="#">Recibo</a></div></div>`).join("")}
              </div>
            </div></div>
        </div>`,

      integracion:`
        <div class="grid g-main">
          <div class="card"><div class="card__head"><h3>Conexión con Consumer Direct</h3>
              <span class="chip ${KESSER.config.modo==="demo"?"chip--warn":"chip--ok"}">
                Modo: ${KESSER.config.modo==="demo"?"demostración":"en vivo"}</span></div>
            <div class="card__body grid" style="gap:16px">
              <div class="callout callout--warn">
                <span style="color:var(--warn);flex:0 0 auto">${ico("candado",18)}</span>
                <div><b>Nunca pongas tus llaves en esta pantalla</b>
                  <p>Las llaves de Consumer Direct van en tu <b>backend</b>, no en el navegador.
                     Esta pantalla solo apunta a la dirección de tu backend.</p></div>
              </div>
              <div class="field"><label>Dirección de mi backend (proxy)</label>
                <input class="input" id="cfgProxy" value="${esc(KESSER.config.proxyUrl)}" placeholder="https://api.kessercredit.com">
                <span class="hint">Tu backend es el que guarda las llaves y habla con Consumer Direct.</span></div>
              <div class="field"><label>Modo de datos</label>
                <select class="input" id="cfgModo">
                  <option value="demo" ${KESSER.config.modo==="demo"?"selected":""}>Demostración (datos de ejemplo)</option>
                  <option value="vivo" ${KESSER.config.modo==="vivo"?"selected":""}>En vivo (Consumer Direct)</option>
                </select></div>
              <button class="btn btn--primary" id="cfgGuardar" style="justify-self:start">Guardar conexión</button>
            </div></div>

          <div class="card"><div class="card__head"><h3>Rutas que debe exponer tu backend</h3></div>
            <div class="card__body" style="display:grid;gap:7px;font-size:12.5px">
              ${Object.entries(KESSER.config.rutas).map(([k,v])=>`
                <div style="display:flex;gap:9px;align-items:baseline">
                  <code style="flex:0 0 auto;min-width:116px">${k}</code>
                  <span style="color:var(--text-2);font-family:var(--mono)">${esc(v)}</span></div>`).join("")}
              <p style="color:var(--text-3);margin-top:8px">
                Están definidas en <code>js/api.js</code>. Cámbialas si tu backend usa otros nombres.</p>
            </div></div>
        </div>`
    };

    return `
      <div class="page__head"><div><h1>Configuración</h1></div></div>
      <div class="tabs">
        ${[["perfil","Perfil y seguridad"],["plan","Plan y facturación"],["integracion","Integración / API"]]
          .map(([k,n])=>`<button class="tab ${tab===k?"is-active":""}" data-tabc="${k}">${n}</button>`).join("")}
      </div>
      ${paneles[tab]}`;
  },
  montar(root){
    root.querySelectorAll("[data-tabc]").forEach(b=>b.addEventListener("click",()=>{
      sessionStorage.setItem("kesser.tabConfig", b.dataset.tabc); APP.render();
    }));
    root.querySelector("#cfgGuardar")?.addEventListener("click",()=>{
      KESSER.config.proxyUrl = root.querySelector("#cfgProxy").value.trim() || "/api";
      KESSER.config.modo = root.querySelector("#cfgModo").value;
      localStorage.setItem("kesser.config", JSON.stringify({
        proxyUrl:KESSER.config.proxyUrl, modo:KESSER.config.modo
      }));
      toast("Conexión guardada. Modo: "+KESSER.config.modo);
      APP.render();
    });
  }
};

})();
