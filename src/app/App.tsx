import { Route, Routes } from "react-router-dom";
import Header from "@/shared/ui/Header";
import Footer from "@/shared/ui/Footer";
import NotFoundPage from "@/shared/ui/NotFoundPage";
import CatalogPage from "@/modules/inventory/presentation/pages/CatalogPage";
import VehicleDetailPage from "@/modules/inventory/presentation/pages/VehicleDetailPage";
import { AuthProvider } from "@/modules/admin/presentation/AuthContext";
import ProtectedRoute from "@/modules/admin/presentation/ProtectedRoute";
import LoginPage from "@/modules/admin/presentation/pages/LoginPage";
import AdminPage from "@/modules/admin/presentation/pages/AdminPage";
import NewVehiclePage from "@/modules/admin/presentation/pages/NewVehiclePage";
import EditVehiclePage from "@/modules/admin/presentation/pages/EditVehiclePage";

export default function App() {
  return (
    <AuthProvider>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/vehiculo/:id" element={<VehicleDetailPage />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vehicles/new"
            element={
              <ProtectedRoute>
                <NewVehiclePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vehicles/:id/edit"
            element={
              <ProtectedRoute>
                <EditVehiclePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </AuthProvider>
  );
}
