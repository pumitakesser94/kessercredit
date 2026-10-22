/* ==========================================================================
   PORTADA PÚBLICA DE VENTAS
   Es lo primero que ve alguien que todavía no es cliente.
   Los precios y los planes están en PLANES: cámbialos ahí y ya.
   ========================================================================== */
window.LANDING = (function(){
  const {ico, logo, esc, gauge, money2} = UI;

  const PLANES = [
    {id:"basico", nombre:"Básico", precio:19.99, destacado:false,
     resumen:"Para empezar a ver qué dicen de ti.",
     incluye:["Puntaje de los 3 burós cada mes","Reporte combinado completo",
              "Alertas por correo","Simulador de puntaje"],
     excluye:["Reporte tri-merge cuenta por cuenta","Money Manager","Seguro de identidad"]},
    {id:"premium", nombre:"Premium", precio:34.99, destacado:true, etiqueta:"El que todos eligen",
     resumen:"Monitoreo diario y tu reporte completo.",
     incluye:["Todo lo del plan Básico","Monitoreo diario de los 3 burós",
              "Reporte tri-merge cuenta por cuenta","Historial de pagos de 24 meses",
              "Money Manager","Seguro de identidad por $1,000,000"],
     excluye:[]},
    {id:"familiar", nombre:"Familiar", precio:49.99, destacado:false,
     resumen:"Hasta 2 adultos y 3 menores.",
     incluye:["Todo lo del plan Premium","2 adultos incluidos",
              "Monitoreo de menores","Un solo panel para toda la casa",
              "Asesor asignado"],
     excluye:[]}
  ];

  const PASOS = [
    {t:"Conectas tus reportes",
     d:"Te registras y en minutos traemos tus tres reportes de crédito. No hace falta llamar a nadie ni mandar papeles. Revisar tu propio crédito no te baja puntos."},
    {t:"Te decimos qué te está frenando",
     d:"Te mostramos renglón por renglón qué está restando puntos y cuánto vale cada arreglo, en español claro. Nada de jerga ni de sorpresas."},
    {t:"Te avisamos cada vez que algo cambia",
     d:"Vigilamos tus tres reportes todos los días. Si aparece una cuenta, sube un saldo o alguien consulta tu crédito, lo sabes el mismo día y con el detalle de qué buró lo reportó."}
  ];

  const FUNCIONES = [
    {i:"score", t:"Los 3 burós en una pantalla",
     d:"TransUnion, Experian y Equifax lado a lado. Verás por qué los tres números no son iguales."},
    {i:"campana", t:"Alertas el mismo día",
     d:"Una cuenta nueva, un saldo que sube, una consulta que no reconoces: te enteras cuando pasa, no un mes después."},
    {i:"reporte", t:"Tu reporte, cuenta por cuenta",
     d:"Cada cuenta con lo que dice TransUnion, Experian y Equifax en columnas, y el historial de pagos de 24 meses. Las diferencias entre burós salen resaltadas."},
    {i:"sim", t:"Simulador de decisiones",
     d:"¿Cierro esta tarjeta? ¿Abro otra? ¿Cuánto pago? Míralo antes de hacerlo."},
    {i:"dinero", t:"Money Manager",
     d:"Tus cuentas, tus gastos y tu presupuesto en el mismo lugar que tu crédito, porque van juntos."},
    {i:"escudo", t:"Protección de identidad",
     d:"Vigilamos tu correo y tu número de seguro social en la web oscura, con seguro de $1,000,000."}
  ];

  const FAQ = [
    {q:"¿Revisar mi crédito aquí me baja puntos?",
     a:"No. Cuando tú revisas tu propio crédito se registra como “consulta suave” y no afecta tu puntaje. Las que restan puntos son las consultas duras, que hace un banco cuando pides crédito."},
    {q:"¿Me garantizan que va a subir mi puntaje?",
     a:"No, y desconfía de quien te lo prometa: la ley prohíbe garantizar resultados en reparación de crédito. Lo que sí podemos garantizar es el trabajo: encontrar lo que está mal, disputarlo con fundamento legal y darle seguimiento hasta que el buró responda."},
    {q:"¿Cuánto tarda en verse un cambio?",
     a:"El buró tiene 30 días por ley para responder una disputa (45 si mandas evidencia nueva). A partir de ahí, el cambio aparece en tu reporte en el siguiente ciclo. Lo normal es empezar a ver movimiento entre el primer y el tercer mes."},
    {q:"¿Puedo cancelar cuando quiera?",
     a:"Sí. Cancelas desde tu panel, sin llamadas ni penalidades, y el servicio sigue activo hasta el final del mes que ya pagaste."},
    {q:"¿Qué pasa con mis datos?",
     a:"Van cifrados, no los vendemos y no los compartimos con nadie que no sea el buró al que le estamos disputando en tu nombre. Puedes pedir que borremos tu cuenta cuando quieras."},
    {q:"¿Esto reemplaza a un abogado?",
     a:"No. Kesser Credit no da asesoría legal. Si tienes una demanda, un embargo o una quiebra en curso, habla con un abogado: eso está fuera de lo que hace una plataforma de monitoreo."}
  ];

  function render(){
    const marca = KESSER.config.marca;
    const demo = [{id:"tu",n:"TransUnion",s:684},{id:"exp",n:"Experian",s:671},{id:"eqf",n:"Equifax",s:702}];

    return `
    <div class="lp">
      <nav class="lp-nav"><div class="lp__wrap lp-nav__in">
        <span class="brand__mark">${logo(36)}</span>
        <div class="brand__name" style="color:var(--text)">${esc(marca.nombre)}</div>
        <div class="lp-nav__links">
          <a href="#como">Cómo funciona</a>
          <a href="#incluye">Qué incluye</a>
          <a href="#planes">Planes</a>
          <a href="#preguntas">Preguntas</a>
        </div>
        <div class="lp-nav__cta">
          <span id="langSlot"></span>
          <button class="btn" data-entrar>Entrar</button>
          <button class="btn btn--primary" data-registro>Empezar</button>
        </div>
      </div></nav>

      <header class="lp__wrap lp-hero">
        <div>
          <span class="lp-eyebrow">${ico("escudo",14)} Monitoreo de los 3 burós</span>
          <h1>Tu crédito, por fin <em>bajo tu control</em>.</h1>
          <p class="lead">Mira lo que los tres burós dicen de ti, cuenta por cuenta, y entérate
             el mismo día que algo cambia. Todo en español, desde tu teléfono.</p>
          <div class="lp-hero__cta">
            <button class="btn btn--primary" data-registro>Empezar ahora</button>
            <button class="btn" data-entrar>Ya soy cliente</button>
          </div>
          <p class="lp-hero__note">Cancela cuando quieras · Revisar tu crédito aquí no te baja puntos</p>
        </div>

        <div class="lp-shot" aria-hidden="true">
          <div class="lp-shot__bar"><i></i><i></i><i></i></div>
          <div class="lp-shot__row">
            ${demo.map(b=>{
              const col = UI.banda(b.s).color;
              return `<div class="lp-mini"><b>${b.n}</b>
                ${gauge(b.s,62)}
                <span class="n" style="color:${col}">${b.s}</span></div>`;
            }).join("")}
          </div>
          <div style="display:grid;gap:9px;border-top:1px solid var(--line);padding-top:13px">
            ${[["bad","Nueva cuenta en cobranza · $612","Revisar"],
               ["warn","Tu saldo subió $430 este mes","Revisar"],
               ["ok","TransUnion subió 23 puntos","Ver"]].map(([n,t,a])=>`
              <div style="display:flex;align-items:center;gap:10px">
                <span class="list__ico list__ico--${n}" style="width:28px;height:28px;border-radius:9px">
                  ${ico(n==="ok"?"check":"alerta",14)}</span>
                <span style="font-size:12.5px;font-weight:650;flex:1">${t}</span>
                <span class="chip chip--${n}" style="height:21px;font-size:10.5px">${a}</span>
              </div>`).join("")}
          </div>
        </div>
      </header>

      <div class="lp__wrap"><div class="lp-trust">
        <span>${ico("check",15)} TransUnion · Experian · Equifax</span>
        <span>${ico("reloj",15)} Actualización diaria</span>
        <span>${ico("candado",15)} Datos cifrados</span>
        <span>${ico("reporte",15)} Reporte de los 3 burós</span>
      </div></div>

      <section class="lp-section lp__wrap" id="como">
        <div class="lp-section__head">
          <h2>Cómo funciona</h2>
          <p>Tres pasos, en este orden. No hay letra chica ni visitas a la oficina.</p>
        </div>
        <div class="lp-steps">
          ${PASOS.map((p,i)=>`<article class="lp-step">
            <div class="lp-step__n">${i+1}</div>
            <h3>${esc(p.t)}</h3><p>${esc(p.d)}</p></article>`).join("")}
        </div>
      </section>

      <section class="lp-section lp__wrap" id="incluye">
        <div class="lp-section__head">
          <h2>Qué hay dentro de tu panel</h2>
          <p>No es un reporte en PDF que te mandan una vez al mes. Es una herramienta que usas.</p>
        </div>
        <div class="lp-feats">
          ${FUNCIONES.map(f=>`<article class="lp-feat">
            <div class="lp-feat__i">${ico(f.i,19)}</div>
            <h3>${esc(f.t)}</h3><p>${esc(f.d)}</p></article>`).join("")}
        </div>
      </section>

      <section class="lp-section lp__wrap" id="planes">
        <div class="lp-section__head">
          <h2>Planes</h2>
          <p>Sin contrato de permanencia. Cambias o cancelas desde tu panel cuando quieras.</p>
        </div>
        <div class="lp-plans">
          ${PLANES.map(p=>`
            <article class="lp-plan ${p.destacado?"lp-plan--top":""}" ${p.etiqueta?`data-tag="${esc(p.etiqueta)}"`:""}>
              <div>
                <div class="lp-plan__name">${esc(p.nombre)}</div>
                <p style="color:var(--text-2);font-size:13.5px;margin-top:5px">${esc(p.resumen)}</p>
              </div>
              <div class="lp-plan__price"><b>${money2(p.precio)}</b><span>/ mes</span></div>
              <button class="btn ${p.destacado?"btn--primary":""} btn--block" data-registro data-plan="${p.id}">
                Elegir ${esc(p.nombre)}</button>
              <ul>
                ${p.incluye.map(x=>`<li>${ico("check",15)}<span>${esc(x)}</span></li>`).join("")}
                ${p.excluye.map(x=>`<li class="off">${ico("x",15)}<span>${esc(x)}</span></li>`).join("")}
              </ul>
            </article>`).join("")}
        </div>
        <p style="color:var(--text-3);font-size:12.5px;margin-top:20px;max-width:80ch;line-height:1.65">
          Los precios están en dólares y se cobran cada mes. Por ley (CROA) no se cobra el servicio
          de reparación antes de prestarlo, y tienes 3 días hábiles para cancelar tu contrato sin costo.
        </p>
      </section>

      <section class="lp-section lp__wrap" id="preguntas">
        <div class="lp-section__head">
          <h2>Preguntas que todo el mundo hace</h2>
        </div>
        <div class="lp-faq">
          ${FAQ.map((f,i)=>`<details ${i===0?"open":""}>
            <summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}
        </div>
      </section>

      <div class="lp__wrap"><div class="lp-cta">
        <h2>Deja de adivinar qué dice tu crédito.</h2>
        <p>Entra, mira tus tres puntajes y descubre en cinco minutos qué es lo que te está frenando.</p>
        <button class="btn btn--primary" data-registro style="height:48px;padding:0 24px;font-size:14.5px">
          Crear mi cuenta</button>
      </div></div>

      <footer class="lp-foot lp__wrap">
        <div class="lp-foot__cols">
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
              <span class="brand__mark">${logo(32)}</span>
              <b style="color:var(--text);font-size:14px">${esc(marca.nombre)}</b>
            </div>
            <p style="line-height:1.7">Monitoreo y reparación de crédito.<br>
              ${esc(marca.soporte)}<br>${esc(marca.telefono)}</p>
          </div>
          <div><h4>Producto</h4><ul>
            <li><a href="#como">Cómo funciona</a></li>
            <li><a href="#incluye">Qué incluye</a></li>
            <li><a href="#planes">Planes</a></li>
          </ul></div>
          <div><h4>Legal</h4><ul>
            <li><a href="#">Términos de servicio</a></li>
            <li><a href="#">Política de privacidad</a></li>
            <li><a href="#">Contrato CROA</a></li>
            <li><a href="#">Derecho de cancelación</a></li>
          </ul></div>
          <div><h4>Soporte</h4><ul>
            <li><a href="#">Centro de ayuda</a></li>
            <li><a href="#">Contacto</a></li>
            <li><a href="#" data-entrar>Entrar a mi cuenta</a></li>
          </ul></div>
        </div>
        <div class="lp-foot__legal">
          ${esc(marca.nombre)} <span>no es un bufete de abogados y no da asesoría legal ni financiera.
          Ninguna empresa puede eliminar información negativa que sea exacta y esté dentro del plazo
          de reporte, ni garantizar un aumento de puntaje. Tienes derecho a disputar información
          por tu cuenta y gratis ante cada buró, y a un reporte de crédito gratuito al año en
          annualcreditreport.com. Los puntajes que se muestran son modelos educativos y pueden
          diferir del que use un prestamista.</span>
          <br><br>© ${new Date().getFullYear()} ${esc(marca.nombre)}. <span>Todos los derechos reservados.</span>
        </div>
      </footer>
    </div>`;
  }

  return {render, PLANES};
})();
