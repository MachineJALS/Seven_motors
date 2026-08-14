import type { Vehiculo } from "../types";

// ─────────────────────────────────────────────────────────────
// Fase 1 del plan: el catálogo vive acá, en código.
// Para agregar/editar un auto, agregás o modificás un objeto
// de este arreglo y hacés "git push" — Cloudflare Pages
// vuelve a construir el sitio automáticamente.
//
// En la Fase 2 esta lista se reemplaza por datos que vienen
// de Supabase, gestionados desde el panel /admin.
// ─────────────────────────────────────────────────────────────

export const vehiculos: Vehiculo[] = [
  {
    id: "hyundai-elantra-2017",
    marca: "Hyundai",
    modelo: "Elantra",
    anio: 2017,
    precio: 12500,
    kilometraje: 75000,
    combustible: "Gasolina",
    transmision: "Automática",
    color: "Gris",
    descripcion:
      "Hyundai Elantra 2017, cómodo y eficiente, ideal para ciudad y carretera. Mantenimientos al día.",
    fotos: ["https://placehold.co/800x600/1F4D3D/F5F6F3?text=Hyundai+Elantra+2017"],
  },
  {
    id: "toyota-yaris-2008",
    marca: "Toyota",
    modelo: "Yaris",
    anio: 2008,
    precio: 3300000,
    kilometraje: 150000,
    combustible: "Gasolina",
    transmision: "Automática",
    color: "Negro",
    descripcion:
      "Toyota Yaris 2008, vehículo económico y confiable, ideal para uso urbano. Mantenimiento regular. A/C Full. Garantia por escrito en caja y motor.",
    fotos: ["https://placehold.co/800x600/1F4D3D/F5F6F3?text=Toyota+Yaris+2008"],
  },
  {
    id: "Kia-Rio-Hatchback-2008",
    marca: "Kia",
    modelo: "Rio Hatchback",
    anio: 2008,
    precio: 2750000,
    kilometraje: 150000,
    combustible: "Gasolina",
    transmision: "Automática",
    color: "Celeste",
    descripcion:
      "Kia Rio Hatchback 2008, vehículo económico y confiable, ideal para uso urbano. Mantenimiento regular. A/C Full. Garantia por escrito en caja y motor.",
    fotos: ["https://placehold.co/800x600/1F4D3D/F5F6F3?text=Kia+Rio+Hatchback+2008"],
  },
  {
    id: "Hyundai-Accent-Hatchback-2012",
    marca: "Hyundai",
    modelo: "Accent Hatchback",
    anio: 2012,
    precio: 3750000,
    kilometraje: 120000,
    combustible: "Gasolina",
    transmision: "Automática",
    color: "Blanco",
    descripcion:
      "Hyundai Accent Hatchback 2012, vehículo económico y confiable, ideal para uso urbano. Mantenimiento regular. A/C Full. Garantia por escrito en caja y motor.",
    fotos: ["https://placehold.co/800x600/1F4D3D/F5F6F3?text=Hyundai+Accent+Hatchback+2012"],
  },

  // Vehículos con fotos
  {
    
  }
  
];
