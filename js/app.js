/* ==========================================================================
   NÚCLEO: sesión, navegación y armado de la pantalla
   ========================================================================== */
window.APP = (function(){
  const {ico, logo, esc, toast, modal, cerrarModal} = UI;

  /* Barra de arriba. Un grupo con una sola pantalla sale como enlace directo;
     con varias, sale como desplegable. */
  const NAV = [
    {k:"credito",  n:"Crédito",      rutas:["panel","puntajes","consejos","simulador"]},
    {k:"reportes", n:"Reportes",     rutas:["reporte","alertas"]},
    {k:"identidad",n:"Identidad",    rutas:["identidad"]},
    {k:"dinero",   n:"Dinero",       rutas:["dinero"]},
    {k:"match",    n:"Kesser Match", rutas:["ofertas"]},
    {k:"clientes", n:"Clientes",     rutas:["clientes"], admin:true}
  ];

  const DESC = {
    panel:"Tu puntaje y qué hacer hoy",
    puntajes:"Los 3 burós y qué mueve tu número",
    consejos:"Qué hacer para subir tu puntaje",
    simulador:"Prueba decisiones antes de tomarlas",
    reporte:"Cada cuenta con los 3 burós en columnas",
    alertas:"Lo que cambió en tus reportes",
    identidad:"Dark web, número de seguro social y seguro",
    dinero:"Tus cuentas, gastos y presupuesto",
    ofertas:"Ofertas para las que ya calificas",
    clientes:"CRM interno de Kesser Credit",
    configuracion:"Cuenta, plan e integración"
  };

  let ruta = (location.hash||"#panel").slice(1);
  if(!VIEWS[ruta]) ruta = "panel";

  /* ---------- config guardada ---------- */
  try{
    const g = JSON.parse(localStorage.getItem("kesser.config")||"null");
    if(g){ KESSER.config.proxyUrl = g.proxyUrl || KESSER.config.proxyUrl; KESSER.config.modo = g.modo || KESSER.config.modo; }
  }catch{}

  const root = ()=>document.getElementById("app");
  const esAdmin = ()=>{ const u = KESSER.sesion.actual(); return u && (u.rol==="admin"||u.rol==="agente"); };

  /* ======================= LOGIN ======================= */
  function pantallaLogin(){
    const m = KESSER.config.marca;
    root().innerHTML = `
      <div class="auth">
        <div class="auth__pitch">
          <div class="brand" style="padding:0">
            <span class="brand__mark">${logo(38)}</span>
            <div class="brand__name">${esc(m.nombre)}<span>Monitoreo y reparación de crédito</span></div>
          </div>
          <h2>Tu crédito, por fin bajo tu control.</h2>
          <p>Los tres burós en una sola pantalla, alertas el mismo día que algo cambia,
             y tu reporte completo cuenta por cuenta.</p>
          <ul class="auth__points">
            ${[["Puntajes de TransUnion, Experian y Equifax","score"],
               ["Monitoreo diario y alertas al instante","campana"],
               ["Reporte de los 3 burós, cuenta por cuenta","reporte"],
               ["Simulador: mira el efecto antes de decidir","sim"],
               ["Seguro de identidad por $1,000,000","escudo"]].map(([t,i])=>
              `<li><span style="color:var(--brand-accent)">${ico(i,18)}</span>${t}</li>`).join("")}
          </ul>
        </div>

        <form class="auth__form" id="formLogin">
          <h1 style="font-size:24px">Entrar a mi cuenta</h1>
          <p style="color:var(--text-2);margin-top:6px"><span>Bienvenido de vuelta a</span> ${esc(m.nombre)}.</p>
          <div class="field"><label>Correo electrónico</label>
            <input class="input" type="email" id="lgEmail" value="maria.rodriguez@email.com" required></div>
          <div class="field"><label>Contraseña</label>
            <input class="input" type="password" id="lgPass" value="demo1234" required></div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:14px">
            <label style="display:flex;gap:8px;align-items:center;font-size:13px;font-weight:600;color:var(--text-2)">
              <input type="checkbox" checked style="width:16px;height:16px;accent-color:var(--brand-accent-dark)"> Recordarme</label>
            <a href="#" style="font-size:13px;font-weight:600">¿Olvidaste tu contraseña?</a>
          </div>
          <button class="btn btn--primary btn--block" type="submit" style="height:44px;margin-top:18px" id="lgBtn">
            Entrar</button>
          <button class="btn btn--block" type="button" id="lgAdmin" style="margin-top:9px">
            ${ico("crm",16)} Entrar como equipo Kesser (admin)</button>
          <p class="auth__legal">
            ¿No tienes cuenta? <a href="#">Crear una cuenta</a><br><br>
            <span>Al continuar aceptas los Términos de servicio y la Política de privacidad de</span>
            ${esc(m.nombre)}<span>. Revisar tu propio crédito no afecta tu puntaje.</span>
          </p>
          <div class="demo-note">
            <b>Modo demostración.</b> <span>Entra con cualquier correo y contraseña.
            Los datos que verás son de ejemplo, para que puedas revisar el diseño
            antes de conectar Consumer Direct.</span>
          </div>
        </form>
      </div>`;

    const entrar = async (rol)=>{
      const btn = document.getElementById("lgBtn");
      btn.textContent = "Entrando…"; btn.disabled = true;
      await KESSER.sesion.login(
        document.getElementById("lgEmail").value,
        document.getElementById("lgPass").value, rol);
      render();
    };
    document.getElementById("formLogin").addEventListener("submit", e=>{ e.preventDefault(); entrar("cliente"); });
    document.getElementById("lgAdmin").addEventListener("click", ()=>entrar("admin"));
  }

  /* ======================= REGISTRO ======================= */
  function pantallaRegistro(){
    const m = KESSER.config.marca;
    const planId = sessionStorage.getItem("kesser.planElegido") || "premium";
    const plan = LANDING.PLANES.find(p=>p.id===planId) || LANDING.PLANES[1];
    root().innerHTML = `
      <div class="auth">
        <div class="auth__pitch">
          <div class="brand" style="padding:0">
            <span class="brand__mark">${logo(38)}</span>
            <div class="brand__name">${esc(m.nombre)}<span>Monitoreo y reparación de crédito</span></div>
          </div>
          <h2>Tu crédito, por fin bajo tu control.</h2>
          <p>Los tres burós en una sola pantalla, alertas el mismo día que algo
             cambia, y tu reporte completo cuenta por cuenta.</p>
          <ul class="auth__points">
            ${plan.incluye.map(t=>
              `<li><span style="color:var(--brand-accent)">${ico("check",18)}</span>${esc(t)}</li>`).join("")}
          </ul>
        </div>
        <form class="auth__form" id="formRegistro">
          <h1 style="font-size:24px">Crear tu cuenta</h1>
          <p style="color:var(--text-2);margin-top:6px">
            <span>Empieza con el plan</span> <b>${esc(plan.nombre)}</b> ·
            <b>${UI.money2(plan.precio)}</b><span>/ mes</span>.
            <span>Te tomará menos de dos minutos.</span></p>
          <div class="grid g-2" style="gap:14px;margin-top:16px">
            <div class="field"><label>Nombre</label><input class="input" id="rgNombre" required></div>
            <div class="field"><label>Apellido</label><input class="input" id="rgApellido"></div>
          </div>
          <div class="field"><label>Correo electrónico</label>
            <input class="input" type="email" id="rgEmail" required></div>
          <div class="field"><label>Teléfono</label><input class="input" type="tel" id="rgTel"></div>
          <div class="field"><label>Contraseña</label>
            <input class="input" type="password" id="rgPass" required></div>
          <div class="field"><label>Plan</label>
            <select class="input" id="rgPlan">
              ${LANDING.PLANES.map(p=>`<option value="${p.id}" ${p.id===plan.id?"selected":""}>
                ${esc(p.nombre)} — ${UI.money2(p.precio)}/ mes</option>`).join("")}
            </select></div>
          <button class="btn btn--primary btn--block" type="submit" style="height:44px;margin-top:18px">
            Crear cuenta y entrar</button>
          <button class="btn btn--block" type="button" data-entrar style="margin-top:9px">
            Ya tengo cuenta</button>
          <p class="auth__legal">
            Al crear tu cuenta aceptas los Términos de servicio, la Política de privacidad
            y el contrato CROA, que incluye tu derecho a cancelar dentro de 3 días hábiles sin costo.
          </p>
        </form>
      </div>`;
    document.getElementById("formRegistro").addEventListener("submit", async e=>{
      e.preventDefault();
      const nombre = document.getElementById("rgNombre").value.trim();
      const email  = document.getElementById("rgEmail").value.trim();
      if(!nombre || !email){ toast("Completa tu nombre y tu correo","bad"); return; }
      const u = await KESSER.sesion.login(email, document.getElementById("rgPass").value, "cliente");
      u.nombre = nombre;
      u.apellido = document.getElementById("rgApellido").value.trim() || u.apellido;
      u.avatar = (nombre[0]+(u.apellido[0]||"")).toUpperCase();
      localStorage.setItem("kesser.sesion", JSON.stringify(u));
      location.hash = "#panel"; ruta = "panel"; render();
    });
  }

  /* ======================= PORTADA PÚBLICA ======================= */
  function pantallaPortada(){
    root().innerHTML = LANDING.render();
    const slot = document.getElementById("langSlot");
    if(slot) slot.innerHTML = I18N.selector();
  }

  function cablearPublico(){
    document.querySelectorAll("[data-entrar]").forEach(b=>b.addEventListener("click", e=>{
      e.preventDefault(); location.hash = "#entrar"; render();
    }));
    document.querySelectorAll("[data-registro]").forEach(b=>b.addEventListener("click", e=>{
      e.preventDefault();
      if(b.dataset.plan) sessionStorage.setItem("kesser.planElegido", b.dataset.plan);
      location.hash = "#registro"; render();
    }));
  }

  /* ======================= ARMAZÓN (barra superior) ======================= */
  const gruposVisibles = ()=> NAV.filter(g=>!g.admin || esAdmin())
    .map(g=>({...g, rutas:g.rutas.filter(r=>VIEWS[r] && (!VIEWS[r].soloAdmin || esAdmin()))}))
    .filter(g=>g.rutas.length);

  function enlaceNav(r){
    const v = VIEWS[r]; if(!v) return "";
    const b = r==="alertas" ? KESSER.alertas.cache.filter(a=>!a.leida).length : 0;
    return `<button class="tn__link ${ruta===r?"is-active":""}" data-ruta="${r}">
      ${ico(v.icono||"panel",17)}
      <span style="flex:1 1 auto;min-width:0"><b>${esc(v.titulo)}</b>
        <span>${esc(DESC[r]||v.sub||"")}</span></span>
      ${b?`<span class="nav__badge" style="margin:2px 0 0">${b}</span>`:""}
    </button>`;
  }

  function shell(){
    const u = KESSER.sesion.actual();
    const m = KESSER.config.marca;
    const grupos = gruposVisibles();
    const sinLeer = KESSER.alertas.cache.filter(a=>!a.leida).length;

    return `
      <div class="app">
        <header class="topnav">
          <div class="topnav__in">
            <div class="brand" data-ruta="panel" role="button" tabindex="0" style="cursor:pointer">
              <span class="brand__mark">${logo(34)}</span>
              <div class="brand__name">${esc(m.nombre)}</div>
            </div>

            <nav class="tn" aria-label="Menú principal">
              ${grupos.map(g=>{
                const activo = g.rutas.includes(ruta);
                if(g.rutas.length === 1){
                  return `<div class="tn__group">
                    <button class="tn__btn ${activo?"is-active":""}" data-ruta="${g.rutas[0]}">
                      ${esc(g.n)}</button></div>`;
                }
                return `<div class="tn__group" data-grupo="${g.k}">
                  <button class="tn__btn ${activo?"is-active":""}" aria-expanded="false" aria-haspopup="true">
                    ${esc(g.n)}
                    <svg class="car" width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"
                      aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="tn__menu">${g.rutas.map(enlaceNav).join("")}</div>
                </div>`;
              }).join("")}
            </nav>

            <div class="topnav__right">
              <label class="search">${ico("buscar",16)}
                <input placeholder="Buscar cuenta, cliente, alerta…" id="buscador"></label>
              ${I18N.selector()}
              <button class="icon-btn tn-burger" data-burger aria-label="Menú">${ico("menu",18)}</button>
              <button class="icon-btn" data-ruta="alertas" aria-label="Alertas">
                ${ico("campana",18)}${sinLeer?'<span class="dot"></span>':""}</button>
              <div class="avatar-wrap" data-avatar>
                <div class="avatar" role="button" tabindex="0"
                  title="${esc(u.nombre)} ${esc(u.apellido)}">${esc(u.avatar||"U")}</div>
                <div class="avatar-menu">
                  <div class="avatar-menu__who">
                    <b>${esc(u.nombre)} ${esc(u.apellido)}</b>
                    <span>${esc(u.email)}</span>
                  </div>
                  ${enlaceNav("configuracion")}
                  <button class="tn__link" data-salir>${ico("salir",17)}
                    <span><b>Cerrar sesión</b></span></button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div class="tn-sheet" id="hoja">
          ${grupos.map(g=>`<h4>${esc(g.n)}</h4>${g.rutas.map(enlaceNav).join("")}`).join("")}
          <h4>Cuenta</h4>
          ${enlaceNav("configuracion")}
          <button class="tn__link" data-salir>${ico("salir",17)}<span><b>Cerrar sesión</b></span></button>
        </div>

        <div class="page" id="vista">${UI.skeleton(260)}</div>
      </div>`;
  }

  /* ======================= RENDER ======================= */
  async function render(){
    const u = KESSER.sesion.actual();
    if(!u){
      cerrarModal();
      const r = location.hash.slice(1);
      if(r === "entrar")        pantallaLogin();
      else if(r === "registro") pantallaRegistro();
      else                      pantallaPortada();
      cablearPublico();
      I18N.aplicar(document.body);
      I18N.cablear(document);
      window.scrollTo({top:0});
      return;
    }
    if(VIEWS[ruta]?.soloAdmin && !esAdmin()) ruta = "panel";
    if(!KESSER.alertas.cache.length){ try{ await KESSER.alertas.listar(); }catch{} }

    cerrarModal();
    document.querySelector(".scrim")?.remove();
    root().innerHTML = shell();
    cablearShell();
    I18N.aplicar(document.body);          // traduce el menú antes de que cargue la vista
    I18N.cablear(document);

    const cont = document.getElementById("vista");
    try{
      cont.innerHTML = await VIEWS[ruta].render();
      VIEWS[ruta].montar?.(cont);
      cablearVista(cont);
      I18N.aplicar(document.body);
      I18N.cablear(document);
      window.scrollTo({top:0});
    }catch(err){
      console.error(err);
      cont.innerHTML = `<div class="card"><div class="empty">
        <h3>No se pudo cargar esta pantalla</h3>
        <p>${esc(err.message)}</p>
        <p style="margin-top:10px">Si estás en modo <b>en vivo</b>, revisa que tu backend
           responda en <code>${esc(KESSER.config.proxyUrl)}</code>.</p>
        <button class="btn btn--primary" style="margin-top:14px" data-reintentar>Reintentar</button>
      </div></div>`;
      I18N.aplicar(cont);
      cont.querySelector("[data-reintentar]")?.addEventListener("click",()=>render());
    }
  }

  function cablearShell(){
    document.querySelectorAll("[data-ruta]").forEach(b=>{
      b.addEventListener("click",()=>ir(b.dataset.ruta));
      if(b.getAttribute("role")==="button")
        b.addEventListener("keydown",e=>{
          if(e.key==="Enter"||e.key===" "){ e.preventDefault(); ir(b.dataset.ruta); }
        });
    });
    document.querySelectorAll("[data-salir]").forEach(b=>b.addEventListener("click",()=>{
      KESSER.sesion.salir(); location.hash="#inicio"; ruta="panel"; render();
    }));

    /* desplegables de la barra */
    const cerrarTodo = ()=>{
      document.querySelectorAll(".tn__group.is-open, .avatar-wrap.is-open")
        .forEach(g=>{ g.classList.remove("is-open");
                      g.querySelector("[aria-expanded]")?.setAttribute("aria-expanded","false"); });
    };
    document.querySelectorAll(".tn__group[data-grupo]").forEach(g=>{
      const btn = g.querySelector(".tn__btn");
      btn.addEventListener("click", e=>{
        e.stopPropagation();
        const abierto = g.classList.contains("is-open");
        cerrarTodo();
        if(!abierto){ g.classList.add("is-open"); btn.setAttribute("aria-expanded","true"); }
      });
    });
    const av = document.querySelector("[data-avatar]");
    av?.querySelector(".avatar")?.addEventListener("click", e=>{
      e.stopPropagation();
      const abierto = av.classList.contains("is-open");
      cerrarTodo();
      if(!abierto) av.classList.add("is-open");
    });
    document.addEventListener("click", cerrarTodo);
    document.addEventListener("keydown", e=>{ if(e.key==="Escape") cerrarTodo(); });

    /* menú de teléfono */
    const hoja = document.getElementById("hoja");
    document.querySelector("[data-burger]")?.addEventListener("click", e=>{
      e.stopPropagation(); hoja?.classList.toggle("is-open");
    });

    document.getElementById("buscador")?.addEventListener("keydown",e=>{
      if(e.key==="Enter" && e.target.value.trim())
        toast(`Búsqueda de “${esc(e.target.value)}” — conecta aquí tu índice de búsqueda`);
    });
  }

  /* acciones globales dentro de cualquier vista */
  function cablearVista(cont){
    cont.querySelectorAll("[data-ir]").forEach(b=>
      b.addEventListener("click",()=>{
        if(b.dataset.cat) sessionStorage.setItem("kesser.catMatch", b.dataset.cat);
        ir(b.dataset.ir);
      }));
    cont.querySelectorAll("[data-revisar]").forEach(b=>
      b.addEventListener("click",e=>{
        e.preventDefault(); e.stopPropagation();
        toast("Lo marcamos para que tu asesor lo revise");
      }));
  }

  function ir(r){
    if(!VIEWS[r]) return;
    ruta = r; location.hash = "#"+r;
    document.getElementById("hoja")?.classList.remove("is-open");
    cerrarModal();
    render();
  }

  window.addEventListener("hashchange",()=>{
    const r = location.hash.slice(1);
    if(!KESSER.sesion.actual()){
      if(["inicio","entrar","registro",""].includes(r)) render();
      return;                                   // anclas de la portada: no re-dibujar
    }
    if(VIEWS[r] && r!==ruta){ ruta = r; render(); }
  });

  document.addEventListener("DOMContentLoaded", render);
  if(document.readyState!=="loading") render();

  return {render, ir, get ruta(){return ruta;}};
})();
