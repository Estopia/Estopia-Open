import { site } from "./site";

export type Project = {
  name: string;
  description: string;
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  license: string | null;
};

type GitHubRepo = {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  archived: boolean;
  license: { spdx_id: string | null } | null;
};

// Repos that should never be listed (org meta, forks handled separately).
const HIDDEN_REPOS = new Set([".github"]);

// Hand-written descriptions for repos whose GitHub description is empty,
// so the listing always reads well.
const DESCRIPTION_OVERRIDES: Record<string, string> = {
  "Estopia-Open":
    "The open-source home of Estopia Engineering — including the source for this very terminal.",
  "contact-page": "A reusable contact page built with Next.js and TypeScript.",
  tools: "A collection of open-source developer tools and utilities.",
  EstopiaWeb: "Estopia's original website — open-sourced and archived.",
};

// Used when the GitHub API is unreachable (offline builds, rate limits) so the
// page always renders a sensible list.
const FALLBACK_PROJECTS: Project[] = [
  {
    name: "Estopia-Open",
    description: DESCRIPTION_OVERRIDES["Estopia-Open"],
    url: "https://github.com/Estopia/Estopia-Open",
    homepage: null,
    language: "TypeScript",
    stars: 0,
    license: "MIT",
  },
  {
    name: "curious.fun",
    description:
      "A collection of tiny open-source web experiments built with Next.js and TailwindCSS — playful, minimal, and inspired by neal.fun.",
    url: "https://github.com/Estopia/curious.fun",
    homepage: null,
    language: "TypeScript",
    stars: 0,
    license: "MIT",
  },
  {
    name: "contact-page",
    description: DESCRIPTION_OVERRIDES["contact-page"],
    url: "https://github.com/Estopia/contact-page",
    homepage: null,
    language: "TypeScript",
    stars: 0,
    license: null,
  },
  {
    name: "tools",
    description: DESCRIPTION_OVERRIDES["tools"],
    url: "https://github.com/Estopia/tools",
    homepage: null,
    language: null,
    stars: 0,
    license: "GPL-3.0",
  },
  {
    name: "EstopiaWeb",
    description: DESCRIPTION_OVERRIDES["EstopiaWeb"],
    url: "https://github.com/Estopia/EstopiaWeb",
    homepage: null,
    language: "HTML",
    stars: 0,
    license: null,
  },
];

function toProject(repo: GitHubRepo): Project {
  const description =
    repo.description?.trim() ||
    DESCRIPTION_OVERRIDES[repo.name] ||
    "No description provided.";

  return {
    name: repo.name,
    description,
    url: repo.html_url,
    homepage: repo.homepage?.trim() ? repo.homepage.trim() : null,
    language: repo.language,
    stars: repo.stargazers_count,
    license: repo.license?.spdx_id ?? null,
  };
}

/**
 * How long (seconds) GitHub data is cached server-side before a background
 * refresh. This throttles calls to GitHub's unauthenticated API (60 req/hour
 * per IP) to at most one per window, shared across every visitor — so the live
 * polling below stays comfortably within the rate limit.
 */
export const REVALIDATE_SECONDS = 60;

export type ProjectsResult = {
  projects: Project[];
  /** true when the list came from GitHub, false when the fallback was used. */
  live: boolean;
  fetchedAt: number;
};

/**
 * Fetches Estopia's public, non-fork repositories from GitHub. Falls back to a
 * curated static list if the API cannot be reached. Cached for
 * {@link REVALIDATE_SECONDS} seconds.
 */
export async function getProjectsResult(): Promise<ProjectsResult> {
  try {
    const res = await fetch(
      `https://api.github.com/orgs/${site.githubOrg}/repos?per_page=100&type=public&sort=pushed`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "estopia-open-source-site",
        },
        next: { revalidate: REVALIDATE_SECONDS },
      },
    );

    if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);

    const data: unknown = await res.json();
    if (!Array.isArray(data)) throw new Error("Unexpected GitHub API response");

    const projects = (data as GitHubRepo[])
      .filter(
        (repo) => !repo.fork && !repo.archived && !HIDDEN_REPOS.has(repo.name),
      )
      .map(toProject)
      .sort((a, b) => b.stars - a.stars);

    if (projects.length === 0) {
      return {
        projects: FALLBACK_PROJECTS,
        live: false,
        fetchedAt: Date.now(),
      };
    }
    return { projects, live: true, fetchedAt: Date.now() };
  } catch {
    return { projects: FALLBACK_PROJECTS, live: false, fetchedAt: Date.now() };
  }
}

export async function getProjects(): Promise<Project[]> {
  return (await getProjectsResult()).projects;
}
