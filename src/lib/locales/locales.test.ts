import { describe, it, expect } from "vitest";
import { en } from "./en";
import { fr } from "./fr";
import { it } from "./it";

/**
 * Recursively flattens a nested object into dotted key paths.
 * E.g. { sidebar: { home: "Home" } } -> { "sidebar.home": "Home" }
 */
function flatten(obj: Record<string, any>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix? `${prefix}.${key}` : key;
    if (value!== null && typeof value === "object" &&!Array.isArray(value)) {
      Object.assign(result, flatten(value, fullKey));
    } else {
      result[fullKey] = String(value);
    }
  }
  return result;
}

/**
 * Extracts sorted list of placeholder tokens from a string.
 * E.g. "Showing {count} songs on {date}" -> ["{count}", "{date}"]
 */
function extractPlaceholders(str: string): string[] {
  const matches = str.match(/\{(\w+)\}/g) || [];
  return [...matches].sort();
}

/**
 * Allowlist of keys whose French/Italian translation is legitimately identical to English
 * (e.g. loanwords, shared musical terminology, technical acronyms, brand names, or symbols).
 */
const IDENTICAL_OK = new Set([
  "equalizer.importPlaceholder",
  "albumDetail.statsLine",
  "albumTagEditor.genreField",
  "artistDetail.albumsFilter",
  "artistDetail.epsFilter",
  "audioPipeline.bitPerfect",
  "audioPipeline.codec",
  "audioPipeline.normalizationGain",
  "audioPipeline.outputFormat",
  "auth.scrobbling",
  "collection.albums",
  "collection.albumsCount",
  "collection.columnActions",
  "collection.columnAlbum",
  "collection.columnBpm",
  "collection.columnFormat",
  "collection.columnGenre",
  "collection.oneAlbum",
  "collection.tableHeaderActions",
  "collection.tableHeaderAlbum",
  "collection.tableHeaderBpm",
  "collection.tableHeaderFormat",
  "collection.tableHeaderGenre",
  "collection.tableHeaderMusicBrainzId",
  "collection.tableHeaderTrack",
  "discord.integrationTitle",
  "equalizer.gain",
  "equalizer.isoStandard",
  "equalizer.jazzPreset",
  "equalizer.modeLabel",
  "equalizer.popPreset",
  "equalizer.qFactor",
  "equalizer.rockPreset",
  "loudness.modeAlbum",
  "lyrics.instrumentalBadge",
  "organizer.placeholders",
  "organizer.presetAlternative",
  "picard.customPathPlaceholderLinux",
  "picard.integrationTitle",
  "playerBar.albumLabel",
  "playerBar.channelsMono",
  "playerBar.critiquebrainzSectionLabel",
  "playerBar.dynamicRangeRms",
  "playerBar.formatLabel",
  "playerBar.genreLabel",
  "playerBar.listenbrainzAlbumLabel",
  "playerBar.listenbrainzSectionLabel",
  "playerBar.mbRatingVotes",
  "playerBar.musicbrainzReleaseTypeLabel",
  "playerBar.musicbrainzSectionLabel",
  "playerBar.pause",
  "playerBar.repeatAlbum",
  "playerBar.shuffleAlbums",
  "playerBar.volume",
  "playlists.activeBadgeLabel",
  "playlists.bpmAutoPlaylist",
  "playlists.genreAutoPlaylist",
  "playlists.tableHeaderTrack",
  "settings.badgeColorCyan",
  "settings.badgeColorIndigo",
  "settings.badgeColorOrange",
  "settings.badgeIconArchive",
  "settings.badgeIconUsb",
  "settings.formatMsix",
  "settings.languageEnglish",
  "settings.languageFrench",
  "settings.simple",
  "settings.statsAlbums",
  "settings.tabSources",
  "settings.webdavUrlPlaceholder",
  "shortcuts.groupNavigation",
  "sidebar.albums",
  "sidebar.collection",
  "sidebar.genres",
  "smartPlaylistBuilder.fieldAlbum",
  "smartPlaylistBuilder.fieldBpm",
  "smartPlaylistBuilder.fieldCompilation",
  "smartPlaylistBuilder.fieldGenre",
  "smartPlaylistBuilder.mixWord",
  "smartPlaylistBuilder.opEquals",
  "smartPlaylistBuilder.opGt",
  "smartPlaylistBuilder.opGte",
  "smartPlaylistBuilder.opLt",
  "smartPlaylistBuilder.opLte",
  "smartPlaylistBuilder.opNotEquals",
  "songTags.viewGenre",
  "stats.heatmapStatus",
  "stats.minuteCount",
  "stats.minuteUnderOne",
  "tagEditor.albumField",
  "tagEditor.bpmField",
  "tagEditor.genreField",
  "themes.dynamic-artwork",
  "themes.sabrina",
  "topNav.searchSuggestions",
  // Italian often keeps same as English for these
  "settings.languageItalian",
]);

