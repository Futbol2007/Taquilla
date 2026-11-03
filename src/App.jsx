import { useState } from "react";
import { useTextos } from "./hooks/useTextos.js";
import "./App.css";
import Navbar from "./components/Navbar";

const App = () => {
  const [idioma, setIdioma] = useState("es");
  const { textos, cargando, error } = useTextos(idioma);
  return (
    <div className="sitio">
      <Navbar
        textos={textos}
        cargando={cargando}
        error={error}
        idioma={idioma}
        setIdioma={setIdioma}
        onBuscar={(consulta) => console.log("buscar:", consulta)}
      />
    </div>
  );
};

export default App;
