import { dinero } from "../../utils/dinero.js";
import "./FiltrosActivos.css";

function formatearFecha(fecha) {
  if (!fecha) return "";
  const valor = new Date(`${fecha}T00:00:00`);
  return Number.isNaN(valor.getTime())
    ? fecha
    : new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(valor);
}

export default function FiltrosActivos({
  textos,
  filtros = {},
  categorias = [],
  onCambiarFiltros,
  onLimpiar,
}) {
  const textosFiltros = textos?.paginas?.explorar?.filtros;
  const textosFecha = textosFiltros?.fecha;
  const categoriasSeleccionadas = Array.isArray(filtros.categorias)
    ? filtros.categorias
    : filtros.categoria
      ? [filtros.categoria]
      : [];
  const chips = [];

  const mismoId = (a, b) => String(a) === String(b);

  chips.push(
    ...categoriasSeleccionadas.map((idCategoria) => {
      const categoria = categorias.find((opcion) =>
        mismoId(opcion.id, idCategoria),
      );

      return {
        id: `categoria-${idCategoria}`,
        texto: categoria?.nombre ?? String(idCategoria),
        quitar: () =>
          onCambiarFiltros?.({
            ...filtros,
            categorias: categoriasSeleccionadas.filter(
              (id) => !mismoId(id, idCategoria),
            ),
            categoria: undefined,
          }),
      };
    }),
  );

  if (filtros.finDeSemana) {
    chips.push({
      id: "fecha-fin-semana",
      texto: textosFecha?.finDeSemana,
      quitar: () => onCambiarFiltros?.({ ...filtros, finDeSemana: false }),
    });
  } else if (filtros.fecha) {
    const hoy = new Date();
    const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
    chips.push({
      id: "fecha",
      texto:
        filtros.fecha === fechaHoy
          ? textosFecha?.hoy
          : `${textosFecha?.titulo}: ${formatearFecha(filtros.fecha)}`,
      quitar: () => onCambiarFiltros?.({ ...filtros, fecha: undefined }),
    });
  } else if (filtros.mes) {
    const [anio, mes] = filtros.mes.split("-").map(Number);
    const textoMes = new Intl.DateTimeFormat(undefined, {
      month: "long",
      year: "numeric",
    }).format(new Date(anio, mes - 1, 1));
    chips.push({
      id: "fecha-mes",
      texto: `${textosFecha?.titulo}: ${textoMes}`,
      quitar: () => onCambiarFiltros?.({ ...filtros, mes: undefined }),
    });
  } else if (filtros.fechaDesde || filtros.fechaHasta) {
    const rango = [filtros.fechaDesde, filtros.fechaHasta]
      .filter(Boolean)
      .map(formatearFecha)
      .join(" – ");
    chips.push({
      id: "fecha-rango",
      texto: `${textosFecha?.titulo}: ${rango}`,
      quitar: () =>
        onCambiarFiltros?.({
          ...filtros,
          fechaDesde: undefined,
          fechaHasta: undefined,
        }),
    });
  }

  if (filtros.ciudad) {
    chips.push({
      id: "ciudad",
      texto: `${textosFiltros?.ciudad}: ${filtros.ciudad}`,
      quitar: () => onCambiarFiltros?.({ ...filtros, ciudad: undefined }),
    });
  }

  if (filtros.precioDesde !== undefined || filtros.precioHasta !== undefined) {
    const rango = [filtros.precioDesde, filtros.precioHasta]
      .filter((precio) => precio !== undefined)
      .map(dinero)
      .join(" – ");
    chips.push({
      id: "precio",
      texto: `${textosFiltros?.precio}: ${rango}`,
      quitar: () =>
        onCambiarFiltros?.({
          ...filtros,
          precioDesde: undefined,
          precioHasta: undefined,
        }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="filtros-activos" aria-label={textosFiltros?.titulo}>
      <div className="filtros-activos-lista" aria-live="polite">
        {chips.map((chip) => (
          <span className="filtro-activo" key={chip.id}>
            <span>{chip.texto}</span>
            <button
              type="button"
              aria-label={`${textosFiltros?.botones?.limpiar}: ${chip.texto}`}
              onClick={chip.quitar}
            >
              <span aria-hidden="true">×</span>
            </button>
          </span>
        ))}
      </div>
      <button
        type="button"
        className="filtros-activos-limpiar"
        onClick={onLimpiar ?? (() => onCambiarFiltros?.({}))}
      >
        {textosFiltros?.botones?.limpiar}
      </button>
    </div>
  );
}
