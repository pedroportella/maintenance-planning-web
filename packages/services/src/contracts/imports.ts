import type { GuidString, IsoDateTimeString } from "./common";

export type SourceDataReadinessContract = {
  readonly status: string;
  readonly issueCode?: string | null;
  readonly issueDetail?: string | null;
  readonly validationIssues: readonly ValidationIssueContract[];
};

export type ValidationIssueContract = {
  readonly code: string;
  readonly severity: string;
  readonly sourceField?: string | null;
  readonly detail?: string | null;
};

export type SourceWorkOrderPayload = {
  readonly sourceSystem: string;
  readonly sourceId: string;
  readonly workOrderNumber: string;
  readonly title: string;
  readonly workType: string;
  readonly priority: string;
  readonly lifecycleStatus: string;
  readonly assetSourceId?: string | null;
  readonly functionalLocationSourceId?: string | null;
  readonly requiredStartUtc?: IsoDateTimeString | null;
  readonly dueAtUtc?: IsoDateTimeString | null;
  readonly scheduledStartUtc?: IsoDateTimeString | null;
  readonly estimatedHours?: number | null;
  readonly sourceUpdatedAtUtc?: IsoDateTimeString | null;
  readonly sourceDataReadiness: SourceDataReadinessContract;
  readonly validationIssues: readonly ValidationIssueContract[];
};

export type MajorEventWindowPayload = {
  readonly sourceSystem: string;
  readonly sourceId: string;
  readonly eventType: string;
  readonly title: string;
  readonly severity: string;
  readonly assetSourceId?: string | null;
  readonly functionalLocationSourceId?: string | null;
  readonly startsAtUtc?: IsoDateTimeString | null;
  readonly endsAtUtc?: IsoDateTimeString | null;
  readonly sourceUpdatedAtUtc?: IsoDateTimeString | null;
  readonly sourceDataReadiness: SourceDataReadinessContract;
  readonly validationIssues: readonly ValidationIssueContract[];
};

export type SourceWorkOrderImportRequest = {
  readonly sourceSystem: string;
  readonly schemaVersion: string;
  readonly idempotencyKey: string;
  readonly sourceWorkOrders: readonly SourceWorkOrderPayload[];
};

export type MaintenanceEventEnvelope = {
  readonly eventId: string;
  readonly eventType: string;
  readonly schemaVersion: string;
  readonly sourceSystem: string;
  readonly sourceRecordId: string;
  readonly correlationId: string;
  readonly occurredAt?: IsoDateTimeString | null;
  readonly publishedAt?: IsoDateTimeString | null;
  readonly idempotencyKey: string;
  readonly payload: unknown;
};

export type MaintenanceEventImportRequest = {
  readonly sourceSystem: string;
  readonly schemaVersion: string;
  readonly batchIdempotencyKey: string;
  readonly events: readonly MaintenanceEventEnvelope[];
};

export type ImportResult = {
  readonly importId: GuidString;
  readonly sourceSystem: string;
  readonly importKind: string;
  readonly idempotencyKey: string;
  readonly status: string;
  readonly receivedCount: number;
  readonly acceptedCount: number;
  readonly rejectedCount: number;
  readonly ignoredDuplicateCount: number;
  readonly ignoredStaleCount: number;
  readonly duplicateRequest: boolean;
  readonly receivedAtUtc: IsoDateTimeString;
  readonly completedAtUtc?: IsoDateTimeString | null;
  readonly events: readonly ImportEventResult[];
};

export type ImportEventResult = {
  readonly eventId: string;
  readonly eventType: string;
  readonly sourceRecordId: string;
  readonly idempotencyKey: string;
  readonly disposition: string;
  readonly status: string;
  readonly readiness?: string | null;
  readonly validationIssueCode?: string | null;
};
