const REGION_COORDS: Record<string, [number, number]> = {
  // Broad regions
  'North America': [-96, 38],
  'South America': [-55, -15],
  'Europe': [15, 50],
  'EU Public Sector': [4.35, 50.85],
  'MENA': [40, 28],
  'Sub-Saharan Africa': [25, 0],
  'East Asia': [115, 35],
  'South Asia': [78, 22],
  'Southeast Asia': [110, 5],
  'Oceania': [134, -25],
  // Countries
  Netherlands: [4.9, 52.37],
  France: [2.35, 48.85],
  'United States': [-98, 38.9],
  'United Kingdom': [-0.12, 51.5],
  Germany: [13.4, 52.5],
  Belgium: [4.35, 50.85],
  Canada: [-75, 45.4],
  Australia: [151.2, -33.87],
  Singapore: [103.82, 1.35],
  Japan: [139.69, 35.68],
  India: [77.2, 28.6],
  Brazil: [-47.9, -15.78],
  Spain: [-3.7, 40.42],
  Italy: [12.48, 41.9],
  Sweden: [18.07, 59.33],
  Norway: [10.75, 59.91],
  Denmark: [12.57, 55.68],
  Switzerland: [7.45, 46.95],
  'South Africa': [28.04, -26.2],
  'New Zealand': [174.76, -36.85],
}

export function getRegionCoords(region: string): [number, number] | null {
  return REGION_COORDS[region] ?? null
}
