import EventoDestacado from "../EventoDestacado/EventoDestacado.jsx";
import "./HeroTaquilla.css";
export default function HeroTaquilla({
  textos,
  en,
  children,
  destacado,
  abrirEvento,
  setFiltros,
  filtrarCategoria,
}) {
  const textosHero = textos?.paginas?.inicio?.hero;
  return (
    <section className="hero-taquilla">
      <div className="ancho-home interior-taquilla">
        <div>
          <span className="etiqueta-evento">
            {textosHero?.etiquetas?.temporada}
          </span>
          <h1>
            {textosHero?.titulo}
          </h1>
          <p>
            {textosHero?.subtitulo}
          </p>
          {children}
          <div className="populares">
            <span>{textosHero?.buscador?.populares}</span>
            {["Salsa", "Stand-up", "Fútbol", "Festivales de fin de año"].map(
              (valor, i) => (
                <button
                  key={valor}
                  onClick={() =>
                    i === 0
                      ? (setFiltros({ consulta: "Salsa" }),
                        document.getElementById("eventos").scrollIntoView())
                      : filtrarCategoria(
                          ["Conciertos", "Comedia", "Deportes", "Festivales"][
                            i
                          ],
                        )
                  }
                >
                  {valor}
                </button>
              ),
            )}
          </div>
        </div>
        <EventoDestacado textos={textosHero} evento={destacado} en={en} onAbrir={abrirEvento} />
      </div>
    </section>
  );
}
