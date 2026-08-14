import { Link } from "react-router-dom";
import { AGENCIA, armarLinkWhatsApp } from "../config";

export default function Header() {
  return (
    <header className="header">
      <div className="wrap header__inner">
        <Link to="/" className="header__brand">
          <span className="header__brand-name">{AGENCIA.nombre}</span>
          <span className="header__brand-city">{AGENCIA.ciudad}</span>
        </Link>
        <a
          className="header__cta"
          href={armarLinkWhatsApp("Hola, quisiera más información sobre sus vehículos.")}
          target="_blank"
          rel="noopener noreferrer"
        >
          Escribinos
        </a>
      </div>
    </header>
  );
}
