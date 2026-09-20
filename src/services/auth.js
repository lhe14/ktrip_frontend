import { apiRequest } from './api'

// Matches app/api/auth.py exactly: SignupRequest{email, nickname, password} ->
// UserOut{id, email, nickname} (no token — call login separately or right
// after signup). LoginRequest{email, password} -> TokenOut{access_token}.
export const signup = ({ email, nickname, password }) =>
  apiRequest('/auth/signup', { method: 'POST', json: { email, nickname, password } })

export const login = ({ email, password }) =>
  apiRequest('/auth/login', { method: 'POST', json: { email, password } })
