"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { site, prompt } from "@/app/lib/site";
import type { Project, ProjectsResult } from "@/app/lib/projects";
import Terminal from "@/app/terminal";
import SiteView from "@/app/site-view";

type Mode = "terminal" | "site";

const VIEW_KEY = "estopia:view";

// How often the open page re-checks GitHub for project changes. The endpoint is
// server-cached, so this only pulls already-cached data most of the time.
const POLL_MS = 60_000;

function projectsSignature(list: Project[]): string {
  return list
    .map(
      (p) =>
        `${p.name}|${p.description}|${p.stars}|${p.language}|${p.license}|${p.pushedAt}|${p.homepage}`,
    )
    .join("\n");
}

// --- persisted view mode, exposed as an external store (no setState-in-effect)
const modeListeners = new Set<() => void>();

function readMode(): Mode {
  try {
    return localStorage.getItem(VIEW_KEY) === "terminal" ? "terminal" : "site";
  } catch {
    return "terminal";
  }
}

function writeMode(mode: Mode) {
  try {
    localStorage.setItem(VIEW_KEY, mode);
  } catch {
    /* ignore */
  }
  modeListeners.forEach((l) => l());
}

function subscribeMode(cb: () => void) {
  modeListeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === VIEW_KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    modeListeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export default function AppShell({
  projects: initialProjects,
  initialLive = false,
}: {
  projects: Project[];
  /** Whether the server read the list from GitHub (not the saved fallback). */
  initialLive?: boolean;
}) {
  const mode = useSyncExternalStore(
    subscribeMode,
    readMode,
    () => "site" as Mode,
  );

  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [live, setLive] = useState(initialLive);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [maximized, setMaximized] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [dragging, setDragging] = useState(false);

  const windowRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    x: number;
    y: number;
    bx: number;
    by: number;
    rect: DOMRect;
  } | null>(null);

  // Live updates: poll our own (server-cached) endpoint and refresh the list
  // when GitHub changes — without a page reload. We never downgrade a good list
  // to the offline fallback, so transient API hiccups don't cause flicker.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function refresh() {
      try {
        const res = await fetch("/api/projects", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as ProjectsResult;
        if (cancelled || !data?.live || !Array.isArray(data.projects)) return;
        setLive(true);
        setProjects((prev) =>
          projectsSignature(prev) === projectsSignature(data.projects)
            ? prev
            : data.projects,
        );
      } catch {
        /* keep showing the current list */
      }
    }

    function schedule() {
      timer = setTimeout(async () => {
        if (document.visibilityState === "visible") await refresh();
        schedule();
      }, POLL_MS);
    }

    void refresh();
    schedule();

    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);

  function setMode(next: Mode | ((m: Mode) => Mode)) {
    writeMode(typeof next === "function" ? next(mode) : next);
  }

  // ---- window controls ----------------------------------------------------

  function minimize() {
    setMinimized(true);
  }

  function toggleMaximize() {
    setMinimized(false);
    setMaximized((m) => !m);
    setPos({ x: 0, y: 0 });
  }

  function close() {
    setMaximized(false);
    setPos({ x: 0, y: 0 });
    setMinimized(true);
  }

  function restore() {
    if (minimized) setMinimized(false);
  }

  function openTerminal() {
    setMinimized(false);
    setMaximized(true);
    setPos({ x: 0, y: 0 });
    setMode("terminal");
    window.scrollTo(0, 0);
  }

  // Leaving the shell lands on the project list.
  function backToPage(toProjects = false) {
    setMode("site");
    if (toProjects) {
      window.setTimeout(() => {
        document.getElementById("projects")?.scrollIntoView({ block: "start" });
      }, 60);
    }
  }

  // ---- dragging -----------------------------------------------------------

  function onPointerDown(e: React.PointerEvent<HTMLElement>) {
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, .no-drag")) return;
    if (minimized) {
      restore();
      return;
    }
    if (maximized) return;
    const win = windowRef.current;
    if (!win) return;
    drag.current = {
      x: e.clientX,
      y: e.clientY,
      bx: pos.x,
      by: pos.y,
      rect: win.getBoundingClientRect(),
    };
    setDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  function onPointerMove(e: React.PointerEvent<HTMLElement>) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    let nx = d.bx + dx;
    let ny = d.by + dy;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const KEEP = 120;
    const predLeft = d.rect.left + (nx - d.bx);
    const predTop = d.rect.top + (ny - d.by);
    const minLeft = KEEP - d.rect.width;
    const maxLeft = vw - KEEP;
    if (predLeft < minLeft) nx += minLeft - predLeft;
    if (predLeft > maxLeft) nx -= predLeft - maxLeft;
    if (predTop < 0) ny += 0 - predTop;
    if (predTop > vh - 48) ny -= predTop - (vh - 48);

    setPos({ x: nx, y: ny });
  }

  function onPointerUp(e: React.PointerEvent<HTMLElement>) {
    drag.current = null;
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  // ---- render -------------------------------------------------------------

  function renderControls() {
    return (
      <div className="win-controls win-ctl-mac no-drag">
        <button
          className="wc wc-close"
          onClick={close}
          aria-label="Close"
          title="Close"
        />
        <button
          className="wc wc-min"
          onClick={minimize}
          aria-label="Minimize"
          title="Minimize"
        />
        <button
          className="wc wc-max"
          onClick={toggleMaximize}
          aria-label={maximized ? "Restore" : "Zoom"}
          title={maximized ? "Restore" : "Zoom"}
        />
      </div>
    );
  }

  if (mode === "site") {
    return (
      <SiteView projects={projects} live={live} onOpenTerminal={openTerminal} />
    );
  }

  const titleName = `${prompt.user}@${prompt.host}: ${prompt.path}`;

  const windowClass = [
    "window",
    maximized ? "maximized" : "",
    minimized ? "minimized" : "",
    dragging ? "dragging" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className="term-page">
      <h1 className="sr-only">{site.org} open source, terminal</h1>
      <div
        ref={windowRef}
        className={windowClass}
        style={
          maximized
            ? undefined
            : { transform: `translate(${pos.x}px, ${pos.y}px)` }
        }
      >
        <header
          className="titlebar"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onDoubleClick={toggleMaximize}
        >
          {renderControls()}

          <span className="titlebar-name" title={titleName}>
            {titleName}
          </span>

          <nav className="toolbar no-drag" aria-label="Primary">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => backToPage()}
            >
              Back to page
            </button>
            <a className="btn" href={site.donate}>
              Sponsor
            </a>
            <a className="btn btn-hide-sm" href={site.github}>
              GitHub
            </a>
          </nav>
        </header>

        <Terminal projects={projects} onExit={() => backToPage(true)} />

        <footer className="statusbar">
          <span className="statusbar-org">
            <span
              className={live ? "live-dot is-live" : "live-dot"}
              aria-hidden="true"
            />
            {site.org}
            <span className="sr-only">
              {live ? " — live, updates automatically" : ""}
            </span>
          </span>
          <span className="statusbar-hint">
            {projects.length} repos, type <code>help</code>
          </span>
          <a href={`mailto:${site.email}`} className="statusbar-link">
            {site.email}
          </a>
        </footer>
      </div>
    </main>
  );
}
