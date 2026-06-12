import { closeExpiredUniformLists } from "@/lib/list-service";

export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const expectedSecret = process.env.CRON_SECRET ?? "quarteto-list-dev-cron-secret";
  const authorizationHeader = request.headers.get("authorization");

  return authorizationHeader === `Bearer ${expectedSecret}`;
}

async function runClosingJob(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json(
      {
        error: "unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const closed = await closeExpiredUniformLists();

  return Response.json({
    closed,
    executedAt: new Date().toISOString(),
  });
}

export function GET(request: Request) {
  return runClosingJob(request);
}

export function POST(request: Request) {
  return runClosingJob(request);
}