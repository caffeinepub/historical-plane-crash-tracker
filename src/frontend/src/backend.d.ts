import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface CasualtyData {
    fatalities: bigint;
    totalAboard: bigint;
    crewFatalities: bigint;
    survivors: bigint;
    passengerFatalities: bigint;
}
export interface Coordinate {
    latitude: number;
    longitude: number;
}
export interface Aircraft {
    model: string;
    manufacturer: string;
    year?: bigint;
    registrationNumber: string;
    ICAOType: string;
    aircraftType: string;
}
export interface InvestigationEntry {
    id: bigint;
    title: string;
    tags: Array<string>;
    description: string;
    author: string;
    timestamp: bigint;
    mediaUrls: Array<string>;
    photos: Array<ExternalBlob>;
}
export interface FlightPathPoint {
    altitude?: number;
    speed?: number;
    coordinate: Coordinate;
    known: boolean;
}
export interface CrashRecord {
    id: bigint;
    incidentPhotos: Array<ExternalBlob>;
    status?: string;
    crashCause: string;
    source: string;
    flightNumber: string;
    submittingOrganization?: string;
    casualties: CasualtyData;
    lastUpdated: bigint;
    phaseOfFlight: string;
    flightPath: Array<FlightPathPoint>;
    investigationTimeline: Array<InvestigationEntry>;
    aircraft: Aircraft;
    externalReferences: Array<string>;
    airline: string;
    crashDate: bigint;
    location: Coordinate;
}
export interface backendInterface {
    addCrashRecord(crashDate: bigint, location: Coordinate, airline: string, flightNumber: string, aircraft: Aircraft, phaseOfFlight: string, casualties: CasualtyData, crashCause: string, source: string, investigationTimeline: Array<InvestigationEntry>, flightPath: Array<FlightPathPoint>): Promise<bigint>;
    addInvestigationEntry(crashId: bigint, timestamp: bigint, description: string, author: string, mediaUrls: Array<string>): Promise<bigint>;
    attachPhotoToCrashRecord(crashId: bigint, photo: ExternalBlob): Promise<void>;
    attachPhotoToEntry(crashId: bigint, entryId: bigint, photo: ExternalBlob): Promise<void>;
    getAllCrashRecordsSorted(): Promise<Array<CrashRecord>>;
    getAllInvestigationEntries(crashId: bigint): Promise<Array<InvestigationEntry>>;
    getCompleteFlightPath(id: bigint): Promise<Array<FlightPathPoint> | null>;
    getCrashRecord(id: bigint): Promise<CrashRecord>;
    getCrashRecordsByDateRange(startTimestamp: bigint, endTimestamp: bigint): Promise<Array<CrashRecord>>;
    getCrashRecordsByPhase(phase: string): Promise<Array<CrashRecord>>;
    getInvestigationEntry(crashId: bigint, entryId: bigint): Promise<InvestigationEntry | null>;
    getSurvivorStories(): Promise<Array<CrashRecord>>;
    searchCrashRecordsByKeyword(keyword: string): Promise<Array<CrashRecord>>;
    updateCrashRecord(id: bigint, crashDate: bigint, location: Coordinate, airline: string, flightNumber: string, aircraft: Aircraft, phaseOfFlight: string, casualties: CasualtyData, crashCause: string, source: string, investigationTimeline: Array<InvestigationEntry>, flightPath: Array<FlightPathPoint>): Promise<void>;
    updateInvestigationEntry(crashId: bigint, entryId: bigint, timestamp: bigint, newTitle: string, newDescription: string): Promise<void>;
}
