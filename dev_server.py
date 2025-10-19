#!/usr/bin/env python3
"""
Простой HTTP сервер с заголовками no-cache для разработки.
Использование: python dev_server.py
"""

import http.server
import socketserver
import os
from urllib.parse import urlparse

PORT = 3000

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Добавляем заголовки для отключения кэширования
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        # Меняем кодировку логов на UTF-8 для корректного отображения
        print(f"[SERVER] {format % args}")

def run_server():
    with socketserver.TCPServer(("", PORT), NoCacheHTTPRequestHandler) as httpd:
        print(f"Сервер запущен на порту {PORT}")
        print(f"URL: http://localhost:{PORT}")
        print("Заголовки no-cache включены")
        print("Нажмите Ctrl+C для остановки")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nСервер остановлен")

if __name__ == "__main__":
    run_server()
