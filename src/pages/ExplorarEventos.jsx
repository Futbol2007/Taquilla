import { useEffect, useMemo, useState } from "react";
import LayoutPublico from "../components/LayoutPublico/LayoutPublico.jsx";
import MigasPan from "../components/MigasPan/MigasPan.jsx";
import PanelFiltrosEventos from "../components/PanelFiltrosEventos/PanelFiltrosEventos.jsx";
import FiltrosActivos from "../components/FiltrosActivos/FiltrosActivos.jsx";
import OrdenarEventos from "../components/OrdenarEventos/OrdenarEventos.jsx";
import Paginacion from "../components/Paginacion/Paginacion.jsx";
import TarjetaEvento from "../components/TarjetaEvento/TarjetaEvento.jsx";
import AficheEvento from "../components/AficheEvento/AficheEvento.jsx";
import DialogoDetalle from "../components/DialogoDetalle/DialogoDetalle.jsx";
import { usePreferencias } from "../context/PreferenciasContext.jsx";
import { useDetalle } from "../hooks/useDetalle.js";
import { useEventos } from "../hooks/useEventos.js";
import { useTextos } from "../hooks/useTextos.js";
import { dinero } from "../utils/dinero.js";
import IconoEvento from "../components/IconoEvento/IconoEvento.jsx";
import iconoFiltros from "../assets/sliders.svg";
import "./ExplorarEventos.css";

const EVENTOS_POR_PAGINA = 9;

function normalizar(valor = "") {
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
}

