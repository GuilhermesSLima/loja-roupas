// src/services/media/index.ts

export interface MediaUploadResult {
  url: string;
  publicId: string;
}

/**
 * Extrai o public_id do Cloudinary a partir da URL da imagem.
 * Útil para exclusão de imagens antigas onde apenas a URL foi salva.
 */
export function extractPublicIdFromUrl(url: string): string | null {
  if (!url || !url.includes('cloudinary.com')) return null;
  try {
    const parts = url.split('/image/upload/');
    if (parts.length < 2) return null;
    
    let path = parts[1];
    // Remove a versão (ex: v1783907802/) se presente
    const versionMatch = path.match(/^v\d+\//);
    if (versionMatch) {
      path = path.replace(versionMatch[0], '');
    }
    
    // Remove a extensão do arquivo
    const dotIndex = path.lastIndexOf('.');
    if (dotIndex !== -1) {
      path = path.substring(0, dotIndex);
    }
    
    return path;
  } catch (err) {
    console.error('Erro ao extrair public_id da URL do Cloudinary:', err);
    return null;
  }
}

/**
 * Função utilitária para gerar hash SHA-1 nativo usando a Web Crypto API (browser-compatible).
 */
async function generateSha1(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Faz upload de um arquivo para o Cloudinary, organizando na pasta lojas/{lojaId}.
 * 
 * @param file Arquivo File do input
 * @param lojaId ID da loja para organizar em subpasta
 */
export async function uploadImage(file: File, lojaId: string): Promise<MediaUploadResult> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

  if (!cloudName) {
    throw new Error('Variável VITE_CLOUDINARY_CLOUD_NAME não configurada.');
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  // Multi-tenant: organizar por pasta da loja
  formData.append('folder', `lojas/${lojaId}`);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload para o Cloudinary falhou: ${errorText}`);
  }

  const data = await response.json();
  return {
    url: data.secure_url,
    publicId: data.public_id,
  };
}

/**
 * Exclui uma imagem do Cloudinary de forma assinada usando o public_id.
 * 
 * @param publicId ID público da imagem no Cloudinary (ex: lojas/123/imagem_name)
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  if (!publicId) return false;

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
  const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('Configurações do Cloudinary incompletas no .env (requer Cloud Name, API Key e API Secret).');
    return false;
  }

  try {
    const timestamp = Math.round(new Date().getTime() / 1000).toString();
    
    // Concatena parâmetros em ordem alfabética e adiciona a chave secreta ao final
    const signatureStr = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = await generateSha1(signatureStr);

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;
    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp);
    formData.append('api_key', apiKey);
    formData.append('signature', signature);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro ao deletar imagem do Cloudinary: ${errorText}`);
      return false;
    }

    const data = await response.json();
    return data.result === 'ok';
  } catch (error) {
    console.error('Falha de rede ou criptografia ao deletar do Cloudinary:', error);
    return false;
  }
}

/**
 * Retorna a URL da imagem. Se necessário, pode aplicar transformações.
 * 
 * @param publicId ID público da imagem
 * @param options Opções de transformação (opcional)
 */
export function getImageUrl(publicId: string, options?: string): string {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  if (!cloudName || !publicId) return '';
  
  const transform = options ? `${options}/` : '';
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transform}${publicId}`;
}
