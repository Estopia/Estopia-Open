"use client";

import { useEffect, useState } from "react";
import { site } from "@/app/lib/site";
import { demoUrl, demoLabel, type Project } from "@/app/lib/projects";
import { FEATURED } from "@/app/lib/featured";
import Terminal from "@/app/terminal";
import Crossfade from "@/app/crossfade";

// GitHub's own colours for the languages Estopia publishes in.
const LANGUAGE_COLOURS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  HTML: "#e34c26",
  CSS: "#663399",
  Python: "#3572a5",
  Swift: "#f05138",
  Kotlin: "#a97bff",
  Go: "#00add8",
  Rust: "#dea584",
  Shell: "#89e051",
};

const QUICK_COMMANDS = ["projects", "about", "neofetch", "help"];

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function updated(project: Project): string {
  if (!project.pushedAt) return "";
  const when = new Date(project.pushedAt);
  return Number.isNaN(when.getTime()) ? "" : dateFormat.format(when);
}

function facts(project: Project): string {
  const parts = [project.language ?? "No main language"];
  if (project.license === "Other") parts.push("own licence");
  else if (project.license) parts.push(`${project.license} licence`);
  return parts.join(", ");
}

function mostCommon(values: (string | null)[]): string | null {
  const counts = new Map<string, number>();
  for (const v of values) if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best: string | null = null;
  for (const [v, n] of counts) if (!best || n > counts.get(best)!) best = v;
  return best;
}

