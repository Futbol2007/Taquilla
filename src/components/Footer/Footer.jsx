import Marca from "../Marca/Marca.jsx";
import "./Footer.css";
export default function Footer({
  nombre,
  tipo,
  descripcion,
  destino,
  etiqueta,
  onCuenta,
  onAbrirCookies,
  textos,
}) {
  // const t = interfaz[idioma];
  const textosFooter = textos?.footer;
  return (
    <footer className="pie-home">
      <div className="ancho-home">
        <div className="columnas-pie">
          <div>
            <Marca nombre={nombre} tipo={tipo} />
            <p>{descripcion}</p>
          </div>
          <div>
            <h3>{textosFooter?.columnas?.explora?.titulo}</h3>
            <a href="#contenido">
              {textosFooter?.columnas?.explora?.enlaces?.inicio}
            </a>
            <a href={destino}>{etiqueta}</a>
          </div>
          <div>
            <h3>{textosFooter?.columnas?.cuenta?.titulo}</h3>
            <button onClick={() => onCuenta("ingresar")}>
              {textosFooter?.columnas?.cuenta?.enlaces?.ingresar}
            </button>
            <button onClick={() => onCuenta("registro")}>
              {textosFooter?.columnas?.cuenta?.enlaces?.crearCuenta}
            </button>
          </div>
        </div>
        <div className="pie-creditos">
          <span>
            © 2026 {nombre} · {textosFooter?.legal?.derechos}
          </span>
          <button className="enlace-home" onClick={onAbrirCookies}>
            {textos?.cookies?.preferencias?.titulo}
          </button>
        </div>
      </div>
    </footer>
  );
}