function fechaLocal(valor) {
  if (!valor) return null;
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(valor)
    ? new Date(`${valor}T00:00:00`)
    : new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function eventoEnFinDeSemana(evento) {
  const fecha = fechaLocal(evento.fecha);
  if (!fecha) return false;

  const hoy = new Date();
  const dia = hoy.getDay();
  const diasHastaViernes = dia === 0 ? 5 : dia === 6 ? -1 : 5 - dia;
  const viernes = new Date(hoy);
  viernes.setDate(hoy.getDate() + diasHastaViernes);
  viernes.setHours(0, 0, 0, 0);
  const lunes = new Date(viernes);
  lunes.setDate(viernes.getDate() + 3);
  const desde = hoy > viernes ? hoy : viernes;

  return fecha >= desde && fecha < lunes;
}

function coincideCategoria(evento, seleccionadas, categorias) {
  if (!seleccionadas.length) return true;
  const categoriaEvento = normalizar(
    typeof evento.categoria === "object"
      ? (evento.categoria.nombre ?? evento.categoria.id)
      : (evento.categoria ?? evento.etiqueta),
  );

  return seleccionadas.some((id) => {
    const opcion = categorias.find(
      (categoria) => String(categoria.id) === String(id),
    );
    return (
      categoriaEvento === normalizar(id) ||
      categoriaEvento === normalizar(opcion?.nombre)
    );
  });
}

export default function ExplorarEventos() {
  const { idioma } = usePreferencias();
  const { textos } = useTextos(idioma);
  const { detalle, setDetalle, abrirCuenta } = useDetalle(textos, idioma);
  const { eventos, categorias, cargando, error } = useEventos(idioma, 0);
  const [filtros, setFiltros] = useState({});
  const [orden, setOrden] = useState("fecha");
  const [paginaActual, setPaginaActual] = useState(1);
  const [panelFiltrosMovilAbierto, setPanelFiltrosMovilAbierto] =
    useState(false);
  const explorar = textos?.paginas?.explorar;
  const migas = textos?.componentes?.migas;
  const tituloPagina = explorar?.seo?.titulo?.split(" · ")[0];

  useEffect(() => {
    if (explorar?.seo?.titulo) document.title = explorar.seo.titulo;
  }, [explorar?.seo?.titulo]);

  useEffect(() => {
    if (!panelFiltrosMovilAbierto) return undefined;

    const overflowAnterior = document.body.style.overflow;
    const cerrarConEscape = (evento) => {
      if (evento.key === "Escape") setPanelFiltrosMovilAbierto(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", cerrarConEscape);
    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener("keydown", cerrarConEscape);
    };
  }, [panelFiltrosMovilAbierto]);

  const resultados = useMemo(() => {
    const categoriasElegidas = Array.isArray(filtros.categorias)
      ? filtros.categorias
      : filtros.categoria
        ? [filtros.categoria]
        : [];
    const hoy = new Date();
    const hoyISO = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

    return eventos
      .filter((evento) => {
        const fecha = String(evento.fecha ?? "").slice(0, 10);
        const precio = Number(evento.precio) || 0;
        const coincideConsulta =
          !filtros.consulta ||
          normalizar(
            `${evento.nombre} ${evento.categoria} ${evento.lugar}`,
          ).includes(normalizar(filtros.consulta));
        const coincideCiudad =
          !filtros.ciudad ||
          normalizar(evento.ciudad) === normalizar(filtros.ciudad);
        const coincideCategoriaSeleccionada = coincideCategoria(
          evento,
          categoriasElegidas,
          categorias,
        );
        const coincideFecha = !filtros.fecha || fecha === filtros.fecha;
        const coincideFinDeSemana =
          !filtros.finDeSemana || eventoEnFinDeSemana(evento);
        const coincideMes = !filtros.mes || fecha.startsWith(filtros.mes);
        const coincideRangoFecha =
          (!filtros.fechaDesde || fecha >= filtros.fechaDesde) &&
          (!filtros.fechaHasta || fecha <= filtros.fechaHasta);
        const coincidePrecio =
          (filtros.precioDesde === undefined ||
            precio >= Number(filtros.precioDesde)) &&
          (filtros.precioHasta === undefined ||
            precio <= Number(filtros.precioHasta));

        return (
          coincideConsulta &&
          coincideCiudad &&
          coincideCategoriaSeleccionada &&
          coincideFecha &&
          coincideFinDeSemana &&
          coincideMes &&
          coincideRangoFecha &&
          coincidePrecio &&
          (!filtros.soloHoy || fecha === hoyISO)
        );
      })
      .sort((a, b) => {
        if (orden === "precio") return Number(a.precio) - Number(b.precio);
        if (orden === "popularidad") {
          const popularidad = (evento) =>
            Number(
              evento.ventasUltimos7Dias ??
                evento.entradasVendidas7Dias ??
                evento.popularidad ??
                evento.ventas ??
                0,
            );
          return popularidad(b) - popularidad(a);
        }
        return (
          (fechaLocal(a.fecha)?.getTime() ?? 0) -
          (fechaLocal(b.fecha)?.getTime() ?? 0)
        );
      });
  }, [eventos, filtros, categorias, orden]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(resultados.length / EVENTOS_POR_PAGINA),
  );
  const paginaSegura = Math.min(paginaActual, totalPaginas);
  const eventosVisibles = resultados.slice(
    (paginaSegura - 1) * EVENTOS_POR_PAGINA,
    paginaSegura * EVENTOS_POR_PAGINA,
  );
  const plantillasResultados = explorar?.resultados;
  const textoResultados =
    resultados.length === 1
      ? plantillasResultados?.uno
      : plantillasResultados?.otro;
  const plantillasResultadosCortos = explorar?.resultadosCorto;
  const textoResultadosCorto =
    resultados.length === 1
      ? plantillasResultadosCortos?.uno
      : plantillasResultadosCortos?.otro;

  function actualizarFiltros(nuevosFiltros) {
    setFiltros(nuevosFiltros);
    setPaginaActual(1);
  }

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
      cerrar: textos?.general?.acciones?.cerrar,
    });
  }

  function limpiarFiltros() {
    actualizarFiltros({});
  }

  function cambiarPagina(pagina) {
    setPaginaActual(pagina);
    document
      .querySelector(".pagina-explorar-cabecera")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <LayoutPublico
      textos={textos}
      onCuenta={abrirCuenta}
      onBuscarEventos={(busqueda) =>
        actualizarFiltros({ ...filtros, ...busqueda })
      }
      className="landing-explorar"
    >
      <div
        className={`pagina-explorar ancho-home${panelFiltrosMovilAbierto ? " filtros-movil-abiertos" : ""}`}
      >
        <header className="pagina-explorar-cabecera">
          <MigasPan
            textos={migas}
            actual="explorar"
            etiqueta={explorar?.seo?.titulo}
          />
          <h1>{tituloPagina}</h1>
          <form
            className="pagina-explorar-buscador-movil"
            role="search"
            onSubmit={(evento) => evento.preventDefault()}
          >
            <label htmlFor="buscar-en-explorar">
              <IconoEvento tipo="buscar" />
              <input
                id="buscar-en-explorar"
                type="search"
                value={filtros.consulta ?? ""}
                placeholder={
                  textos?.paginas?.inicio?.hero?.buscador?.placeholders?.movil
                }
                onChange={(evento) =>
                  actualizarFiltros({
                    ...filtros,
                    consulta: evento.target.value,
                  })
                }
              />
            </label>
            <button
              type="button"
              aria-label={explorar?.filtros?.titulo}
              aria-expanded={panelFiltrosMovilAbierto}
              onClick={() => setPanelFiltrosMovilAbierto((abierto) => !abierto)}
            >
              <img src={iconoFiltros} alt="" aria-hidden="true" />
            </button>
          </form>
          <p className="pagina-explorar-resumen" role="status">
            {textoResultados?.replaceAll(
              "{cantidad}",
              String(resultados.length),
            )}
          </p>
        </header>

        {cargando && <p role="status">{textos?.estados?.cargando?.titulo}</p>}
        {error && !cargando && (
          <div className="pagina-explorar-error" role="alert">
            <h2>{textos?.estados?.error?.titulo}</h2>
            <p>{textos?.estados?.error?.texto}</p>
          </div>
        )}

        {!cargando && !error && (
          <div className="pagina-explorar-cuerpo">
            <aside className="pagina-explorar-filtros">
              <PanelFiltrosEventos
                textos={textos}
                categorias={categorias}
                eventos={eventos}
                filtros={filtros}
                cantidadResultados={resultados.length}
                onCambiarFiltros={actualizarFiltros}
                onLimpiar={limpiarFiltros}
                onCerrar={() => setPanelFiltrosMovilAbierto(false)}
                modalMovilAbierto={panelFiltrosMovilAbierto}
                onVerResultados={() => {
                  setPanelFiltrosMovilAbierto(false);
                  document
                    .querySelector("#eventos")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              />
            </aside>

            <section className="pagina-explorar-resultados" id="eventos">
              <div className="pagina-explorar-controles">
                <FiltrosActivos
                  textos={textos}
                  filtros={filtros}
                  categorias={categorias}
                  onCambiarFiltros={actualizarFiltros}
                  onLimpiar={limpiarFiltros}
                />
                <div className="pagina-explorar-barra-resultados-movil">
                  <p>
                    {textoResultadosCorto?.replaceAll(
                      "{cantidad}",
                      String(resultados.length),
                    )}
                  </p>
                  <OrdenarEventos
                    textos={textos}
                    orden={orden}
                    onCambiarOrden={(valor) => {
                      setOrden(valor);
                      setPaginaActual(1);
                    }}
                  />
                </div>
              </div>

              {eventosVisibles.length > 0 ? (
                <div className="pagina-explorar-grid">
                  {eventosVisibles.map((evento) => (
                    <TarjetaEvento
                      key={evento.id ?? evento.slug ?? evento.nombre}
                      textos={textos?.paginas}
                      evento={evento}
                      onAbrir={abrirEvento}
                    />
                  ))}
                </div>
              ) : (
                <div className="pagina-explorar-vacio">
                  <h2>{explorar?.vacio?.titulo}</h2>
                  <p>{explorar?.vacio?.texto}</p>
                  <button
                    type="button"
                    className="boton-home primario"
                    onClick={limpiarFiltros}
                  >
                    {explorar?.vacio?.botones?.limpiar}
                  </button>
                </div>
              )}

              <Paginacion
                textos={textos}
                paginaActual={paginaSegura}
                totalPaginas={totalPaginas}
                onCambiarPagina={cambiarPagina}
              />
            </section>
          </div>
        )}
      </div>
      <DialogoDetalle detalle={detalle} onCerrar={() => setDetalle(null)} />
    </LayoutPublico>
  );
}
