LANDING FIBRA FIX - CLOUDFLARE PAGES
=====================================

Este paquete fue adaptado desde la versión actualizada de la landing.

IMPORTANTE
----------
- La carpeta public/ se copió sin modificar el frontend.
- No se cambiaron HTML, CSS, JavaScript, imágenes, SVG, videos, estilos,
  responsive, botones ni diseño.
- Node/Express ya no es necesario para desplegar esta versión.
- La ruta /api/orders conserva el mismo endpoint que usa el frontend,
  pero ahora funciona con Cloudflare Pages Functions.
- El archivo .env original NO se incluye en este paquete.

ESTRUCTURA
----------
public/                 Landing completa sin modificaciones visuales
functions/api/orders.js Endpoint POST /api/orders para pedidos
.dev.vars.example       Ejemplo de variables para desarrollo local
.gitignore              Evita subir secretos locales

VARIABLES / SECRETS NECESARIOS EN CLOUDFLARE
---------------------------------------------
CALLMEBOT_PHONE
CALLMEBOT_API_KEY

No publiques estos valores dentro de HTML o JavaScript del navegador.

CONFIGURACIÓN DEL PROYECTO EN CLOUDFLARE PAGES
-----------------------------------------------
Framework preset: None
Production branch: main
Build command: exit 0
Build output directory: public

El directorio functions/ debe permanecer en la raíz del repositorio,
al mismo nivel que public/.

PEDIDOS
-------
El frontend sigue enviando:
POST /api/orders

La Function valida los mismos campos, guarda el pedido en Google Sheets
y mantiene la notificación por CallMeBot cuando los secretos están
configurados.
