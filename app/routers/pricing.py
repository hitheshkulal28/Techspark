# app/routers/pricing.py
from fastapi import APIRouter
from app.schemas import PricingRecommendationRequest, PricingRecommendationResponse
from app.services.pricing_service import recommend_price

router = APIRouter()

@router.post(
    "/recommend",
    response_model=PricingRecommendationResponse,
    summary="Recommend Profit-Maximizing Price",
)
async def recommend_pricing(request: PricingRecommendationRequest):
    """
    Estimates price elasticity of demand and recommends the profit-maximizing price 
    subject to margin and competitor constraints.
    """
    
    recommendation = recommend_price(request)
    
    return recommendation