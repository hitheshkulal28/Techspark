# app/routers/forecast.py
from fastapi import APIRouter
from app.schemas import ForecastRequest, ForecastResponse
from app.services.forecast_service import generate_forecast

router = APIRouter()

@router.get(
    "/forecast",
    response_model=ForecastResponse,
    summary="Generate Demand Forecast Series (Prophet)",
)
async def get_forecast(
    sku: str, 
    region: str, 
    channel: str, 
    horizon: str = '8w'
):
    """Generates the next N periods demand forecast and confidence intervals for a specific SKU-Region-Channel combination."""
    
    forecast_data = generate_forecast(sku, region, channel, horizon)
    
    return ForecastResponse(
        sku=sku,
        region=region,
        channel=channel,
        forecast_series=forecast_data
    )