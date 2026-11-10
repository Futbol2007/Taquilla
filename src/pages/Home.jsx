import { useEffect, useState } from "react";
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
  const tituloSeo = textos?.paginas?.inicio?.seo?.titulo;

  useEffect(() => {
    if (tituloSeo) document.title = tituloSeo;
  }, [tituloSeo]);

  const en = idioma === "en";
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState("Manizales");
  const { detalle, setDetalle, abrirCuenta } = useDetalle(textos, idioma);
  const {
    eventos,
    eventosFinDeSemana,
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

  const textosInicio = textos?.paginas?.inicio;
  const verTodos = () => buscar({});

  const textosResultados = textos?.paginas?.explorar?.resultadosCorto;
  const textoResultados =
    resultados.length === 1 ? textosResultados?.uno : textosResultados?.otro;

  const tituloEventos = filtros ? (
    en ? (
      "Search results"
    ) : (
      "Resultados de búsqueda"
    )
  ) : (
    <>
      <span className="titulo-destacados-escritorio">
        {textosInicio?.destacados?.titulo}
      </span>
      <span className="titulo-destacados-movil">
        {textosInicio?.filtrosMovil?.destacados}
      </span>
    </>
  );

  const descripcionEventos = filtros ? (
    textoResultados?.replaceAll("{cantidad}", resultados.length)
  ) : (
    <span className="descripcion-destacados-escritorio">
      {textosInicio?.destacados?.subtitulo}
    </span>
  );

  const eventosPrincipales = filtros
    ? resultados
    : eventos.filter((evento) => evento.destacado).slice(0, numeroEventos);

  const ciudadTexto =
    ciudadSeleccionada || (en ? "all cities" : "todas las ciudades");

  const eventosProximamente = eventos
    .filter(
      (evento) =>
        evento.ciudad?.toLowerCase() === ciudadSeleccionada?.toLowerCase(),
    )
    .slice(0, numeroEventos);

  const textosProximamente = textosInicio?.proximos;
  const tituloProximamente = textosProximamente?.titulo.replaceAll(
    "{ciudad}",
    ciudadTexto,
  );
  const descripcionProximamente = textosProximamente?.subtitulo?.replaceAll(
    "{ciudad}",
    ciudadTexto,
  );

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
      cerrar: textos?.general?.acciones?.cerrar ?? (en ? "Close" : "Cerrar"),
    });
  }

  return (
    <LayoutPublico
      textos={textos}
      onCuenta={abrirCuenta}
      onBuscarEventos={buscar}
    >
      <HeroTaquilla
        textos={textos}
        en={en}
        destacado={eventos.find((evento) => evento.destacado) || eventos[0]}
        abrirEvento={abrirEvento}
        setFiltros={setFiltros}
        filtrarCategoria={filtrarCategoria}
      >
        <BuscadorEventos
          textos={textos}
          en={en}
          eventos={eventos}
          onBuscar={buscar}
          ciudad={ciudadSeleccionada}
          onCambiarCiudad={setCiudadSeleccionada}
          filtrosAplicados={filtros}
        />
      </HeroTaquilla>

      <div className="ancho-home">
        {cargando && <p role="status">{textos?.estados?.cargando?.titulo}</p>}
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
              textos={textos}
              categorias={categorias}
              filtros={filtros}
              en={en}
              filtrarCategoria={filtrarCategoria}
            />
            <SeccionEventos
              textos={textos}
              id="eventos"
              presentacion="carrusel"
              titulo={tituloEventos}
              descripcion={descripcionEventos}
              eventos={eventosPrincipales}
              en={en}
              onAbrir={abrirEvento}
              onVerTodos={() => buscar(filtros || { destacado: true })}
            />
            {!filtros && (
              <SeccionEventos
                textos={textos}
                id="eventos-proximamente"
                className="seccion-eventos--escritorio"
                presentacion="lista"
                titulo={tituloProximamente}
                descripcion={descripcionProximamente}
                eventos={eventosProximamente}
                en={en}
                onAbrir={abrirEvento}
                onVerTodos={() =>
                  buscar(
                    ciudadSeleccionada ? { ciudad: ciudadSeleccionada } : {},
                  )
                }
              />
            )}
            {!filtros && (
              <SeccionEventos
                textos={textos}
                id="eventos-fin-de-semana"
                className="seccion-eventos--movil"
                presentacion="lista"
                tarjetasClicables
                titulo={textosInicio?.filtrosMovil?.finDeSemana}
                eventos={eventosFinDeSemana}
                onAbrir={abrirEvento}
                onVerTodos={() => buscar({ finDeSemana: true })}
              />
            )}
          </>
        )}
      </div>

      <DialogoDetalle detalle={detalle} onCerrar={() => setDetalle(null)} />
    </LayoutPublico>
  );
}
