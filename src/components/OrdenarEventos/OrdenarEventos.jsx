import "./OrdenarEventos.css";

export default function OrdenarEventos({
  textos,
  orden = "fecha",
  onCambiarOrden,
}) {
  const textosOrden = textos?.paginas?.explorar?.orden;
  const opciones = textosOrden?.opciones;

  if (!opciones) return null;

  return (
    <label className="ordenar-eventos">
      <span>{textosOrden.etiqueta}</span>
      <select
        value={orden}
        onChange={(evento) => onCambiarOrden?.(evento.target.value)}
        aria-label={textosOrden.etiqueta}
      >
        {Object.entries(opciones).map(([valor, texto]) => (
          <option key={valor} value={valor}>
            {texto}
          </option>
        ))}
      </select>
    </label>
  );
}
