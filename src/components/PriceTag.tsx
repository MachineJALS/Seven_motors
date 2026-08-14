interface Props {
  precio: number;
  size?: "sm" | "lg";
}

const formateador = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export default function PriceTag({ precio, size = "sm" }: Props) {
  return (
    <span className={`price-tag ${size === "lg" ? "price-tag--lg" : ""}`}>
      <span className="price-tag__currency">$</span>
      {formateador.format(precio)}
    </span>
  );
}
