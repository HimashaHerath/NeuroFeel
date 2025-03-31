from fastapi import FastAPI
from dataserving import app as dataserving_app
from model import app as model_app

app = FastAPI(
    title="Combined WESAD API",
    description="Combined API for data serving and model demonstration"
)

app.mount("/wesad/dataserving", dataserving_app)
app.mount("/wesad/model", model_app)
