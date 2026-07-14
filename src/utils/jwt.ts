export interface JwtPayload {
  sub: string
  username: string
  role: string
  exp: number
  iat: number
  userId: string
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const parsed = JSON.parse(decoded)
    // 后端用 setSubject(userId) 存入 sub 字段，兼容映射到 userId
    return { ...parsed, userId: parsed.sub || parsed.userId }
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
