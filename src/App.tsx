import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CatalogoPage from "./pages/CatalogoPage";
import VehiculoDetallePage from "./pages/VehiculoDetallePage";
import NoEncontradaPage from "./pages/NoEncontradaPage";

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<CatalogoPage />} />
          <Route path="/vehiculo/:id" element={<VehiculoDetallePage />} />
          <Route path="*" element={<NoEncontradaPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
