#!/usr/bin/env python3
"""Build the KirthiVerse v21 visual-system stylesheet.

Combines the six preview CSS sources in their existing cascade order, moves
@import rules to the beginning (required by CSS), and conservatively minifies
comments/whitespace outside quoted strings. Source stylesheets remain in the
repository for rollback and review.
"""
from pathlib import Path
import re

SOURCES = [
    "styles.css",
    "learning-foundation-v19.css",
    "learning-tools-v20.css",
    "visual-master-v15.css",
    "visual-master-pages-v15.css",
    "visual-master-features-v15.css",
]
OUTPUT = Path("visual-system-v21.css")
HEADER = "/* KirthiVerse visual system v21 | generated from preserved preview CSS sources */\n"


def strip_comments(text: str) -> str:
    out = []
    i = 0
    quote = None
    n = len(text)
    while i < n:
        ch = text[i]
        if quote:
            out.append(ch)
            if ch == "\\" and i + 1 < n:
                i += 1
                out.append(text[i])
            elif ch == quote:
                quote = None
            i += 1
            continue
        if ch in ("'", '"'):
            quote = ch
            out.append(ch)
            i += 1
            continue
        if ch == "/" and i + 1 < n and text[i + 1] == "*":
            end = text.find("*/", i + 2)
            i = n if end < 0 else end + 2
            continue
        out.append(ch)
        i += 1
    return "".join(out)


def minify(text: str) -> str:
    text = strip_comments(text)
    out = []
    i = 0
    quote = None
    n = len(text)
    pending_space = False
    tight = set("{}:;,>+~")
    while i < n:
        ch = text[i]
        if quote:
            out.append(ch)
            if ch == "\\" and i + 1 < n:
                i += 1
                out.append(text[i])
            elif ch == quote:
                quote = None
            i += 1
            continue
        if ch in ("'", '"'):
            if pending_space and out and out[-1] not in tight:
                out.append(" ")
            pending_space = False
            quote = ch
            out.append(ch)
            i += 1
            continue
        if ch.isspace():
            pending_space = True
            i += 1
            continue
        if ch in tight:
            while out and out[-1] == " ":
                out.pop()
            out.append(ch)
            pending_space = False
            i += 1
            continue
        if pending_space and out and out[-1] not in tight:
            out.append(" ")
        pending_space = False
        out.append(ch)
        i += 1
    result = "".join(out).strip()
    result = result.replace(";}", "}")
    return result


def main() -> None:
    imports = []
    bodies = []
    source_bytes = 0
    import_re = re.compile(r"@import\s+[^;]+;", re.IGNORECASE)
    for name in SOURCES:
        path = Path(name)
        if not path.is_file():
            raise SystemExit(f"Missing CSS source: {name}")
        raw = path.read_text(encoding="utf-8")
        source_bytes += len(raw.encode("utf-8"))
        for rule in import_re.findall(raw):
            if rule not in imports:
                imports.append(rule.strip())
        bodies.append(import_re.sub("", raw))

    combined = "\n".join(imports + bodies)
    built = HEADER + minify(combined) + "\n"
    OUTPUT.write_text(built, encoding="utf-8")
    output_bytes = OUTPUT.stat().st_size
    saved = source_bytes - output_bytes
    pct = (saved / source_bytes * 100) if source_bytes else 0
    print(f"VISUAL_CSS_SOURCE_BYTES={source_bytes}")
    print(f"VISUAL_CSS_OUTPUT_BYTES={output_bytes}")
    print(f"VISUAL_CSS_SAVED_BYTES={saved}")
    print(f"VISUAL_CSS_REDUCTION_PERCENT={pct:.2f}")
    print(f"VISUAL_CSS_REQUESTS_BEFORE={len(SOURCES)}")
    print("VISUAL_CSS_REQUESTS_AFTER=1")


if __name__ == "__main__":
    main()
