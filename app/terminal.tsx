"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode, KeyboardEvent as ReactKeyboardEvent } from "react";
import { site, prompt } from "@/app/lib/site";
import type { Project } from "@/app/lib/projects";

const BANNER = `███████╗███████╗████████╗ ██████╗ ██████╗ ██╗ █████╗ 
██╔════╝██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗██║██╔══██╗
█████╗  ███████╗   ██║   ██║   ██║██████╔╝██║███████║
██╔══╝  ╚════██║   ██║   ██║   ██║██╔═══╝ ██║██╔══██║
███████╗███████║   ██║   ╚██████╔╝██║     ██║██║  ██║
╚══════╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝`;

const NEO_LOGO = `█████ 
█     
████  
█     
█████ `;

const BLANK: ReactNode = "\u00A0";

const HOME = prompt.path; // "~/open-source"
const PROJECTS_DIR = `${HOME}/projects`;

// Module-scope so the impure `Date.now` is not in the component body (keeps the
// React-compiler purity lint happy; these are only ever called from effects /
// event handlers, never during render).
function nowMs(): number {
  return Date.now();
}

type Command = { name: string; args?: string; desc: string };

const SITE_COMMANDS: Command[] = [
  { name: "help", desc: "List the available commands" },
  { name: "about", desc: "What is Estopia Engineering?" },
  { name: "projects", desc: "List our open-source projects" },
  { name: "open", args: "<n|name>", desc: "Open a project on GitHub" },
  { name: "donate", desc: "Support our work via GitHub Sponsors" },
  { name: "site", desc: "Visit our main website" },
  { name: "github", desc: "Open our GitHub organisation" },
  { name: "contact", desc: "How to get in touch" },
  { name: "gui", desc: "Switch to the normal website view" },
  { name: "banner", desc: "Reprint the Estopia banner" },
];

const SYS_COMMANDS: Command[] = [
  { name: "ls", args: "[-l] [dir]", desc: "List directory contents" },
  { name: "cd", args: "<dir>", desc: "Change the current directory" },
  { name: "pwd", desc: "Print the working directory" },
  { name: "cat", args: "<file>", desc: "Print the contents of a file" },
  { name: "neofetch", desc: "Show system information" },
  { name: "uname", args: "[-a]", desc: "Print system information" },
  { name: "whoami", desc: "Print the current user" },
  { name: "hostname", desc: "Print the hostname" },
  { name: "uptime", desc: "How long this session has been up" },
  { name: "history", desc: "Show command history" },
  { name: "man", args: "<cmd>", desc: "Show the manual for a command" },
  { name: "which", args: "<cmd>", desc: "Locate a command" },
  { name: "date", desc: "Print the current date and time" },
  { name: "echo", args: "<text>", desc: "Print a line of text" },
  { name: "clear", desc: "Clear the screen" },
  { name: "exit", desc: "Leave the shell (opens the desktop view)" },
];

const ALL_COMMANDS = [...SITE_COMMANDS, ...SYS_COMMANDS];

const ALIASES = ["ls", "sponsor", "home", "repos", "cls", "logout", "logo"];

const ALL_NAMES = Array.from(
  new Set([...ALL_COMMANDS.map((c) => c.name), ...ALIASES]),
).sort();

function Prompt({ path }: { path: string }) {
  return (
    <span className="t-prompt">
      <span className="t-user">
        {prompt.user}@{prompt.host}
      </span>
      <span className="t-sep">:</span>
      <span className="t-path">{path}</span>
      <span className="t-dollar">$ </span>
    </span>
  );
}

