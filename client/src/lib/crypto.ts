import { Buffer } from 'buffer';

// Gerar um par de chaves para o usuário
export async function generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
  try {
    // Gerar par de chaves usando a API Web Crypto
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      true, // exportável
      ['sign', 'verify']
    );
    
    // Exportar a chave pública
    const publicKeyBuffer = await window.crypto.subtle.exportKey(
      'spki',
      keyPair.publicKey
    );
    
    // Exportar a chave privada
    const privateKeyBuffer = await window.crypto.subtle.exportKey(
      'pkcs8',
      keyPair.privateKey
    );
    
    // Converter para string base64
    const publicKey = arrayBufferToBase64(publicKeyBuffer);
    const privateKey = arrayBufferToBase64(privateKeyBuffer);
    
    return { publicKey, privateKey };
  } catch (error) {
    console.error('Erro ao gerar par de chaves:', error);
    throw error;
  }
}

// Criptografar a chave privada usando uma senha
export async function encryptPrivateKey(privateKey: string, password: string): Promise<string> {
  try {
    // Derivar chave a partir da senha
    const passwordKey = await deriveKeyFromPassword(password);
    
    // Converter a chave privada de base64 para ArrayBuffer
    const privateKeyBuffer = base64ToArrayBuffer(privateKey);
    
    // Gerar vetor de inicialização (IV)
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Criptografar a chave privada
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      passwordKey,
      privateKeyBuffer
    );
    
    // Combinar IV e dados criptografados
    const combinedData = new Uint8Array(iv.length + encryptedData.byteLength);
    combinedData.set(iv, 0);
    combinedData.set(new Uint8Array(encryptedData), iv.length);
    
    // Retornar como string base64
    return arrayBufferToBase64(combinedData);
  } catch (error) {
    console.error('Erro ao criptografar chave privada:', error);
    throw error;
  }
}

// Descriptografar a chave privada usando uma senha
export async function decryptPrivateKey(encryptedPrivateKey: string, password: string): Promise<string> {
  try {
    // Derivar chave a partir da senha
    const passwordKey = await deriveKeyFromPassword(password);
    
    // Converter a chave criptografada de base64 para ArrayBuffer
    const encryptedData = base64ToArrayBuffer(encryptedPrivateKey);
    
    // Extrair IV e dados criptografados
    const iv = encryptedData.slice(0, 12);
    const ciphertextBuffer = encryptedData.slice(12);
    
    // Descriptografar a chave privada
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      passwordKey,
      ciphertextBuffer
    );
    
    // Retornar como string base64
    return arrayBufferToBase64(decryptedData);
  } catch (error) {
    console.error('Erro ao descriptografar chave privada:', error);
    throw error;
  }
}

// Assinar dados usando a chave privada
export async function signData(data: string, privateKeyBase64: string): Promise<string> {
  try {
    // Converter a chave privada de base64 para objeto CryptoKey
    const privateKeyBuffer = base64ToArrayBuffer(privateKeyBase64);
    const privateKey = await window.crypto.subtle.importKey(
      'pkcs8',
      privateKeyBuffer,
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      false,
      ['sign']
    );
    
    // Converter dados para ArrayBuffer
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    // Assinar os dados
    const signature = await window.crypto.subtle.sign(
      {
        name: 'ECDSA',
        hash: { name: 'SHA-256' },
      },
      privateKey,
      dataBuffer
    );
    
    // Retornar assinatura como string base64
    return arrayBufferToBase64(signature);
  } catch (error) {
    console.error('Erro ao assinar dados:', error);
    throw error;
  }
}

// Verificar uma assinatura usando a chave pública
export async function verifySignature(
  data: string,
  signature: string,
  publicKeyBase64: string
): Promise<boolean> {
  try {
    // Converter a chave pública de base64 para objeto CryptoKey
    const publicKeyBuffer = base64ToArrayBuffer(publicKeyBase64);
    const publicKey = await window.crypto.subtle.importKey(
      'spki',
      publicKeyBuffer,
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      false,
      ['verify']
    );
    
    // Converter dados para ArrayBuffer
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    // Converter assinatura de base64 para ArrayBuffer
    const signatureBuffer = base64ToArrayBuffer(signature);
    
    // Verificar a assinatura
    return await window.crypto.subtle.verify(
      {
        name: 'ECDSA',
        hash: { name: 'SHA-256' },
      },
      publicKey,
      signatureBuffer,
      dataBuffer
    );
  } catch (error) {
    console.error('Erro ao verificar assinatura:', error);
    return false;
  }
}

// Funções auxiliares

// Derivar uma chave a partir de uma senha
async function deriveKeyFromPassword(password: string): Promise<CryptoKey> {
  // Converter senha para ArrayBuffer
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  // Importar a senha como chave
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  // Usar um salt fixo (em aplicações reais, isso deve ser único por usuário e armazenado)
  const salt = encoder.encode('Internet3.0SaltValue');
  
  // Derivar a chave
  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Converter ArrayBuffer para string Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

// Converter string Base64 para ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
