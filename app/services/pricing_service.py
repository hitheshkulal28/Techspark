# app/services/pricing_service.py
import pandas as pd
import numpy as np
import statsmodels.api as sm
from typing import Optional, Tuple
from app.schemas import PricingRecommendationResponse
from app.services.forecast_service import generate_forecast # To get future demand

# Global Data Load (using mock sales data for elasticity)
try:
    # MOCK DATA LOAD: Sales data with price and units sold
    date_range = pd.date_date_range(start='2024-01-01', periods=100, freq='W')
    sales_data = pd.DataFrame({
        'date': date_range,
        'sku': 'SKU123',
        'region': 'North',
        'channel': 'online',
        'price': np.linspace(100, 150, 100) + np.random.normal(0, 5, 100), # Price variation
        'units_sold': 500 - 3 * np.linspace(100, 150, 100) + np.random.normal(0, 20, 100), # Quantity variation
        'promo': np.random.randint(0, 2, 100),
        'stock_level': np.random.randint(100, 500, 100)
    })
    sales_data['units_sold'] = sales_data['units_sold'].clip(lower=10) # Clip minimum sales
except:
    sales_data = pd.DataFrame()


def estimate_price_elasticity(df: pd.DataFrame) -> Tuple[Optional[float], Optional[float]]:
    # Log-Log Model: log(Demand) ~ log(Price) + Controls
    df['log_units_sold'] = np.log(df['units_sold'])
    df['log_price'] = np.log(df['price'])
    
    # Independent variables (Log-Price + Controls)
    X = df[['log_price', 'promo', 'stock_level']].fillna(0) # Include dummy/control variables
    X = sm.add_constant(X)
    
    # Dependent variable
    Y = df['log_units_sold']
    
    # Run OLS Regression
    try:
        model = sm.OLS(Y, X, missing='drop').fit()
        # The coefficient of log_price is the price elasticity (epsilon)
        elasticity = model.params.get('log_price')
        r_squared = model.rsquared
        return elasticity, r_squared
    except Exception:
        # Fallback if regression fails (e.g., constant price, zero sales)
        return -2.0, 0.0 # Default to -2.0 (elastic) if calculation fails


def recommend_price(request: PricingRecommendationRequest) -> PricingRecommendationResponse:
    # 1. Data Filtering and Cost Assignment
    cost = request.cost if request.cost is not None else (request.current_price * 0.6)
    
    # Filter historical data for elasticity calculation
    df = sales_data[
        (sales_data['sku'] == request.sku) & 
        (sales_data['region'] == request.region) & 
        (sales_data['channel'] == request.channel)
    ]

    if df.empty:
        return PricingRecommendationResponse(
            sku=request.sku, elasticity_coefficient=0.0, recommended_price=request.current_price, 
            max_profit_estimate=0.0, rationale="Insufficient historical sales data to calculate elasticity."
        )

    # 2. Elasticity Estimation
    elasticity, r_squared = estimate_price_elasticity(df)
    
    # 3. Forecast Next Period Demand (for profit simulation)
    # We use a 1-period (1-week) forecast for the optimization step
    forecast_results = generate_forecast(request.sku, request.region, request.channel, horizon='1w')
    if not forecast_results:
        q_forecast = df['units_sold'].mean() # Fallback to historical average
        forecast_reason = "Forecast unavailable, using historical average demand."
    else:
        q_forecast = forecast_results[0]['demand'] # Use first period's demand
        forecast_reason = f"Demand forecast (Q) used: {q_forecast} units/period."

    # 4. Profit Maximization Calculation
    # Profit Maximizing Price (P*) using the Constant Elasticity formula:
    # P* = Cost / (1 + 1/Elasticity) -> P* = Cost * (Elasticity / (Elasticity + 1))
    
    if elasticity >= -0.01: # Essentially inelastic or positive (unrealistic), set high price or competitor price
        p_star = request.current_price * 1.05 # Tentative small increase
        rationale_core = f"Demand is inelastic ({elasticity:.2f}), suggesting price is too low, or elasticity model failed."
    elif elasticity < -10.0: # Extremely elastic, clamp to a small markup
        p_star = cost * (1 + request.min_margin_percent) * 1.1 # Small markup
        rationale_core = f"Demand is extremely elastic ({elasticity:.2f}), suggesting a small price increase above cost for profit."
    else:
        # Standard calculation for P* when elasticity is between -10 and -0.01
        p_star = cost * (elasticity / (elasticity + 1))
        rationale_core = f"Optimal price derived from constant elasticity formula. Elasticity ($\epsilon$) is {elasticity:.2f} (R-squared: {r_squared:.2f})."

    # 5. Apply Constraints and Final Price Selection
    final_price = p_star
    
    # Constraint A: Min Margin
    min_price_margin = cost * (1 + request.min_margin_percent)
    if final_price < min_price_margin:
        final_price = min_price_margin
        rationale_core += f" Final price clamped to meet minimum {request.min_margin_percent:.0%} margin constraint."
    
    # Constraint B: Competitor Price Bound
    if request.competitor_price_bound is not None and final_price > request.competitor_price_bound:
        final_price = request.competitor_price_bound
        rationale_core += " Final price capped by the competitor price bound."

    # 6. Estimate Max Profit at Recommended Price
    # Since we use OLS, we can estimate new demand (Q_new) at final_price
    # Q_new = Q_forecast * (final_price / current_price)**elasticity
    try:
        q_new = q_forecast * (final_price / request.current_price)**elasticity
    except:
        q_new = q_forecast # Fallback
        
    estimated_profit = max(0, (final_price - cost) * q_new)

    return PricingRecommendationResponse(
        sku=request.sku,
        elasticity_coefficient=elasticity,
        recommended_price=round(final_price, 2),
        max_profit_estimate=round(estimated_profit, 2),
        rationale=f"Recommended Price: {round(final_price, 2):.2f}. {rationale_core} {forecast_reason}"
    )