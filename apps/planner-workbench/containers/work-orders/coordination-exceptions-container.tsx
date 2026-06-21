import WorkOrderBacklogPage from "./work-order-backlog-container";

export default async function CoordinationExceptionsPage() {
  return WorkOrderBacklogPage({ initialFilter: "exceptions" });
}
