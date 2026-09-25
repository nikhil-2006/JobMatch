import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculates distance between two latitude/longitude pairs using Haversine formula
 * @returns distance string in kilometers (e.g., "1.4 km")
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): string {
  if (!lat1 || !lon1 || !lat2 || !lon2) return '0.5 km'

  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km

  if (d < 1) {
    return `${Math.round(d * 1000)} m`
  }
  return `${d.toFixed(1)} km`
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}
