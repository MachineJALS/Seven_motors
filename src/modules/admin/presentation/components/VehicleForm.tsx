import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { FuelType, Transmission, Vehicle } from "@/modules/inventory/domain/vehicle";

const FUEL_TYPES: FuelType[] = ["gasoline", "diesel", "hybrid", "electric"];
const TRANSMISSIONS: Transmission[] = ["automatic", "manual"];

function slugify(brand: string, model: string, year: string): string {
  return `${brand}-${model}-${year}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface Props {
  initial?: Vehicle;
  onSubmit: (vehicle: Vehicle) => Promise<unknown>;
}

export default function VehicleForm({ initial, onSubmit }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [model, setModel] = useState(initial?.model ?? "");
  const [year, setYear] = useState(initial ? String(initial.year) : "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [mileage, setMileage] = useState(initial ? String(initial.mileage) : "");
  const [fuelType, setFuelType] = useState<FuelType>(initial?.fuelType ?? "gasoline");
  const [transmission, setTransmission] = useState<Transmission>(initial?.transmission ?? "automatic");
  const [color, setColor] = useState(initial?.color ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [photos, setPhotos] = useState(initial?.photos.join("\n") ?? "");
  const [sold, setSold] = useState(initial?.sold ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(false);

    const photoList = photos
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const vehicle: Vehicle = {
      id: initial?.id ?? slugify(brand, model, year),
      brand,
      model,
      year: Number(year),
      price: Number(price),
      mileage: Number(mileage),
      fuelType,
      transmission,
      color,
      description,
      images: initial?.images ?? [], // managed via the image manager, see .claude/specs/vehicle-image-management/spec.md
      photos: photoList,
      sold,
    };

    try {
      await onSubmit(vehicle);
      navigate("/admin");
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h1>{initial ? t("admin.form.titleEdit") : t("admin.form.titleNew")}</h1>

      <div className="admin-form__grid">
        <div className="filtro-campo">
          <label htmlFor="v-brand">{t("admin.form.brand")}</label>
          <input id="v-brand" required value={brand} onChange={(e) => setBrand(e.target.value)} />
        </div>

        <div className="filtro-campo">
          <label htmlFor="v-model">{t("admin.form.model")}</label>
          <input id="v-model" required value={model} onChange={(e) => setModel(e.target.value)} />
        </div>

        <div className="filtro-campo">
          <label htmlFor="v-year">{t("admin.form.year")}</label>
          <input
            id="v-year"
            type="number"
            required
            min={1990}
            max={2100}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>

        <div className="filtro-campo">
          <label htmlFor="v-price">{t("admin.form.price")}</label>
          <input
            id="v-price"
            type="number"
            required
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div className="filtro-campo">
          <label htmlFor="v-mileage">{t("admin.form.mileage")}</label>
          <input
            id="v-mileage"
            type="number"
            required
            min={0}
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
          />
        </div>

        <div className="filtro-campo">
          <label htmlFor="v-color">{t("admin.form.color")}</label>
          <input id="v-color" required value={color} onChange={(e) => setColor(e.target.value)} />
        </div>

        <div className="filtro-campo">
          <label htmlFor="v-fuel">{t("admin.form.fuelType")}</label>
          <select
            id="v-fuel"
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value as FuelType)}
          >
            {FUEL_TYPES.map((f) => (
              <option key={f} value={f}>
                {t(`enums.fuelType.${f}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="filtro-campo">
          <label htmlFor="v-transmission">{t("admin.form.transmission")}</label>
          <select
            id="v-transmission"
            value={transmission}
            onChange={(e) => setTransmission(e.target.value as Transmission)}
          >
            {TRANSMISSIONS.map((tr) => (
              <option key={tr} value={tr}>
                {t(`enums.transmission.${tr}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="filtro-campo">
        <label htmlFor="v-description">{t("admin.form.description")}</label>
        <textarea
          id="v-description"
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="filtro-campo">
        <label htmlFor="v-photos">{t("admin.form.photos")}</label>
        <textarea
          id="v-photos"
          required
          rows={3}
          placeholder={"https://...jpg\nhttps://...jpg"}
          value={photos}
          onChange={(e) => setPhotos(e.target.value)}
        />
      </div>

      <label className="admin-form__checkbox">
        <input type="checkbox" checked={sold} onChange={(e) => setSold(e.target.checked)} />
        {t("admin.form.sold")}
      </label>

      {error && <p className="admin-form__error">{t("admin.form.error")}</p>}

      <div className="admin-form__actions">
        <button type="button" className="filtro-limpiar" onClick={() => navigate("/admin")}>
          {t("admin.form.cancel")}
        </button>
        <button type="submit" className="btn-cta" disabled={saving}>
          {saving ? t("admin.form.saving") : t("admin.form.save")}
        </button>
      </div>
    </form>
  );
}
