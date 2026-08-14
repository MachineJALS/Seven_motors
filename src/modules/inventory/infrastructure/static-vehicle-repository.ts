import type { Vehicle } from "@/modules/inventory/domain/vehicle";

// MVP: the catalog lives here, in code. To add/edit a car, add or modify an
// object in this array and "git push" — Cloudflare Pages rebuilds the site
// automatically. Phase 2 replaces this with a Supabase-backed repository
// managed from the /admin panel (see docs/migration-plan.md) — everything
// above this file (domain/application/presentation) stays unchanged, only
// this infrastructure implementation gets swapped.
//
// KNOWN ISSUE (see docs/audit-report.md): prices below are inconsistent —
// some are realistic USD figures, others carry Costa Rican colones
// magnitudes under the same "price in USD" field. Left as-is pending the
// dealership confirming the correct USD price per vehicle.

export const vehicles: Vehicle[] = [
  {
    id: "hyundai-elantra-2017",
    brand: "Hyundai",
    model: "Elantra",
    year: 2017,
    price: 12500,
    mileage: 75000,
    fuelType: "gasoline",
    transmission: "automatic",
    color: "Gris",
    description:
      "Hyundai Elantra 2017, cómodo y eficiente, ideal para ciudad y carretera. Mantenimientos al día.",
    photos: ["https://placehold.co/800x600/1F4D3D/F5F6F3?text=Hyundai+Elantra+2017"],
  },
  {
    id: "toyota-yaris-2008",
    brand: "Toyota",
    model: "Yaris",
    year: 2008,
    price: 3300000,
    mileage: 150000,
    fuelType: "gasoline",
    transmission: "automatic",
    color: "Negro",
    description:
      "Toyota Yaris 2008, vehículo económico y confiable, ideal para uso urbano. Mantenimiento regular. A/C Full. Garantia por escrito en caja y motor.",
    photos: ["https://placehold.co/800x600/1F4D3D/F5F6F3?text=Toyota+Yaris+2008"],
  },
  {
    id: "Kia-Rio-Hatchback-2008",
    brand: "Kia",
    model: "Rio Hatchback",
    year: 2008,
    price: 2750000,
    mileage: 150000,
    fuelType: "gasoline",
    transmission: "automatic",
    color: "Celeste",
    description:
      "Kia Rio Hatchback 2008, vehículo económico y confiable, ideal para uso urbano. Mantenimiento regular. A/C Full. Garantia por escrito en caja y motor.",
    photos: ["https://placehold.co/800x600/1F4D3D/F5F6F3?text=Kia+Rio+Hatchback+2008"],
  },
  {
    id: "Hyundai-Accent-Hatchback-2012",
    brand: "Hyundai",
    model: "Accent Hatchback",
    year: 2012,
    price: 3750000,
    mileage: 120000,
    fuelType: "gasoline",
    transmission: "automatic",
    color: "Blanco",
    description:
      "Hyundai Accent Hatchback 2012, vehículo económico y confiable, ideal para uso urbano. Mantenimiento regular. A/C Full. Garantia por escrito en caja y motor.",
    photos: ["https://placehold.co/800x600/1F4D3D/F5F6F3?text=Hyundai+Accent+Hatchback+2012"],
  },
];
