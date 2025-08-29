// Utility to fetch a QR code as a base64 data URL
export async function fetchQrCodeDataUrl(qrUrl: string): Promise<string> {
  const response = await fetch(qrUrl);
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
