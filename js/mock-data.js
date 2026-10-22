/* ==========================================================================
   DATOS DE DEMOSTRACIÓN
   Esto es SOLO para que veas la plataforma funcionando sin API.
   Cuando conectes Consumer Direct, api.js deja de usar este archivo.
   No necesitas borrarlo: sirve de referencia de la forma que deben tener
   los datos que devuelve la API.
   ========================================================================== */
window.MOCK = {

  user:{
    id:"CL-10427", nombre:"María", apellido:"Rodríguez",
    email:"maria.rodriguez@email.com", telefono:"(305) 555-0142",
    direccion:"1420 SW 8th St, Apt 5B, Miami, FL 33135",
    ssnMask:"•••-••-4417", nacimiento:"1988-04-12",
    plan:"Kesser Premium", planPrecio:34.99, proximoCobro:"2026-11-14",
    miembroDesde:"2025-08-02", rol:"cliente", avatar:"MR"
  },

  scores:{
    actualizado:"2026-10-21T08:15:00",
    modelo:"VantageScore 3.0",
    burós:[
      {id:"tu",  nombre:"TransUnion", score:684, prev:661, min:300, max:850},
      {id:"exp", nombre:"Experian",   score:671, prev:658, min:300, max:850},
      {id:"eqf", nombre:"Equifax",    score:702, prev:669, min:300, max:850}
    ]
  },

  /* Lo que se ve en el panel de presentación, debajo del puntaje.
     "actual" es el puntaje de TransUnion (el que viene incluido en el plan).
     planAccion e impulso son los puntos que el cliente PUEDE ganar.
     riesgo son los puntos que puede PERDER si se descuida. */
  detalle:{
    buró:"tu",
    actual:684,
    inicial:612,
    actualizado:"2026-10-21T08:15:00",
    proximaActualizacion:"2026-11-21",
    refrescosUsados:1,
    refrescosDelMes:3,
    planAccion:119,          // = la suma de los consejos de tipo "ganar"
    impulso:6,
    riesgo:-162
  },

  /* KESSER MATCH — las categorías. Cuántas ofertas hay y qué puntaje hace
     falta NO se escribe aquí: se calcula solo a partir de la lista `ofertas`,
     para que nunca se contradigan. */
  categorias:[
    {id:"tarjetas",  nombre:"Tarjetas de crédito",  icono:"tarjeta", clase:"tarjeta"},
    {id:"personales",nombre:"Préstamos personales", icono:"dinero",  clase:"prestamo"},
    {id:"auto",      nombre:"Préstamos de auto",    icono:"auto",    clase:"prestamo"},
    {id:"casa",      nombre:"Préstamos de casa",    icono:"casa",    clase:"prestamo"},
    {id:"negocio",   nombre:"Préstamos de negocio", icono:"negocio", clase:"prestamo"}
  ],

  /* Consejos: por qué el puntaje está donde está y qué hacer, en orden de impacto. */
  consejos:[
    {id:"CJ-1", titulo:"Tienes muy pocas cuentas abiertas", impacto:22, tipo:"ganar",
     dificultad:"Media", plazo:"3 a 6 meses", factor:"Mezcla de cuentas",
     porque:"Hoy tienes 3 cuentas activas. Los modelos de puntaje premian tener entre 5 y 8 cuentas sanas, porque demuestra que varios acreedores distintos confían en ti. Con pocas cuentas, cada movimiento pesa demasiado: un solo saldo alto te mueve el puntaje entero.",
     queHacer:"Pide que te agreguen como usuario autorizado en una tarjeta de un familiar con historial largo y uso bajo, o abre una tarjeta asegurada con depósito pequeño. No abras varias a la vez: una cada seis meses."},

    {id:"CJ-2", titulo:"Estás usando el 81% de tu límite", impacto:38, tipo:"ganar",
     dificultad:"Alta prioridad", plazo:"1 a 2 meses", factor:"Uso del crédito",
     porque:"Usar más del 30% de tu límite es lo segundo que más pesa en tu puntaje, después de los atrasos. Y a diferencia de un pago tardío, esto se arregla rápido: el buró ve el saldo nuevo en cuanto el acreedor reporta, normalmente al mes siguiente.",
     queHacer:"Baja el saldo de tus tarjetas a menos del 30% del límite. Son $1,540 repartidos entre Capital One y Amazon. Si no puedes pagarlo completo, paga primero la que esté más cerca del tope."},

    {id:"CJ-3", titulo:"Tienes 2 cuentas en cobranza", impacto:34, tipo:"ganar",
     dificultad:"Media", plazo:"2 a 4 meses", factor:"Historial de pagos",
     porque:"Una cobranza es el renglón que más daño hace después de una quiebra. Las dos tuyas suman $2,459 y siguen apareciendo en tu reporte aunque la deuda original sea vieja.",
     queHacer:"Habla directo con la agencia y negocia por escrito antes de pagar nada. Nunca pagues por teléfono sin tener el acuerdo en papel. Pagar sin acuerdo puede reiniciar el reloj de la deuda."},

    {id:"CJ-4", titulo:"3 pagos tardíos en los últimos 24 meses", impacto:18, tipo:"ganar",
     dificultad:"Fácil", plazo:"6 meses", factor:"Historial de pagos",
     porque:"El historial de pagos es el 40% de tu puntaje. Los atrasos pierden fuerza con el tiempo: los tuyos ya tienen más de un año y cada mes limpio los diluye más.",
     queHacer:"Pon pago automático del mínimo en las tres cuentas. Con eso, aunque se te olvide, nunca vuelves a caer en atraso. Seis meses seguidos sin un solo tarde y se nota."},

    {id:"CJ-5", titulo:"No cierres tu tarjeta más antigua", impacto:16, tipo:"proteger",
     dificultad:"Fácil", plazo:"Ahora mismo", factor:"Antigüedad del crédito",
     porque:"Tu Discover de 2017 está cerrada pero todavía cuenta para tu antigüedad promedio. Cerrar una tarjeta vieja y activa te quitaría historial y límite al mismo tiempo: doble golpe.",
     queHacer:"Mantén abiertas tus cuentas más viejas aunque no las uses. Si te cobran anualidad, pide cambiarla a una versión sin cuota en vez de cerrarla."},

    {id:"CJ-6", titulo:"Tienes 2 consultas duras recientes", impacto:7, tipo:"ganar",
     dificultad:"Fácil", plazo:"Esperar", factor:"Consultas recientes",
     porque:"Cada consulta dura pesa poco por separado, pero se quedan 2 años. Las tuyas son de julio y de mayo.",
     queHacer:"No pidas crédito nuevo por los próximos 6 meses. Si vas a comprar auto o casa, haz todas las cotizaciones dentro de 14 días: el modelo las cuenta como una sola consulta."}
  ],

  historial:[
    {mes:"Abr", tu:612, exp:604, eqf:625},
    {mes:"May", tu:618, exp:611, eqf:631},
    {mes:"Jun", tu:627, exp:619, eqf:640},
    {mes:"Jul", tu:641, exp:630, eqf:652},
    {mes:"Ago", tu:655, exp:644, eqf:661},
    {mes:"Sep", tu:661, exp:658, eqf:669},
    {mes:"Oct", tu:684, exp:671, eqf:702}
  ],

  /* "Credit Report Card": los 5 factores con nota */
  factores:[
    {id:"pagos", nombre:"Historial de pagos", nota:"C", pct:68, peso:"40%",
     detalle:"3 pagos tardíos en los últimos 24 meses", impacto:"alto"},
    {id:"uso", nombre:"Uso del crédito", nota:"D", pct:41, peso:"20%",
     detalle:"Estás usando el 81% de tu límite disponible", impacto:"alto"},
    {id:"antiguedad", nombre:"Antigüedad del crédito", nota:"B", pct:78, peso:"21%",
     detalle:"Edad promedio de cuentas: 6 años 4 meses", impacto:"medio"},
    {id:"mezcla", nombre:"Mezcla de cuentas", nota:"A", pct:90, peso:"11%",
     detalle:"Tarjetas, auto e hipoteca: buena variedad", impacto:"bajo"},
    {id:"consultas", nombre:"Consultas recientes", nota:"B", pct:80, peso:"8%",
     detalle:"2 consultas duras en los últimos 12 meses", impacto:"bajo"}
  ],

  /* Reporte tri-merge */
  personal:{
    nombres:["María Rodríguez","Maria C Rodriguez","M. Rodriguez"],
    direcciones:[
      {valor:"1420 SW 8th St, Apt 5B, Miami, FL 33135", desde:"2023-06", burós:["tu","exp","eqf"]},
      {valor:"88 NE 42nd Ave, Hialeah, FL 33013", desde:"2019-02", burós:["tu","eqf"]},
      {valor:"PO BOX 7721, Miami, FL 33101", desde:"2018-05", burós:["exp"], sospechosa:true}
    ],
    empleadores:[{valor:"Sunrise Logistics LLC", reportado:"2025-03", burós:["tu","exp"]}]
  },

  /* Cada cuenta trae lo que reporta CADA buró por separado.
     Así es como llega la información de un tri-merge: los tres burós casi nunca
     dicen exactamente lo mismo, y cuando uno no reporta la cuenta, va en null.

     historial = 24 meses, del más viejo al más nuevo:
       O = pagó a tiempo   3 = 30 días tarde   6 = 60 días   9 = 90+ días
       C = en cobranza     D = diferido        - = sin información        */
  cuentas:[
    {id:"AC-1", acreedor:"Capital One Platinum", tipo:"Tarjeta revolvente",
     responsable:"Individual", negativa:false,
     burós:{
       tu:{numero:"****4417", saldo:2840, limite:3500, pago:95, abierta:"2018-03-14",
           ultimoPago:"2026-10-14", estado:"Al día", d30:1, d60:0, d90:0,
           reportado:"2026-10-01", historial:"OOOOOOOOOO3OOOOOOOOOOOOO"},
       exp:{numero:"****4417", saldo:2840, limite:3500, pago:95, abierta:"2018-03-14",
           ultimoPago:"2026-10-14", estado:"Al día", d30:1, d60:0, d90:0,
           reportado:"2026-09-28", historial:"OOOOOOOOOO3OOOOOOOOOOOOO"},
       eqf:{numero:"****4417", saldo:2790, limite:3500, pago:95, abierta:"2018-03-14",
           ultimoPago:"2026-10-14", estado:"Al día", d30:1, d60:0, d90:0,
           reportado:"2026-09-20", historial:"OOOOOOOOOO3OOOOOOOOOOOOO"}}},

    {id:"AC-2", acreedor:"Synchrony / Amazon Store", tipo:"Tarjeta revolvente",
     responsable:"Individual", negativa:false,
     burós:{
       tu:{numero:"****9023", saldo:1190, limite:1500, pago:45, abierta:"2021-11-02",
           ultimoPago:"2026-10-09", estado:"Al día", d30:2, d60:0, d90:0,
           reportado:"2026-10-01", historial:"OOOOO3OOOOOOOO3OOOOOOOOO"},
       exp:{numero:"****9023", saldo:1190, limite:1500, pago:45, abierta:"2021-11-02",
           ultimoPago:"2026-10-09", estado:"Al día", d30:2, d60:0, d90:0,
           reportado:"2026-09-30", historial:"OOOOO3OOOOOOOO3OOOOOOOOO"},
       eqf:null}},

    {id:"AC-3", acreedor:"Ally Auto Finance", tipo:"Préstamo de auto",
     responsable:"Individual", negativa:false,
     burós:{
       tu:{numero:"****7781", saldo:14320, limite:24500, pago:412, abierta:"2022-07-19",
           ultimoPago:"2026-10-19", estado:"Al día", d30:0, d60:0, d90:0,
           reportado:"2026-10-01", historial:"OOOOOOOOOOOOOOOOOOOOOOOO"},
       exp:{numero:"****7781", saldo:14320, limite:24500, pago:412, abierta:"2022-07-19",
           ultimoPago:"2026-10-19", estado:"Al día", d30:0, d60:0, d90:0,
           reportado:"2026-10-02", historial:"OOOOOOOOOOOOOOOOOOOOOOOO"},
       eqf:{numero:"****7781", saldo:14480, limite:24500, pago:412, abierta:"2022-07-19",
           ultimoPago:"2026-09-19", estado:"Al día", d30:0, d60:0, d90:0,
           reportado:"2026-09-22", historial:"OOOOOOOOOOOOOOOOOOOOOOOO"}}},

    {id:"AC-4", acreedor:"Portfolio Recovery Assoc.", tipo:"Cobranza",
     responsable:"Individual", negativa:true,
     nota:"Deuda original: Verizon Wireless",
     burós:{
       tu:{numero:"****2290", saldo:1847, limite:0, pago:0, abierta:"2023-09-08",
           ultimoPago:"—", estado:"En cobranza", d30:0, d60:0, d90:4,
           reportado:"2026-10-01", historial:"------------CCCCCCCCCCCC"},
       exp:{numero:"****2290", saldo:1847, limite:0, pago:0, abierta:"2023-09-08",
           ultimoPago:"—", estado:"En cobranza", d30:0, d60:0, d90:4,
           reportado:"2026-09-28", historial:"------------CCCCCCCCCCCC"},
       eqf:null}},

    {id:"AC-5", acreedor:"Midland Credit Mgmt", tipo:"Cobranza",
     responsable:"Individual", negativa:true,
     nota:"Deuda original: Credit One Bank",
     burós:{
       tu:null,
       exp:{numero:"****6612", saldo:612, limite:0, pago:0, abierta:"2024-02-21",
           ultimoPago:"—", estado:"En cobranza", d30:0, d60:0, d90:2,
           reportado:"2026-10-05", historial:"--------------------CCCC"},
       eqf:{numero:"****6612", saldo:612, limite:0, pago:0, abierta:"2024-02-21",
           ultimoPago:"—", estado:"En cobranza", d30:0, d60:0, d90:2,
           reportado:"2026-10-03", historial:"--------------------CCCC"}}},

    {id:"AC-6", acreedor:"Navient Student Loan", tipo:"Préstamo estudiantil",
     responsable:"Individual", negativa:false,
     burós:{
       tu:{numero:"****1104", saldo:9800, limite:9800, pago:0, abierta:"2015-09-01",
           ultimoPago:"—", estado:"Diferido", d30:0, d60:0, d90:0,
           reportado:"2026-10-01", historial:"DDDDDDDDDDDDDDDDDDDDDDDD"},
       exp:{numero:"****1104", saldo:9800, limite:9800, pago:0, abierta:"2015-09-01",
           ultimoPago:"—", estado:"Diferido", d30:0, d60:0, d90:0,
           reportado:"2026-10-01", historial:"DDDDDDDDDDDDDDDDDDDDDDDD"},
       eqf:{numero:"****1104", saldo:9800, limite:9800, pago:0, abierta:"2015-09-01",
           ultimoPago:"—", estado:"Diferido", d30:0, d60:0, d90:0,
           reportado:"2026-09-25", historial:"DDDDDDDDDDDDDDDDDDDDDDDD"}}},

    {id:"AC-7", acreedor:"Discover it", tipo:"Tarjeta revolvente",
     responsable:"Individual", negativa:false,
     nota:"Cuenta cerrada por el titular",
     burós:{
       tu:{numero:"****3356", saldo:0, limite:2000, pago:0, abierta:"2017-05-30",
           ultimoPago:"2024-02-11", estado:"Cerrada", d30:0, d60:1, d90:0,
           reportado:"2024-03-01", historial:"OOOOOOOOOOOOOOOOOO6OOOOO"},
       exp:{numero:"****3356", saldo:0, limite:2000, pago:0, abierta:"2017-05-30",
           ultimoPago:"2024-02-11", estado:"Cerrada", d30:0, d60:1, d90:0,
           reportado:"2024-03-01", historial:"OOOOOOOOOOOOOOOOOO6OOOOO"},
       eqf:{numero:"****3356", saldo:0, limite:2000, pago:0, abierta:"2017-05-30",
           ultimoPago:"2024-02-11", estado:"Cerrada", d30:0, d60:1, d90:0,
           reportado:"2024-03-01", historial:"OOOOOOOOOOOOOOOOOO6OOOOO"}}}
  ],

  consultas:[
    {id:"IQ-1", empresa:"Ally Financial", fecha:"2026-07-11", tipo:"Dura", buró:"tu", motivo:"Auto"},
    {id:"IQ-2", empresa:"Chase Bank USA", fecha:"2026-05-03", tipo:"Dura", buró:"exp", motivo:"Tarjeta"},
    {id:"IQ-3", empresa:"Credit One Bank", fecha:"2026-02-18", tipo:"Dura", buró:"eqf", motivo:"Tarjeta", disputable:true},
    {id:"IQ-4", empresa:"LendingTree", fecha:"2026-01-22", tipo:"Suave", buró:"tu", motivo:"Pre-aprobación"}
  ],

  publicos:[
    {id:"PR-1", tipo:"Gravamen fiscal", entidad:"Miami-Dade County", fecha:"2021-04-06",
     monto:3200, estado:"Liberado", burós:["exp"], disputable:true}
  ],

  alertas:[
    {id:"AL-1", nivel:"bad", titulo:"Nueva cuenta en cobranza", detalle:"Midland Credit Mgmt reportó una cuenta de $612 en Experian.",
     fecha:"2026-10-19T14:22:00", buró:"exp", leida:false, accionable:true},
    {id:"AL-2", nivel:"warn", titulo:"Aumento de saldo", detalle:"Capital One Platinum subió de $2,410 a $2,840 (+$430).",
     fecha:"2026-10-16T09:05:00", buró:"tu", leida:false, accionable:false},
    {id:"AL-3", nivel:"bad", titulo:"Consulta dura no reconocida", detalle:"Credit One Bank consultó tu crédito en Equifax.",
     fecha:"2026-10-12T17:40:00", buró:"eqf", leida:false, accionable:true},
    {id:"AL-4", nivel:"ok", titulo:"Puntaje subió 23 puntos", detalle:"TransUnion pasó de 661 a 684.",
     fecha:"2026-10-21T08:15:00", buró:"tu", leida:true, accionable:false},
    {id:"AL-5", nivel:"info", titulo:"Dirección nueva en archivo", detalle:"Se agregó 'PO BOX 7721, Miami FL' a tu reporte de Experian.",
     fecha:"2026-09-30T11:12:00", buró:"exp", leida:true, accionable:true},
    {id:"AL-6", nivel:"ok", titulo:"Pago reportado a tiempo", detalle:"Ally Auto Finance reportó tu pago de octubre al día.",
     fecha:"2026-09-28T08:00:00", buró:"tu", leida:true, accionable:false}
  ],

  finanzas:{
    netWorth:18420,
    cuentas:[
      {id:"BK-1", nombre:"Chase Total Checking", tipo:"Corriente", saldo:3240.18, institucion:"Chase"},
      {id:"BK-2", nombre:"Ally Online Savings", tipo:"Ahorro", saldo:7800.00, institucion:"Ally"},
      {id:"BK-3", nombre:"Capital One Platinum", tipo:"Tarjeta", saldo:-2840.00, institucion:"Capital One"},
      {id:"BK-4", nombre:"Amazon Store Card", tipo:"Tarjeta", saldo:-1190.00, institucion:"Synchrony"}
    ],
    ingresoMes:4280, gastoMes:3615,
    porMes:[
      {mes:"May", ingreso:4100, gasto:3980},
      {mes:"Jun", ingreso:4180, gasto:3740},
      {mes:"Jul", ingreso:4220, gasto:4010},
      {mes:"Ago", ingreso:4250, gasto:3690},
      {mes:"Sep", ingreso:4280, gasto:3820},
      {mes:"Oct", ingreso:4280, gasto:3615}
    ],
    categorias:[
      {nombre:"Vivienda", monto:1450, presupuesto:1450},
      {nombre:"Transporte", monto:612, presupuesto:600},
      {nombre:"Comida", monto:548, presupuesto:500},
      {nombre:"Deudas", monto:552, presupuesto:552},
      {nombre:"Servicios", monto:263, presupuesto:280},
      {nombre:"Otros", monto:190, presupuesto:250}
    ],
    movimientos:[
      {fecha:"2026-10-21", desc:"Publix Super Market", cat:"Comida", monto:-86.42},
      {fecha:"2026-10-20", desc:"Pago nómina — Sunrise Logistics", cat:"Ingreso", monto:2140.00},
      {fecha:"2026-10-19", desc:"Ally Auto Finance", cat:"Deudas", monto:-412.00},
      {fecha:"2026-10-18", desc:"FPL Electricidad", cat:"Servicios", monto:-143.18},
      {fecha:"2026-10-17", desc:"Shell Gasolina", cat:"Transporte", monto:-58.30},
      {fecha:"2026-10-15", desc:"Renta — Brickell Property", cat:"Vivienda", monto:-1450.00},
      {fecha:"2026-10-14", desc:"Capital One pago mínimo", cat:"Deudas", monto:-95.00},
      {fecha:"2026-10-12", desc:"Amazon.com", cat:"Otros", monto:-67.88}
    ]
  },

  /* Ofertas precalificadas. `scoreMin` es lo que pide el emisor;
     la plataforma compara contra el puntaje real del cliente y ordena por tasa. */
  ofertas:[
    /* ---- Tarjetas de crédito ---- */
    {id:"OF-01", cat:"tarjetas", producto:"Kesser Builder Asegurada", emisor:"Partner Bank",
     color:"#E11D2E", apr:"0% por 12 meses", aprOrden:0, limite:"Tu depósito, desde $200",
     anualidad:0, extra:"Reporta a los 3 burós cada mes", scoreMin:0},
    {id:"OF-02", cat:"tarjetas", producto:"Capital Rewards Platinum", emisor:"Capital One",
     color:"#0F8B8D", apr:"19.99% – 29.99%", aprOrden:19.99, limite:"Hasta $3,500",
     anualidad:0, extra:"$200 de bono al gastar $500 en 3 meses", scoreMin:580},
    {id:"OF-03", cat:"tarjetas", producto:"Discover it Cash Back", emisor:"Discover",
     color:"#E07A1F", apr:"18.24% – 27.24%", aprOrden:18.24, limite:"Hasta $2,500",
     anualidad:0, extra:"Te duplican el cashback del primer año", scoreMin:640},
    {id:"OF-04", cat:"tarjetas", producto:"Freedom Unlimited", emisor:"Chase",
     color:"#2563EB", apr:"20.49% – 29.24%", aprOrden:20.49, limite:"Hasta $5,000",
     anualidad:0, extra:"1.5% en todo + $200 de bono", scoreMin:690},

    /* ---- Préstamos personales ---- */
    {id:"OF-05", cat:"personales", producto:"Préstamo de consolidación", emisor:"Upstart",
     color:"#6D4AC9", apr:"11.20%", aprOrden:11.20, monto:12000, plazo:36, cuota:394,
     extra:"Liquida tus tarjetas y te queda un solo pago", scoreMin:640},
    {id:"OF-06", cat:"personales", producto:"Préstamo personal", emisor:"LightStream",
     color:"#0E9F6E", apr:"9.49%", aprOrden:9.49, monto:15000, plazo:48, cuota:377,
     extra:"Sin comisión de apertura ni penalidad por pago anticipado", scoreMin:700},
    {id:"OF-07", cat:"personales", producto:"Préstamo personal", emisor:"Avant",
     color:"#C01626", apr:"24.95%", aprOrden:24.95, monto:8000, plazo:36, cuota:318,
     extra:"Aprobación el mismo día", scoreMin:580},

    /* ---- Préstamos de auto ---- */
    {id:"OF-08", cat:"auto", producto:"Refinanciamiento de tu Ally", emisor:"AutoRefi Direct",
     color:"#0F8B8D", apr:"6.49%", aprOrden:6.49, monto:14320, plazo:48, cuota:340,
     extra:"Ahorrarías unos $72 al mes sobre tu pago actual", scoreMin:660},
    {id:"OF-09", cat:"auto", producto:"Compra de auto usado", emisor:"Capital One Auto",
     color:"#E07A1F", apr:"7.89%", aprOrden:7.89, monto:25000, plazo:60, cuota:505,
     extra:"Preaprobación sin consulta dura", scoreMin:580},
    {id:"OF-10", cat:"auto", producto:"Compra de auto nuevo", emisor:"LightStream",
     color:"#0E9F6E", apr:"6.24%", aprOrden:6.24, monto:35000, plazo:60, cuota:680,
     extra:"La tasa más baja de la lista", scoreMin:700},

    /* ---- Préstamos de casa ---- */
    {id:"OF-11", cat:"casa", producto:"Línea sobre el valor de tu casa", emisor:"Rocket Mortgage",
     color:"#2563EB", apr:"6.95%", aprOrden:6.95, monto:50000, plazo:120, cuota:580,
     extra:"Usas solo lo que necesitas, pagas interés solo de eso", scoreMin:700},
    {id:"OF-12", cat:"casa", producto:"Refinanciamiento FHA", emisor:"Partner Lending",
     color:"#6D4AC9", apr:"6.45%", aprOrden:6.45, monto:320000, plazo:360, cuota:2012,
     extra:"Pensado para puntajes en recuperación", scoreMin:720},

    /* ---- Préstamos de negocio ---- */
    {id:"OF-13", cat:"negocio", producto:"Línea de capital de trabajo", emisor:"Fundbox",
     color:"#0E9F6E", apr:"9.90%", aprOrden:9.90, monto:150000, plazo:12, cuota:13150,
     extra:"Solo pagas por lo que uses", scoreMin:650},
    {id:"OF-14", cat:"negocio", producto:"Préstamo SBA 7(a)", emisor:"Partner SBA",
     color:"#E11D2E", apr:"11.25%", aprOrden:11.25, monto:350000, plazo:120, cuota:4820,
     extra:"Respaldado por la Small Business Administration", scoreMin:680}
  ],

  identidad:{
    seguro:1000000, estado:"Protegido",
    monitoreo:[
      {id:"ID-1", nombre:"Dark web — correo electrónico", estado:"alerta",
       detalle:"maria.rodriguez@email.com apareció en la filtración de 'ShopMart 2024'"},
      {id:"ID-2", nombre:"Número de Seguro Social", estado:"ok", detalle:"Sin actividad sospechosa"},
      {id:"ID-3", nombre:"Monitoreo de dirección", estado:"alerta",
       detalle:"Dirección nueva no reconocida en Experian"},
      {id:"ID-4", nombre:"Teléfono y cuentas", estado:"ok", detalle:"Sin coincidencias"},
      {id:"ID-5", nombre:"Registros de arresto / corte", estado:"ok", detalle:"Sin coincidencias"}
    ]
  },

  /* ---------- CRM interno (lado Kesser) ---------- */
  crm:{
    etapas:["Lead nuevo","Contactado","Documentos","Activo","Graduado"],
    clientes:[
      {id:"CL-10427", nombre:"María Rodríguez", tel:"(305) 555-0142", email:"maria.rodriguez@email.com",
       etapa:"Activo", plan:"Premium", score:684, scoreInicial:612, desde:"2025-08-02",
       agente:"Dayan K.", alertasAbiertas:2, valor:34.99, ultimoContacto:"2026-10-18"},
      {id:"CL-10431", nombre:"Jorge Peña", tel:"(786) 555-0198", email:"jpena@email.com",
       etapa:"Activo", plan:"Premium", score:641, scoreInicial:548, desde:"2025-11-19",
       agente:"Dayan K.", alertasAbiertas:4, valor:34.99, ultimoContacto:"2026-10-20"},
      {id:"CL-10455", nombre:"Yanet Cruz", tel:"(305) 555-0177", email:"ycruz@email.com",
       etapa:"Documentos", plan:"Básico", score:0, scoreInicial:0, desde:"2026-10-14",
       agente:"Equipo", alertasAbiertas:0, valor:19.99, ultimoContacto:"2026-10-19"},
      {id:"CL-10460", nombre:"Luis Betancourt", tel:"(954) 555-0133", email:"luisb@email.com",
       etapa:"Contactado", plan:"—", score:0, scoreInicial:0, desde:"2026-10-20",
       agente:"Equipo", alertasAbiertas:0, valor:0, ultimoContacto:"2026-10-21"},
      {id:"CL-10462", nombre:"Ana Fuentes", tel:"(305) 555-0121", email:"afuentes@email.com",
       etapa:"Lead nuevo", plan:"—", score:0, scoreInicial:0, desde:"2026-10-21",
       agente:"—", alertasAbiertas:0, valor:0, ultimoContacto:"—"},
      {id:"CL-10399", nombre:"Roberto Díaz", tel:"(786) 555-0160", email:"rdiaz@email.com",
       etapa:"Graduado", plan:"Premium", score:748, scoreInicial:601, desde:"2025-02-10",
       agente:"Dayan K.", alertasAbiertas:0, valor:0, ultimoContacto:"2026-09-02"},
      {id:"CL-10466", nombre:"Katia Morales", tel:"(305) 555-0188", email:"kmorales@email.com",
       etapa:"Lead nuevo", plan:"—", score:0, scoreInicial:0, desde:"2026-10-22",
       agente:"—", alertasAbiertas:0, valor:0, ultimoContacto:"—"}
    ]
  }
};
