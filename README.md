# Home de Taquilla

Proyecto React y Vite independiente. Incluye código ejecutable del home, componentes funcionales, estilos por componente y tokens. No depende de las otras carpetas del material.

## Ejecutar

Requiere Node.js 20.19 o posterior en la rama 20, o Node.js 22.12 o posterior.

```sh
npm ci
cp .env.example .env
npm run dev
```

En `.env`, configura `VITE_API_URL` con la URL base de la API (incluye `/api/v1`). Para apuntar a otra API, cambia esa variable y reinicia Vite.

Abre la dirección que muestre Vite. El home está en `/`, Explorar eventos en `/explorar` y cada evento en `/eventos/:slug`.

```sh
npm run build
npm run preview
```

## Organización

- `src/pages/Home.jsx`: composición del home y acciones de demostración.
- `src/pages/ExplorarEventos.jsx`: interfaz de búsqueda y exploración del catálogo.
- `src/pages/DetalleEvento.jsx`: ficha individual, ubicación y recomendaciones de eventos.
- `src/components/`: cada carpeta incluye el componente `.jsx` y su `.css`.
- `src/styles/tokens.css`: colores de marca, fuentes, espaciado y radio.
- `src/styles/base.css`: reset, contenedores y elementos comunes.
- `src/context/PreferenciasContext.jsx`: estado compartido de idioma y consentimiento.
- `src/services/cookies.js`: lectura, guardado y eliminación de cookies.
- `src/services/api.js`: cliente GET para la API real del proyecto.
- `src/hooks/useRecurso.js`: consulta cancelable, carga, error y reintento.
- `src/hooks/useDetalle.js`: datos del diálogo de demostración.

## Componentes incluidos

- `Accesibilidad/Accesibilidad.jsx` y `Accesibilidad/Accesibilidad.css`.
- `AficheEvento/AficheEvento.jsx` y `AficheEvento/AficheEvento.css`.
- `BannerCookies/BannerCookies.jsx` y `BannerCookies/BannerCookies.css`.
- `BuscadorEventos/BuscadorEventos.jsx` y `BuscadorEventos/BuscadorEventos.css`.
- `CategoriasEventos/CategoriasEventos.jsx` y `CategoriasEventos/CategoriasEventos.css`.
- `DialogoDetalle/DialogoDetalle.jsx` y `DialogoDetalle/DialogoDetalle.css`.
- `EventoDestacado/EventoDestacado.jsx` y `EventoDestacado/EventoDestacado.css`.
- `Flecha/Flecha.jsx` y `Flecha/Flecha.css`.
- `Footer/Footer.jsx` y `Footer/Footer.css`.
- `GestorCookies/GestorCookies.jsx` y `GestorCookies/GestorCookies.css`.
- `HeroTaquilla/HeroTaquilla.jsx` y `HeroTaquilla/HeroTaquilla.css`.
- `IconoEvento/IconoEvento.jsx` y `IconoEvento/IconoEvento.css`.
- `LayoutPublico/LayoutPublico.jsx` y `LayoutPublico/LayoutPublico.css`.
- `Marca/Marca.jsx` y `Marca/Marca.css`.
- `MenuMovil/MenuMovil.jsx` y `MenuMovil/MenuMovil.css`.
- `Navbar/Navbar.jsx` y `Navbar/Navbar.css`.
- `PreferenciasCookies/PreferenciasCookies.jsx` y `PreferenciasCookies/PreferenciasCookies.css`.
- `SaltarContenido/SaltarContenido.jsx` y `SaltarContenido/SaltarContenido.css`.
- `SeccionEventos/SeccionEventos.jsx` y `SeccionEventos/SeccionEventos.css`.
- `SelectorIdioma/SelectorIdioma.jsx` y `SelectorIdioma/SelectorIdioma.css`.
- `TarjetaEvento/TarjetaEvento.jsx` y `TarjetaEvento/TarjetaEvento.css`.

## Reutilizar

