import type { Vehicle } from "@/modules/inventory/domain/vehicle";

type Translate = (key: string, options?: Record<string, unknown>) => string;

export function buildVehicleInquiryMessage(vehicle: Vehicle, t: Translate, formattedPrice: string): string {
  return t("detail.inquiryMessage", {
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
    price: formattedPrice,
  });
}

export function buildGeneralInquiryMessage(t: Translate): string {
  return t("header.ctaMessage");
}
