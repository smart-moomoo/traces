#!/usr/bin/env python3
"""Local artwork preview: always revalidate edited code and fixed assets."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class PreviewHandler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map,
                      ".mjs": "text/javascript"}

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=4173)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    handler = partial(PreviewHandler, directory=str(root))
    ThreadingHTTPServer(("127.0.0.1", args.port), handler).serve_forever()
