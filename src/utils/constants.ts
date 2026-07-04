export const API_BASE = '/api'

export const WS_URL = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/chat`

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_INFO: 'userInfo'
}

export const MESSAGE_STATUS = {
  NORMAL: 0,
  RECALLED: 1,
  DELETED: 2
} as const
