# app/schemas.py
from pydantic import BaseModel, Field
from typing import List, Optional

# --- RAG Search + Best Deals Schemas ---
class DealItem(BaseModel):
    sku: str = Field(..., description="Unique product SKU.")
    name: str = Field(..., description="Product name.")
    price: float = Field(..., description="Current selling price.")
    quality_score: int = Field(..., description="Quality score (1-10, inferred if missing).")
    discount_percent: float = Field(..., description="Current discount percentage (0.0 to 100.0).")
    reason: str = Field(..., description="A friendly, short sentence explaining why this is a good deal (provided by LLM).")

class DealResponse(BaseModel):
    query: str = Field(..., description="The original search query.")
    deals: List[DealItem] = Field(..., description="The ranked list of best deals.")
    explanation: str = Field(..., description="A general summary/friendly explanation of the top deals provided by the LLM.")


# --- Demand Forecasting Schemas ---
class ForecastPoint(BaseModel):
    date: str = Field(..., description="The forecast date in YYYY-MM-DD format.")
    demand: int = Field(..., description="The median units_sold forecast (yhat).")
    confidence_low: int = Field(..., description="Lower bound of the confidence interval (yhat_lower).")
    confidence_high: int = Field(..., description="Upper bound of the confidence interval (yhat_upper).")

class ForecastRequest(BaseModel):
    sku: str
    region: str
    channel: str
    horizon: str = Field("8w", description="Forecast horizon (e.g., '4w', '8w', '60d').")

class ForecastResponse(BaseModel):
    sku: str
    region: str
    channel: str
    forecast_series: List[ForecastPoint]


# --- Dynamic Pricing Schemas ---
class PricingRecommendationRequest(BaseModel):
    sku: str
    region: str
    channel: str
    current_price: float
    cost: Optional[float] = Field(None, description="Marginal cost. Assumed to be 60% of price if None.")
    min_margin_percent: float = Field(0.10, description="Minimum acceptable gross margin (e.g., 0.10 for 10%).")
    # Placeholder for competitor check:
    competitor_price_bound: Optional[float] = Field(None, description="Upper price limit based on competitor pricing.")

class PricingRecommendationResponse(BaseModel):
    sku: str
    elasticity_coefficient: float = Field(..., description="The estimated price elasticity of demand (log-log coefficient).")
    recommended_price: float = Field(..., description="The profit-maximizing price.")
    max_profit_estimate: float = Field(..., description="Estimated weekly profit at the recommended price.")
    rationale: str = Field(..., description="Detailed explanation of the price recommendation.")