Importa el componente desde su carpeta y entrega sus datos por props. El componente importa su CSS. El archivo `main.jsx` carga tokens y estilos base una vez; otra página que use estos componentes debe mantener esas dos importaciones.

`LayoutPublico` compone Navbar, Footer, enlace de salto, contenido y gestor de cookies. Requiere `PreferenciasProvider`, ya montado en `main.jsx`. Las tarjetas reciben datos y callbacks; no hacen solicitudes HTTP por instancia.

Los estilos están separados por responsabilidad, pero usan las clases y los tokens del proyecto. Para copiar una tarjeta a otra aplicación, incluye sus componentes hijos, su CSS y los tokens que utiliza.

## Datos y API

El home y Explorar eventos obtienen eventos y categorías de la API mediante `useEventos`. Los textos de la interfaz se cargan por idioma con `useTextos`. Si la API no responde, la interfaz muestra sus estados de carga o error.

La URL base de la API se lee desde `VITE_API_URL` en `.env`. El archivo `.env.example` incluye la configuración de desarrollo actual.

`useEventos` consulta `GET /eventos` en páginas y `GET /categorias?idioma=...`. `useTextos` consulta `GET /textos?idioma=es` o `GET /textos?idioma=en`.

Las listas llegan en `datos`, las listas paginadas incluyen `paginacion` y los textos llegan en `textos`. Consulta el [contrato](https://yanethm-taquilla-api.fly.dev/docs/contrato) antes de adaptar campos. Los filtros de Explorar y la ficha del evento trabajan con los eventos cargados desde la API.

`useRecurso` también está disponible como hook genérico para otras consultas. Los componentes de presentación reciben los datos por props y no necesitan conocer la URL de la API.

## Explorar eventos y parámetros de URL

La página `/explorar` mantiene en la URL el estado de búsqueda. `ExplorarEventos.jsx` lee sus parámetros al abrir la página y restaura los filtros, el orden y la página. Al cambiar esos controles, actualiza la dirección sin recargar. Así se puede recargar o compartir un enlace y conservar los resultados.

Ejemplo: `/explorar?categoria=teatro&ciudad=Manizales&q=salsa&orden=precio&pagina=2`.

Se admiten `categoria` (puede aparecer más de una vez), `ciudad`, `q`, `fecha`, `finDeSemana`, `mes`, `fechaDesde`, `fechaHasta`, `precioDesde`, `precioHasta`, `hoy`, `orden` y `pagina`. Los valores predeterminados —orden por fecha y página 1— se omiten. Los demás parámetros de la URL se conservan.

Las tarjetas de eventos abren `/eventos/:slug`. La ruta busca el evento en el catálogo cargado y muestra su información disponible, un enlace a la ubicación en Maps y recomendaciones de la misma categoría.

## Cookies e idioma

El banner permite aceptar, rechazar o configurar. El footer vuelve a abrir el diálogo. Solo se persiste el idioma si se aceptan preferencias; al rechazarlas se elimina la cookie de idioma.

Se usan nombres `taquilla_consentimiento` y `taquilla_idioma`, con `Path=/`, para aislar estas demostraciones incluso cuando se ejecutan bajo el mismo host con diferentes puertos. Esta es una decisión del material distribuible; los contratos describen los nombres generales `consentimiento` e `idioma`.

No se instalan servicios de analítica ni publicidad y no se crea una sesión de usuario. La decisión se guarda por seis meses. Si el navegador bloquea el almacenamiento se muestra un error.

## Accesibilidad

Enlace de salto al contenido, menú con `aria-expanded`, Escape y retorno de foco, selector de idioma con `aria-pressed`, formularios etiquetados, estados anunciados, diálogos nativos y CSS para movimiento reducido. Comprueba teclado y zoom al modificar los componentes.

## Alcance

Incluye el home, Explorar eventos y las fichas individuales. Los botones de cuenta abren un aviso; no hay registro ni compra. Las fuentes de Google Fonts requieren conexión; el CSS incluye fuentes de respaldo.
