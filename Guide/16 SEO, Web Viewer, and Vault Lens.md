These three turn the vault into a place to research and publish from, on top of the life workflows.

## Web viewer (core plugin, Obsidian 1.8+)
Enabled in `core-plugins.json`; `.obsidian/webviewer.json` ships with external links opening in the viewer, ad blocking on, and saved pages going to `07 Library` (keys observed in public vaults, not officially documented; toggle once in settings to confirm on your build). Open links inside Obsidian, keep a browser tab next to a draft, and save a page as a note ("Save to vault") which pairs with the official Web Clipper. Settings → Core plugins → Web viewer: choose whether external links open in the viewer, set the search engine, and clear browsing data.

## SEO (`seo` 0.5.6, https://github.com/davidvkimball/obsidian-seo)
Audits notes meant to be published: title and description length, keyword in title/description/slug, heading hierarchy, alt text, broken and naked links, duplicate titles, reading level, word count. Score 40 to 100.
- Commands: **Run current note audit**, **Run vault audit**.
- Settings → SEO → scan directories: set `06 Writing` (and `07 Library` if you publish book notes). Leave the journal folders out; they are not for search engines.
- External link checking is off by default and needs the network; leave it off in the template.
- Frontmatter it reads: `title`, `description`, `slug`, `keywords` (configurable in settings). The writing templates carry `subject`, `meta_description`, `slug` today; align them with the plugin's property names in Settings → SEO if you want scores on drafts.
- Part of the author's Vault CMS project; independent of any publishing platform.

## Vault Lens (browser extension, formerly "Obsidian Search for Web")
https://github.com/jk-oster/obsidian-search-for-web. Shows matching vault notes next to web search results and on pages you revisit. Needs a vault-side provider: see [[17 Search Providers]] for the security review and the member setup steps.

## Together
Web viewer to read, Web Clipper + Vault Lens to capture and resurface, Claude via [[14 Agent Client and Claude Code]] to draft in `06 Writing`, SEO to audit before it leaves the vault.
