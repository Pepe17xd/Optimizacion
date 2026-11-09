from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit
from pathlib import Path
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs): super().__init__(*args,directory=str(Path('dist').resolve()),**kwargs)
 def translate_path(self,path):
  clean=urlsplit(path).path
  if not clean.startswith('/Optimizacion/'): return str(Path('dist/__not_found__').resolve())
  return super().translate_path(clean[len('/Optimizacion'):])
ThreadingHTTPServer(('127.0.0.1',8765),Handler).serve_forever()
