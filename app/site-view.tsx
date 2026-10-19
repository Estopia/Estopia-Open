"use client";

import { useState } from "react";
import { site } from "@/app/lib/site";
import { demoUrl, type Project } from "@/app/lib/projects";

export default function SiteView({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "stars">("name");
  const [selectedName, setSelectedName] = useState(projects[0]?.name ?? "");
  const languages = Array.from(
    new Set(
      projects.flatMap((project) =>
        project.language ? [project.language] : [],
      ),
    ),
  ).sort((a, b) => a.localeCompare(b));
  const normalizedQuery = query.trim().toLowerCase();
  const visibleProjects = projects
    .filter((project) => {
      const matchesQuery =
        !normalizedQuery ||
        `${project.name} ${project.description}`
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesQuery && (!language || project.language === language);
    })
    .sort((a, b) =>
      sortBy === "stars"
        ? b.stars - a.stars || a.name.localeCompare(b.name)
        : a.name.localeCompare(b.name),
    );
  const selectedProject =
    visibleProjects.find((project) => project.name === selectedName) ??
    visibleProjects[0] ??
    null;

  return (
    <div className="site-body">
      <header className="directory-header">
        <h1 className="site-title">Project directory</h1>
      </header>

      <section className="directory-toolbar" aria-label="Project filters">
        <label className="directory-search">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search projects"
            placeholder="Search projects"
          />
        </label>
        <label className="directory-select">
          <span>Language</span>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            <option value="">All languages</option>
            {languages.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="directory-select">
          <span>Sort</span>
          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value as "name" | "stars")
            }
          >
            <option value="name">Name</option>
            <option value="stars">Most stars</option>
          </select>
        </label>
      </section>

      <div className="directory-layout">
        <section className="directory-list" aria-label="Projects">
          <div className="directory-list-heading">
            <h2>Projects</h2>
            <span>{visibleProjects.length}</span>
          </div>
          {visibleProjects.length ? (
            <div className="directory-rows">
              {visibleProjects.map((project) => (
                <button
                  key={project.name}
                  type="button"
                  className={`directory-row${selectedProject?.name === project.name ? " is-selected" : ""}`}
                  aria-pressed={selectedProject?.name === project.name}
                  onClick={() => setSelectedName(project.name)}
                >
                  <span className="directory-row-title">
                    <span className="directory-row-name">{project.name}</span>
                    {project.stars > 0 ? (
                      <span className="directory-row-stars">
                        ★ {project.stars}
                      </span>
                    ) : null}
                  </span>
                  <span className="directory-row-description">
                    {project.description}
                  </span>
                  <span className="directory-row-meta">
                    {project.language ?? "Other"}
                    {project.license ? ` · ${project.license}` : ""}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="directory-empty">No projects match those filters.</p>
          )}
        </section>

        {selectedProject ? (
          <aside className="directory-detail" aria-live="polite">
            <p className="directory-detail-label">Selected project</p>
            <h2>{selectedProject.name}</h2>
            <p className="directory-detail-description">
              {selectedProject.description}
            </p>
            <dl className="directory-facts">
              <div>
                <dt>Language</dt>
                <dd>{selectedProject.language ?? "Not listed"}</dd>
              </div>
              <div>
                <dt>Licence</dt>
                <dd>{selectedProject.license ?? "Not listed"}</dd>
              </div>
              {selectedProject.stars > 0 ? (
                <div>
                  <dt>GitHub stars</dt>
                  <dd>{selectedProject.stars}</dd>
                </div>
              ) : null}
            </dl>
            <div className="directory-actions">
              {demoUrl(selectedProject) ? (
                <a
                  className="directory-action directory-action-primary"
                  href={demoUrl(selectedProject)!}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Live demo <span aria-hidden="true">↗</span>
                </a>
              ) : null}
              <a
                className="directory-action"
                href={selectedProject.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View source <span aria-hidden="true">↗</span>
              </a>
            </div>
          </aside>
        ) : (
          <aside className="directory-detail directory-detail-empty">
            <p className="directory-detail-label">Project details</p>
            <h2>No projects found</h2>
            <p className="directory-detail-description">
              Try another name or clear the language filter.
            </p>
          </aside>
        )}
      </div>
    </div>
  );
}
