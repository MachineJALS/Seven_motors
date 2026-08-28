import { useState, type DragEvent } from "react";
import { useTranslation } from "react-i18next";
import type { VehicleImage } from "@/modules/inventory/domain/vehicle";
import {
  uploadVehicleImage,
  deleteVehicleImage,
  updateVehicleImageAltText,
  reorderVehicleImages,
} from "@/modules/admin/application/vehicle-images-admin";
import { getSession } from "@/modules/admin/application/auth";

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
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const suggestedAlt = () => `${brand} ${model} ${year} ${color}`.trim().replace(/\s+/g, " ");

  const reportError = (context: string, reason: unknown) => {
    console.error(`[VehicleImageManager] ${context}:`, reason);
    setError(true);
    setErrorDetail(reason instanceof Error ? reason.message : String(reason));
  };

  // Takes a plain File[], never a live FileList: FileList is tied to the
  // <input>'s current state, and this function awaits (getSession) before
  // touching it -- by the time an await resumes, the input's onChange
  // handler may already have reset `input.value`, which clears the live
  // FileList out from under us (this was a real bug: files present at
  // call time became an empty list after the first await).
  const handleFiles = async (files: File[]) => {
    console.info("[VehicleImageManager] handleFiles called", {
      fileCount: files.length,
      currentImages: images.length,
    });
    if (files.length === 0) {
      console.info("[VehicleImageManager] no files, bailing out");
      return;
    }

    try {
      const session = await getSession();
      const expiresAt = session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null;
      console.info("[VehicleImageManager] session before upload:", {
        hasSession: Boolean(session),
        role: session?.user?.role,
        expiresAt,
        expired: session?.expires_at ? session.expires_at * 1000 < Date.now() : null,
      });
      if (!session) {
        reportError("no active session — log in again", null);
        return;
      }

      const capacity = Math.max(0, MAX_FILES - images.length);
      const candidates = files.slice(0, capacity);
      const validFiles = candidates.filter((file) => file.type.startsWith("image/") && file.size <= MAX_FILE_SIZE);
      console.info("[VehicleImageManager] file validation:", {
        capacity,
        candidateCount: candidates.length,
        validCount: validFiles.length,
        fileDetails: files.map((f) => ({ name: f.name, type: f.type, size: f.size })),
      });

      if (validFiles.length < candidates.length || candidates.length < files.length) {
        reportError("some files were skipped (not an image, too large, or over the per-vehicle limit)", null);
      }
      if (validFiles.length === 0) {
        console.info("[VehicleImageManager] no valid files after filtering, bailing out");
        return;
      }

      setUploading(true);
      const startIndex = images.length;
      console.info("[VehicleImageManager] starting upload of", validFiles.length, "file(s)");
      const results = await Promise.allSettled(
        validFiles.map((file, i) =>
          uploadVehicleImage({ vehicleId, file, sequenceNumber: startIndex + i + 1, altText: suggestedAlt() })
        )
      );
      console.info("[VehicleImageManager] upload results:", results);
      const uploaded = results
        .filter((r): r is PromiseFulfilledResult<VehicleImage> => r.status === "fulfilled")
        .map((r) => r.value);
      const rejected = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
      if (rejected.length > 0) reportError("upload failed", rejected[0].reason);
      setImages((prev) => [...prev, ...uploaded]);
      setUploading(false);
    } catch (reason) {
      reportError("unexpected error in handleFiles", reason);
      setUploading(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    void handleFiles(Array.from(e.dataTransfer.files));
  };

  const handleDelete = async (image: VehicleImage) => {
    setBusyId(image.id);
    try {
      await deleteVehicleImage(image);
      setImages((prev) => prev.filter((i) => i.id !== image.id));
    } catch (reason) {
      reportError("delete failed", reason);
    } finally {
      setBusyId(null);
    }
  };

  const persistOrder = async (reordered: VehicleImage[]) => {
    setImages(reordered);
    try {
      await reorderVehicleImages(reordered);
    } catch (reason) {
      reportError("reorder failed", reason);
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
    } catch (reason) {
      reportError("alt text update failed", reason);
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
              const selected = Array.from(e.target.files ?? []);
              e.target.value = "";
              void handleFiles(selected);
            }}
          />
        </label>
      </div>

      {uploading && <span className="admin-form__hint">{t("admin.images.uploading")}</span>}
      {error && (
        <span className="admin-form__error">
          {t("admin.images.error")}
          {errorDetail ? ` (${errorDetail})` : ""}
        </span>
      )}

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
