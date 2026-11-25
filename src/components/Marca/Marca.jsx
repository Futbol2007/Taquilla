import "./Marca.css";
import logoNormal from "../../assets/logo-normal.svg";
import logoInverso from "../../assets/logo-inverso.svg";

export default function Marca({ nombre, tipo, logoNavbar = false, logoInversoMovil = false }) {
  return (
    <a
      className={`marca-home${logoNavbar ? " marca-home-logo-navbar" : ""}`}
      href="/"
      aria-label={`${nombre}, inicio`}
    >
      {logoNavbar ? (
        <picture className="marca-home-logo-imagen">
          {logoInversoMovil && <source media="(max-width: 640px)" srcSet={logoInverso} />}
          <img src={logoNormal} alt="" />
        </picture>
      ) : (
        <>
          <span className={`emblema emblema-${tipo}`} aria-hidden="true">
            {tipo === "sintonia" ? (
              <svg viewBox="0 0 32 32">
                <path
                  d="M8 13v7m5-12v17m6-14v11m5-8v5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            ) : tipo === "cromoverso" ? (
              <svg viewBox="0 0 24 24">
                <path
                  d="m12 2 3 6 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 32 32"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M6 9h20v5a2 2 0 0 0 0 4v5H6v-5a2 2 0 0 0 0-4V9Z" />
                <path d="M20 10v3m0 2v3m0 2v2" />
              </svg>
            )}
          </span>
          {nombre}
        </>
      )}
    </a>
  );
}
