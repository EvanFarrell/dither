import argparse
import json
import re
import shutil
import subprocess
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from ipaddress import ip_address
from pathlib import Path
from tempfile import TemporaryDirectory
from threading import Lock
from zipfile import ZIP_DEFLATED, ZipFile


ROOT = Path(__file__).resolve().parents[1]
SLUG = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*")
LOCAL_HOST = re.compile(r"(?:localhost|127\.0\.0\.1)(?::[0-9]+)?")
NUMBER_OPTIONS = {"width": "width", "height": "height", "fps": "fps", "pixelSize": "pixel-size"}
export_lock = Lock()


class DitherHandler(SimpleHTTPRequestHandler):
    def json_error(self, status, message):
        body = json.dumps({"error": message}).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path != "/api/hero-export":
            self.json_error(404, "Unknown Dither endpoint.")
            return

        host = self.headers.get("Host", "")
        origin = self.headers.get("Origin")
        if not (ip_address(self.client_address[0]).is_loopback and LOCAL_HOST.fullmatch(host)
                and origin in (None, f"http://{host}")):
            self.json_error(403, "Open Dither on localhost to export a hero pack.")
            return
        if self.headers.get_content_type() != "application/json":
            self.json_error(415, "Hero settings must be sent as JSON.")
            return

        try:
            size = int(self.headers.get("Content-Length", "0"))
            if not 0 < size <= 2048:
                raise ValueError()
            settings = json.loads(self.rfile.read(size))
            scene, palette = settings["scene"], settings["palette"]
            if not all(isinstance(value, str) and SLUG.fullmatch(value) for value in (scene, palette)):
                raise ValueError()
            if not all(type(settings[key]) is int for key in NUMBER_OPTIONS):
                raise ValueError()
        except (KeyError, TypeError, ValueError):
            self.json_error(400, "Invalid hero export settings.")
            return

        if not export_lock.acquire(blocking=False):
            self.json_error(409, "A hero export is already running. Try again when it finishes.")
            return
        try:
            self.export_hero(scene, palette, settings)
        except (BrokenPipeError, ConnectionResetError):
            pass
        finally:
            export_lock.release()

    def export_hero(self, scene, palette, settings):
        with TemporaryDirectory(prefix="dither-hero-") as directory:
            out = Path(directory) / "assets"
            command = ["node", str(ROOT / "scripts/export-hero.mjs"), f"--scene={scene}",
                       f"--palette={palette}", f"--out={out}"]
            command.extend(f"--{flag}={settings[key]}" for key, flag in NUMBER_OPTIONS.items())
            try:
                result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, timeout=600)
            except FileNotFoundError:
                self.json_error(503, "Node.js is required to export a hero pack.")
                return
            except subprocess.TimeoutExpired:
                self.json_error(504, "The hero export timed out. Try a smaller size or frame rate.")
                return

            if result.returncode:
                errors = result.stderr.strip().splitlines()
                self.json_error(422, errors[-1] if errors else "Could not encode the hero pack.")
                return

            filename = f"{scene}-{palette}-hero.zip"
            archive = Path(directory) / filename
            with ZipFile(archive, "w", compression=ZIP_DEFLATED, compresslevel=3) as bundle:
                for file in sorted(out.iterdir()):
                    bundle.write(file, file.name)
            self.send_response(200)
            self.send_header("Content-Type", "application/zip")
            self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
            self.send_header("Content-Length", str(archive.stat().st_size))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            with archive.open("rb") as data:
                shutil.copyfileobj(data, self.wfile)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Serve Dither and its local hero exporter.")
    parser.add_argument("port", nargs="?", type=int, default=8420)
    parser.add_argument("--bind", default="127.0.0.1")
    parser.add_argument("--directory", default=str(ROOT))
    args = parser.parse_args()
    handler = partial(DitherHandler, directory=args.directory)
    with ThreadingHTTPServer((args.bind, args.port), handler) as server:
        print(f"Dither is running at http://{args.bind}:{server.server_port}", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