export default function Terminal({
  projects,
  onExit,
}: {
  projects: Project[];
  onExit: () => void;
}) {
  const [lines, setLines] = useState<{ id: number; node: ReactNode }[]>([]);
  const [input, setInput] = useState("");
  const [booted, setBooted] = useState(false);
  const [histPos, setHistPos] = useState<number | null>(null);
  const [cwd, setCwd] = useState<string>(HOME);

  const idRef = useRef(0);
  const historyRef = useRef<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const bootTimeRef = useRef(0);
  const projectsSigRef = useRef<string | null>(null);

  function pushLine(node: ReactNode) {
    setLines((prev) => [...prev, { id: idRef.current++, node }]);
  }

  function pushLines(nodes: ReactNode[]) {
    setLines((prev) => [
      ...prev,
      ...nodes.map((node) => ({ id: idRef.current++, node })),
    ]);
  }

  function openLink(url: string) {
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  // Boot sequence: reveal a few lines, then enable the prompt.
  useEffect(() => {
    bootTimeRef.current = nowMs();
    const boot: ReactNode[] = [
      <pre
        key="b"
        className="t-banner"
        aria-label={`${site.org} — open source`}
      >
        {BANNER}
      </pre>,
      BLANK,
      <span key="v" className="t-dim">
        {site.org} · open-source projects
      </span>,
      BLANK,
      <span key="intro">
        This is an interactive terminal. Type a command and press{" "}
        <span className="t-cmd">Enter</span>.
      </span>,
      BLANK,
      <span key="qs" className="t-accent">
        Quick start
      </span>,
      <span key="q1">
        <span className="t-cmd">{"projects".padEnd(11)}</span>
        <span className="t-dim">list everything we have open-sourced</span>
      </span>,
      <span key="q2">
        <span className="t-cmd">{"open 1".padEnd(11)}</span>
        <span className="t-dim">
          open a project on GitHub (by number or name)
        </span>
      </span>,
      <span key="q3">
        <span className="t-cmd">{"donate".padEnd(11)}</span>
        <span className="t-dim">support our work via GitHub Sponsors</span>
      </span>,
      <span key="q4">
        <span className="t-cmd">{"help".padEnd(11)}</span>
        <span className="t-dim">see the full list of commands</span>
      </span>,
      BLANK,
      <span key="tabhint" className="t-dim">
        Tip: start typing and press <span className="t-cmd">Tab</span> (or{" "}
        <span className="t-cmd">→</span>) to autocomplete.
      </span>,
      <span key="hint" className="t-dim">
        Prefer a normal website? Click{" "}
        <span className="t-accent">▦ Simple view</span> in the title bar (or
        type <span className="t-cmd">gui</span>).
      </span>,
      BLANK,
    ];

    const timers: ReturnType<typeof setTimeout>[] = [];
    boot.forEach((node, i) => {
      timers.push(
        setTimeout(() => {
          setLines((prev) => [...prev, { id: idRef.current++, node }]);
        }, i * 110),
      );
    });
    timers.push(
      setTimeout(
        () => {
          setBooted(true);
          inputRef.current?.focus();
        },
        boot.length * 110 + 60,
      ),
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  // Keep the latest output in view.
  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [lines, booted]);

  // Focus the prompt once it is rendered.
  useEffect(() => {
    if (booted) inputRef.current?.focus();
  }, [booted]);

  // Notify (subtly) when the live project list changes while the shell is open.
  useEffect(() => {
    const sig = projects.map((p) => p.name).join("|");
    if (projectsSigRef.current === null) {
      projectsSigRef.current = sig;
      return;
    }
    if (sig === projectsSigRef.current) return;
    projectsSigRef.current = sig;
    if (!booted) return;
    const id = setTimeout(() => {
      pushLine(
        <span className="t-dim">
          ✷ project list updated — type <span className="t-cmd">projects</span>{" "}
          to view it.
        </span>,
      );
    }, 0);
    return () => clearTimeout(id);
  }, [projects, booted]);

  function uptimeStr() {
    const base = bootTimeRef.current || nowMs();
    const s = Math.max(1, Math.round((nowMs() - base) / 1000));
    if (s < 60) return `${s} sec`;
    const m = Math.floor(s / 60);
    return `${m} min ${s % 60} sec`;
  }

  // ---- output builders ----------------------------------------------------

  function helpLines(): ReactNode[] {
    const out: ReactNode[] = [
      <span key="hh" className="t-accent">
        Estopia commands
      </span>,
    ];
    for (const c of SITE_COMMANDS) {
      const label = (c.args ? `${c.name} ${c.args}` : c.name).padEnd(18, " ");
      out.push(
        <span key={`s-${c.name}`}>
          <span className="t-accent">{label}</span>
          <span className="t-dim">{c.desc}</span>
        </span>,
      );
    }
    out.push(BLANK);
    out.push(
      <span key="sh" className="t-accent">
        System commands
      </span>,
    );
    for (const c of SYS_COMMANDS) {
      const label = (c.args ? `${c.name} ${c.args}` : c.name).padEnd(18, " ");
      out.push(
        <span key={`y-${c.name}`}>
          <span className="t-accent">{label}</span>
          <span className="t-dim">{c.desc}</span>
        </span>,
      );
    }
    out.push(BLANK);
    out.push(
      <span key="tip" className="t-dim">
        Tab / → completes · ↑/↓ history · Ctrl+L clear ·{" "}
        <span className="t-cmd">man {"<cmd>"}</span> for details
      </span>,
    );
    return out;
  }

  function aboutLines(): ReactNode[] {
    return [
      <span key="a1" className="t-accent">
        {site.orgLegal}
      </span>,
      BLANK,
      <span key="a2">
        {site.org} is a software studio based in {site.location}. We build
        products and tools, and open-source the pieces we think others can learn
        from or build on.
      </span>,
      BLANK,
      <span key="a3" className="t-dim">
        This terminal is itself open source — run{" "}
        <span className="t-cmd">github</span> to browse the code.
      </span>,
      BLANK,
      <span key="a4">
        <span className="t-dim">web: </span>
        <button className="t-link" onClick={() => openLink(site.mainSite)}>
          {site.mainSite}
        </button>
      </span>,
      <span key="a5">
        <span className="t-dim">code: </span>
        <button className="t-link" onClick={() => openLink(site.github)}>
          {site.github}
        </button>
      </span>,
      <span key="a6">
        <span className="t-dim">email: </span>
        <a className="t-link" href={`mailto:${site.email}`}>
          {site.email}
        </a>
      </span>,
    ];
  }

  function projectRow(p: Project, i: number): ReactNode {
    const idx = String(i + 1).padStart(2, " ");
    return (
      <span key={`pr-${p.name}`}>
        <span className="t-dim">{idx}. </span>
        <button className="t-link" onClick={() => openLink(p.url)}>
          {p.name}
        </button>
        {p.language ? <span className="t-meta"> · {p.language}</span> : null}
        {p.license ? <span className="t-meta"> · {p.license}</span> : null}
        {p.stars > 0 ? <span className="t-meta"> · ★ {p.stars}</span> : null}
      </span>
    );
  }

  function projectLines(): ReactNode[] {
    const out: ReactNode[] = [
      <span key="ph" className="t-accent">
        {site.org} — {projects.length} open-source{" "}
        {projects.length === 1 ? "project" : "projects"}
      </span>,
      BLANK,
    ];
    projects.forEach((p, i) => {
      out.push(projectRow(p, i));
      out.push(
        <span
          key={`pd-${p.name}`}
          className="t-desc"
        >{`    ${p.description}`}</span>,
      );
    });
    out.push(BLANK);
    out.push(
      <span key="pt" className="t-dim">
        Run <span className="t-cmd">{"open <number|name>"}</span> to visit a
        repo on GitHub.
      </span>,
    );
    return out;
  }

  function projectDetail(p: Project): ReactNode[] {
    return [
      <span key="d1" className="t-accent">
        {p.name}
      </span>,
      <span key="d2">{p.description}</span>,
      BLANK,
      <span key="d3">
        <span className="t-dim">language: </span>
        {p.language ?? "—"}
        <span className="t-dim"> license: </span>
        {p.license ?? "—"}
        <span className="t-dim"> stars: </span>★ {p.stars}
      </span>,
      <span key="d4">
        <span className="t-dim">url: </span>
        <button className="t-link" onClick={() => openLink(p.url)}>
          {p.url}
        </button>
      </span>,
    ];
  }

  function contactLines(): ReactNode[] {
    return [
      <span key="c1">Get in touch with {site.org}:</span>,
      BLANK,
      <span key="c2">
        <span className="t-dim">email: </span>
        <a className="t-link" href={`mailto:${site.email}`}>
          {site.email}
        </a>
      </span>,
      <span key="c3">
        <span className="t-dim">website: </span>
        <button className="t-link" onClick={() => openLink(site.mainSite)}>
          {site.mainSite}
        </button>
      </span>,
      <span key="c4">
        <span className="t-dim">github: </span>
        <button className="t-link" onClick={() => openLink(site.github)}>
          {site.github}
        </button>
      </span>,
    ];
  }

  function donateFileLines(): ReactNode[] {
    return [
      <span key="do1" className="t-accent">
        Support {site.org} ♥
      </span>,
      BLANK,
      <span key="do2">
        We open-source what we can. If our work helps you, consider sponsoring
        us — it directly funds more open source.
      </span>,
      BLANK,
      <span key="do3">
        <span className="t-dim">sponsor: </span>
        <button className="t-link" onClick={() => openLink(site.donate)}>
          {site.donate}
        </button>
      </span>,
    ];
  }

  function readmeLines(): ReactNode[] {
    return [
      <span key="rm1" className="t-accent">
        # {site.org} — open source
      </span>,
      BLANK,
      <span key="rm2">{site.description}</span>,
      BLANK,
      <span key="rm3" className="t-dim">
        Run <span className="t-cmd">projects</span> to list repos, or{" "}
        <span className="t-cmd">gui</span> for the normal website.
      </span>,
    ];
  }

  function licenseLines(): ReactNode[] {
    return [
      <span key="li1">MIT License</span>,
      <span key="li2" className="t-dim">
        Most Estopia repositories are MIT licensed. See each repo for the exact
        terms.
      </span>,
    ];
  }

  const FILES: Record<string, () => ReactNode[]> = {
    "about.txt": aboutLines,
    "donate.txt": donateFileLines,
    "contact.txt": contactLines,
    "README.md": readmeLines,
    LICENSE: licenseLines,
  };
  const FILE_NAMES = Object.keys(FILES);
  const DIR_NAMES = ["projects"];

  function longRow(perm: string, owner: string, size: string, name: string) {
    return `${perm}  ${owner.padEnd(8)} ${size.padStart(5)}  Jun  7 2026  ${name}`;
  }

  function lsLines(arg: string): ReactNode[] {
    const tokens = arg.split(/\s+/).filter(Boolean);
    const flags = tokens.filter((t) => t.startsWith("-")).join("");
    const targetArg = tokens.find((t) => !t.startsWith("-"));
    const long = flags.includes("l") || flags.includes("a");

    let dir = cwd;
    if (targetArg === "projects" || targetArg === "projects/")
      dir = PROJECTS_DIR;
    else if (targetArg && targetArg !== "." && targetArg !== HOME) {
      return [
        <span key="e" className="t-err">
          {`ls: cannot access '${targetArg}': No such file or directory`}
        </span>,
      ];
    }

    if (dir === PROJECTS_DIR) {
      if (!long) {
        return [
          <span key="lp" className="t-line">
            {projects.map((p) => (
              <button
                key={p.name}
                className="t-link"
                onClick={() => openLink(p.url)}
              >
                {p.name}
                {"  "}
              </button>
            ))}
          </span>,
        ];
      }
      const out: ReactNode[] = [
        <span key="t" className="t-dim">{`total ${projects.length}`}</span>,
      ];
      projects.forEach((p) => {
        out.push(
          <span key={`pl-${p.name}`}>
            <span className="t-dim">
              {longRow("-rw-r--r--", prompt.user, String(p.stars), "")}
            </span>
            <button className="t-link" onClick={() => openLink(p.url)}>
              {p.name}
            </button>
          </span>,
        );
      });
      return out;
    }

    // base directory
    if (!long) {
      return [
        <span key="lb" className="t-line">
          {DIR_NAMES.map((d) => (
            <span key={d} className="t-dir">
              {d}/{"  "}
            </span>
          ))}
          {FILE_NAMES.map((f) => (
            <span key={f}>
              {f}
              {"  "}
            </span>
          ))}
        </span>,
      ];
    }
    const out: ReactNode[] = [
      <span key="t" className="t-dim">{`total ${
        DIR_NAMES.length + FILE_NAMES.length
      }`}</span>,
    ];
    DIR_NAMES.forEach((d) =>
      out.push(
        <span key={`dl-${d}`}>
          <span className="t-dim">
            {longRow("drwxr-xr-x", prompt.user, "-", "")}
          </span>
          <span className="t-dir">{d}/</span>
        </span>,
      ),
    );
    FILE_NAMES.forEach((f) =>
      out.push(
        <span key={`fl-${f}`} className="t-dim">
          {longRow("-rw-r--r--", prompt.user, "1k", f)}
        </span>,
      ),
    );
    return out;
  }

  function catLines(arg: string): ReactNode[] {
    const name = arg.trim().replace(/^\.\//, "");
    if (!name) {
      return [
        <span key="cu" className="t-err">
          usage: cat {"<file>"}
        </span>,
      ];
    }
    if (cwd === HOME && FILES[name]) return FILES[name]();

    let projName: string | null = null;
    if (name.startsWith("projects/")) projName = name.slice("projects/".length);
    else if (cwd === PROJECTS_DIR) projName = name;
    if (projName) {
      const pn = projName;
      const p = projects.find((x) => x.name.toLowerCase() === pn.toLowerCase());
      if (p) return projectDetail(p);
    }
    return [
      <span key="cn" className="t-err">
        {`cat: ${name}: No such file or directory`}
      </span>,
    ];
  }

  function changeDir(arg: string): ReactNode[] {
    const t = arg.trim();
    if (!t || t === "~" || t === HOME || t === "/") {
      setCwd(HOME);
      return [];
    }
    if (t === ".." || t === "../") {
      setCwd(HOME);
      return [];
    }
    if (t === "projects" || t === "projects/" || t === PROJECTS_DIR) {
      setCwd(PROJECTS_DIR);
      return [];
    }
    if (t === ".") return [];
    return [
      <span key="cde" className="t-err">
        {`cd: no such file or directory: ${t}`}
      </span>,
    ];
  }

  function neofetchNode(): ReactNode {
    return (
      <div className="t-neofetch" key="neo">
        <pre className="t-neo-logo">{NEO_LOGO}</pre>
        <div className="t-neo-info">
          <span className="t-accent">
            {prompt.user}@{prompt.host}
          </span>
          <span className="t-dim">-----------------</span>
          <span>
            <span className="t-meta">OS</span>: EstopiaOS 1.0.0 x86_64
          </span>
          <span>
            <span className="t-meta">Host</span>:{" "}
            {site.mainSite.replace("https://", "")}
          </span>
          <span>
            <span className="t-meta">Kernel</span>: esh-1.0.0
          </span>
          <span>
            <span className="t-meta">Uptime</span>: {uptimeStr()}
          </span>
          <span>
            <span className="t-meta">Shell</span>: estopia-shell
          </span>
          <span>
            <span className="t-meta">Projects</span>: {projects.length}
          </span>
          <span>
            <span className="t-meta">Theme</span>: terminal{" "}
            <span className="t-dim">(type &apos;gui&apos; for desktop)</span>
          </span>
          <span className="t-neo-colors" aria-hidden="true">
            {[
              "#4ade80",
              "#5eead4",
              "#56b6ff",
              "#7aa2ff",
              "#fbbf24",
              "#f87171",
            ].map((c) => (
              <span key={c} className="t-neo-sq" style={{ background: c }} />
            ))}
          </span>
        </div>
      </div>
    );
  }

  function manLines(arg: string): ReactNode[] {
    const q = arg.trim();
    const c = ALL_COMMANDS.find((x) => x.name === q);
    if (!c) {
      return [
        <span key="mn" className="t-err">
          {`No manual entry for ${q || "?"}`}
        </span>,
      ];
    }
    return [
      <span key="m1" className="t-accent">
        {c.name.toUpperCase()}(1)
      </span>,
      <span key="m2">
        <span className="t-dim">NAME</span>
      </span>,
      <span key="m3">{`    ${c.name} — ${c.desc}`}</span>,
      BLANK,
      <span key="m4">
        <span className="t-dim">SYNOPSIS</span>
      </span>,
      <span key="m5" className="t-cmd">{`    ${c.name}${
        c.args ? " " + c.args : ""
      }`}</span>,
    ];
  }

  function historyLines(): ReactNode[] {
    if (historyRef.current.length === 0) {
      return [
        <span key="h0" className="t-dim">
          no history yet
        </span>,
      ];
    }
    return historyRef.current.map((h, i) => (
      <span key={`h-${i}`}>
        <span className="t-dim">{String(i + 1).padStart(3, " ")} </span>
        {h}
      </span>
    ));
  }

  // ---- command dispatch ---------------------------------------------------

  function execute(line: string) {
    const [rawCmd, ...rest] = line.split(/\s+/);
    const cmd = (rawCmd ?? "").toLowerCase();
    const arg = rest.join(" ");

    switch (cmd) {
      case "":
        break;
      case "help":
      case "?":
      case "commands":
        pushLines(helpLines());
        break;
      case "about":
      case "whois":
        pushLines(aboutLines());
        break;
      case "projects":
      case "repos":
      case "list":
        pushLines(projectLines());
        break;
      case "open":
        pushLines(openProject(arg));
        break;
      case "donate":
      case "sponsor":
      case "support":
        openLink(site.donate);
        pushLine(
          <span>
            opening GitHub Sponsors{" "}
            <span className="t-dim">→ {site.donate}</span> — thank you ♥
          </span>,
        );
        break;
      case "site":
      case "home":
      case "web":
      case "website":
        openLink(site.mainSite);
        pushLine(
          <span>
            opening {site.org} <span className="t-dim">→ {site.mainSite}</span>
          </span>,
        );
        break;
      case "github":
      case "repo":
      case "source":
      case "git":
        openLink(site.github);
        pushLine(
          <span>
            opening GitHub <span className="t-dim">→ {site.github}</span>
          </span>,
        );
        break;
      case "contact":
      case "email":
        pushLines(contactLines());
        break;
      case "ls":
      case "dir":
        pushLines(lsLines(arg));
        break;
      case "cd":
        pushLines(changeDir(arg));
        break;
      case "pwd":
        pushLine(<span>{cwd.replace("~", `/home/${prompt.user}`)}</span>);
        break;
      case "cat":
      case "less":
      case "more":
        pushLines(catLines(arg));
        break;
      case "neofetch":
      case "fetch":
        pushLine(neofetchNode());
        break;
      case "uname":
        pushLine(
          <span>
            {arg.includes("-a")
              ? "EstopiaOS estopia 1.0.0 #1 SMP x86_64 GNU/Linux"
              : "EstopiaOS"}
          </span>,
        );
        break;
      case "hostname":
        pushLine(<span>{prompt.host}</span>);
        break;
      case "uptime":
        pushLine(
          <span>up {uptimeStr()}, 1 user, load average: 0.07, 0.05, 0.01</span>,
        );
        break;
      case "history":
        pushLines(historyLines());
        break;
      case "man":
        pushLines(manLines(arg));
        break;
      case "which":
        pushLine(
          ALL_NAMES.includes(arg.trim()) ? (
            <span>/usr/bin/{arg.trim()}</span>
          ) : (
            <span className="t-err">{`which: no ${
              arg.trim() || "?"
            } in (/usr/bin:/bin)`}</span>
          ),
        );
        break;
      case "whoami":
        pushLine(<span>{prompt.user}</span>);
        break;
      case "date":
        pushLine(<span>{new Date().toString()}</span>);
        break;
      case "echo":
        pushLine(<span>{arg || BLANK}</span>);
        break;
      case "clear":
      case "cls":
        setLines([]);
        break;
      case "banner":
      case "logo":
        pushLine(
          <pre className="t-banner" aria-label={`${site.org} — open source`}>
            {BANNER}
          </pre>,
        );
        break;
      case "gui":
      case "exit":
      case "logout":
      case "quit":
        pushLine(
          <span className="t-dim">
            leaving the shell → launching desktop view...
          </span>,
        );
        window.setTimeout(() => onExit(), 320);
        break;
      case "sudo":
        pushLine(
          <span className="t-warn">
            {prompt.user} is not in the sudoers file. This incident will be
            reported.
          </span>,
        );
        break;
      case "rm":
        pushLine(
          <span className="t-warn">
            {arg.includes("-rf") && arg.includes("/")
              ? "rm: nice try — permission denied (and we like our files)."
              : "rm: this is a read-only filesystem."}
          </span>,
        );
        break;
      default:
        pushLine(
          <span className="t-err">
            command not found: {cmd}. Type <span className="t-cmd">help</span>{" "}
            for a list of commands.
          </span>,
        );
    }
  }

  function openProject(arg: string): ReactNode[] {
    const query = arg.trim();
    if (!query) {
      return [
        <span key="ou" className="t-err">
          usage: open {"<number|name>"} — run{" "}
          <span className="t-cmd">projects</span> to see the list.
        </span>,
      ];
    }
    let target: Project | undefined;
    if (/^\d+$/.test(query)) {
      target = projects[Number(query) - 1];
    } else {
      const q = query.toLowerCase();
      target =
        projects.find((p) => p.name.toLowerCase() === q) ??
        projects.find((p) => p.name.toLowerCase().includes(q));
    }
    if (!target) {
      return [
        <span key="on" className="t-err">
          no such project: {query}
        </span>,
      ];
    }
    openLink(target.url);
    return [
      <span key="oo">
        opening <span className="t-accent">{target.name}</span>{" "}
        <span className="t-dim">→ {target.url}</span>
      </span>,
    ];
  }

  // ---- input handling -----------------------------------------------------

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const raw = input;
    const pathAtRun = cwd;
    pushLine(
      <span>
        <Prompt path={pathAtRun} />
        <span className="t-cmd">{raw}</span>
      </span>,
    );
    const trimmed = raw.trim();
    if (trimmed) historyRef.current.push(trimmed);
    setHistPos(null);
    setInput("");
    execute(trimmed);
  }

  // ---- tab completion -----------------------------------------------------

  function completionPool(head: string): string[] {
    switch (head) {
      case "open":
        return projects.map((p) => p.name);
      case "cat":
      case "less":
      case "more":
        return cwd === PROJECTS_DIR ? projects.map((p) => p.name) : FILE_NAMES;
      case "cd":
        return [...DIR_NAMES, ".."];
      case "man":
      case "which":
        return ALL_COMMANDS.map((c) => c.name);
      default:
        return [];
    }
  }

  // Returns the matches for the token currently being typed, plus the part of
  // the line that precedes that token (so a completion can be re-assembled).
  function getCompletion(value: string): {
    lineBeforeFrag: string;
    frag: string;
    matches: string[];
  } {
    const parts = value.split(/\s+/);
    const head = (parts[0] ?? "").toLowerCase();

    if (parts.length <= 1) {
      // completing the command itself
      const frag = parts[0] ?? "";
      const matches = frag
        ? ALL_NAMES.filter((n) => n.startsWith(frag.toLowerCase()))
        : [];
      return { lineBeforeFrag: "", frag, matches };
    }

    // completing the first argument
    if (parts.length > 2)
      return { lineBeforeFrag: value, frag: "", matches: [] };
    const frag = parts[1] ?? "";
    const pool = completionPool(head);
    const matches = pool.filter((n) =>
      n.toLowerCase().startsWith(frag.toLowerCase()),
    );
    return { lineBeforeFrag: `${parts[0]} `, frag, matches };
  }

  function commonPrefix(items: string[]): string {
    if (items.length === 0) return "";
    let prefix = items[0];
    for (const item of items.slice(1)) {
      let i = 0;
      while (i < prefix.length && i < item.length && prefix[i] === item[i]) i++;
      prefix = prefix.slice(0, i);
      if (!prefix) break;
    }
    return prefix;
  }

  // The greyed-out inline suggestion shown after the caret (fish-style).
  function ghostFor(value: string): string {
    if (!value) return "";
    const { frag, matches } = getCompletion(value);
    if (matches.length === 0) return "";
    const best = matches[0];
    if (best.length <= frag.length) return "";
    return best.slice(frag.length);
  }

  function acceptGhost(): boolean {
    const { lineBeforeFrag, matches } = getCompletion(input);
    if (matches.length === 0) return false;
    if (ghostFor(input) === "") return false;
    setInput(`${lineBeforeFrag}${matches[0]} `);
    setHistPos(null);
    return true;
  }

  function handleTab() {
    const { lineBeforeFrag, frag, matches } = getCompletion(input);
    if (matches.length === 0) return;

    if (matches.length === 1) {
      setInput(`${lineBeforeFrag}${matches[0]} `);
      setHistPos(null);
      return;
    }

    const cp = commonPrefix(matches);
    if (cp.length > frag.length) {
      // extend the input to the shared prefix of all candidates
      setInput(`${lineBeforeFrag}${cp}`);
      setHistPos(null);
    } else {
      // already at the branch point — list the options like a real shell
      pushLine(<span className="t-dim">{matches.join("   ")}</span>);
    }
  }

  function handleKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.ctrlKey && (e.key === "l" || e.key === "L")) {
      e.preventDefault();
      setLines([]);
      return;
    }
    const hist = historyRef.current;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (hist.length === 0) return;
      const np = histPos === null ? hist.length - 1 : Math.max(0, histPos - 1);
      setHistPos(np);
      setInput(hist[np]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histPos === null) return;
      const np = histPos + 1;
      if (np >= hist.length) {
        setHistPos(null);
        setInput("");
      } else {
        setHistPos(np);
        setInput(hist[np]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      handleTab();
    } else if (e.key === "ArrowRight" || (e.ctrlKey && e.key === "e")) {
      const el = e.currentTarget;
      const atEnd =
        el.selectionStart === el.value.length &&
        el.selectionEnd === el.value.length;
      if (atEnd && ghostFor(input)) {
        e.preventDefault();
        acceptGhost();
      }
    }
  }

  function focusInput() {
    if (typeof window !== "undefined") {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) return;
    }
    inputRef.current?.focus();
  }

  return (
    <div className="t-body" ref={bodyRef} onClick={focusInput}>
      <div className="t-output">
        {lines.map((l) => (
          <div key={l.id} className="t-line">
            {l.node}
          </div>
        ))}
      </div>

      {booted ? (
        <form className="t-inputrow" onSubmit={handleSubmit}>
          <Prompt path={cwd} />
          <span className="t-typed">{input}</span>
          <span className="t-cursor" aria-hidden="true" />
          {ghostFor(input) ? (
            <span className="t-ghost" aria-hidden="true">
              {ghostFor(input)}
            </span>
          ) : null}
          <input
            ref={inputRef}
            className="t-hidden-input"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setHistPos(null);
            }}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Terminal command input"
          />
        </form>
      ) : null}
    </div>
  );
}
