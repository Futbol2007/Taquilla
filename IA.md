# Registro de uso de inteligencia artificial

Este archivo resume algunas consultas realizadas a una IA durante el desarrollo de Taquilla y cómo se aplicaron o corrigieron sus respuestas. Las decisiones finales se revisaron en el código del proyecto.

## Entrada 1: panel de accesibilidad adaptable

**Consulta:** Ajustar el panel de accesibilidad para que se pareciera a una referencia visual y se adaptara a la landing en pantallas pequeñas.

**Aporte de la IA:** Propuso un panel más compacto, descripciones legibles, controles de tamaño con iconos, bordes redondeados y reglas responsive. También identificó que las reglas globales de espaciado podían afectar la distribución del texto dentro del panel.

**Aplicación:** Se modificaron `Accesibilidad.css` y `Accesibilidad.jsx` para adaptar el panel, sus controles y el espaciado de lectura. El menú móvil se diseñó como un drawer con opciones de idioma, accesibilidad e ingreso.

## Entrada 2: tamaño de texto incremental

**Consulta:** Hacer que los botones menos y más aumentaran o redujeran el tamaño del texto progresivamente, en vez de elegir entre tres tamaños predeterminados.

**Aporte de la IA:** Propuso guardar el tamaño como porcentaje numérico, modificarlo en pasos de 10 y limitarlo entre 80 % y 150 %. El hook publica un factor CSS que usa la landing para escalarse, y la letra central muestra el tamaño seleccionado.

**Aplicación:** Se actualizaron `Accesibilidad.jsx`, `useAccesibilidad.js` y `base.css`. Los botones se desactivan al llegar a los límites.

## Entrada 3: eventos desde una API paginada

**Consulta:** Dejar de usar eventos hardcodeados, cargar los datos desde la API, recibir el idioma y el número de eventos que se muestran, y consultar más allá de la primera página.

**Respuesta inicial equivocada:** La IA asumió que la pantalla todavía usaba directamente el catálogo local y que bastaba con reemplazar la función del hook. Al revisar la rama, encontró que `catalogo.js` ya se había eliminado y que partes de la pantalla estaban comentadas, además de que la API usa nombres de campos distintos a los componentes.

**Corrección y aplicación:** Se adaptó `useEventos(idioma, numeroEventos)` para consultar todas las páginas indicadas por `paginacion.paginas`, pasar `idioma` y convertir los campos de la API al formato que usan las tarjetas. También se conectó de nuevo la pantalla a los resultados dinámicos. La consulta a la API mostró que `idioma=en` todavía devuelve títulos y ciudades en español; por eso la interfaz traduce categorías y fechas, mientras que los nombres dependen de traducciones que proporcione la API.

## Entrada 4: cerrar accesibilidad al tocar fuera

**Consulta:** Corregir el menú móvil cuando se abre accesibilidad, se toca fuera del panel y después se vuelve a abrir el menú, porque el panel reaparecía encima.

**Aporte de la IA:** Identificó que el panel guardaba su propio estado dentro de `Accesibilidad.jsx`, mientras que el overlay solo cerraba los estados del `Navbar.jsx`. Así quedaban dos estados diferentes: el menú parecía cerrado, pero accesibilidad seguía abierta internamente.

**Aplicación:** El estado del panel quedó controlado desde `Navbar.jsx` y se pasó a `Accesibilidad.jsx` mediante la propiedad `abierto`. De esta manera, tocar fuera, cerrar con la X o alternar el menú actualiza la misma fuente de estado.

