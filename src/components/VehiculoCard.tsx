import { Link } from "react-router-dom";
import type { Vehiculo } from "../types";
import PriceTag from "./PriceTag";

const km = new Intl.NumberFormat("es-CR");

export default function VehiculoCard({ vehiculo }: { vehiculo: Vehiculo }) {
  return (
    <Link className="card" to={`/vehiculo/${vehiculo.id}`}>
      <div className="card__media">
        {vehiculo.vendido && <span className="badge-vendido">Vendido</span>}
        <img src={vehiculo.fotos[0]} alt={`${vehiculo.marca} ${vehiculo.modelo}`} loading="lazy" />
      </div>
      <div className="card__body">
        <h3 className="card__title">
          {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio}
        </h3>
        <div className="card__specs">
          <span>{km.format(vehiculo.kilometraje)} km</span>
          <span>·</span>
          <span>{vehiculo.transmision}</span>
          <span>·</span>
          <span>{vehiculo.combustible}</span>
        </div>
        <div className="card__footer">
          <PriceTag precio={vehiculo.precio} />
          <span className="ver-mas">Ver ficha →</span>
        </div>
      </div>
    </Link>
  );
}
