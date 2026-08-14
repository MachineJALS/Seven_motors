export type Combustible = "Gasolina" | "Diésel" | "Híbrido" | "Eléctrico";
export type Transmision = "Automática" | "Manual";

export interface Vehiculo {
  id: string;
  marca: string;
  modelo: string;
  anio: number;
  precio: number; // en USD
  kilometraje: number; // en km
  combustible: Combustible;
  transmision: Transmision;
  color: string;
  descripcion: string;
  fotos: string[];
  vendido?: boolean;
}
