"use client";

import {
  useId,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode
} from "react";
import { joinClasses } from "../../../utils";
import {
  PlannerSummaryList,
  type PlannerSummaryListItem
} from "../../data";
import {
  PlannerAlert,
  type PlannerStatusTone
} from "../../feedback";
import {
  PlannerRadioCards,
  PlannerRadioGroup,
  PlannerTextArea
} from "../../forms";
import {
  RadixButton,
  RadixText
} from "../../radix";

export type PlannerDecisionKind = "Accepted" | "Deferred" | "Rejected";

export type PlannerDecisionPanelAction = {
  actionCode: string;
  decision: PlannerDecisionKind;
  description: ReactNode;
  disabled?: boolean;
  disabledDescription?: ReactNode;
  label: ReactNode;
  reasonCode?: string;
  tone?: PlannerStatusTone;
};

export type PlannerDecisionPanelBlocker = {
  id?: string;
  label?: ReactNode;
  summary: ReactNode;
};

export type PlannerDecisionPanelProps = {
  actions: readonly PlannerDecisionPanelAction[];
  ariaLabel?: string;
  blockers?: readonly PlannerDecisionPanelBlocker[];
  className?: string;
  defaultDecision?: PlannerDecisionKind;
  defaultDeferActionCode?: string;
  facts?: readonly PlannerSummaryListItem[];
  formId?: string;
  packageId: string;
  packageNumber: string;
  planningRunId?: string;
  recordAction?: ComponentPropsWithoutRef<"form">["action"];
  secondaryAction?: ReactNode;
  title?: ReactNode;
  titleId?: string;
  workOrderIds: readonly string[];
};

