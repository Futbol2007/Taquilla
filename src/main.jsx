import "./styles/tokens.css";
import "./styles/base.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Home from "./pages/Home.jsx";
import ExplorarEventos from "./pages/ExplorarEventos.jsx";
import DetalleEvento from "./pages/DetalleEvento.jsx";
import Ingresar from "./pages/Ingresar.jsx";
import { PreferenciasProvider } from "./context/PreferenciasContext.jsx";
import { SesionProvider } from "./context/SesionContext.jsx";

const ruta = window.location.pathname.replace(/\/+$/, "") || "/";
const rutaEvento = ruta.match(/^\/eventos\/([^/]+)$/);
const pagina = rutaEvento
  ? <DetalleEvento slug={decodeURIComponent(rutaEvento[1])} />
  : ruta === "/ingresar"
    ? <Ingresar />
    : ruta === "/explorar"
    ? <ExplorarEventos />
    : <Home />;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PreferenciasProvider>
      <SesionProvider>{pagina}</SesionProvider>
    </PreferenciasProvider>
  </StrictMode>,
);
