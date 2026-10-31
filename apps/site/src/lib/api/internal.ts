import { apiApp } from '@/lib/api/app'

export function internalApiRequest(path: string, init?: RequestInit) {
  return apiApp.request(`http://internal/api/v1${path}`, init)
}
