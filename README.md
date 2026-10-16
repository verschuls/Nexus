<h1 align="center">
  <a href="https://nexus.verschuls.xyz">NEXUS</a>
</h1>

<p align="center">
  A fan-made viewer for watching the Marvel Cinematic Universe in chronological order - films, series, shorts, and web series woven into one timeline.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-22c55e?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/React-19-38bdf8?style=flat-square" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8-eab308?style=flat-square" alt="Vite 8" />
</p>

---

Personal MCU catalog built for one thing: figuring out **what to watch next**. Reconstructs the [MCU Fandom Wiki](https://marvelcinematicuniverse.fandom.com) timeline and lets you browse, filter, and track it.

## Features

- **Two orderings** - *Chronological* (collapsed to cut the constant show-hopping) and *Release date*.
- **Filters** - stack by medium (Movies / Series / Shorts) and tier (Essential -> Legacy), with live counts.
- **Tags** - Alternate Universe, Unconfirmed / Dubious / Inspired / Non-Canon, time travel, multiverse, plus the Earth an entry is set on, colour-coded per entry.
- **Season-aware timeline** - in *Chronological* order a series card is about that run: its season, episodes, dates, tier and tags.
- **Details view** - cards stay a uniform size; the info button opens the full description, notes and episode list.
- **Watch tracking** - click a card to mark it; progress persists per ordering in `localStorage`.
- **Fast** - content-visibility rendering + memoised cards keep hundreds of entries smooth.
- **Data-driven** - every entry is a small JSON file; the catalog rebuilds itself from the folder.

> **Note:** the *Chronological* order is a work in progress, so the ordering may not be perfectly balanced yet.

## Stack

React 19 + TypeScript (strict) · Vite 8 · Tailwind CSS v4 · [Phosphor](https://phosphoricons.com) icons. No router, no state library, no component library - the glass look, modal and tooltips are a few local components plus plain CSS, and every animation is CSS.

## Project layout

```
src/
  App.tsx            wires state, filters and the list together
  lib/               data types, catalog loading, the timeline, localStorage, tier/tag colours
  hooks/             useMediaQuery, useGlassLight, usePersistentSet
  components/
    ui.tsx           Button, Modal
    entry/           the card, the details modal and their parts
    header/          desktop + mobile headers and their parts
  data/              the JSON catalog (below)
```

## Data

Everything lives in `src/data/`. There is no manifest - a glob import picks the files up at build time.

**Entries** - one JSON file per title under `movies/`, `series/`, or `shorts/`. The filename is the id, so `movies/gotg.json` is `gotg`. Series carry a `seasons` map of episodes; everything else is flat with a `runtimeMinutes`.

```jsonc
{
  "title": "X-Men",
  "releaseDate": "14.07.2000",              // dd.mm.yyyy
  "runtimeMinutes": 104,                    // series use "runtimePerEp" + "seasons"
  "inUniverseTime": "Around 2000",
  "tier": "essential",                      // essential | recommended | optional | completionist | legacy
  "tags": ["alt"],                          // see below; [] for none
  "earth": "10005",                         // optional, shown as Earth-10005; omit for the main MCU
  "notes": "",
  "description": "..."
}
```

**Seasons** - a series' `seasons` maps the season number to the season:

```jsonc
"seasons": {
  "1": {
    "tier": "recommended",                       // optional, overrides the show tier for this season
    "inUniverseTime": "09.2013 - 05.2014",       // optional, shown on the season's card
    "tags": [],                                  // optional, overrides the show's tags
    "episodes": [
      { "id": 1, "title": "Pilot", "releaseDate": "24.09.2013", "inUniverseTime": "11.09.2013" }   // no tags: inherits the season's
    ]
  }
}
```

**Tags** - short keys: `alt`, `unconfirmed`, `inspired`, `dubious`, `noncanon` (no canon tag means Reality), `timetravel`, `multiverse`. Tags cascade show -> season -> episode: leave `tags` out of a season or episode to inherit its parent's, or write `[]` for explicitly none. `"inherit": false` on a season or episode stops it taking anything from its parent; on the show it turns the cascade off for every season and episode. So tag the show once and only override where a season or episode differs. Labels, colours and icons live in the `TAGS` map in `src/lib/meta.ts` (tier colours too); an unknown key still shows, in grey.

**Watch order** - `chrono.json`. **A row's position in the array is its order**, so there is no `order` field to maintain - drop a row where it belongs and you are done. Two row shapes:

```jsonc
{ "id": "gotg" }                        // a film, short, or a whole series
{ "id": "aos:2" }                       // season 2
```

A series can appear once per season, so its seasons interleave with films. Progress is stored against an entry's contents rather than its position, so reordering the timeline never wipes anyone's watch history.

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
