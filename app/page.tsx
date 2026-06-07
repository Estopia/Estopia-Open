export default function Home() {
  const projects = [
    {
      name: "FluxRoute",
      status: "Maintained",
      summary:
        "Type-safe service routing for distributed systems, focused on reliable deploys and observable rollbacks.",
      stack: "TypeScript, Node.js, OpenTelemetry",
      detail: "Stable API, weekly triage, and deterministic release notes.",
    },
    {
      name: "Circuit Foundry",
      status: "Beta",
      summary:
        "Reusable infrastructure blueprints for cloud-native teams that want consistent environments and fewer release surprises.",
      stack: "Terraform, CI pipelines, Policy as Code",
      detail: "Opinionated modules, policy checks, and cloud portability.",
    },
    {
      name: "Agent Canvas",
      status: "Experimental",
      summary:
        "Composable automation framework for internal engineering workflows with human-in-the-loop controls.",
      stack: "React, Workers, Event-driven architecture",
      detail: "Composable agents, auditable actions, and guarded execution.",
    },
  ];

  const waysOfWorking = [
    {
      title: "Predictable releases",
      note: "Versioned changelogs and migration notes for every meaningful update.",
    },
    {
      title: "Maintainer visibility",
      note: "Clear issue ownership, transparent status updates, and practical roadmap notes.",
    },
    {
      title: "Contributor-friendly process",
      note: "Documented conventions and faster feedback for first-time pull requests.",
    },
  ];

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]/90">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 md:px-8">
          <a className="text-sm font-semibold tracking-[0.06em] text-[var(--primary-deep)]" href="#home">
            ESTOPIA OPEN
          </a>
          <nav className="hidden items-center gap-6 text-sm font-medium text-[var(--muted)] md:flex">
            <a className="hover:text-foreground" href="#projects">
              Projects
            </a>
            <a className="hover:text-foreground" href="#how-we-work">
              How we work
            </a>
            <a className="hover:text-foreground" href="#community">
              Community
            </a>
          </nav>
        </div>
      </header>

      <main
        id="home"
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-20 px-6 py-12 md:px-8 md:py-16"
      >
        <section className="grid gap-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 md:grid-cols-[1.5fr_1fr] md:p-10">
          <div className="space-y-6">
            <p className="text-sm font-medium text-[var(--muted)]">
              Estopia Engineering Ltd. builds and maintains open source software.
            </p>
            <h1 className="font-display max-w-[16ch] text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
              Practical open source tools for modern engineering teams.
            </h1>
            <p className="max-w-[66ch] text-base leading-8 text-[var(--muted)] md:text-lg">
              This site showcases our public projects, current focus areas, and
              how we collaborate with contributors. We optimise for reliability,
              clear documentation, and maintainership that lasts.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                className="rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--surface)] transition hover:bg-[var(--primary-deep)]"
                href="#projects"
              >
                Browse projects
              </a>
              <a
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold text-foreground transition hover:border-[var(--primary)]"
                href="#community"
              >
                Start contributing
              </a>
            </div>
          </div>

          <aside className="rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--accent)_14%,var(--surface))] p-6">
            <p className="text-xs font-semibold tracking-[0.06em] text-[var(--muted)]">
              Current focus
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--muted)]">
              <li>Stronger release discipline across repositories.</li>
              <li>Clear migration notes and upgrade guidance.</li>
              <li>Faster issue triage and contributor response.</li>
            </ul>
          </aside>
        </section>

        <section id="projects" className="space-y-6">
          <div className="space-y-2">
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Featured projects
            </h2>
            <p className="max-w-[70ch] text-sm leading-7 text-[var(--muted)]">
              Replace placeholder copy with real repository links, stars, and issue labels when ready.
            </p>
          </div>

          <ol className="space-y-4">
            {projects.map((project) => (
              <li
                key={project.name}
                className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 md:grid-cols-[1.1fr_1.7fr_auto] md:items-start"
              >
                <div>
                  <h3 className="font-display text-2xl font-semibold tracking-tight">{project.name}</h3>
                  <p className="mt-2 text-xs font-medium tracking-[0.06em] text-[var(--muted)]">
                    {project.stack}
                  </p>
                </div>
                <div>
                  <p className="text-sm leading-7 text-[var(--muted)]">{project.summary}</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{project.detail}</p>
                </div>
                <div className="flex items-center gap-3 md:flex-col md:items-end">
                  <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--primary-deep)]">
                    {project.status}
                  </span>
                  <a className="text-sm font-semibold text-[var(--primary)] hover:underline" href="#">
                    View repository
                  </a>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="how-we-work" className="space-y-6">
          <div className="space-y-2">
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              How we work in the open
            </h2>
            <p className="max-w-[70ch] text-sm leading-7 text-[var(--muted)]">
              These are the working standards we apply across our public projects.
            </p>
          </div>

          <ol className="grid gap-4 md:grid-cols-3">
            {waysOfWorking.map((entry) => (
              <li key={entry.title} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
                <h3 className="font-display text-2xl font-semibold tracking-tight">{entry.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{entry.note}</p>
              </li>
            ))}
          </ol>
        </section>

        <section
          id="community"
          className="grid gap-8 rounded-3xl border border-[var(--primary)] bg-[color-mix(in_oklab,var(--primary)_11%,var(--surface))] p-8 md:grid-cols-[1.4fr_1fr] md:p-10"
        >
          <div>
            <h2 className="font-display max-w-[22ch] text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
              Want to contribute?
            </h2>
            <p className="mt-4 max-w-[64ch] text-base leading-8 text-[var(--muted)]">
              Open an issue, propose improvements, or submit a pull request. We
              welcome practical collaboration and thoughtful technical feedback.
            </p>
          </div>

          <div className="flex flex-col gap-3 self-end md:items-end">
            <a
              className="w-full rounded-full bg-[var(--primary-deep)] px-6 py-3 text-center text-sm font-semibold text-[var(--surface)] transition hover:bg-[var(--primary)] md:w-auto"
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit GitHub organisation
            </a>
            <a
              className="w-full rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-center text-sm font-semibold text-foreground transition hover:border-[var(--primary)] md:w-auto"
              href="mailto:opensource@estopia.net"
            >
              Contact maintainers
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--surface)]/80">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-6 text-sm text-[var(--muted)] md:px-10">
          <p>© {new Date().getFullYear()} Estopia Engineering Ltd.</p>
          <p>open.estopia.net</p>
        </div>
      </footer>
    </div>
  );
}
