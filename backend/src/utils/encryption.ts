// d:\Trae\backend\src\utils\encryption.ts

import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

// ✅ ใช้ environment variable สำหรับ encryption key
const getEncryptionKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }
  return Buffer.from(key, 'base64');
};

interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

// ✅ Enhanced encryption with authentication tag
export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(16); // ✅ สุ่ม IV ทุกครั้ง
    const key = getEncryptionKey();

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag(); // ✅ เพิ่ม authentication tag

    const result: EncryptedData = {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };

    return Buffer.from(JSON.stringify(result)).toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

// ✅ Enhanced decryption with authentication verification
export function decrypt(encryptedData: string): string {
  try {
    const key = getEncryptionKey();
    const data: EncryptedData = JSON.parse(Buffer.from(encryptedData, 'base64').toString());

    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(data.iv, 'hex'));
    decipher.setAuthTag(Buffer.from(data.authTag, 'hex')); // ✅ ตรวจสอบ authentication tag

    let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

// ✅ Utility function to generate secure encryption key
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('base64');
}

// ✅ Hash function for sensitive data
export function hashData(data: string, salt?: string): string {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(data, actualSalt, 100000, 64, 'sha512');
  return `${actualSalt}:${hash.toString('hex')}`;
}

// ✅ Verify hashed data
export function verifyHash(data: string, hashedData: string): boolean {
  try {
    const [salt, hash] = hashedData.split(':');
    const newHash = crypto.pbkdf2Sync(data, salt, 100000, 64, 'sha512');
    return hash === newHash.toString('hex');
  } catch (error) {
    return false;
  }
}

// 🛡️ Military-Grade Session Encryption
export interface SessionData {
  userId: string;
  sessionId: string;
  timestamp: number;
  permissions: string[];
  metadata?: Record<string, any>;
}

export const encryptSession = (session: SessionData): string => {
  try {
    const iv = crypto.randomBytes(16);
    const key = getEncryptionKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const sessionString = JSON.stringify(session);
    let encrypted = cipher.update(sessionString, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Format: iv:encrypted:authTag
    return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
  } catch (error) {
    console.error('Session encryption error:', error);
    throw new Error('Failed to encrypt session data');
  }
};

export const decryptSession = (encryptedSession: string): SessionData => {
  try {
    const [ivHex, encrypted, authTagHex] = encryptedSession.split(':');

    if (!ivHex || !encrypted || !authTagHex) {
      throw new Error('Invalid encrypted session format');
    }

    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted) as SessionData;
  } catch (error) {
    console.error('Session decryption error:', error);
    throw new Error('Failed to decrypt session data');
  }
};

// 💳 PCI DSS Compliant Card Encryption
export interface CreditCardData {
  id?: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface EncryptedCardData {
  id?: string;
  encryptedCardNumber: string;
  encryptedCvv: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  lastFourDigits: string;
  cardType: string;
  encryptedBillingAddress?: string;
  createdAt: number;
  fingerprint: string;
}

export const encryptCardData = (cardData: CreditCardData): EncryptedCardData => {
  try {
    // สร้าง fingerprint สำหรับ card
    const cardFingerprint = crypto
      .createHash('sha256')
      .update(cardData.cardNumber + cardData.cardholderName)
      .digest('hex');

    // เข้ารหัส card number และ CVV แยกกัน
    const encryptedCardNumber = encrypt(cardData.cardNumber);
    const encryptedCvv = encrypt(cardData.cvv);

    // เก็บเฉพาะ 4 หลักสุดท้าย
    const lastFourDigits = cardData.cardNumber.slice(-4);

    // ตรวจสอบประเภทบัตร
    const cardType = detectCardType(cardData.cardNumber);

    // เข้ารหัส billing address ถ้ามี
    let encryptedBillingAddress: string | undefined;
    if (cardData.billingAddress) {
      encryptedBillingAddress = encrypt(JSON.stringify(cardData.billingAddress));
    }

    return {
      id: cardData.id,
      encryptedCardNumber,
      encryptedCvv,
      cardholderName: cardData.cardholderName,
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      lastFourDigits,
      cardType,
      encryptedBillingAddress,
      createdAt: Date.now(),
      fingerprint: cardFingerprint
    };
  } catch (error) {
    console.error('Card encryption error:', error);
    throw new Error('Failed to encrypt card data');
  }
};

export const decryptCardData = (encryptedCard: EncryptedCardData): CreditCardData => {
  try {
    const cardNumber = decrypt(encryptedCard.encryptedCardNumber);
    const cvv = decrypt(encryptedCard.encryptedCvv);

    let billingAddress;
    if (encryptedCard.encryptedBillingAddress) {
      billingAddress = JSON.parse(decrypt(encryptedCard.encryptedBillingAddress));
    }

    return {
      id: encryptedCard.id,
      cardNumber,
      cvv,
      cardholderName: encryptedCard.cardholderName,
      expiryMonth: encryptedCard.expiryMonth,
      expiryYear: encryptedCard.expiryYear,
      billingAddress
    };
  } catch (error) {
    console.error('Card decryption error:', error);
    throw new Error('Failed to decrypt card data');
  }
};

// 🔍 Card Type Detection
const detectCardType = (cardNumber: string): string => {
  const number = cardNumber.replace(/\s/g, '');

  if (/^4/.test(number)) return 'Visa';
  if (/^5[1-5]/.test(number)) return 'Mastercard';
  if (/^3[47]/.test(number)) return 'American Express';
  if (/^6/.test(number)) return 'Discover';

  return 'Unknown';
};

// 🔐 Advanced Security Functions
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

export const createHMAC = (data: string, secret?: string): string => {
  const key = secret || process.env.HMAC_SECRET || 'default-secret';
  return crypto.createHmac('sha256', key).update(data).digest('hex');
};

export const verifyHMAC = (data: string, signature: string, secret?: string): boolean => {
  try {
    const expectedSignature = createHMAC(data, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    return false;
  }
};

// 🔑 Key Derivation Function
export const deriveKey = (password: string, salt: string, iterations: number = 100000): Buffer => {
  return crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256');
};

// 🧂 Salt Generation
export const generateSalt = (length: number = 16): string => {
  return crypto.randomBytes(length).toString('hex');
};

// 📝 Digital Signature
export const createDigitalSignature = (data: string, privateKey: string): string => {
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(data);
  return sign.sign(privateKey, 'hex');
};

export const verifyDigitalSignature = (data: string, signature: string, publicKey: string): boolean => {
  try {
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(data);
    return verify.verify(publicKey, signature, 'hex');
  } catch (error) {
    return false;
  }
};
