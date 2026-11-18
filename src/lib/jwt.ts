// Lee el `exp` (segundos epoch) del payload de un JWT sin verificar la firma:
// la verificación la hace el backend; acá solo se usa para anticipar el refresh.
// Devuelve null si el token no se puede decodificar o no trae `exp`.
export function getTokenExp(token: string): number | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded));
    return typeof payload?.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

// true solo si se sabe que al token le quedan menos de `marginMs`.
// Si no se puede leer el exp ("no sé"), devuelve false y se sigue como siempre.
export function isTokenExpiringSoon(token: string, marginMs = 30_000): boolean {
  const exp = getTokenExp(token);
  if (exp === null) return false;
  return exp * 1000 - Date.now() < marginMs;
}
