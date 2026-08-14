import { Link } from "react-router-dom";

export default function NoEncontradaPage() {
  return (
    <div className="wrap pagina-404">
      <h1>Página no encontrada</h1>
      <p>
        <Link to="/">← Volver al catálogo</Link>
      </p>
    </div>
  );
}
