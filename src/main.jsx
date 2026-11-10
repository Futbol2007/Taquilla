import "./styles/tokens.css";
import "./styles/base.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Home from "./pages/Home.jsx";
import ExplorarEventos from "./pages/ExplorarEventos.jsx";
import { PreferenciasProvider } from "./context/PreferenciasContext.jsx";

const ruta = window.location.pathname.replace(/\/+$/, "") || "/";
const pagina = ruta === "/explorar" ? <ExplorarEventos /> : <Home />;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PreferenciasProvider>
      {pagina}
    </PreferenciasProvider>
  </StrictMode>,
);
