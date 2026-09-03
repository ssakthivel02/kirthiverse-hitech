#!/usr/bin/env python3
"""Build the KirthiVerse v21 visual-system stylesheet.

Combines the six preview CSS sources in their existing cascade order, moves
@import rules to the beginning (required by CSS), conservatively minifies
comments/whitespace outside quoted strings, then removes only byte-identical
qualified rule blocks when an identical later rule exists in the same CSS
container. Source stylesheets remain in the repository for rollback/review.
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
CONTAINER_AT_RULES = ("@media", "@supports", "@container", "@layer", "@scope")


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
    return "".join(out).strip().replace(";}", "}")


def find_matching_brace(text: str, open_index: int) -> int:
    depth = 1
    quote = None
    i = open_index + 1
    while i < len(text):
        ch = text[i]
        if quote:
            if ch == "\\" and i + 1 < len(text):
                i += 2
                continue
            if ch == quote:
                quote = None
            i += 1
            continue
        if ch in ("'", '"'):
            quote = ch
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return i
        i += 1
    raise ValueError("Unbalanced CSS braces")


def parse_units(text: str):
    """Return top-level CSS units without interpreting declaration-bearing at-rules."""
    units = []
    i = 0
    n = len(text)
    while i < n:
        while i < n and text[i].isspace():
            i += 1
        if i >= n:
            break
        start = i
        quote = None
        paren = 0
        bracket = 0
        boundary = None
        while i < n:
            ch = text[i]
            if quote:
                if ch == "\\" and i + 1 < n:
                    i += 2
                    continue
                if ch == quote:
                    quote = None
                i += 1
                continue
            if ch in ("'", '"'):
                quote = ch
            elif ch == "(":
                paren += 1
            elif ch == ")":
                paren = max(paren - 1, 0)
            elif ch == "[":
                bracket += 1
            elif ch == "]":
                bracket = max(bracket - 1, 0)
            elif paren == 0 and bracket == 0 and ch in "{;":
                boundary = ch
                break
            i += 1
        if boundary is None:
            tail = text[start:].strip()
            if tail:
                units.append(("raw", tail, "", ""))
            break
        if boundary == ";":
            units.append(("statement", text[start:i + 1], "", ""))
            i += 1
            continue
        prelude = text[start:i].strip()
        close = find_matching_brace(text, i)
        body = text[i + 1:close]
        kind = "at" if prelude.startswith("@") else "qualified"
        units.append((kind, "", prelude, body))
        i = close + 1
    return units


def dedupe_exact_qualified_rules(text: str):
    """Drop earlier byte-identical qualified rules only within the same container."""
    units = parse_units(text)
    normalized = []
    removed_rules = 0
    removed_bytes = 0

    for kind, raw, prelude, body in units:
        if kind == "at" and prelude.lower().startswith(CONTAINER_AT_RULES):
            body, sub_rules, sub_bytes = dedupe_exact_qualified_rules(body)
            removed_rules += sub_rules
            removed_bytes += sub_bytes
            normalized.append((kind, "", prelude, body))
        else:
            normalized.append((kind, raw, prelude, body))

    seen = set()
    keep = [True] * len(normalized)
    for idx in range(len(normalized) - 1, -1, -1):
        kind, raw, prelude, body = normalized[idx]
        if kind != "qualified":
            continue
        unit = f"{prelude}{{{body}}}"
        if unit in seen:
            keep[idx] = False
            removed_rules += 1
            removed_bytes += len(unit.encode("utf-8"))
        else:
            seen.add(unit)

    out = []
    for should_keep, (kind, raw, prelude, body) in zip(keep, normalized):
        if not should_keep:
            continue
        if kind in ("qualified", "at"):
            out.append(f"{prelude}{{{body}}}")
        else:
            out.append(raw)
    return "".join(out), removed_rules, removed_bytes


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

    import_text = minify("\n".join(imports))
    minified_body = minify("\n".join(bodies))
    deduped_body, removed_rules, removed_bytes = dedupe_exact_qualified_rules(minified_body)
    built = HEADER + import_text + deduped_body + "\n"
    OUTPUT.write_text(built, encoding="utf-8")
    output_bytes = OUTPUT.stat().st_size
    saved = source_bytes - output_bytes
    pct = (saved / source_bytes * 100) if source_bytes else 0

    print(f"VISUAL_CSS_SOURCE_BYTES={source_bytes}")
    print(f"VISUAL_CSS_OUTPUT_BYTES={output_bytes}")
    print(f"VISUAL_CSS_SAVED_BYTES={saved}")
    print(f"VISUAL_CSS_REDUCTION_PERCENT={pct:.2f}")
    print(f"VISUAL_CSS_EXACT_DUPLICATE_RULES_REMOVED={removed_rules}")
    print(f"VISUAL_CSS_EXACT_DUPLICATE_RULE_BYTES_REMOVED={removed_bytes}")
    print(f"VISUAL_CSS_REQUESTS_BEFORE={len(SOURCES)}")
    print("VISUAL_CSS_REQUESTS_AFTER=1")


if __name__ == "__main__":
    main()
