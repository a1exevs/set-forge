type Handler = () => void;

let handler: Handler | null = null;

export function setSessionExpiredHandler(next: Handler | null): void {
  handler = next;
}

export function notifySessionExpired(): void {
  handler?.();
}
