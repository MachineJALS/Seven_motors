import { AGENCIA } from "../config";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <span>
          © {new Date().getFullYear()} {AGENCIA.nombre} · {AGENCIA.ciudad}
        </span>
        <span>
          <a href={`mailto:${AGENCIA.correo}`}>{AGENCIA.correo}</a>
        </span>
        <span>
          {/* Pendiente: enlazar aquí la plantilla de aviso de privacidad (sección 11 del plan) */}
          Aviso de privacidad
        </span>
      </div>
    </footer>
  );
}
