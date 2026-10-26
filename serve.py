#!/usr/bin/env python3
"""
AstroMotion - Local Development Server
Starts a local HTTP server and launches the default web browser.
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class AstroHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS and disable cache during development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def guess_type(self, path):
        # Ensure correct MIME types for modern ES modules
        if path.endswith('.js') or path.endswith('.mjs'):
            return 'application/javascript; charset=utf-8'
        if path.endswith('.css'):
            return 'text/css; charset=utf-8'
        return super().guess_type(path)

def run():
    port = PORT
    max_retries = 10
    httpd = None

    for i in range(max_retries):
        try:
            httpd = socketserver.TCPServer(("", port), AstroHandler)
            break
        except OSError:
            print(f"Port {port} is occupied, trying port {port + 1}...")
            port += 1

    if not httpd:
        print(f"Error: Unable to bind to any port between {PORT} and {PORT + max_retries}")
        sys.exit(1)

    url = f"http://localhost:{port}/index.html"
    print("\n" + "=" * 60)
    print("  🚀 AstroMotion — Celestial Motion Simulator is Running!")
    print(f"  👉 URL: {url}")
    print("  Press Ctrl+C to stop the server.")
    print("=" * 60 + "\n")

    # Automatically open default web browser
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"Could not open browser automatically: {e}")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        httpd.server_close()

if __name__ == '__main__':
    run()
