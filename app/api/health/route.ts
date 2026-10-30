import { evaluateHealth } from "@/lib/server/health-core.mjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const { payload, statusCode } = evaluateHealth(process.env, new Date());

  return Response.json(payload, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
