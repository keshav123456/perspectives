import http.server
import socketserver
import urllib.parse
from scraper import scrape_google
import json

PORT = 8080

class MyHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        # Parse query parameters
        parsed_path = urllib.parse.urlparse(self.path)
        text = urllib.parse.parse_qs(parsed_path.query).get('text', [''])[0]
        
        # Convert text to lowercase
        res = scrape_google(text)
        
        # Send response
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(res).encode())

with socketserver.TCPServer(("", PORT), MyHandler) as httpd:
    print("Server running on port", PORT)
    httpd.serve_forever()


