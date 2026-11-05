import "./BannerCookies.css";
export default function BannerCookies({
  textos,
  onAceptar,
  onRechazar,
  onConfigurar,
}) {
  return (
    <aside className="banner-cookies" aria-label={textos?.banner?.titulo}>
      <h2>{textos?.banner?.titulo}</h2>
      <p>{textos?.banner?.texto}</p>
      <div className="grupo-botones">
        <button className="boton-home primario" onClick={onAceptar}>
          {textos?.banner?.botones?.aceptar}
        </button>
        <button className="boton-home secundario" onClick={onRechazar}>
          {textos?.banner?.botones?.rechazar}
        </button>
        <button className="enlace-home" onClick={onConfigurar}>
          {textos?.preferencias?.titulo}
        </button>
      </div>
    </aside>
  );
}
