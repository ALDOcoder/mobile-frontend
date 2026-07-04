export interface JwtPayload {
  userId: string
  username: string
  role: string
  exp: number
  iat: number
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token)
  if (!payload) return true
  return payload.exp * 1000 < Date.now()
}

export function getUserId(token: string): string | null {
  const payload = decodeJwt(token)
  return payload?.userId ?? null
}

export function getUsername(token: string): string | null {
  const payload = decodeJwt(token)
  return payload?.username ?? null
}
