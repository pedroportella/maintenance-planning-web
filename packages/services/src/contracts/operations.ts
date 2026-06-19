import type { GuidString, IsoDateTimeString } from "./common";

export type OperationsPostureReport = {
  readonly databaseConfigured: boolean;
  readonly status: string;
  readonly latestImport?: LatestImportFreshness | null;
  readonly checkedAtUtc: IsoDateTimeString;
};

export type LatestImportFreshness = {
  readonly importId: GuidString;
  readonly sourceSystem: string;
  readonly importKind: string;
  readonly status: string;
  readonly receivedCount: number;
  readonly acceptedCount: number;
  readonly rejectedCount: number;
  readonly ignoredDuplicateCount: number;
  readonly ignoredStaleCount: number;
  readonly receivedAtUtc: IsoDateTimeString;
  readonly completedAtUtc?: IsoDateTimeString | null;
};

export type MigrationReadinessReport = {
  readonly databaseConfigured: boolean;
  readonly databaseReachable: boolean;
  readonly isReady: boolean;
  readonly status: string;
  readonly appliedMigrationCount: number;
  readonly pendingMigrationCount: number;
  readonly pendingMigrations: readonly string[];
  readonly latestAppliedMigration?: string | null;
  readonly issueCode?: string | null;
  readonly checkedAtUtc: IsoDateTimeString;
};
