import uvicorn
import os
import sys

# Crucial step: Add the parent directory (which contains the 'app' folder) 
# to the system path so Python can find 'app.main' correctly.
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app", 
        host="127.0.0.1", 
        port=8000, 
        reload=False,  # <--- THIS IS THE FIX. We disable the reloader.
        log_level="info"
    )