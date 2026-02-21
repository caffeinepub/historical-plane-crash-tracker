// Mapping of aircraft types to their 3D model identifiers
const AIRCRAFT_MODEL_MAP: Record<string, string> = {
  'Boeing 737': 'boeing-737',
  'Boeing 747': 'boeing-747',
  'Boeing 777': 'boeing-777',
  'Boeing 787': 'boeing-787',
  'Airbus A320': 'airbus-a320',
  'Airbus A330': 'airbus-a330',
  'Airbus A380': 'airbus-a380',
  'McDonnell Douglas DC-10': 'dc-10',
  'Lockheed L-1011': 'l-1011',
  'Cessna 172': 'cessna-172',
  'Piper PA-28': 'piper-pa28',
};

const GENERIC_MODEL = 'generic-aircraft';

export function getModelForAircraftType(aircraftType: string): string {
  if (!aircraftType) return GENERIC_MODEL;
  
  // Try exact match first
  if (AIRCRAFT_MODEL_MAP[aircraftType]) {
    return AIRCRAFT_MODEL_MAP[aircraftType];
  }
  
  // Try partial match
  const normalizedType = aircraftType.toLowerCase();
  for (const [key, value] of Object.entries(AIRCRAFT_MODEL_MAP)) {
    if (normalizedType.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return GENERIC_MODEL;
}

export function getAircraftTypePreview(aircraftType: string): string | null {
  if (!aircraftType) return null;
  
  const modelId = getModelForAircraftType(aircraftType);
  
  if (modelId === GENERIC_MODEL) {
    return 'Using generic model';
  }
  
  // Find the display name
  for (const [key, value] of Object.entries(AIRCRAFT_MODEL_MAP)) {
    if (value === modelId) {
      return key;
    }
  }
  
  return null;
}

export function getAllSupportedAircraftTypes(): string[] {
  return Object.keys(AIRCRAFT_MODEL_MAP);
}
