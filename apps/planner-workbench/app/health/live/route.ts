export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  return Response.json(
    {
      service: "planner-workbench",
      status: "ok"
    },
    {
      headers: {
        "cache-control": "no-store"
      }
    }
  );
}
