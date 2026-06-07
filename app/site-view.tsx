"use client";

import { site } from "@/app/lib/site";
import type { Project } from "@/app/lib/projects";

export default function SiteView({
  projects,
  onOpenTerminal,
}: {
  projects: Project[];
  onOpenTerminal: () => void;
}) {
  return (
    <div className="site-body">
      <section className="site-hero">
        <p className="site-eyebrow">{site.orgLegal}</p>
        <h1 className="site-title">Open Source</h1>
        <p className="site-lead">{site.description}</p>
        <div className="site-cta">
          <a
            className="site-btn site-btn-primary"
            href={site.donate}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span aria-hidden="true">♥</span> Donate
          </a>
          <a
            className="site-btn"
            href={site.mainSite}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit main site <span aria-hidden="true">↗</span>
          </a>
          <a
            className="site-btn"
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub <span aria-hidden="true">↗</span>
          </a>
          <button
            type="button"
            className="site-btn site-btn-ghost"
            onClick={onOpenTerminal}
          >
            <span aria-hidden="true">❯_</span> Open the terminal
          </button>
        </div>
      </section>

      <section className="site-section">
        <h2 className="site-h2">
          Projects <span className="site-count">{projects.length}</span>
        </h2>
        <div className="site-grid">
          {projects.map((p) => (
            <a
              key={p.name}
              className="site-card"
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="site-card-name">{p.name}</span>
              <span className="site-card-desc">{p.description}</span>
              <span className="site-card-meta">
                {p.language ? (
                  <span className="site-tag">{p.language}</span>
                ) : null}
                {p.license ? (
                  <span className="site-tag site-tag-dim">{p.license}</span>
                ) : null}
                {p.stars > 0 ? (
                  <span className="site-tag site-tag-dim">★ {p.stars}</span>
                ) : null}
                <span className="site-card-go">View on GitHub →</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <span>
          © {new Date().getFullYear()} {site.orgLegal}
        </span>
        <span className="site-footer-links">
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <a href={site.mainSite} target="_blank" rel="noopener noreferrer">
            {site.mainSite.replace("https://", "")}
          </a>
        </span>
      </footer>
    </div>
  );
}
