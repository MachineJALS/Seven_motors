import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { vehiculos } from "../data/vehiculos";
import PriceTag from "../components/PriceTag";
import WhatsAppButton from "../components/WhatsAppButton";
import { AGENCIA } from "../config";

const km = new Intl.NumberFormat("es-CR");

export default function VehiculoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const vehiculo = vehiculos.find((v) => v.id === id);
  const [fotoActiva, setFotoActiva] = useState(0);

  if (!vehiculo) {
    return (
      <div className="wrap pagina-404">
        <h1>Vehículo no encontrado</h1>
        <p>Puede que ya se haya vendido o que el link esté mal escrito.</p>
        <Link to="/">← Volver al catálogo</Link>
      </div>
    );
  }

  const mensajeWhatsApp = `Hola, me interesa el ${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.anio} (precio $${vehiculo.precio}) que vi en el sitio web.`;

  return (
    <div className="wrap">
      <Link to="/" className="ficha-volver">
        ← Volver al catálogo
      </Link>

      <div className="ficha">
        <div>
          <div className="ficha__foto-principal">
            <img src={vehiculo.fotos[fotoActiva]} alt={`${vehiculo.marca} ${vehiculo.modelo}`} />
          </div>
          {vehiculo.fotos.length > 1 && (
            <div className="ficha__miniaturas">
              {vehiculo.fotos.map((foto, i) => (
                <button
                  key={foto}
                  className={i === fotoActiva ? "activa" : ""}
                  onClick={() => setFotoActiva(i)}
                  aria-label={`Ver foto ${i + 1}`}
                >
                  <img src={foto} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="ficha__titulo">
            {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio}
          </h1>
          <p className="ficha__ubicacion">{AGENCIA.ciudad}</p>

          <PriceTag precio={vehiculo.precio} size="lg" />

          <table className="ficha__tabla">
            <tbody>
              <tr>
                <td>Año</td>
                <td>{vehiculo.anio}</td>
              </tr>
              <tr>
                <td>Kilometraje</td>
                <td>{km.format(vehiculo.kilometraje)} km</td>
              </tr>
              <tr>
                <td>Transmisión</td>
                <td>{vehiculo.transmision}</td>
              </tr>
              <tr>
                <td>Combustible</td>
                <td>{vehiculo.combustible}</td>
              </tr>
              <tr>
                <td>Color</td>
                <td>{vehiculo.color}</td>
              </tr>
            </tbody>
          </table>

          <p className="ficha__descripcion">{vehiculo.descripcion}</p>

          <WhatsAppButton mensaje={mensajeWhatsApp} vendido={vehiculo.vendido} />
        </div>
      </div>
    </div>
  );
}
