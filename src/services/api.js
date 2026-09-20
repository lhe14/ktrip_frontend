export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Set by AuthContext on login/logout/startup so every request can attach the
// current session's bearer token without each caller having to pass it.
let authToken = null
export const setAuthToken = (token) => {
  authToken = token || null
}

// Also set by AuthContext: called whenever a request comes back 401, so an
// expired/invalid token clears the session in one place instead of every
// call site having to check for it.
let unauthorizedHandler = null
export const setUnauthorizedHandler = (fn) => {
  unauthorizedHandler = fn
}

export async function apiRequest(path, options = {}) {
  const { json, headers, ...rest } = options
  const finalHeaders = { Accept: 'application/json', ...headers }

  let body = rest.body
  if (json !== undefined) {
    finalHeaders['Content-Type'] = 'application/json'
    body = JSON.stringify(json)
  }
  if (authToken) {
    finalHeaders.Authorization = `Bearer ${authToken}`
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...rest, headers: finalHeaders, body })
  } catch {
    throw new ApiError('The K-TRIP service could not be reached. Please check that the API server is running.')
  }

  if (!response.ok) {
    let message = `Request failed (${response.status}).`
    try {
      const errorBody = await response.json()
      // FastAPI's own HTTPException(detail=...) sends a plain string, but
      // its automatic request-validation errors (422) send `detail` as a
      // list of {msg, loc, ...} objects — handle both shapes.
      if (typeof errorBody.detail === 'string') {
        message = errorBody.detail
      } else if (Array.isArray(errorBody.detail)) {
        message = errorBody.detail.map((d) => d.msg).filter(Boolean).join(' ') || message
      }
    } catch {
      // Keep the status message when the server does not return JSON.
    }
    if (response.status === 401) unauthorizedHandler?.()
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) return null
  return response.json()
}
