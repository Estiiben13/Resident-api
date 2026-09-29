# Resident Evil Archives

Aplicación standalone de Angular para explorar personajes de Resident Evil. Incluye búsqueda por nombre o expediente, tarjetas con retratos, indicador de carga, gestión de errores y un modal con enlaces a las fichas de la wiki.

## Requisitos

- Node.js y npm
- Conexión a internet para consultar Resident Evil Wiki

## Instalar y ejecutar

Instala las dependencias con `npm install` y después inicia el servidor de desarrollo con `npm start`. Abre `http://localhost:4200` en el navegador. La app consulta la API pública de MediaWiki en `https://residentevil.fandom.com/api.php`.

## Compilar y probar

- `npm run build` genera la compilación de producción.
- `npm test -- --watch=false` ejecuta las pruebas una vez.

## Implementación

- `provideHttpClient()` habilita las peticiones HTTP en la configuración standalone.
- `ResidentEvilService` carga personajes y retratos desde categorías de la wiki.
- Angular Signals y `computed` mantienen el estado y la búsqueda reactivos.
- Las tarjetas y el diálogo de detalles se adaptan a pantallas pequeñas.
