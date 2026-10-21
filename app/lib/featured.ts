// Projects shown large on the page, with real pictures of each one working.
// Keyed by GitHub repo name; a repo that disappears from GitHub drops out.
// Pictures live in public/projects/.

import type { Frame } from "@/app/crossfade";

export type Featured = {
  /** Two short sentences: what it is and why someone would use it. */
  blurb: string;
  /** One or more pictures of the same framing; several slowly crossfade. */
  frames: Frame[];
  width: number;
  height: number;
  /** A desktop screenshot, or a phone screen shown at phone proportions. */
  shape: "wide" | "tall";
  /** Position on the page, smallest first. */
  order: number;
  /** Where a phone's square crop of a wide picture centres (object-position). */
  focus?: string;
};

export const FEATURED: Record<string, Featured> = {
  Tessellate: {
    order: 1,
    shape: "wide",
    focus: "72% 30%",
    blurb:
      "Drop in a batch of pictures and arrange them as justified rows, a fixed grid or masonry columns, then export the grid as one image. It runs entirely in the browser, so the pictures never leave your device.",
    width: 1440,
    height: 900,
    frames: [
      {
        src: "/projects/Tessellate.jpg",
        alt: "Tessellate arranging eight photographs and paintings in masonry columns, with its layout settings on the left.",
      },
      {
        src: "/projects/Tessellate-dynamic.jpg",
        alt: "The same eight pictures in Tessellate's dynamic layout, set in justified rows.",
      },
    ],
  },
  "Apprentice-Atlas": {
    order: 2,
    shape: "tall",
    blurb:
      "A map-first iPhone app for finding apprenticeships near you in the UK and Germany. Each vacancy is explained in plain language, with saved jobs, deadlines and interview practice. In testing on TestFlight.",
    width: 782,
    height: 1700,
    frames: [
      {
        src: "/projects/Apprentice-Atlas.jpg",
        alt: "Apprentice Atlas on iPhone: a map of the West Midlands with clustered apprenticeship pins and 181 opportunities found.",
      },
      {
        src: "/projects/Apprentice-Atlas-dashboard.jpg",
        alt: "The Apprentice Atlas home screen with saved jobs, deadlines and a recommended support engineer apprenticeship.",
      },
      {
        src: "/projects/Apprentice-Atlas-opportunity-detail.jpg",
        alt: "An IT apprenticeship in Northampton in Apprentice Atlas, with its category, level and application deadline.",
      },
    ],
  },
  "curious.fun": {
    order: 3,
    shape: "wide",
    focus: "50% 60%",
    blurb:
      "Small interactive pages in the spirit of neal.fun: your life in weeks, spending a trillion, democracy in numbers and a colour-naming game.",
    width: 1440,
    height: 900,
    frames: [
      {
        src: "/projects/curious.fun.jpg",
        alt: "curious.fun's Life in Weeks page: 1,300 of 4,680 weeks passed, drawn as a grid of coloured squares.",
      },
    ],
  },
  "Apprentice-Atlas-Web": {
    order: 4,
    shape: "wide",
    focus: "18% 40%",
    blurb:
      "The bilingual website and editorial system behind Apprentice Atlas, written for young people, families and careers advisers. A Next.js site with a Payload CMS editor.",
    width: 1440,
    height: 900,
    frames: [
      {
        src: "/projects/Apprentice-Atlas-Web.jpg",
        alt: "The Apprentice Atlas website: the headline 'Find the apprenticeship route that fits your life' beside a drawn route map.",
      },
    ],
  },
};
