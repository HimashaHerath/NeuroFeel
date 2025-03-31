from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import WESAD apps
from server.wesad.dataserving import app as wesad_dataserving_app
from server.wesad.model import app as wesad_model_app


# Import Cross Dataset apps
from server.cross_dataset.dataserving import app as cross_dataserving_app
from server.cross_dataset.model import app as cross_model_app


import sys
import os

# Add server/ to the Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Create the main FastAPI app
app = FastAPI(
    title="Combined NeuroFeel API",
    description="Combined API for WESAD and Cross-Dataset emotion recognition",
    version="1.0.0",
)

# CORS Configuration
origins = [
    "https://neurofeel.vercel.app",  # Vercel frontend
    "http://localhost:3000",         # Local dev
    "https://neurofeel.space",       # Neurofeel space
    "https://www.neurofeel.space"    
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Mount WESAD apps under /wesad
app.mount("/wesad/dataserving", wesad_dataserving_app)
app.mount("/wesad/model", wesad_model_app)

# Mount Cross Dataset apps under /cross_dataset
app.mount("/cross_dataset/dataserving", cross_dataserving_app)
app.mount("/cross_dataset/model", cross_model_app)

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
