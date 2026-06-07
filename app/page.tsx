import { getProjects } from "@/app/lib/projects";
import { site } from "@/app/lib/site";
import AppShell from "@/app/app-shell";

export default async function Home() {
  const projects = await getProjects();

  return (
    <main className="page">
      <AppShell projects={projects} />

      <section className="sr-only">
        <h1>{site.org} — Open Source Projects</h1>
        <p>{site.description}</p>
        <ul>
          {projects.map((p) => (
            <li key={p.name}>
              <a href={p.url}>{p.name}</a> — {p.description}
            </li>
          ))}
        </ul>
        <p>
          <a href={site.donate}>Donate / Sponsor</a> ·{" "}
          <a href={site.mainSite}>Main website</a> ·{" "}
          <a href={site.github}>GitHub organisation</a>
        </p>
      </section>
    </main>
  );
}
