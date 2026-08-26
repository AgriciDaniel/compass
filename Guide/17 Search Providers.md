The Vault Lens browser extension (https://github.com/jk-oster/obsidian-search-for-web, v2.7.x) shows vault notes next to web search results and on pages you revisit. It talks to a small local server inside Obsidian. This page records which server the template ships and why (from a security review of the plugins' source code).

## What ships
| Plugin | State | Why |
| --- | --- | --- |
| **Local REST API** 5.1.0 | installed, enabled, HTTP server on port 27123 | The only provider that gives Vault Lens preview, edit, append, daily-note and page-notes features. Authenticated with a per-install bearer API key. Binds to 127.0.0.1. Vault Lens defaults to this provider, `http`, 27123, so the member's only manual step is pasting the key. |
| **Omnisearch** 1.30.1 | installed, enabled, its HTTP server **off** (default) | Great in-vault search (BM25, typo tolerant). Its HTTP endpoint has no authentication and `Access-Control-Allow-Origin: *`, so any local process or loaded web page could query the vault index. Leave it off unless you know why you want it. Real port if you do: 51361 (the Vault Lens quickstart's "51736" is a typo). |

Shipped settings: `.obsidian/plugins/obsidian-local-rest-api/data.json` contains only `{"enableInsecureServer": true}`. The plugin generates the API key and a self-signed certificate on first load and saves them into that same file on the member's machine.

## Member setup (8 steps)
1. Open the vault, turn off Restricted mode. Local REST API loads with the other plugins.
2. Settings → Local REST API: confirm "Non-encrypted (HTTP) server" is running on 27123. Copy the API key shown there.
3. Install Vault Lens: Chrome Web Store (Chrome, Brave, Edge, Arc, Opera), Firefox Add-ons (2.5.2+), or Edge Add-ons. Links: https://vaultlens.com/getting-started.html
4. Extension Options → "Obsidian Connection": provider Local REST API, protocol `http`, port `27123`, paste the API key, vault name = the folder you opened.
5. Wait for the green "connection established" toast.
6. Verify search: search the web for a word that appears in `Guide/00 Start Here.md`; the extension icon turns green and lists the note.
7. Verify the write path: click the daily-note button in the extension sidebar; the note should open under `01 Journal/Daily/`. If it was created empty (without the Daily Note properties), run **Templater: Replace templates in the active file** once; QuickAdd captures work either way.
8. Optional: Settings → Core plugins → Web viewer is on. Do not sign in to sensitive sites inside the in-app browser.

## Security posture
- Loopback only. Never set `bindingHost` (REST API) or `DANGER_httpHost` (Omnisearch).
- HTTP on 27123 is used because HTTPS (27124) needs every member to import a self-signed certificate that expires after 365 days; that is recurring support load. HTTPS remains available for anyone who wants it.
- The API key is a password to read and write the vault. Do not share screenshots of the Local REST API settings page. Vault Lens stores it in the browser's synced extension storage. "Reset all cryptography" in the plugin rotates key and certificate.
- Edits from the browser replace the whole note; if the same note is open in Obsidian, last write wins.
- Web viewer: Chromium webview, audited by Cure53, ad-blocking on. While Obsidian runs, third-party plugins can access Web viewer cookies, so use your main browser for anything password protected.

## Owner's release gate
`scripts/verify_template.py` refuses to ship a copy whose Local REST API settings contain a generated key or certificate; `scripts/build_template.py` resets that file to `{"enableInsecureServer": true}` on every build. See `scripts/RELEASE.md`.

## Dissent recorded
1. Turning on a listening server for every member, including those who never install the extension, is a policy choice; the more conservative posture is "installed, not enabled" at the cost of one more checklist step.
2. Pre-enabling HTTP overrides the plugin author's secure-by-default stance (HTTPS on, HTTP off). Loopback plus bearer key is acceptable on a single-user desktop; weaker on shared machines.
