#!/usr/bin/env python3
"""Live quotes publish decisions (run_hermes_quote_sync.py) against a fake /api/quotes."""
from __future__ import annotations

import hashlib
import http.server
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import threading
import time
import types
import unittest

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("live_sync", HERE / "run_hermes_quote_sync.py")
live_sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(live_sync)

BANK = "## Index\n- [[#One|One]] (1)\n\n## One\n\n> A line.\n"
SHA = hashlib.sha256(BANK.encode()).hexdigest()


class Fake(http.server.BaseHTTPRequestHandler):
    put_status = 200
    stored: str | None = None
    puts = 0

    def log_message(self, *args):
        pass

    def do_HEAD(self):
        cls = type(self)
        if cls.stored is None:
            self.send_response(404)
        elif self.headers.get("If-None-Match") == f'"{hashlib.sha256(cls.stored.encode()).hexdigest()}"':
            self.send_response(304)
        else:
            self.send_response(200)
        self.end_headers()

    def do_PUT(self):
        cls = type(self)
        cls.puts += 1
        body = self.rfile.read(int(self.headers["Content-Length"])).decode()
        if self.headers.get("Authorization") != "Bearer secret":
            self.send_response(401)
            self.end_headers()
            return
        self.send_response(cls.put_status)
        self.end_headers()
        if cls.put_status == 200:
            changed = cls.stored != body
            cls.stored = body
            self.wfile.write(json.dumps({"changed": changed, "quotes": 1, "sha": SHA}).encode())


class LivePublish(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), Fake)
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()
        live_sync.LIVE_URL = f"http://127.0.0.1:{cls.server.server_port}/api/quotes"

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()

    def setUp(self):
        Fake.stored, Fake.put_status, Fake.puts = None, 200, 0
        os.environ["NUROCTANE_QUOTES_TOKEN"] = "secret"
        self.logs: list[str] = []

    def publish(self):
        return live_sync.publish_live(BANK, self.logs.append)

    def test_publishes_then_skips_unchanged(self):
        self.assertEqual(self.publish(), "published")
        self.assertEqual(self.publish(), "same")
        self.assertEqual(Fake.puts, 1, "an unchanged bank is not re-sent")

    def test_bad_token_falls_back(self):
        os.environ["NUROCTANE_QUOTES_TOKEN"] = "wrong"
        self.assertEqual(self.publish(), "failed")

    def test_missing_token_falls_back(self):
        os.environ["NUROCTANE_QUOTES_TOKEN"] = ""
        live_sync.TOKEN_FILE = Path(HERE / "no-such-token-file")
        self.assertEqual(self.publish(), "failed")

    def test_server_error_falls_back(self):
        Fake.put_status = 503
        self.assertEqual(self.publish(), "failed")

    def test_unsafe_bank_is_refused_not_pushed(self):
        Fake.put_status = 409
        self.assertEqual(self.publish(), "refused")

    def test_unreachable_falls_back(self):
        saved = live_sync.LIVE_URL
        live_sync.LIVE_URL = "http://127.0.0.1:9/api/quotes"
        try:
            self.assertEqual(self.publish(), "failed")
        finally:
            live_sync.LIVE_URL = saved


class Snapshot(unittest.TestCase):
    def module(self, last_commit: int | None):
        def git(*args, check=True):
            out = "" if last_commit is None else str(last_commit)
            return subprocess.CompletedProcess(args, 0, out, "")
        return types.SimpleNamespace(git=git, REL_DEST="shared/content/quotes.md")

    def test_due_after_a_day(self):
        self.assertTrue(live_sync.snapshot_due(self.module(int(time.time()) - 25 * 3600))[0])

    def test_not_due_within_a_day(self):
        self.assertFalse(live_sync.snapshot_due(self.module(int(time.time()) - 3600))[0])

    def test_due_without_history(self):
        self.assertTrue(live_sync.snapshot_due(self.module(None))[0])


if __name__ == "__main__":
    unittest.main()
