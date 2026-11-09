import { useEffect, useMemo, useState } from "react";
import { consultar } from "../services/api.js";

const EVENTOS_POR_PAGINA = 20;

function normalizar(valor = "") {
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
}

function adaptarEvento(evento, idioma) {
  const categoria = evento.categoria?.toLocaleLowerCase();
  const numeroId = Number(evento.id.split("_")[1]);
  const varianteCss = Number.isInteger(evento.arte)
    ? evento.arte
    : Number.isFinite(numeroId)
      ? numeroId % 8
      : 0;
  const fecha = evento.fecha;
  const fechaLegible = evento.fecha
    ? new Date(evento.fecha).toLocaleDateString(
        idioma === "en" ? "en-US" : "es-CO",
        {
          weekday: "short",
          day: "numeric",
          month: "short",
        },
      )
    : "";

  return {
    ...evento,
    nombre: evento.titulo || evento.nombre || evento.slug,
    categoria,
    etiqueta: categoria?.nombre || categoria,
    fecha,
    horario: fechaLegible,
    lugar: evento.recinto?.nombre,
    ciudad: evento.recinto?.ciudad,
    precio: evento.precioDesde ?? evento.precio ?? 0,
    arte: varianteCss,
    // arte: evento.afiche ?? evento.arte ?? 0,
  };
}

async function cargarTodasLasPaginas(idioma) {
  const primeraPagina = await consultar(
    `/eventos?idioma=${idioma}&pagina=1&porPagina=${EVENTOS_POR_PAGINA}`,
  );
  const paginas = Math.max(1, Number(primeraPagina.paginacion?.paginas) || 1);

  const otrasPaginas = await Promise.all(
    Array.from({ length: paginas - 1 }, (_, indice) => {
      const pagina = indice + 2;
      return consultar(
        `/eventos?idioma=${idioma}&pagina=${pagina}&porPagina=${EVENTOS_POR_PAGINA}`,
      );
    }),
  );

  return [primeraPagina, ...otrasPaginas].flatMap((respuesta) =>
    Array.isArray(respuesta.datos) ? respuesta.datos : [],
  );
}

async function cargarCategorias(idioma) {
  const parametros = new URLSearchParams({ idioma });
  const respuesta = await consultar(`/categorias?${parametros}`);
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

    Promise.all([cargarTodasLasPaginas(idioma), cargarCategorias(idioma)])
      .then(([datosEventos, datosCategorias]) => {
        setCategorias(datosCategorias);
        setEventos(
          datosEventos.map((evento) =>
            adaptarEvento(evento, idioma),
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
