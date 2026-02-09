export function generateRandomString(length: number = 8): string {
  return Math.random().toString(36).substring(2, length + 2);
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
