import { getProjectsResult } from "@/app/lib/projects";
import AppShell from "@/app/app-shell";

export default async function Home() {
  const { projects, live } = await getProjectsResult();
  return <AppShell projects={projects} initialLive={live} />;
}
