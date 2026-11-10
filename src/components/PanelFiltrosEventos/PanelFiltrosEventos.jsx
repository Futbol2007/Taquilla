import { useId, useState } from "react";
import { dinero } from "../../utils/dinero.js";
import "./PanelFiltrosEventos.css";

export default function PanelFiltrosEventos({
  textos,
  categorias = [],
  eventos = [],
  filtros = {},
  cantidadResultados = 0,
  onCambiarFiltros,
  onLimpiar,
  onVerResultados,
}) {
  const id = useId();
  const [fechasAbiertas, setFechasAbiertas] = useState(false);
  const explorar = textos?.paginas?.explorar;
  const textosFiltros = explorar?.filtros;
  const textosFecha = textosFiltros?.fecha;
  const filtroCategorias = Array.isArray(filtros.categorias)
    ? filtros.categorias
    : filtros.categoria
      ? [filtros.categoria]
      : [];
  const ciudades = [...new Set(eventos.map((evento) => evento.ciudad).filter(Boolean))];
  const precios = eventos
    .map((evento) => Number(evento.precio))
    .filter((precio) => Number.isFinite(precio));
  const precioMinimo = precios.length ? Math.min(...precios) : 0;
  const precioMaximo = precios.length ? Math.max(...precios) : 100000;
  const limitePrecioMaximo = Math.max(
    100000,
    Math.ceil(precioMaximo / 100000) * 100000,
  );
  const precioDesde = Number(filtros.precioDesde ?? precioMinimo);
  const precioHasta = Number(filtros.precioHasta ?? precioMaximo);
  const rangoPrecio = limitePrecioMaximo || 1;
  const porcentajeDesde = Math.max(
    0,
    Math.min(100, (precioDesde / rangoPrecio) * 100),
  );
  const porcentajeHasta = Math.max(
    porcentajeDesde,
    Math.min(100, (precioHasta / rangoPrecio) * 100),
  );
  const hoy = new Date();
  const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
  const mesActual = fechaHoy.slice(0, 7);
  const placeholderCiudad = textosFiltros?.ciudad;

  function cambiarFiltros(cambios) {
    onCambiarFiltros?.({ ...filtros, ...cambios });
  }

  function cambiarCategoria(categoriaId, activa) {
    const categoriasActualizadas = activa
      ? [...new Set([...filtroCategorias, categoriaId])]
      : filtroCategorias.filter((valor) => valor !== categoriaId);

    cambiarFiltros({ categorias: categoriasActualizadas, categoria: undefined });
  }

  function seleccionarFecha(cambios) {
    cambiarFiltros({
      fecha: undefined,
      fechaDesde: undefined,
      fechaHasta: undefined,
      mes: undefined,
      finDeSemana: false,
      ...cambios,
    });
  }

  function limpiarFiltros() {
    setFechasAbiertas(false);
    if (onLimpiar) onLimpiar();
    else onCambiarFiltros?.({});
  }

  return (
    <section className="panel-filtros-eventos" aria-labelledby={`${id}-titulo`}>
      <div className="panel-filtros-eventos-cabecera">
        <h2 id={`${id}-titulo`}>{textosFiltros?.titulo}</h2>
        <button type="button" className="panel-filtros-limpiar" onClick={limpiarFiltros}>
          {textosFiltros?.botones?.limpiar}
        </button>
      </div>

      <fieldset className="panel-filtros-grupo">
        <legend>{textosFiltros?.categoria}</legend>
        {categorias.map((categoria) => {
          const inputId = `${id}-categoria-${categoria.id}`;
          return (
            <label className="panel-filtros-categoria" htmlFor={inputId} key={categoria.id}>
              <input
                id={inputId}
                type="checkbox"
                checked={filtroCategorias.includes(categoria.id)}
                onChange={(evento) =>
                  cambiarCategoria(categoria.id, evento.target.checked)
                }
              />
              <span>{categoria.nombre}</span>
              <small>{categoria.eventos ?? 0}</small>
            </label>
          );
        })}
      </fieldset>

      <fieldset className="panel-filtros-grupo">
        <legend>{textosFecha?.titulo}</legend>
        <div className="panel-filtros-fechas-rapidas">
          <button
            type="button"
            aria-pressed={filtros.fecha === fechaHoy}
            onClick={() => seleccionarFecha({ fecha: fechaHoy })}
          >
            {textosFecha?.hoy}
          </button>
          <button
            type="button"
            aria-pressed={Boolean(filtros.finDeSemana)}
            onClick={() => seleccionarFecha({ finDeSemana: true })}
          >
            {textosFecha?.finDeSemana}
          </button>
          <button
            type="button"
            aria-pressed={filtros.mes === mesActual}
            onClick={() => seleccionarFecha({ mes: mesActual })}
          >
            {textosFecha?.mes}
          </button>
          <button
            type="button"
            className="panel-filtros-elegir-fechas"
            aria-expanded={fechasAbiertas}
            onClick={() => setFechasAbiertas((abiertas) => !abiertas)}
          >
            {textosFecha?.elegir}
          </button>
        </div>
        {fechasAbiertas && (
          <div className="panel-filtros-rango-fechas">
            <input
              type="date"
              aria-label={`${textosFecha?.titulo} ${textosFecha?.elegir}`}
              value={filtros.fechaDesde || ""}
              onChange={(evento) =>
                seleccionarFecha({ fechaDesde: evento.target.value || undefined })
              }
            />
            <input
              type="date"
              aria-label={`${textosFecha?.titulo} ${textosFecha?.elegir}`}
              value={filtros.fechaHasta || ""}
              onChange={(evento) =>
                seleccionarFecha({ fechaHasta: evento.target.value || undefined })
              }
            />
          </div>
        )}
      </fieldset>

      <div className="panel-filtros-grupo">
        <label htmlFor={`${id}-ciudad`}>{textosFiltros?.ciudad}</label>
        <select
          id={`${id}-ciudad`}
          value={filtros.ciudad || ""}
          onChange={(evento) => cambiarFiltros({ ciudad: evento.target.value || undefined })}
        >
          <option value="">{placeholderCiudad}</option>
          {ciudades.map((ciudad) => (
            <option value={ciudad} key={ciudad}>
              {ciudad}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="panel-filtros-grupo panel-filtros-precio">
        <legend>{textosFiltros?.precio}</legend>
        <div
          className="panel-filtros-precio-rangos"
          style={{
            "--precio-desde": `${porcentajeDesde}%`,
            "--precio-hasta": `${porcentajeHasta}%`,
          }}
        >
          <label>
            <span>{dinero(precioDesde)}</span>
            <input
              type="range"
              min="0"
              max={limitePrecioMaximo}
              step="1000"
              value={precioDesde}
              aria-label={textosFiltros?.precio}
              onChange={(evento) =>
                cambiarFiltros({
                  precioDesde: Math.min(Number(evento.target.value), precioHasta),
                })
              }
            />
          </label>
          <label>
            <span>{dinero(precioHasta)}</span>
            <input
              type="range"
              min="0"
              max={limitePrecioMaximo}
              step="1000"
              value={precioHasta}
              aria-label={textosFiltros?.precio}
              onChange={(evento) =>
                cambiarFiltros({
                  precioHasta: Math.max(Number(evento.target.value), precioDesde),
                })
              }
            />
          </label>
        </div>
      </fieldset>

      {onVerResultados && (
        <button
          type="button"
          className="boton-home primario panel-filtros-ver-resultados"
          onClick={onVerResultados}
        >
          {textosFiltros?.botones?.verResultados?.replaceAll(
            "{cantidad}",
            String(cantidadResultados),
          )}
        </button>
      )}
    </section>
  );
}