export function PlannerDecisionPanel({
  actions,
  ariaLabel,
  blockers = [],
  className,
  defaultDecision,
  defaultDeferActionCode,
  facts = [],
  formId,
  packageId,
  packageNumber,
  planningRunId,
  recordAction,
  secondaryAction,
  title = "Record decision",
  titleId,
  workOrderIds
}: PlannerDecisionPanelProps) {
  const generatedId = useId().replace(/:/g, "");
  const resolvedTitleId = titleId ?? `planner-decision-panel-${generatedId}`;
  const acceptAction = actions.find((action) => action.decision === "Accepted");
  const rejectAction = actions.find((action) => action.decision === "Rejected");
  const deferActions = actions.filter((action) => action.decision === "Deferred");
  const [selectedDecision, setSelectedDecision] = useState<PlannerDecisionKind>(() =>
    resolveInitialDecision({
      acceptAction,
      actions,
      defaultDecision,
      deferActions,
      rejectAction
    })
  );
  const [selectedDeferActionCode, setSelectedDeferActionCode] = useState(
    () => resolveInitialDeferActionCode(deferActions, defaultDeferActionCode)
  );
  const decisionStatusId = `planner-decision-panel-${generatedId}-status`;

  const selectedDeferAction =
    deferActions.find((action) => action.actionCode === selectedDeferActionCode) ??
    deferActions[0];
  const selectedAction =
    selectedDecision === "Accepted"
      ? acceptAction
      : selectedDecision === "Rejected"
        ? rejectAction
        : selectedDeferAction;
  const submittedActionCode =
    selectedDecision === "Deferred" ? "defer" : selectedAction?.actionCode ?? "";
  const submitTone = selectedAction?.tone ?? toneByDecision[selectedDecision];
  const isSubmitDisabled = !selectedAction || selectedAction.disabled === true;
  const hasBlockers = blockers.length > 0;
  const selectedActionStatus = buildSelectedActionStatus({
    isSubmitDisabled,
    packageNumber,
    selectedAction,
    selectedDecision,
    selectedDeferAction
  });

  return (
    <section
      aria-labelledby={resolvedTitleId}
      className={joinClasses("planner-decision-panel", className)}
      data-selected-decision={selectedDecision.toLowerCase()}
    >
      <header className="planner-decision-panel-header">
        <div className="planner-decision-panel-copy">
          <p className="planner-decision-panel-eyebrow">Planner decision</p>
          <h3 id={resolvedTitleId}>{title}</h3>
          <RadixText as="p" size="2" tone="muted">
            Choose one decision path for {packageNumber}, then submit it once.
          </RadixText>
        </div>
      </header>

      <form
        action={recordAction}
        aria-describedby={decisionStatusId}
        aria-label={ariaLabel ?? `Record planner decision for ${packageNumber}`}
        className="planner-decision-panel-form"
        id={formId}
      >
        <input name="packageId" type="hidden" value={packageId} />
        {planningRunId ? (
          <input name="planningRunId" type="hidden" value={planningRunId} />
        ) : null}
        {workOrderIds.map((workOrderId) => (
          <input
            key={workOrderId}
            name="workOrderIds"
            type="hidden"
            value={workOrderId}
          />
        ))}
        <input name="actionCode" type="hidden" value={submittedActionCode} />
        <p
          aria-live="polite"
          className="sr-only"
          id={decisionStatusId}
        >
          {selectedActionStatus}
        </p>

        {facts.length > 0 ? (
          <PlannerSummaryList
            ariaLabel={`${packageNumber} decision facts`}
            className="planner-decision-panel-facts"
            items={facts}
            variant="compact"
          />
        ) : null}

        <PlannerAlert
          className="planner-decision-panel-context"
          role={hasBlockers ? "alert" : "status"}
          title={hasBlockers ? "Acceptance is blocked" : "Ready for decision"}
          tone={hasBlockers ? "warning" : "success"}
        >
          {hasBlockers ? (
            <ul className="planner-decision-panel-blockers">
              {blockers.map((blocker, index) => (
                <li key={getBlockerKey(blocker, index)}>
                  {blocker.label ? <strong>{blocker.label}: </strong> : null}
                  {blocker.summary}
                </li>
              ))}
            </ul>
          ) : (
            <p>Package facts do not show a blocker for acceptance.</p>
          )}
        </PlannerAlert>

        <PlannerTextArea
          className="planner-decision-panel-note"
          label="Decision note"
          name="notes"
          optional
          placeholder="Optional synthetic planner note"
          rows={3}
        />

        <PlannerRadioCards
          className="planner-decision-panel-choice"
          controlClassName="planner-decision-panel-choice-list"
          label="Decision option"
          name="decisionChoice"
          onValueChange={(value) => setSelectedDecision(value as PlannerDecisionKind)}
          options={buildDecisionOptions({
            acceptAction,
            deferActions,
            rejectAction,
            selectedDeferAction
          })}
          required
          value={selectedDecision}
        />

        {selectedDecision === "Deferred" && deferActions.length > 0 ? (
          <PlannerRadioGroup
            className="planner-decision-panel-defer"
            controlClassName="planner-decision-panel-defer-list"
            hint="Choose the reason that will be posted with the deferred decision."
            label="Defer reason"
            name="deferActionCode"
            onValueChange={setSelectedDeferActionCode}
            options={deferActions.map((action) => ({
              disabled: action.disabled,
              hint: action.description,
              label: action.label,
              value: action.actionCode
            }))}
            required
            value={selectedDeferActionCode}
          />
        ) : null}

        <footer className="planner-decision-panel-action-bar">
          <RadixButton
            aria-describedby={decisionStatusId}
            className="planner-decision-panel-submit"
            disabled={isSubmitDisabled}
            tone={submitTone}
            type="submit"
          >
            {getSubmitLabel(selectedDecision)}
          </RadixButton>
          {secondaryAction ? (
            <span className="planner-decision-panel-secondary">{secondaryAction}</span>
          ) : null}
        </footer>
      </form>
    </section>
  );
}

const toneByDecision = {
  Accepted: "success",
  Deferred: "warning",
  Rejected: "critical"
} as const satisfies Record<PlannerDecisionKind, PlannerStatusTone>;

