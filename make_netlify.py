from datetime import datetime
from pathlib import Path

from tomlkit import aot, comment, document, dumps, table
from tomlkit.items import Table, String, StringType, Trivia

FOREVER = 10 * 365 * 24 * 60 * 60

NO_CACHE = """
max-age=0,
no-cache,
no-store,
must-revalidate"""
CACHE_FOREVER = f"""
max-age={FOREVER},
public,
immutable"""

FOREVER_PATTERNS = ["/dist/*.*.js", "/dist/*.*.css", "/dist/fonts/*"]


def make_headers(dest: str, value: dict) -> Table:
    hdrs_table = table()
    hdrs_table["for"] = dest
    value_table = table().indent(2)
    for k, v in value.items():
        if "\n" in v:
            val = String(StringType.MLL, v, v, Trivia())
            value_table[k] = val
        else:
            value_table[k] = v
    hdrs_table["values"] = value_table
    return hdrs_table


def make_headers_file():
    file = Path("._headers")
    path_headers = {
        "/sw.js": {
            "service-worker-allowed": "/",
            "cache-control": ["max-age=0", "no-cache", "no-store", "must-revalidate"],
        },
        "*/manifest.json": {
            "cache-control": ["max-age=0", "no-cache", "no-store", "must-revalidate"]
        },
        "/dist/*.*.js": {
            "cache-control": [f"max-age={FOREVER}", "public", "immutable"]
        },
        "/dist/*.*.css": {
            "cache-control": [f"max-age={FOREVER}", "public", "immutable"]
        },
        "/dist/fonts/*": {
            "cache-control": [f"max-age={FOREVER}", "public", "immutable"]
        },
    }
    lines, indent = [], (" " * 2)
    for path, hdrs in path_headers.items():
        lines.append(path)
        for k, values in hdrs.items():
            if isinstance(values, str):
                values = [values]
            for val in values:
                lines.append(f"{indent}{k}: {val}")
        lines.append("")

    output = "\n".join(lines)
    print(output)
    file.write_text(output)


def toml_headers():
    filename = Path("_netlify.toml")

    doc = document()
    doc.add(comment("netlify.toml"))
    doc.add(comment("Generated: " + datetime.now().isoformat()))

    build = table()
    env = table().indent(2)
    env["YARN_VERSION"] = "1.21.0"
    build["publish"] = "_site/"
    build["command"] = "make build"
    build["environment"] = env
    doc["build"] = build

    headers = aot()

    sw = make_headers(
        "sw.js", {"service-worker-allowed": "/", "cache-control": NO_CACHE}
    )
    headers.append(sw)
    manifest = make_headers("**/manifest.json", {"cache-control": NO_CACHE})
    headers.append(manifest)
    for pattern in FOREVER_PATTERNS:
        headers.append(make_headers(pattern, {"cache-control": CACHE_FOREVER}))

    doc["headers"] = headers

    output = dumps(doc)
    print(output)
    sz = filename.write_text(output)
    print(sz)


if __name__ == "__main__":
    make_headers_file()
