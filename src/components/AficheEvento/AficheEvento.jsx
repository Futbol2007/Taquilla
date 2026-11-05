import "./AficheEvento.css";
export default function AficheEvento({ variante = 0, className = "" }) {
  const afiche = typeof variante === "object" ? variante : null;
  const estilo = afiche?.color1 && afiche?.color2
    ? {
        backgroundImage: `linear-gradient(135deg, ${afiche.color1}, ${afiche.color2})`,
      }
    : undefined;

  return (
    <div
      className={`arte-evento ${afiche ? "arte-evento-api" : `arte-evento-${variante}`} ${className}`}
      style={estilo}
      data-patron={afiche?.patron}
      aria-hidden="true"
    />
  );
}
