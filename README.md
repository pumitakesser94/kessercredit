# Kesser Credit — sitio público

Plataforma de monitoreo de crédito. Este repositorio contiene **solo el front-end**
(lo que ve el navegador): portada de ventas, registro, login y el panel del cliente.

🔗 **En vivo:** https://kessercredit.com

## Qué hay aquí

```
index.html     la página (portada + plataforma, una sola aplicación)
404.html       página de error propia
styles.css     todo el diseño — los colores de marca están arriba del archivo
js/
  mock-data.js  datos de ejemplo (modo demostración)
  api.js        ⭐ la capa de integración con Consumer Direct
  i18n.js       diccionario español / inglés
  ui.js         iconos, logo, gráficas
  landing.js    la portada: planes, precios y preguntas
  views.js      las pantallas del panel
  app.js        navegación y sesión
CNAME          el dominio propio (no borrar)
.nojekyll      evita que GitHub procese los archivos (no borrar)
```

## Importante

- **Aquí no hay ni una sola llave ni contraseña.** Todo lo que está en este
  repositorio lo descarga cualquier navegador que entre al sitio: por eso las
  credenciales de Consumer Direct van en un backend aparte, nunca aquí.
- Hoy el sitio corre en **modo demostración**: los datos que se ven son de
  ejemplo. Para conectarlo de verdad hay que cambiar `modo` y `proxyUrl` en
  `js/api.js`.

## Publicación

GitHub Pages, desde la rama `main`. Cada vez que se sube un cambio, el sitio se
actualiza solo en un par de minutos.
