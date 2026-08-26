#!/usr/bin/env python3
"""Split a plain-text Bible into note-as-chapter and note-as-verse markdown files.

Input format (one verse per line, tab separated; the common format of public-domain KJV/WEB dumps):
    Genesis 1:1<TAB>In the beginning God created the heaven and the earth.

Usage:
    python3 scripts/split_bible.py kjv.txt --out "09 Reading"

Writes:
    <out>/Chapters/<Book> <N>.md     full chapter text + links to every verse note
    <out>/Verses/<Book> <N>.<V>.md   one verse, previous/next links, frontmatter for Dataview

Existing files are overwritten. Roughly 31k files for a full Bible; Obsidian handles it, the
first index just takes a minute. Use --books to limit, e.g. --books "Genesis,John".
"""
import argparse
import os
import re
from collections import OrderedDict

LINE = re.compile(r"^(?P<book>[1-3]?\s?[A-Za-z ]+?)\s+(?P<ch>\d+):(?P<v>\d+)\t(?P<text>.+)$")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("source")
    ap.add_argument("--out", default="09 Reading")
    ap.add_argument("--books", default="", help="comma separated subset")
    ap.add_argument("--translation", default="KJV")
    a = ap.parse_args()

    only = {b.strip() for b in a.books.split(",") if b.strip()}
    data = OrderedDict()
    with open(a.source, encoding="utf-8") as f:
        for raw in f:
            m = LINE.match(raw.rstrip("\n"))
            if not m:
                continue
            book = m.group("book").strip()
            if only and book not in only:
                continue
            ch, v = int(m.group("ch")), int(m.group("v"))
            data.setdefault(book, OrderedDict()).setdefault(ch, OrderedDict())[v] = m.group("text").strip()

    chap_dir = os.path.join(a.out, "Chapters")
    verse_dir = os.path.join(a.out, "Verses")
    os.makedirs(chap_dir, exist_ok=True)
    os.makedirs(verse_dir, exist_ok=True)

    n_ch = n_v = 0
    for book, chapters in data.items():
        for ch, verses in chapters.items():
            cname = f"{book} {ch}"
            prev_ch = f"{book} {ch - 1}" if ch > 1 else None
            next_ch = f"{book} {ch + 1}" if (ch + 1) in chapters else None
            nav = " · ".join(x for x in [f"Previous: [[{prev_ch}]]" if prev_ch else "", f"Next: [[{next_ch}]]" if next_ch else ""] if x)
            body = [
                "---", "type: bible-chapter", f"book: {book}", f"chapter: {ch}", f"translation: {a.translation}",
                "tags:", "  - bible/chapter", "---", f"# {cname}", "", nav, "", "## Text",
            ]
            body += [f"{v}. {t}" for v, t in verses.items()]
            body += ["", "## Verses", " · ".join(f"[[{book} {ch}.{v}]]" for v in verses), "",
                     "## Notes and sermons linking here", "```dataview", "LIST",
                     'WHERE contains(file.outlinks, this.file.link) AND !contains(file.folder, "Bible/Chapters")', "```", ""]
            with open(os.path.join(chap_dir, cname + ".md"), "w", encoding="utf-8") as f:
                f.write("\n".join(body))
            n_ch += 1

            vkeys = list(verses)
            for i, v in enumerate(vkeys):
                vname = f"{book} {ch}.{v}"
                links = [f"Chapter: [[{cname}]]"]
                if i > 0:
                    links.append(f"Previous: [[{book} {ch}.{vkeys[i - 1]}]]")
                if i + 1 < len(vkeys):
                    links.append(f"Next: [[{book} {ch}.{vkeys[i + 1]}]]")
                vb = ["---", "type: bible-verse", f"book: {book}", f"chapter: {ch}", f"verse: {v}",
                      f"translation: {a.translation}", "tags:", "  - bible/verse", "---",
                      f"# {book} {ch}:{v}", "", verses[v], "", " · ".join(links), ""]
                with open(os.path.join(verse_dir, vname + ".md"), "w", encoding="utf-8") as f:
                    f.write("\n".join(vb))
                n_v += 1
    print(f"wrote {n_ch} chapter notes and {n_v} verse notes to {a.out}")


if __name__ == "__main__":
    main()
