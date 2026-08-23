import { useState, type DragEvent } from "react";
import { useTranslation } from "react-i18next";
import type { VehicleImage } from "@/modules/inventory/domain/vehicle";
import {
  uploadVehicleImage,
  deleteVehicleImage,
  updateVehicleImageAltText,
  reorderVehicleImages,
} from "@/modules/admin/application/vehicle-images-admin";

const MAX_FILES = 12;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface Props {
  vehicleId: string;
  brand: string;
  model: string;
  year: string;
  color: string;
  initialImages: VehicleImage[];
}

export default function VehicleImageManager({ vehicleId, brand, model, year, color, initialImages }: Props) {
  const { t } = useTranslation();
  const [images, setImages] = useState<VehicleImage[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const suggestedAlt = () => `${brand} ${model} ${year} ${color}`.trim().replace(/\s+/g, " ");

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const capacity = Math.max(0, MAX_FILES - images.length);
    const candidates = Array.from(fileList).slice(0, capacity);

    const validFiles = candidates.filter((file) => file.type.startsWith("image/") && file.size <= MAX_FILE_SIZE);
    if (validFiles.length < candidates.length || candidates.length < fileList.length) setError(true);
    if (validFiles.length === 0) return;

    setUploading(true);
    const startIndex = images.length;
    const results = await Promise.allSettled(
      validFiles.map((file, i) =>
        uploadVehicleImage({ vehicleId, file, sequenceNumber: startIndex + i + 1, altText: suggestedAlt() })
      )
    );
    const uploaded = results
      .filter((r): r is PromiseFulfilledResult<VehicleImage> => r.status === "fulfilled")
      .map((r) => r.value);
    if (uploaded.length < validFiles.length) setError(true);
    setImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    void handleFiles(e.dataTransfer.files);
  };

  const handleDelete = async (image: VehicleImage) => {
    setBusyId(image.id);
    try {
      await deleteVehicleImage(image);
      setImages((prev) => prev.filter((i) => i.id !== image.id));
    } catch {
      setError(true);
    } finally {
      setBusyId(null);
    }
  };

  const persistOrder = async (reordered: VehicleImage[]) => {
    setImages(reordered);
    try {
      await reorderVehicleImages(reordered);
    } catch {
      setError(true);
    }
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const reordered = [...images];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    void persistOrder(reordered);
  };

  const handleMakePrimary = (index: number) => {
    if (index === 0) return;
    const image = images[index];
    const reordered = [image, ...images.slice(0, index), ...images.slice(index + 1)];
    void persistOrder(reordered);
  };

  const handleAltTextBlur = async (image: VehicleImage, value: string) => {
    if (value === image.altText) return;
    setImages((prev) => prev.map((i) => (i.id === image.id ? { ...i, altText: value } : i)));
    try {
      await updateVehicleImageAltText(image.id, value);
    } catch {
      setError(true);
    }
  };

  return (
    <div className="filtro-campo">
      <label>{t("admin.images.title")}</label>

      <div
        className={dragOver ? "image-dropzone image-dropzone--active" : "image-dropzone"}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <p>{t("admin.images.dropHint")}</p>
        <label className="filtro-limpiar image-dropzone__button">
          {t("admin.images.selectFiles")}
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            disabled={uploading || images.length >= MAX_FILES}
            onChange={(e) => {
              void handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {uploading && <span className="admin-form__hint">{t("admin.images.uploading")}</span>}
      {error && <span className="admin-form__error">{t("admin.images.error")}</span>}

      {images.length > 0 && (
        <div className="image-manager-grid">
          {images.map((image, index) => (
            <div className="image-manager-item" key={image.id}>
              <div className="image-manager-item__media">
                <img src={image.url} alt={image.altText} loading="lazy" />
                {index === 0 && <span className="image-manager-item__primary">{t("admin.images.primary")}</span>}
              </div>
              <input
                className="image-manager-item__alt"
                defaultValue={image.altText}
                placeholder={t("admin.images.altPlaceholder")}
                aria-label={t("admin.images.altLabel")}
                onBlur={(e) => void handleAltTextBlur(image, e.target.value)}
              />
              <div className="image-manager-item__actions">
                <button
                  type="button"
                  className="filtro-limpiar"
                  disabled={index === 0}
                  aria-label={t("admin.images.moveUp")}
                  onClick={() => handleMove(index, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="filtro-limpiar"
                  disabled={index === images.length - 1}
                  aria-label={t("admin.images.moveDown")}
                  onClick={() => handleMove(index, 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="filtro-limpiar"
                  disabled={index === 0}
                  onClick={() => handleMakePrimary(index)}
                >
                  {t("admin.images.makePrimary")}
                </button>
                <button
                  type="button"
                  className="filtro-limpiar"
                  disabled={busyId === image.id}
                  onClick={() => void handleDelete(image)}
                >
                  {t("admin.images.delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
