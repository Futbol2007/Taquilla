import { useEffect, useMemo, useState } from "react";
import { consultar } from "../services/api.js";

const EVENTOS_POR_PAGINA = 20;

function localizar(valor, idioma) {
  if (valor && typeof valor === "object") {
    return valor[idioma] ?? valor.es ?? valor.en ?? "";
  }
  return valor ?? "";
}

function normalizar(valor = "") {
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
}

function adaptarEvento(evento, idioma, categoriasPorId) {
  const categoria = localizar(evento.categoria, idioma).toLocaleLowerCase();
  const categoriaApi = categoriasPorId.get(categoria);
  const fecha = evento.fecha;
  const fechaLegible = fecha
    ? new Intl.DateTimeFormat(idioma === "en" ? "en-US" : "es-CO", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }).format(new Date(fecha))
    : "";

  return {
    ...evento,
    nombre:
      localizar(evento.titulo, idioma) ||
      localizar(evento.nombre, idioma) ||
      evento.slug,
    categoria,
    etiqueta: localizar(categoriaApi?.nombre, idioma) || categoria,
    fecha,
    horario: fechaLegible,
    lugar: localizar(evento.recinto?.nombre, idioma),
    ciudad: localizar(evento.recinto?.ciudad, idioma),
    precio: evento.precioDesde ?? evento.precio ?? 0,
    arte: evento.afiche ?? evento.arte ?? 0,
  };
}

async function cargarTodasLasPaginas(idioma, signal) {
  const parametros = new URLSearchParams({
    idioma,
    pagina: "1",
    porPagina: String(EVENTOS_POR_PAGINA),
  });
  const primeraPagina = await consultar(`/eventos?${parametros}`, { signal });
  const paginas = Math.max(1, Number(primeraPagina.paginacion?.paginas) || 1);

  const otrasPaginas = await Promise.all(
    Array.from({ length: paginas - 1 }, (_, indice) => {
      const pagina = indice + 2;
      const query = new URLSearchParams({
        idioma,
        pagina: String(pagina),
        porPagina: String(EVENTOS_POR_PAGINA),
      });
      return consultar(`/eventos?${query}`, { signal });
    }),
  );

  return [primeraPagina, ...otrasPaginas].flatMap((respuesta) =>
    Array.isArray(respuesta.datos) ? respuesta.datos : [],
  );
}

async function cargarCategorias(idioma, signal) {
  const parametros = new URLSearchParams({ idioma });
  const respuesta = await consultar(`/categorias?${parametros}`, { signal });
  return Array.isArray(respuesta.datos) ? respuesta.datos : [];
}

export function useEventos(idioma = "es", numeroEventos = 4) {
  const limiteEventos = Math.max(0, Math.floor(Number(numeroEventos) || 0));
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState(null);

  useEffect(() => {
    const controlador = new AbortController();
    setEventos([]);
    setCategorias([]);
    setCargando(true);
    setError(null);

    Promise.all([
      cargarTodasLasPaginas(idioma, controlador.signal),
      cargarCategorias(idioma, controlador.signal),
    ])
      .then(([datosEventos, datosCategorias]) => {
        const categoriasPorId = new Map(
          datosCategorias.map((categoria) => [categoria.id, categoria]),
        );
        setCategorias(datosCategorias);
        setEventos(
          datosEventos.map((evento) =>
            adaptarEvento(evento, idioma, categoriasPorId),
          ),
        );
      })
      .catch((fallo) => {
        if (fallo.name !== "AbortError") setError(fallo);
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCargando(false);
      });

    return () => controlador.abort();
  }, [idioma]);

  const resultados = useMemo(
    () =>
      eventos.filter((evento) => {
        const coincideConsulta =
          !filtros?.consulta ||
          normalizar(evento.nombre).includes(normalizar(filtros.consulta));
        const coincideCiudad =
          !filtros?.ciudad ||
          normalizar(evento.ciudad) === normalizar(filtros.ciudad);
        const coincideFecha =
          !filtros?.fecha || evento.fecha?.slice(0, 10) === filtros.fecha;
        const coincideCategoria =
          !filtros?.categoria ||
          normalizar(evento.categoria) === normalizar(filtros.categoria);
        return (
          coincideConsulta &&
          coincideCiudad &&
          coincideFecha &&
          coincideCategoria
        );
      }),
    [eventos, filtros],
  );

  function buscar(valores) {
    setFiltros(valores);
    document.getElementById("eventos")?.scrollIntoView({ block: "start" });
  }

  return {
    eventos,
    categorias,
    numeroEventos: limiteEventos,
    filtros,
    resultados,
    cargando,
    error,
    buscar,
    setFiltros,
    filtrarCategoria: (categoria) => buscar({ categoria }),
  };
}
