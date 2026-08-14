import { Route, Routes } from "react-router-dom";
import Header from "@/shared/ui/Header";
import Footer from "@/shared/ui/Footer";
import NotFoundPage from "@/shared/ui/NotFoundPage";
import CatalogPage from "@/modules/inventory/presentation/pages/CatalogPage";
import VehicleDetailPage from "@/modules/inventory/presentation/pages/VehicleDetailPage";

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/vehiculo/:id" element={<VehicleDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