function resolveInitialDecision({
  acceptAction,
  actions,
  defaultDecision,
  deferActions,
  rejectAction
}: {
  acceptAction?: PlannerDecisionPanelAction;
  actions: readonly PlannerDecisionPanelAction[];
  defaultDecision?: PlannerDecisionKind;
  deferActions: readonly PlannerDecisionPanelAction[];
  rejectAction?: PlannerDecisionPanelAction;
}) {
  const preferredAction = actions.find((action) => action.decision === defaultDecision);

  if (preferredAction && !preferredAction.disabled) {
    return preferredAction.decision;
  }

  if (acceptAction && !acceptAction.disabled) {
    return "Accepted";
  }

  if (deferActions.length > 0) {
    return "Deferred";
  }

  if (rejectAction) {
    return "Rejected";
  }

  return actions[0]?.decision ?? "Deferred";
}

function resolveInitialDeferActionCode(
  deferActions: readonly PlannerDecisionPanelAction[],
  defaultDeferActionCode?: string
) {
  const preferredAction = deferActions.find(
    (action) => action.actionCode === defaultDeferActionCode
  );

  return preferredAction?.actionCode ?? deferActions[0]?.actionCode ?? "";
}

function buildDecisionOptions({
  acceptAction,
  deferActions,
  rejectAction,
  selectedDeferAction
}: {
  acceptAction?: PlannerDecisionPanelAction;
  deferActions: readonly PlannerDecisionPanelAction[];
  rejectAction?: PlannerDecisionPanelAction;
  selectedDeferAction?: PlannerDecisionPanelAction;
}) {
  return [
    acceptAction
      ? {
          disabled: acceptAction.disabled,
          hint: acceptAction.disabled
            ? acceptAction.disabledDescription ?? "Resolve blockers before accepting."
            : acceptAction.description,
          label: acceptAction.label,
          value: "Accepted"
        }
      : null,
    deferActions.length > 0
      ? {
          hint: selectedDeferAction?.description ?? "Hold the package with a selected reason.",
          label: "Defer package",
          value: "Deferred"
        }
      : null,
    rejectAction
      ? {
          disabled: rejectAction.disabled,
          hint: rejectAction.disabled
            ? rejectAction.disabledDescription ?? rejectAction.description
            : rejectAction.description,
          label: rejectAction.label,
          value: "Rejected"
        }
      : null
  ].filter((option): option is NonNullable<typeof option> => option !== null);
}

function getSubmitLabel(decision: PlannerDecisionKind) {
  if (decision === "Accepted") return "Accept package";
  if (decision === "Rejected") return "Reject package";
  return "Defer package";
}

function buildSelectedActionStatus({
  isSubmitDisabled,
  packageNumber,
  selectedAction,
  selectedDecision,
  selectedDeferAction
}: {
  isSubmitDisabled: boolean;
  packageNumber: string;
  selectedAction?: PlannerDecisionPanelAction;
  selectedDecision: PlannerDecisionKind;
  selectedDeferAction?: PlannerDecisionPanelAction;
}) {
  if (!selectedAction) {
    return `No ${selectedDecision.toLowerCase()} action is available for ${packageNumber}.`;
  }

  const reason =
    selectedDecision === "Deferred"
      ? labelToPlainText(selectedDeferAction?.label) ??
        selectedDeferAction?.reasonCode ??
        selectedDeferAction?.actionCode
      : selectedAction.reasonCode ?? selectedAction.actionCode;
  const reasonText = reason ?? selectedAction.actionCode;
  const disabledText = isSubmitDisabled
    ? " This action is unavailable until blockers are resolved."
    : "";

  return `${selectedDecision} selected for ${packageNumber}. Submitting records ${reasonText}.${disabledText}`;
}

function labelToPlainText(label: ReactNode) {
  return typeof label === "string" || typeof label === "number" ? String(label) : undefined;
}

function getBlockerKey(blocker: PlannerDecisionPanelBlocker, index: number) {
  if (blocker.id) {
    return blocker.id;
  }

  return typeof blocker.label === "string" ? blocker.label : `blocker-${index}`;
}
