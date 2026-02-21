import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { CrashRecord, InvestigationEntry, Coordinate, Aircraft, CasualtyData, FlightPathPoint, ExternalBlob } from '../backend';

// Query keys
const QUERY_KEYS = {
  allCrashes: ['crashes', 'all'],
  crash: (id: number) => ['crashes', id],
  crashesByDateRange: (start: bigint, end: bigint) => ['crashes', 'dateRange', start.toString(), end.toString()],
  crashesByPhase: (phase: string) => ['crashes', 'phase', phase],
  searchCrashes: (keyword: string) => ['crashes', 'search', keyword],
  survivorStories: ['crashes', 'survivors'],
  flightPath: (id: number) => ['flightPath', id],
  investigationEntries: (crashId: number) => ['investigation', crashId],
};

// Crash Record Queries
export function useGetAllCrashRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<CrashRecord[]>({
    queryKey: QUERY_KEYS.allCrashes,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCrashRecordsSorted();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCrashRecord(id: number) {
  const { actor, isFetching } = useActor();

  return useQuery<CrashRecord>({
    queryKey: QUERY_KEYS.crash(id),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getCrashRecord(BigInt(id));
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

export function useGetCrashRecordsByDateRange(startTimestamp: bigint, endTimestamp: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<CrashRecord[]>({
    queryKey: QUERY_KEYS.crashesByDateRange(startTimestamp, endTimestamp),
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCrashRecordsByDateRange(startTimestamp, endTimestamp);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCrashRecordsByPhase(phase: string) {
  const { actor, isFetching } = useActor();

  return useQuery<CrashRecord[]>({
    queryKey: QUERY_KEYS.crashesByPhase(phase),
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCrashRecordsByPhase(phase);
    },
    enabled: !!actor && !isFetching && !!phase,
  });
}

export function useSearchCrashRecords(keyword: string) {
  const { actor, isFetching } = useActor();

  return useQuery<CrashRecord[]>({
    queryKey: QUERY_KEYS.searchCrashes(keyword),
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchCrashRecordsByKeyword(keyword);
    },
    enabled: !!actor && !isFetching && !!keyword,
  });
}

export function useGetSurvivorStories() {
  const { actor, isFetching } = useActor();

  return useQuery<CrashRecord[]>({
    queryKey: QUERY_KEYS.survivorStories,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSurvivorStories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetFlightPath(id: number) {
  const { actor, isFetching } = useActor();

  return useQuery<FlightPathPoint[] | null>({
    queryKey: QUERY_KEYS.flightPath(id),
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCompleteFlightPath(BigInt(id));
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

// Crash Record Mutations
export function useAddCrashRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      crashDate: bigint;
      location: Coordinate;
      airline: string;
      flightNumber: string;
      aircraft: Aircraft;
      phaseOfFlight: string;
      casualties: CasualtyData;
      crashCause: string;
      source: string;
      investigationTimeline: InvestigationEntry[];
      flightPath: FlightPathPoint[];
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addCrashRecord(
        data.crashDate,
        data.location,
        data.airline,
        data.flightNumber,
        data.aircraft,
        data.phaseOfFlight,
        data.casualties,
        data.crashCause,
        data.source,
        data.investigationTimeline,
        data.flightPath
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allCrashes });
    },
  });
}

export function useUpdateCrashRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      crashDate: bigint;
      location: Coordinate;
      airline: string;
      flightNumber: string;
      aircraft: Aircraft;
      phaseOfFlight: string;
      casualties: CasualtyData;
      crashCause: string;
      source: string;
      investigationTimeline: InvestigationEntry[];
      flightPath: FlightPathPoint[];
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateCrashRecord(
        data.id,
        data.crashDate,
        data.location,
        data.airline,
        data.flightNumber,
        data.aircraft,
        data.phaseOfFlight,
        data.casualties,
        data.crashCause,
        data.source,
        data.investigationTimeline,
        data.flightPath
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allCrashes });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.crash(Number(variables.id)) });
    },
  });
}

export function useAttachPhotoToCrashRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { crashId: bigint; photo: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.attachPhotoToCrashRecord(data.crashId, data.photo);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.crash(Number(variables.crashId)) });
    },
  });
}

// Investigation Timeline Queries & Mutations
export function useGetInvestigationEntries(crashId: number) {
  const { actor, isFetching } = useActor();

  return useQuery<InvestigationEntry[]>({
    queryKey: QUERY_KEYS.investigationEntries(crashId),
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllInvestigationEntries(BigInt(crashId));
    },
    enabled: !!actor && !isFetching && crashId !== undefined,
  });
}

export function useAddInvestigationEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      crashId: bigint;
      timestamp: bigint;
      description: string;
      author: string;
      mediaUrls: string[];
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addInvestigationEntry(
        data.crashId,
        data.timestamp,
        data.description,
        data.author,
        data.mediaUrls
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.investigationEntries(Number(variables.crashId)) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.crash(Number(variables.crashId)) });
    },
  });
}

export function useAttachPhotoToEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { crashId: bigint; entryId: bigint; photo: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.attachPhotoToEntry(data.crashId, data.entryId, data.photo);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.investigationEntries(Number(variables.crashId)) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.crash(Number(variables.crashId)) });
    },
  });
}

export function useUpdateInvestigationEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      crashId: bigint;
      entryId: bigint;
      timestamp: bigint;
      newTitle: string;
      newDescription: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateInvestigationEntry(
        data.crashId,
        data.entryId,
        data.timestamp,
        data.newTitle,
        data.newDescription
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.investigationEntries(Number(variables.crashId)) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.crash(Number(variables.crashId)) });
    },
  });
}
