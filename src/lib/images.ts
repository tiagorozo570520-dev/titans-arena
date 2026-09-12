/**
 * Convierte un File de imagen a data URL (base64)
 * para guardarlo en el estado de la demo sin backend.
 * En producción usarías storage (S3, Supabase, Cloudinary).
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Solo se permiten imágenes (JPG, PNG, WEBP)"));
      return;
    }
    // Límite ~2.5MB para no saturar localStorage/estado
    if (file.size > 2.5 * 1024 * 1024) {
      reject(new Error("La imagen debe pesar menos de 2.5 MB"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
    reader.readAsDataURL(file);
  });
}
