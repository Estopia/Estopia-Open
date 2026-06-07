import { getProjectsResult } from "@/app/lib/projects";

// Default (`auto`) handler: runs per request but the GitHub `fetch` inside
// getProjectsResult is cached via its `revalidate`, so the upstream API is hit
// at most once per window regardless of how many clients poll this endpoint.
export async function GET() {
  const result = await getProjectsResult();
  return Response.json(result, {
    headers: {
      // Let every poll reach the server; the data cache does the throttling.
      "Cache-Control": "no-store",
    },
  });
}
