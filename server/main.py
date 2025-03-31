from fastapi import FastAPI

# Import WESAD apps
from wesad.dataserving import app as wesad_dataserving_app
from wesad.model import app as wesad_model_app

# Import Cross Dataset apps
from cross_dataset.dataserving import app as cross_dataserving_app
from cross_dataset.model import app as cross_model_app

app = FastAPI(
    title="Combined NeuroFeel API",
    description="Combined API for WESAD and Cross-Dataset emotion recognition",
    version="1.0.0"
)

# Mount WESAD apps under /wesad
app.mount("/wesad/dataserving", wesad_dataserving_app)
app.mount("/wesad/model", wesad_model_app)

# Mount Cross Dataset apps under /cross_dataset
app.mount("/cross_dataset/dataserving", cross_dataserving_app)
app.mount("/cross_dataset/model", cross_model_app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
