"""Vercel Serverless Function entry-point.

Adds ``backend/`` to ``sys.path`` so all ``from app.…`` imports resolve,
then re-exports the FastAPI ``app`` object for Vercel to serve under /api/*.

Table creation is already handled inside ``app.main`` on import.
"""

import sys
from pathlib import Path

_backend_dir = str(Path(__file__).resolve().parent.parent / "backend")
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from app.main import app 
