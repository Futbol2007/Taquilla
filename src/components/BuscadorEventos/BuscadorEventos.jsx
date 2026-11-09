import { useEffect, useState } from "react";
import IconoEvento from "../IconoEvento/IconoEvento.jsx";
import iconoFiltros from "../../assets/sliders.svg";
import "./BuscadorEventos.css";
export default function BuscadorEventos({
  textos,
  en,
  eventos,
  onBuscar,
  filtrosAplicados = null,
}) {
  const [consulta, setConsulta] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [fecha, setFecha] = useState("");
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const ciudades = [
    ...new Set(eventos.map((evento) => evento.ciudad).filter(Boolean)),
  ];
  const fechas = [
    ...new Set(
      eventos.map((evento) => evento.fecha?.slice(0, 10)).filter(Boolean),
    ),
  ];
  useEffect(() => {
    setConsulta(filtrosAplicados?.consulta ?? "");
    setCiudad(filtrosAplicados?.ciudad ?? "");
    setFecha(filtrosAplicados?.fecha ?? "");
  }, [filtrosAplicados]);
  function buscar(evento) {
    evento.preventDefault();
    onBuscar({ consulta, ciudad, fecha });
    setFiltrosAbiertos(false);
  }
  const textosBuscador = textos?.paginas?.inicio?.hero?.buscador;
  const resumenCiudad =
    ciudad || textosBuscador?.placeholders?.donde || (en ? "All cities" : "Todas las ciudades");
  const resumenFecha = fecha
    ? new Date(`${fecha}T12:00:00`).toLocaleDateString(en ? "en" : "es-CO", {
        day: "numeric",
        month: "short",
      })
    : textosBuscador?.placeholders?.cuando || (en ? "Any date" : "Cualquier fecha");
  return (
    <form
      id="buscador-eventos"
      className={`buscador-eventos${filtrosAbiertos ? " filtros-abiertos" : ""}`}
      role="search"
      onSubmit={buscar}
      aria-label={en ? "Find events" : "Buscar eventos"}
    >
      <label>
        <IconoEvento tipo="buscar" />
        <span>
          <span>{textosBuscador?.etiquetas?.que}</span>
          <input
            type="search"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            placeholder={textosBuscador?.placeholders?.que}
          />
          <span className="resumen-filtros-movil">
            {resumenCiudad} · {resumenFecha}
          </span>
        </span>
      </label>
      <label>
        <IconoEvento tipo="lugar" />
        <span>
          <span>{textosBuscador?.etiquetas?.donde}</span>
          <select value={ciudad} onChange={(e) => setCiudad(e.target.value)}>
            <option value="">{en ? "All cities" : "Todas las ciudades"}</option>
            {ciudades.map((valor) => (
              <option key={valor}>{valor}</option>
            ))}
          </select>
        </span>
      </label>
      <label>
        <IconoEvento tipo="fecha" />
        <span>
          <span>{textosBuscador?.etiquetas?.cuando}</span>
          <select value={fecha} onChange={(e) => setFecha(e.target.value)}>
            <option value="">{textosBuscador?.placeholders?.cuando}</option>
            {fechas.map((valor) => (
              <option key={valor} value={valor}>
                {new Date(`${valor}T12:00:00`).toLocaleDateString(
                  en ? "en" : "es-CO",
                  {
                    day: "numeric",
                    month: "short",
                  },
                )}
              </option>
            ))}
          </select>
        </span>
      </label>
      <button className="boton-home primario" type="submit">
        {textosBuscador?.botones?.buscar}
      </button>
      <button
        className="boton-filtros-movil"
        type="button"
        aria-label={en ? "Show search filters" : "Mostrar filtros de búsqueda"}
        aria-expanded={filtrosAbiertos}
        onClick={() => setFiltrosAbiertos((abiertos) => !abiertos)}
      >
        <img src={iconoFiltros} alt="" />
      </button>
    </form>
  );
}
