from fastapi import FastAPI, HTTPException
import sys

# 1. Define the 'app' variable immediately.
app = FastAPI(
    title="Nordic Retail Dynamic Pricing & Demand Forecasting",
    description="An AI-driven assistant using RAG for product intelligence and ML for pricing/forecasting.",
    version="1.0.0"
)

# 2. Use a try/except Exception block to catch ALL import errors
try:
    # These imports are now safe because 'app' is already defined.
    from app.routers import deals, forecast, pricing
    from app.data_ingestion import run_full_ingestion 

    # --- Routers ---
    app.include_router(deals.router, prefix="/deals", tags=["RAG Deals"])
    app.include_router(forecast.router, prefix="/forecast", tags=["Demand Forecasting"])
    app.include_router(pricing.router, prefix="/pricing", tags=["Dynamic Pricing"])
    print("INFO:     All routers loaded successfully.")

except Exception as e:
    # This will now catch ANY error (ImportError, RuntimeError, etc.)
    # and print it to the console, allowing the server to start.
    print("="*50)
    print(f"CRITICAL STARTUP ERROR: Failed to load routers.")
    print(f"ERROR DETAILS: {e}")
    print("="*50)
    
    # Add a dummy endpoint so the server can start and show the error
    @app.get("/")
    def startup_error():
        raise HTTPException(
            status_code=500, 
            detail=f"Server startup failed. Check console logs for: {e}"
        )

# --- Health Check (defined outside the try block) ---
@app.get("/health", summary="Health Check", tags=["System"])
def health_check():
    """Confirms the API is running."""
    return {"status": "ok", "message": "Assistant is operational."}

# --- Ingestion Endpoint (defined outside the try block) ---
# This endpoint will only work if the imports in the 'try' block succeeded.
@app.post("/ingest/products", summary="Ingest Data from Kaggle to ChromaDB", tags=["System"])
def ingest_data():
    """Triggers the download, preprocessing, and loading of Kaggle data into the system."""
    try:
        # This function must be defined and imported in the 'try' block above
        message = run_full_ingestion()
        if "Failed" in message:
            raise HTTPException(status_code=500, detail=message)
        return {"status": "success", "message": message}
    except NameError:
        raise HTTPException(status_code=500, detail="Server failed to start: 'run_full_ingestion' not loaded. Check console logs.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {e}")

# --- Startup Event ---
@app.on_event("startup")
async def startup_event():
    print("FastAPI startup complete. Ensure Ollama is running.")