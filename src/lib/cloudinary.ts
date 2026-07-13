// src/lib/cloudinary.ts
/**
 * Módulo de integração com Cloudinary.
 * Usa as variáveis VITE_ definidas no .env (expostas ao bundle Vite).
 * IMPORTANTE: a chave secreta (API_SECRET) será incluída no bundle cliente.
 * Para ambientes de produção recomenda‑se usar upload unsigned (preset) ou
 * gerar assinaturas no backend.
 */

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  // outros campos não são usados aqui
}

/**
 * Faz upload de um arquivo para o Cloudinary.
 * @param file - objeto File selecionado no input.
 * @returns URL segura da imagem hospedada.
 */
export async function uploadImage(file: File): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';
  // apiSecret is also available, but we use unsigned preset for safety.

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  if (uploadPreset) {
    formData.append('upload_preset', uploadPreset);
  } else {
    // fallback signed upload – exige timestamp e signature – não implementado aqui.
    console.warn('Upload preset não definido; carregamento pode falhar.');
  }

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`Cloudinary upload falhou: ${txt}`);
  }

  const data: CloudinaryUploadResponse = await response.json();
  return data.secure_url;
}
