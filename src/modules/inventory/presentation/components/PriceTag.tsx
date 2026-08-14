import { useTranslation } from "react-i18next";
import { numberLocale } from "@/shared/i18n/format";

interface Props {
  price: number;
  size?: "sm" | "lg";
}

export default function PriceTag({ price, size = "sm" }: Props) {
  const { i18n } = useTranslation();
  const formatter = new Intl.NumberFormat(numberLocale(i18n.resolvedLanguage ?? "es"), {
    maximumFractionDigits: 0,
  });

  return (
    <span className={`price-tag ${size === "lg" ? "price-tag--lg" : ""}`}>
      <span className="price-tag__currency">₡</span>
      {formatter.format(price)}
    </span>
  );
}
