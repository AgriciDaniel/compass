#!/usr/bin/env python3
"""Synthetic, temporary-directory release safety tests. No live note reads."""
import importlib.util
import json
import pathlib
import subprocess
import sys
import tempfile
import unittest
import hashlib
import zipfile
from verify_archive_restore import verify_archive, safe_name
from verify_template import fixed_capture_heading_present

HERE = pathlib.Path(__file__).resolve().parent
PRIVATE_SENTINEL = "SYNTHETIC_PRIVATE_SENTINEL"
spec = importlib.util.spec_from_file_location("builder", HERE / "build_template.py")
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)

class ReleaseSafety(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="life-os-safety-")
        self.base = pathlib.Path(self.temp.name)
        self.live = self.base / "fixture"
        self.live.mkdir()
        self.output = self.base / "output"
    def tearDown(self):
        self.temp.cleanup()
    def test_unsafe_names(self):
        for name in ["..", ".", "../escape", "/absolute", "nested/name", ""]:
            with self.assertRaises(ValueError): builder.validate_destination(self.live, self.output, name)
    def test_overlap_and_existing(self):
        for output in [self.live, self.live / "build", self.base]:
            with self.assertRaises(ValueError): builder.validate_destination(self.live, output, "Candidate")
        (self.output / "Candidate").mkdir(parents=True)
        with self.assertRaises(ValueError): builder.validate_destination(self.live, self.output, "Candidate")
    def test_output_symlink(self):
        self.output.symlink_to(self.live, target_is_directory=True)
        with self.assertRaises(ValueError): builder.validate_destination(self.live, self.output, "Candidate")
    def test_safe_settings_before_copy(self):
        for plugin in ["obsidian-local-rest-api", "agent-client", "quickadd"]:
            folder = self.live / ".obsidian/plugins" / plugin
            folder.mkdir(parents=True)
            (folder / "data.json").write_text(json.dumps({"apiKey": PRIVATE_SENTINEL, "savedSessions": ["SYNTHETIC_SESSION"], "choices": [], "ai": {"providers": [{"apiKey": PRIVATE_SENTINEL}]}}))
        self.output.mkdir()
        builder.copy_tree(str(self.live), str(self.output))
        for file in self.output.rglob("data.json"):
            self.assertNotIn("SYNTHETIC_PRIVATE_SENTINEL", file.read_text())
            self.assertNotIn("SYNTHETIC_SESSION", file.read_text())
        agent = json.loads((self.output / ".obsidian/plugins/agent-client/data.json").read_text())
        self.assertFalse(agent["autoAllowPermissions"])
        self.assertFalse(agent["autoMentionActiveNote"])
    def test_source_symlink_rejected(self):
        (self.live / "link.md").symlink_to(HERE / "RELEASE.md")
        self.output.mkdir()
        with self.assertRaises(ValueError): builder.copy_tree(str(self.live), str(self.output))
    def test_verifier_redacts_live_state(self):
        p = self.live / ".obsidian/plugins/obsidian-local-rest-api"
        p.mkdir(parents=True)
        (p / "data.json").write_text(json.dumps({"apiKey": PRIVATE_SENTINEL}))
        result = subprocess.run([sys.executable, str(HERE / "verify_template.py"), str(self.live), "--json"], text=True, capture_output=True)
        self.assertEqual(result.returncode, 1)
        self.assertNotIn("SYNTHETIC_PRIVATE_SENTINEL", result.stdout + result.stderr)
        self.assertIn("content scan skipped", result.stdout)
    def test_manifest_is_inside_package(self):
        (self.live / "fixture.txt").write_text("synthetic")
        builder.manifest(str(self.live))
        self.assertIn("fixture.txt", (self.live / "MANIFEST.sha256").read_text())
        self.assertFalse((self.base / "MANIFEST.sha256").exists())
    def test_private_defaults_never_staged(self):
        for rel in ["Meta/Compass Config.md", "03 Planning/Life Theme.md", "08 Tasks/Tasks.md"]:
            path = self.live / rel
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("SYNTHETIC_PRIVATE_SENTINEL")
        self.output.mkdir()
        builder.copy_tree(str(self.live), str(self.output))
        self.assertEqual(list(self.output.rglob("*.md")), [])
    def test_boards_do_not_bypass_personal_content_filter(self):
        for rel in ["04 Projects/Projects Board.md", "04 Projects/Private Board.md"]:
            path = self.live / rel
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("## Private lane\n- [ ] SYNTHETIC_PRIVATE_SENTINEL")
        self.output.mkdir()
        builder.copy_tree(str(self.live), str(self.output))
        self.assertFalse((self.output / "04 Projects/Private Board.md").exists())
        self.assertNotIn("SYNTHETIC_PRIVATE_SENTINEL", (self.output / "04 Projects/Projects Board.md").read_text())
    def test_packaged_boards_support_fixed_capture_anchors(self):
        routes = [
            ("lifeos-project-idea", "04 Projects/Projects Board.md", "## Ideas"),
            ("lifeos-newsletter-idea", "06 Writing/Newsletters/Newsletter Board.md", "## Backlog"),
            ("lifeos-video-idea", "06 Writing/YouTube Scripts/YouTube Board.md", "## Backlog"),
            ("lifeos-article-idea", "06 Writing/Articles/Article Board.md", "## Backlog"),
        ]
        choices = []
        for identifier, relative, anchor in routes:
            board = self.live / relative
            board.parent.mkdir(parents=True, exist_ok=True)
            board.write_text("## Private lane\n- [ ] SYNTHETIC_PRIVATE_SENTINEL")
            choices.append({"id": identifier, "captureTo": relative, "insertAfter": {
                "enabled": True, "after": anchor, "createIfNotFound": False,
            }})
        settings = self.live / ".obsidian/plugins/quickadd/data.json"
        settings.parent.mkdir(parents=True)
        settings.write_text(json.dumps({"choices": choices}))
        self.output.mkdir()
        builder.copy_tree(str(self.live), str(self.output))
        packaged = json.loads((self.output / ".obsidian/plugins/quickadd/data.json").read_text())
        for choice in packaged["choices"]:
            with self.subTest(choice=choice["id"]):
                body = (self.output / choice["captureTo"]).read_text()
                self.assertIn(choice["insertAfter"]["after"], body.splitlines())
                self.assertNotIn("SYNTHETIC_PRIVATE_SENTINEL", body)
                self.assertNotIn("- [ ]", body)
                self.assertIn("## In progress", body)
                self.assertIn("## Done", body)
    def test_fixed_capture_heading_gate_matches_quickadd_context(self):
        choice = {"captureTo": "Board.md", "insertAfter": {
            "enabled": True, "after": "## Backlog   ", "createIfNotFound": False,
        }}
        self.assertTrue(fixed_capture_heading_present(choice, {"Board.md": "  ## Backlog\n"}))
        self.assertTrue(fixed_capture_heading_present(choice, {"Board.md": "## Backlog (ideas)\n"}))
        self.assertFalse(fixed_capture_heading_present(choice, {"Board.md": "## Ideas\n"}))
        contexts = [
            {**choice, "captureToActiveFile": True},
            {**choice, "insertAfter": {**choice["insertAfter"], "promptHeading": True}},
            {**choice, "insertAfter": {**choice["insertAfter"], "createIfNotFound": True}},
            {**choice, "insertAfter": {**choice["insertAfter"], "after": "## {{VALUE:lane}}"}},
            {**choice, "captureTo": "{{DATE:YYYY-MM-DD}}.md"},
            {**choice, "captureTo": "<% tp.date.now() %>.md"},
            {**choice, "insertAfter": {**choice["insertAfter"], "inline": True}},
            {**choice, "insertAfter": {**choice["insertAfter"], "after": "## Backlog\\nDetails"}},
            {**choice, "insertAfter": {**choice["insertAfter"], "after": "## Backlog\\Other"}},
        ]
        for contextual in contexts:
            with self.subTest(choice=contextual):
                texts = {contextual["captureTo"]: "## Ideas\n"}
                self.assertIsNone(fixed_capture_heading_present(contextual, texts))
    def test_archive_path_rules(self):
        for path in ["../escape", "/absolute", "root/../escape", "root\\escape", "C:/escape", "root//file"]:
            self.assertFalse(safe_name(path))
        self.assertTrue(safe_name("Candidate/Guide/Start Here.md"))
    def test_restore_rejects_traversal_and_bad_hash(self):
        archive = self.base / "unsafe.zip"
        with zipfile.ZipFile(archive, "w") as bundle:
            bundle.writestr("../escape", "synthetic")
        checksum = pathlib.Path(str(archive) + ".sha256")
        checksum.write_text(hashlib.sha256(archive.read_bytes()).hexdigest() + "  " + archive.name)
        with self.assertRaises(ValueError): verify_archive(archive)
        checksum.write_text("0" * 64 + "  " + archive.name)
        with self.assertRaises(ValueError): verify_archive(archive)

if __name__ == "__main__":
    unittest.main()
