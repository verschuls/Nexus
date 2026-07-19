<h1 align="center">
  <a href="https://nexus.verschuls.xyz">NEXUS</a>
</h1>

<p align="center">
  A fan-made viewer for watching the Marvel Cinematic Universe in in-universe order - films, series, one-shots, shorts, and web series woven into one timeline.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-22c55e?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/React-19-38bdf8?style=flat-square" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8-eab308?style=flat-square" alt="Vite 8" />
</p>

---

Personal MCU catalog built for one thing: figuring out **what to watch next**. Reconstructs the [MCU Fandom Wiki](https://marvelcinematicuniverse.fandom.com) timeline and lets you browse, filter, and track it.

## Features

- **Three orderings** - *In-universe* (episode-interleaved, faithful to the wiki), *Semi-chrono* (collapsed to cut the constant show-hopping), and *Release date*.
- **Filters** - stack by medium (Movies / Series / One-Shots / Shorts) and tier (Essential -> Completionist), with live counts.
- **Canon flags** - Alternate Universe, Unconfirmed / Dubious / Inspired / Non-Canon, and time-travel, colour-coded per entry.
- **Watch tracking** - click a card to mark it; progress persists per ordering in `localStorage`.
- **Fast** - content-visibility rendering + memoised cards keep hundreds of entries smooth.
- **Data-driven** - every entry is a small JSON file; the catalog rebuilds itself from the folder.

> **Note:** *Semi-chrono* is a work in progress, it was a bit of a speedrun, so the ordering may not be perfectly balanced yet.

## Stack

React 19 + TypeScript (strict) · Vite 8 · Tailwind CSS v4. No router, no state library.

## Getting started

```bash
git clone https://github.com/verschuls/nexus.git
cd nexus
pnpm install
pnpm dev      # dev server
pnpm build    # production build
```

## Credits & disclaimer

Timeline data, ordering, and canon classifications come from the community-maintained **[MCU Fandom Wiki](https://marvelcinematicuniverse.fandom.com)** - thanks to its contributors.

Unofficial, non-commercial fan project. **Not affiliated with or endorsed by** Marvel, Disney, the MCU, or Fandom. All trademarks and content belong to their owners; MIT covers this project's code only.

---

<p align="center">
  Made by <a href="https://verschuls.xyz"><b>Verschuls</b></a> with ☕
</p>
