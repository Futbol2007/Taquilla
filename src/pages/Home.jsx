import LayoutPublico from "../components/LayoutPublico/LayoutPublico.jsx";
import HeroTaquilla from "../components/HeroTaquilla/HeroTaquilla.jsx";
import BuscadorEventos from "../components/BuscadorEventos/BuscadorEventos.jsx";
import CategoriasEventos from "../components/CategoriasEventos/CategoriasEventos.jsx";
import SeccionEventos from "../components/SeccionEventos/SeccionEventos.jsx";
import AficheEvento from "../components/AficheEvento/AficheEvento.jsx";
import DialogoDetalle from "../components/DialogoDetalle/DialogoDetalle.jsx";
import { usePreferencias } from "../context/PreferenciasContext.jsx";
import { useDetalle } from "../hooks/useDetalle.js";
import { useEventos } from "../hooks/useEventos.js";
import { useTextos } from "../hooks/useTextos.js";
import { dinero } from "../utils/dinero.js";

const EVENTOS_INICIALES = 4;

export default function Home() {
  const { idioma } = usePreferencias();
  const { textos } = useTextos(idioma);
  const en = idioma === "en";
  const { detalle, setDetalle, abrirCuenta } = useDetalle(idioma);
  const {
    eventos,
    categorias,
    numeroEventos,
    filtros,
    resultados,
    cargando,
    error,
    buscar,
    setFiltros,
    filtrarCategoria,
  } = useEventos(idioma, EVENTOS_INICIALES);

  function abrirEvento(evento) {
    setDetalle({
      titulo: evento.nombre,
      descripcion: `${evento.horario} · ${evento.lugar}, ${evento.ciudad}`,
      contenido: (
        <div className="resumen-evento">
          <AficheEvento variante={evento.arte} />
          <p>{dinero(evento.precio)} COP</p>
          {evento.descripcion && <small>{evento.descripcion}</small>}
        </div>
      ),
      cerrar: en ? "Close" : "Cerrar",
    });
  }

  return (
    <LayoutPublico textos={textos} destino="#explorar" onCuenta={abrirCuenta}>
      <HeroTaquilla
        en={en}
        destacado={eventos.find((evento) => evento.destacado) || eventos[0]}
        abrirEvento={abrirEvento}
        setFiltros={setFiltros}
        filtrarCategoria={filtrarCategoria}
      >
        <BuscadorEventos
          en={en}
          eventos={eventos}
          onBuscar={buscar}
          filtrosAplicados={filtros}
        />
      </HeroTaquilla>
      <div className="ancho-home">
        {cargando && (
          <p role="status">{en ? "Loading events…" : "Cargando eventos…"}</p>
        )}
        {error && !cargando && (
          <p role="alert">
            {en
              ? "We couldn't load the events. Please try again later."
              : "No pudimos cargar los eventos. Intenta de nuevo más tarde."}
          </p>
        )}
        {!cargando && !error && (
          <>
            <CategoriasEventos
              categorias={categorias}
              filtros={filtros}
              en={en}
              filtrarCategoria={filtrarCategoria}
            />
            <SeccionEventos
              id="eventos"
              titulo={
                filtros
                  ? en
                    ? "Search results"
                    : "Resultados de búsqueda"
                  : en
                    ? "Featured events"
                    : "Eventos destacados"
              }
              descripcion={
                filtros
                  ? `${resultados.length} ${en ? "results" : "resultados"}`
                  : en
                    ? "Explore our event selection"
                    : "Explora nuestra selección de eventos"
              }
              eventos={filtros ? resultados : eventos.slice(0, numeroEventos)}
              en={en}
              onAbrir={abrirEvento}
              onVerTodos={() => buscar({})}
            />
            {!filtros && (
              <SeccionEventos
                id="eventos-ciudad"
                titulo={en ? "Events in Manizales" : "Eventos en Manizales"}
                descripcion={
                  en
                    ? "Discover events in your city"
                    : "Descubre los eventos de tu ciudad"
                }
                eventos={eventos
                  .filter((evento) => evento.ciudad === "Manizales")
                  .slice(0, numeroEventos)}
                en={en}
                onAbrir={abrirEvento}
                onVerTodos={() => buscar({ ciudad: "Manizales" })}
              />
            )}
          </>
        )}
      </div>
      <DialogoDetalle detalle={detalle} onCerrar={() => setDetalle(null)} />
    </LayoutPublico>
  );
}
