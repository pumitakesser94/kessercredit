/* ==========================================================================
   KESSER CREDIT — CAPA DE INTEGRACIÓN
   --------------------------------------------------------------------------
   ESTE ES EL ÚNICO ARCHIVO QUE TIENES QUE TOCAR PARA CONECTAR
   CONSUMER DIRECT (SmartCredit API). El diseño y las pantallas no se tocan.

   Cómo funciona:
     KESSER.config.modo = "demo"  -> usa los datos de js/mock-data.js
     KESSER.config.modo = "vivo"  -> llama a tu backend (proxy)

   ⚠️ SEGURIDAD: nunca pongas tu clientSecret / API key aquí. Este archivo
   lo descarga el navegador del cliente y cualquiera puede leerlo.
   Pon las llaves en un backend (proxy) y apunta `proxyUrl` a ese backend.
   Lee README-INTEGRACION.md para el paso a paso.
   ========================================================================== */

window.KESSER = (function(){

  const config = {
    modo: "demo",                 // "demo" | "vivo"
    proxyUrl: "/api",             // tu backend que habla con Consumer Direct
    marca: {
      nombre: "Kesser Credit",
      sigla: "K",
      soporte: "soporte@kessercredit.com",
      telefono: "(305) 000-0000"
    },
    // Rutas que tu backend debe exponer. Cambia los nombres si prefieres otros.
    rutas: {
      login:        "POST /auth/login",
      sesion:       "GET  /auth/session",
      scores:       "GET  /credit/scores",            // 3 burós, score actual
      detalle:      "GET  /credit/summary",           // puntaje incluido + proyección
      refrescar:    "POST /credit/refresh",           // ⟳ actualizar sin comprar los 3 burós
      precalifica:  "GET  /offers/prequalified",      // categorías de Kesser Match
      consejos:     "GET  /credit/advice",            // consejos ordenados por impacto
      historial:    "GET  /credit/scores/history",    // puntajes por mes
      factores:     "GET  /credit/report-card",       // 5 factores + nota
      reporte:      "GET  /credit/report",            // tri-merge completo
      alertas:      "GET  /credit/alerts",
      alertaLeida:  "POST /credit/alerts/:id/read",
      simulador:    "POST /credit/simulate",
      finanzas:     "GET  /money/overview",
      ofertas:      "GET  /offers",
      identidad:    "GET  /identity/status",
      clientes:     "GET  /crm/clients",
      guardarCliente:"POST /crm/clients"
    }
  };

  /* ---------- transporte ---------- */
  async function call(nombreRuta, {params={}, body=null}={}){
    const def = config.rutas[nombreRuta];
    if(!def) throw new Error("Ruta no definida: "+nombreRuta);
    let [metodo, path] = def.split(/\s+/).filter(Boolean);
    Object.entries(params).forEach(([k,v])=>{ path = path.replace(":"+k, encodeURIComponent(v)); });

    const res = await fetch(config.proxyUrl.replace(/\/$/,"") + path, {
      method: metodo,
      credentials: "include",
      headers: {"Content-Type":"application/json"},
      body: body ? JSON.stringify(body) : undefined
    });
    if(!res.ok) throw new Error("API "+res.status+" en "+path);
    return res.json();
  }

  const demo = ()=> config.modo === "demo";
  const esperar = (ms=260)=> new Promise(r=>setTimeout(r,ms));
  async function fake(valor){ await esperar(); return structuredClone(valor); }

  /* ======================= SESIÓN ======================= */
  const sesion = {
    async login(email, password, rol="cliente"){
      if(demo()){
        await esperar(420);
        const u = structuredClone(MOCK.user);
        u.rol = rol;
        if(email) u.email = email;
        localStorage.setItem("kesser.sesion", JSON.stringify(u));
        return u;
      }
      const u = await call("login",{body:{email,password}});
      localStorage.setItem("kesser.sesion", JSON.stringify(u));
      return u;
    },
    actual(){
      try{ return JSON.parse(localStorage.getItem("kesser.sesion")||"null"); }
      catch{ return null; }
    },
    salir(){ localStorage.removeItem("kesser.sesion"); }
  };

  /* ======================= CRÉDITO ======================= */
  const credito = {
    scores:    ()=> demo() ? fake(MOCK.scores)     : call("scores"),
    detalle:   ()=> demo() ? fake(MOCK.detalle)    : call("detalle"),
    categorias: ()=> demo() ? fake(MOCK.categorias) : call("precalifica"),
    consejos:  ()=> demo() ? fake(MOCK.consejos)   : call("consejos"),

    /* El botón ⟳ del panel. Vuelve a pedir el puntaje incluido (TransUnion)
       sin comprar el reporte de los tres burós.
       Consumer Direct limita cuántas veces al mes se puede hacer: ese límite
       es el que va en detalle.refrescosDelMes. */
    async refrescar(){
      if(!demo()) return call("refrescar");
      await esperar(1400);
      const d = MOCK.detalle;
      if(d.refrescosUsados >= d.refrescosDelMes){
        throw new Error("Ya usaste tus " + d.refrescosDelMes + " actualizaciones de este mes");
      }
      d.refrescosUsados++;
      d.actualizado = new Date().toISOString();
      MOCK.scores.actualizado = d.actualizado;
      return structuredClone(d);
    },
    historial: ()=> demo() ? fake(MOCK.historial)  : call("historial"),
    factores:  ()=> demo() ? fake(MOCK.factores)   : call("factores"),

    async reporte(){
      if(demo()) return fake({
        personal:MOCK.personal, cuentas:MOCK.cuentas,
        consultas:MOCK.consultas, publicos:MOCK.publicos
      });
      return call("reporte");
    },

    /* Simulador de puntaje.
       En demo usa un modelo heurístico propio. En vivo, Consumer Direct
       tiene su propio endpoint de simulación: cámbialo por `call("simulador",...)`. */
    async simular(base, acciones){
      if(!demo()) return call("simulador",{body:{base,acciones}});
      await esperar(500);
      let delta = 0, notas = [];
      if(acciones.pagarTarjetas){
        const pts = Math.round(38 * (acciones.pagarTarjetasPct/100));
        delta += pts; notas.push(`Bajar el uso de tarjetas: +${pts}`);
      }
      if(acciones.eliminarCobranza){ delta += 34; notas.push("Eliminar 1 cobranza: +34"); }
      if(acciones.eliminarTardio){ delta += 21; notas.push("Quitar 1 pago tardío: +21"); }
      if(acciones.nuevaTarjeta){ delta -= 9;  notas.push("Abrir tarjeta nueva: −9 (temporal)"); }
      if(acciones.cerrarTarjeta){ delta -= 16; notas.push("Cerrar tarjeta antigua: −16"); }
      if(acciones.autorizado){ delta += 12; notas.push("Usuario autorizado en cuenta sana: +12"); }
      if(acciones.meses){
        const pts = Math.min(26, acciones.meses * 3);
        delta += pts; notas.push(`${acciones.meses} meses de pagos a tiempo: +${pts}`);
      }
      const proyectado = Math.max(300, Math.min(850, base + delta));
      return {base, proyectado, delta: proyectado - base, notas};
    }
  };

  /* ======================= ALERTAS ======================= */
  const alertas = {
    cache: [],                        // última lista cargada (la usa el contador del menú)
    async listar(){
      const r = demo() ? await fake(MOCK.alertas) : await call("alertas");
      alertas.cache = r;
      return r;
    },
    async marcarLeida(id){
      const enCache = alertas.cache.find(x=>x.id===id); if(enCache) enCache.leida = true;
      if(demo()){ const a = MOCK.alertas.find(x=>x.id===id); if(a) a.leida = true; return {ok:true}; }
      return call("alertaLeida",{params:{id}});
    },
    async marcarTodas(){
      for(const a of [...alertas.cache]) await alertas.marcarLeida(a.id);
    }
  };

  /* ======================= DINERO / OFERTAS / ID ======================= */
  const dinero    = { resumen: ()=> demo() ? fake(MOCK.finanzas)  : call("finanzas") };
  const ofertas   = { listar:  ()=> demo() ? fake(MOCK.ofertas)   : call("ofertas") };
  const identidad = { estado:  ()=> demo() ? fake(MOCK.identidad) : call("identidad") };

  /* ======================= CRM ======================= */
  const crm = {
    clientes: ()=> demo() ? fake(MOCK.crm) : call("clientes"),
    async guardar(cliente){
      if(demo()){
        await esperar(300);
        const i = MOCK.crm.clientes.findIndex(c=>c.id===cliente.id);
        if(i>=0) MOCK.crm.clientes[i] = {...MOCK.crm.clientes[i], ...cliente};
        else MOCK.crm.clientes.unshift(cliente);
        return cliente;
      }
      return call("guardarCliente",{body:cliente});
    }
  };

  return {config, sesion, credito, alertas, dinero, ofertas, identidad, crm};
})();
