import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { randomBytes } from 'crypto';

export async function generateTOTPSecret(email: string) {
  const secret = authenticator.generateSecret();
  const appName = process.env.TOTP_APP_NAME || 'Zoahary Baobab CMS';
  const otpauth = authenticator.keyuri(email, appName, secret);
  
  const qrCode = await QRCode.toDataURL(otpauth);
  
  return {
    secret,
    qrCode,
  };
}

export function verifyTOTP(token: string, secret: string): boolean {
  return authenticator.verify({ token, secret });
}

export function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
}
