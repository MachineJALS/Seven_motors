import type { Combustible } from "../types";

export interface Filtros {
  marca: string;
  precioMax: string;
  anioMin: string;
  combustible: string;
}

export const filtrosVacios: Filtros = {
  marca: "",
  precioMax: "",
  anioMin: "",
  combustible: "",
};

interface Props {
  filtros: Filtros;
  marcas: string[];
  combustibles: Combustible[];
  onChange: (filtros: Filtros) => void;
}

export default function FiltroBar({ filtros, marcas, combustibles, onChange }: Props) {
  const actualizar = (campo: keyof Filtros, valor: string) => {
    onChange({ ...filtros, [campo]: valor });
  };

  const hayFiltrosActivos = Object.values(filtros).some((v) => v !== "");

  return (
    <div className="filtros">
      <div className="filtro-campo">
        <label htmlFor="f-marca">Marca</label>
        <select id="f-marca" value={filtros.marca} onChange={(e) => actualizar("marca", e.target.value)}>
          <option value="">Todas</option>
          {marcas.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="filtro-campo">
        <label htmlFor="f-precio">Precio máximo (USD)</label>
        <input
          id="f-precio"
          type="number"
          min={0}
          placeholder="Sin límite"
          value={filtros.precioMax}
          onChange={(e) => actualizar("precioMax", e.target.value)}
        />
      </div>

      <div className="filtro-campo">
        <label htmlFor="f-anio">Año desde</label>
        <input
          id="f-anio"
          type="number"
          min={1990}
          max={2030}
          placeholder="Cualquiera"
          value={filtros.anioMin}
          onChange={(e) => actualizar("anioMin", e.target.value)}
        />
      </div>

      <div className="filtro-campo">
        <label htmlFor="f-combustible">Combustible</label>
        <select
          id="f-combustible"
          value={filtros.combustible}
          onChange={(e) => actualizar("combustible", e.target.value)}
        >
          <option value="">Todos</option>
          {combustibles.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {hayFiltrosActivos && (
        <button type="button" className="filtro-limpiar" onClick={() => onChange(filtrosVacios)}>
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
