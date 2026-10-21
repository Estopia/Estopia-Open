import { site } from "./site";

export type Project = {
  name: string;
  description: string;
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  license: string | null;
  /** ISO time of the last push to the repo, or null when unknown. */
  pushedAt: string | null;
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
  pushed_at: string | null;
};

// Repos that should never be listed (org meta, forks handled separately).
const HIDDEN_REPOS = new Set([".github"]);

// Hosts that belong to this showcase itself. A repo whose GitHub homepage points
// here is just linking back to this site, so it should not get a "demo" button.
const SELF_HOSTS: ReadonlySet<string> = (() => {
  try {
    const host = new URL(site.openSite).hostname.toLowerCase();
    const bare = host.replace(/^www\./, "");
    return new Set([host, bare, `www.${bare}`]);
  } catch {
    return new Set(["open.estopia.net", "www.open.estopia.net"]);
  }
})();

/**
 * The live demo URL for a project, taken from its GitHub repo homepage. Returns
 * null when there is no homepage, it isn't a valid http(s) URL, or it points
 * back at this showcase ({@link site.openSite}).
 */
export function demoUrl(project: Pick<Project, "homepage">): string | null {
  const raw = project.homepage?.trim();
  if (!raw) return null;

  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return null;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  if (SELF_HOSTS.has(parsed.hostname.toLowerCase())) return null;
  return parsed.toString();
}

/** A compact, human-readable label for a demo URL (host + path, no scheme). */
export function demoLabel(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname === "/" ? "" : u.pathname.replace(/\/$/, "");
    return `${u.host}${path}`;
  } catch {
    return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  }
}

// Hand-written descriptions for repos whose GitHub description is empty,
// so the listing always reads well.
const DESCRIPTION_OVERRIDES: Record<string, string> = {
  "Estopia-Open":
    "The open-source home of Estopia Engineering, including the source for this site and its terminal.",
  "contact-page": "A reusable contact page built with Next.js and TypeScript.",
  tools: "A home for small developer tools and utilities. Empty so far.",
  EstopiaWeb: "Estopia's original website, open-sourced and archived.",
  "Apprentice-Atlas":
    "A map-first iPhone app for finding apprenticeships in the UK and Germany.",
};

// Licences GitHub cannot classify (it reports NOASSERTION), named by hand.
const LICENCE_OVERRIDES: Record<string, string> = {
  "Apprentice-Atlas": "PolyForm Noncommercial",
  "Apprentice-Atlas-Web": "PolyForm Noncommercial",
};

// Used when the GitHub API is unreachable (offline builds, rate limits) so the
// page always renders a sensible list.
const FALLBACK_PROJECTS: Project[] = [
  {
    name: "Tessellate",
    description:
      "Privacy-first, 100% client-side image-grid arranger: justified, fixed-scale & masonry layouts with zoom, drag-reorder and PNG/JPG export. React + Vite + TypeScript.",
    url: "https://github.com/Estopia/Tessellate",
    homepage: "https://tessellate.estopia.net",
    language: "TypeScript",
    stars: 0,
    license: "MIT",
    pushedAt: null,
  },
  {
    name: "Apprentice-Atlas",
    description: DESCRIPTION_OVERRIDES["Apprentice-Atlas"],
    url: "https://github.com/Estopia/Apprentice-Atlas",
    homepage: null,
    language: "TypeScript",
    stars: 0,
    license: LICENCE_OVERRIDES["Apprentice-Atlas"],
    pushedAt: null,
  },
  {
    name: "Apprentice-Atlas-Web",
    description:
      "Bilingual marketing and editorial platform for Apprentice Atlas",
    url: "https://github.com/Estopia/Apprentice-Atlas-Web",
    homepage: null,
    language: "TypeScript",
    stars: 0,
    license: LICENCE_OVERRIDES["Apprentice-Atlas-Web"],
    pushedAt: null,
  },
  {
    name: "Estopia-Open",
    description: DESCRIPTION_OVERRIDES["Estopia-Open"],
    url: "https://github.com/Estopia/Estopia-Open",
    homepage: null,
    language: "TypeScript",
    stars: 0,
    license: "MIT",
    pushedAt: null,
  },
  {
    name: "curious.fun",
    description:
      "A collection of tiny open-source web experiments built with Next.js and TailwindCSS. Playful, minimal, and inspired by neal.fun.",
    url: "https://github.com/Estopia/curious.fun",
    homepage: null,
    language: "TypeScript",
    stars: 0,
    license: "MIT",
    pushedAt: null,
  },
  {
    name: "tools",
    description: DESCRIPTION_OVERRIDES["tools"],
    url: "https://github.com/Estopia/tools",
    homepage: null,
    language: null,
    stars: 0,
    license: "GPL-3.0",
    pushedAt: null,
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
    // GitHub reports a licence file it cannot classify as NOASSERTION.
    license:
      repo.license?.spdx_id === "NOASSERTION"
        ? (LICENCE_OVERRIDES[repo.name] ?? "Other")
        : (repo.license?.spdx_id ?? null),
    pushedAt: repo.pushed_at ?? null,
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
      .sort(
        (a, b) =>
          b.stars - a.stars ||
          (b.pushedAt ?? "").localeCompare(a.pushedAt ?? ""),
      );

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
