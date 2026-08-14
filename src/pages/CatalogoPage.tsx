import { useMemo, useState } from "react";
import { vehiculos } from "../data/vehiculos";
import VehiculoCard from "../components/VehiculoCard";
import FiltroBar, { filtrosVacios, type Filtros } from "../components/FiltroBar";
import type { Combustible } from "../types";

export default function CatalogoPage() {
  const [filtros, setFiltros] = useState<Filtros>(filtrosVacios);

  const marcas = useMemo(
    () => Array.from(new Set(vehiculos.map((v) => v.marca))).sort(),
    []
  );
  const combustibles = useMemo(
    () => Array.from(new Set(vehiculos.map((v) => v.combustible))).sort() as Combustible[],
    []
  );

  const vehiculosFiltrados = useMemo(() => {
    return vehiculos.filter((v) => {
      if (filtros.marca && v.marca !== filtros.marca) return false;
      if (filtros.precioMax && v.precio > Number(filtros.precioMax)) return false;
      if (filtros.anioMin && v.anio < Number(filtros.anioMin)) return false;
      if (filtros.combustible && v.combustible !== filtros.combustible) return false;
      return true;
    });
  }, [filtros]);

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <h1 className="hero__title">Carros de confianza, listos para vos</h1>
          <p className="hero__subtitle">
            Revisá el inventario completo, filtrá por lo que buscás y escribinos directo por
            WhatsApp por el auto que te interese.
          </p>
        </div>
      </section>

      <div className="wrap">
        <FiltroBar filtros={filtros} marcas={marcas} combustibles={combustibles} onChange={setFiltros} />

        <p className="catalogo-meta">
          {vehiculosFiltrados.length} de {vehiculos.length} vehículos
        </p>

        {vehiculosFiltrados.length === 0 ? (
          <p className="vacio">No hay vehículos que coincidan con esos filtros.</p>
        ) : (
          <div className="grid">
            {vehiculosFiltrados.map((v) => (
              <VehiculoCard key={v.id} vehiculo={v} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