function LogoMark() {
  return (
    <svg
      className="logo-mark"
      viewBox="0 0 64 64"
      width="28"
      height="28"
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="14" fill="var(--mark)" />
      <rect x="16" y="16.5" width="32" height="7.5" fill="#fff" />
      <rect x="16" y="28.25" width="25.5" height="7.5" fill="#fff" />
      <rect x="16" y="40" width="32" height="7.5" fill="#fff" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        d="M4 12h15M13 5l7 7-7 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

// Section parts rise into place once, as they scroll into view. Without
// script, or with reduced motion, everything is simply there.
function useReveal() {
  useEffect(() => {
    const root = document.documentElement;
    const items = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const vh = window.innerHeight;
    for (const el of items) {
      if (el.getBoundingClientRect().top < vh * 0.92) el.classList.add("is-in");
    }
    root.classList.add("reveal-on");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    items.forEach((el) => {
      if (!el.classList.contains("is-in")) io.observe(el);
    });
    return () => {
      io.disconnect();
      root.classList.remove("reveal-on");
    };
  }, []);
}

export default function SiteView({
  projects,
  live,
  onOpenTerminal,
}: {
  projects: Project[];
  live: boolean;
  onOpenTerminal: () => void;
}) {
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  useReveal();

  const sorted = [...projects].sort(
    (a, b) =>
      (b.pushedAt ?? "").localeCompare(a.pushedAt ?? "") ||
      a.name.localeCompare(b.name),
  );
  const featured = sorted
    .filter((p) => FEATURED[p.name])
    .sort((a, b) => FEATURED[a.name].order - FEATURED[b.name].order);
  // Search examples: the most common language and licence, and one word.
  const examples = [
    mostCommon(sorted.map((p) => p.language)),
    mostCommon(sorted.map((p) => p.license).filter((l) => l !== "Other")),
    "app",
  ].filter((x): x is string => Boolean(x));

  const needle = query.trim().toLowerCase();
  const matches = sorted.filter(
    (p) =>
      !needle ||
      `${p.name} ${p.description} ${p.language ?? ""} ${p.license ?? ""}`
        .toLowerCase()
        .includes(needle),
  );

  function goToProjects() {
    document
      .getElementById("projects")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const body = message.trim();
    const subject = "Estopia open source";
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  }

  return (
    <div className="site">
      <header className="nav wrap">
        <a className="brand" href="#top" aria-label="Estopia open source, top">
          <LogoMark />
          <span>Estopia open source</span>
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a href="#projects">Projects</a>
          <button type="button" onClick={onOpenTerminal}>
            Terminal
          </button>
          <a href={site.mainSite}>estopia.net</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero wrap" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title" className="rise" style={{ "--i": 0 } as Style}>
              Software we build
              <br /> in the open
            </h1>
            <p className="lead rise" style={{ "--i": 1 } as Style}>
              Every public project from {site.org}, a software studio in the UK.
              Read the code, use it, or explore it from the shell below.
            </p>
            <div className="actions rise" style={{ "--i": 2 } as Style}>
              <a className="button" href={site.github}>
                Browse on GitHub
              </a>
              <a className="text-link" href={site.donate}>
                Sponsor our work
              </a>
            </div>
          </div>

          <div
            className="shell rise"
            style={{ "--i": 3 } as Style}
            data-ui
            aria-label="Interactive Estopia shell"
            role="group"
          >
            <div className="shell-bar">
              <samp className="shell-title">
                visitor@estopia: ~/open-source
              </samp>
              <button
                type="button"
                className="shell-expand"
                onClick={onOpenTerminal}
              >
                Full screen
              </button>
            </div>
            <Terminal
              projects={projects}
              onExit={goToProjects}
              inline
              quickCommands={QUICK_COMMANDS}
            />
          </div>
        </section>

        {featured.length ? (
          <section
            className="featured wrap"
            aria-labelledby="featured-title"
            id="featured"
          >
            <h2 id="featured-title" className="section-title" data-reveal>
              Things we have shipped
            </h2>
            {featured.map((project, i) => {
              const f = FEATURED[project.name];
              const demo = demoUrl(project);
              return (
                <article
                  key={project.name}
                  className={`feature feature-${f.shape} feature-${i % 3}`}
                >
                  <div className="feature-text">
                    <h3 data-reveal>{project.name}</h3>
                    <p data-reveal style={{ "--i": 1 } as Style}>
                      {f.blurb}
                    </p>
                    <p
                      className="feature-facts"
                      data-reveal
                      style={{ "--i": 2 } as Style}
                    >
                      {facts(project)}
                      {updated(project) ? (
                        <>
                          <br />
                          Updated {updated(project)}
                        </>
                      ) : null}
                    </p>
                    <p
                      className="feature-links"
                      data-reveal
                      style={{ "--i": 3 } as Style}
                    >
                      {demo ? (
                        <a className="text-link" href={demo}>
                          Open {demoLabel(demo)}
                        </a>
                      ) : null}
                      <a className="text-link" href={project.url}>
                        Read the source
                      </a>
                    </p>
                  </div>
                  <figure
                    className="feature-picture"
                    data-reveal
                    style={
                      { "--i": 1, "--focus": f.focus ?? "50% 0%" } as Style
                    }
                  >
                    <Crossfade
                      frames={f.frames}
                      width={f.width}
                      height={f.height}
                    />
                  </figure>
                </article>
              );
            })}
          </section>
        ) : null}

        <section
          className="index wrap"
          id="projects"
          aria-labelledby="projects-title"
        >
          <div className="index-head">
            <h2 id="projects-title" className="section-title" data-reveal>
              Every repository
            </h2>
            <p className="index-live" data-reveal style={{ "--i": 1 } as Style}>
              <span
                className={live ? "live-dot is-live" : "live-dot"}
                aria-hidden="true"
              />
              {live
                ? `Live from GitHub, checked every minute. ${projects.length} public repositories.`
                : `${projects.length} public repositories.`}
            </p>
          </div>

          <div
            className="search"
            data-ui
            data-reveal
            style={{ "--i": 2 } as Style}
          >
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects"
              aria-label="Search projects by name, language or licence"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <p className="examples" data-reveal style={{ "--i": 3 } as Style}>
            <span>Try</span>
            {examples.map((ex) => (
              <button
                key={ex}
                type="button"
                aria-pressed={query === ex}
                onClick={() => setQuery(query === ex ? "" : ex)}
              >
                {ex}
              </button>
            ))}
          </p>

          {matches.length ? (
            <ul className="rows" aria-live="polite">
              {matches.map((project, i) => {
                const demo = demoUrl(project);
                return (
                  <li
                    key={project.name}
                    className="row"
                    data-reveal
                    style={{ "--i": Math.min(i, 8) } as Style}
                  >
                    <span
                      className="row-dot"
                      aria-hidden="true"
                      style={{
                        background:
                          (project.language &&
                            LANGUAGE_COLOURS[project.language]) ||
                          "var(--ink-3)",
                      }}
                    />
                    <div className="row-main">
                      <a className="row-name" href={project.url}>
                        {project.name}
                      </a>
                      <span className="row-desc">{project.description}</span>
                      <span className="row-facts">
                        {facts(project)}
                        {demo ? (
                          <>
                            {", "}
                            <a href={demo}>live demo</a>
                          </>
                        ) : null}
                      </span>
                    </div>
                    <span className="row-date">
                      {updated(project) ? (
                        <time dateTime={project.pushedAt ?? undefined}>
                          {updated(project)}
                        </time>
                      ) : null}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="rows-empty">
              Nothing matches “{query}”.{" "}
              <button type="button" onClick={() => setQuery("")}>
                Show every project
              </button>
            </p>
          )}
        </section>

        <section
          className="contact wrap"
          id="contact"
          aria-labelledby="contact-title"
        >
          <h2 id="contact-title" className="section-title" data-reveal>
            Tell us what you need
          </h2>
          <p
            className="contact-intro"
            data-reveal
            style={{ "--i": 1 } as Style}
          >
            Using one of these, found a bug, or want to help build the next one?
            Write a line and we will read it.
          </p>
          <form
            className="contact-form"
            onSubmit={sendMessage}
            data-reveal
            style={{ "--i": 2 } as Style}
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="A bug, an idea, a question…"
              aria-label="Your message"
            />
            <button type="submit" aria-label="Write the email">
              <Arrow />
            </button>
          </form>
          <p className="contact-note" data-reveal style={{ "--i": 3 } as Style}>
            This opens an email to {site.email} with your message in it.
          </p>
          <dl
            className="contact-ways"
            data-reveal
            style={{ "--i": 4 } as Style}
          >
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </dd>
            </div>
            <div>
              <dt>Bugs and code</dt>
              <dd>
                <a href={site.github}>github.com/{site.githubOrg}</a>
              </dd>
            </div>
            <div>
              <dt>Sponsor</dt>
              <dd>
                <a href={site.donate}>GitHub Sponsors</a>
              </dd>
            </div>
          </dl>
        </section>
      </main>

      <footer className="footer" aria-label="Site footer">
        <div className="tile tile-statement">
          <p>
            {site.org} builds software in the {site.location}. This is the part
            we give away.
          </p>
          <p className="tile-small">
            © {site.orgLegal} Each project carries its own licence.
          </p>
        </div>
        <nav className="tile tile-nav" aria-label="Footer">
          <a href="#projects">Projects</a>
          <button type="button" onClick={onOpenTerminal}>
            Terminal
          </button>
          <a href={site.mainSite}>estopia.net</a>
          <a href={site.github}>GitHub</a>
        </nav>
        <div className="tile tile-live">
          <p>
            <span
              className={live ? "live-dot is-live" : "live-dot"}
              aria-hidden="true"
            />
            {live ? "Live from GitHub" : "Saved copy of the list"}
          </p>
          <p className="tile-small">
            {projects.length} public repositories, read straight from the
            Estopia organisation.
          </p>
        </div>
        <div className="tile tile-email">
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </div>
        <div className="tile tile-name" aria-hidden="true">
          Estopia
        </div>
        <a className="tile tile-sponsor" href={site.donate}>
          <span>Sponsor our work</span>
          <Arrow />
        </a>
      </footer>
    </div>
  );
}

type Style = React.CSSProperties & Record<`--${string}`, string | number>;