describe("Locale translation completeness and integrity", () => {
  const flatEn = flatten(en);
  const flatFr = flatten(fr);
  const flatIt = flatten(it);

  it("every key in en.ts has a corresponding translation in fr.ts", () => {
    const missingInFr = Object.keys(flatEn).filter((key) =>!(key in flatFr));
    expect(
      missingInFr,
      `Missing French translations in src/lib/locales/fr.ts for the following keys:\n${missingInFr.map((k) => ` - ${k}`).join("\n")}`
    ).toEqual([]);
  });

  it("every key in en.ts has a corresponding translation in it.ts", () => {
    const missingInIt = Object.keys(flatEn).filter((key) =>!(key in flatIt));
    expect(
      missingInIt,
      `Missing Italian translations in src/lib/locales/it.ts for the following keys:\n${missingInIt.map((k) => ` - ${k}`).join("\n")}`
    ).toEqual([]);
  });

  it("fr.ts contains no stale keys that do not exist in en.ts", () => {
    const staleInFr = Object.keys(flatFr).filter((key) =>!(key in flatEn));
    expect(
      staleInFr,
      `Stale keys found in src/lib/locales/fr.ts that no longer exist in en.ts:\n${staleInFr.map((k) => ` - ${k}`).join("\n")}`
    ).toEqual([]);
  });

  it("it.ts contains no stale keys that do not exist in en.ts", () => {
    const staleInIt = Object.keys(flatIt).filter((key) =>!(key in flatEn));
    expect(
      staleInIt,
      `Stale keys found in src/lib/locales/it.ts that no longer exist in en.ts:\n${staleInIt.map((k) => ` - ${k}`).join("\n")}`
    ).toEqual([]);
  });

  it("fr.ts values differ from en.ts unless explicitly allowlisted in IDENTICAL_OK", () => {
    const untranslated = Object.keys(flatEn).filter((key) => {
      return key in flatFr && flatEn[key] === flatFr[key] &&!IDENTICAL_OK.has(key);
    });

    expect(
      untranslated,
      `The following French translations are identical to English. If this is legitimately the same word in French (or a symbol/brand name), add the key to IDENTICAL_OK in src/lib/locales/locales.test.ts:\n${untranslated
       .map((k) => ` - ${k}: "${flatEn[k]}"`)
       .join("\n")}`
    ).toEqual([]);
  });

  it("it.ts values differ from en.ts unless explicitly allowlisted in IDENTICAL_OK", () => {
    const untranslated = Object.keys(flatEn).filter((key) => {
      return key in flatIt && flatEn[key] === flatIt[key] &&!IDENTICAL_OK.has(key);
    });

    expect(
      untranslated,
      `The following Italian translations are identical to English. If this is legitimately the same word in Italian (or a symbol/brand name), add the key to IDENTICAL_OK in src/lib/locales/locales.test.ts:\n${untranslated
       .map((k) => ` - ${k}: "${flatEn[k]}"`)
       .join("\n")}`
    ).toEqual([]);
  });

  it("every key in IDENTICAL_OK is still identical and exists in en.ts", () => {
    const unneededInAllowlist = [...IDENTICAL_OK].filter((key) => {
      const enExists = key in flatEn;
      const frIdentical = key in flatFr && flatEn[key] === flatFr[key];
      const itIdentical = key in flatIt && flatEn[key] === flatIt[key];
      return!enExists || (!frIdentical &&!itIdentical);
    });

    expect(
      unneededInAllowlist,
      `The following keys in IDENTICAL_OK no longer match or no longer exist; remove them from IDENTICAL_OK in src/lib/locales/locales.test.ts:\n${unneededInAllowlist
       .map((k) => ` - ${k}`)
       .join("\n")}`
    ).toEqual([]);
  });

  it("interpolation placeholder tokens match between en.ts and fr.ts", () => {
    const mismatches: { key: string; enTokens: string[]; frTokens: string[] }[] = [];

    for (const key of Object.keys(flatEn)) {
      if (key in flatFr) {
        const enTokens = extractPlaceholders(flatEn[key]);
        const frTokens = extractPlaceholders(flatFr[key]);
        if (enTokens.join(",")!== frTokens.join(",")) {
          mismatches.push({ key, enTokens, frTokens });
        }
      }
    }

    expect(
      mismatches,
      `Interpolation placeholders mismatch between en.ts and fr.ts:\n${mismatches
       .map((m) => ` - ${m.key}: en has [${m.enTokens.join(", ")}], fr has [${m.frTokens.join(", ")}]`)
       .join("\n")}`
    ).toEqual([]);
  });

  it("interpolation placeholder tokens match between en.ts and it.ts", () => {
    const mismatches: { key: string; enTokens: string[]; itTokens: string[] }[] = [];

    for (const key of Object.keys(flatEn)) {
      if (key in flatIt) {
        const enTokens = extractPlaceholders(flatEn[key]);
        const itTokens = extractPlaceholders(flatIt[key]);
        if (enTokens.join(",")!== itTokens.join(",")) {
          mismatches.push({ key, enTokens, itTokens });
        }
      }
    }

    expect(
      mismatches,
      `Interpolation placeholders mismatch between en.ts and it.ts:\n${mismatches
       .map((m) => ` - ${m.key}: en has [${m.enTokens.join(", ")}], it has [${m.itTokens.join(", ")}]`)
       .join("\n")}`
    ).toEqual([]);
  });
});

describe("Locale validation helper functions", () => {
  it("flatten flattens nested objects into dotted key paths", () => {
    const input = {
      section: {
        title: "Hello",
        nested: {
          deep: "World"
        }
      }
    };
    expect(flatten(input)).toEqual({
      "section.title": "Hello",
      "section.nested.deep": "World"
    });
  });

  it("extractPlaceholders extracts sorted placeholder names", () => {
    expect(extractPlaceholders("Hello {name}, you have {count} messages from {name}!")).toEqual([
      "{count}",
      "{name}",
      "{name}"
    ]);
    expect(extractPlaceholders("Plain string without variables")).toEqual([]);
  });
});
