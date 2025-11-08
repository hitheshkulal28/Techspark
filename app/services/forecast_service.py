# app/services/forecast_service.py
import pandas as pd
from prophet import Prophet
from prophet.make_holidays import make_holidays_df
from typing import List, Dict

# In a real app, this data would be loaded from a persistent store,
# but here we load a mock/processed DataFrame once.
try:
    # MOCK DATA LOAD: In a real app, sales data is pre-aggregated
    # sales_df = pd.read_csv('data/sales.csv', parse_dates=['date'])
    # For a placeholder, let's create a dummy DataFrame:
    date_range = pd.date_range(start='2023-01-01', periods=365, freq='D')
    sales_df = pd.DataFrame({
        'date': date_range,
        'units_sold': (100 + 5 * date_range.dayofyear + 50 * (date_range.month.isin([6, 12])) + 10 * (date_range.day_name() == 'Friday')).astype(int),
        'sku': 'SKU123',
        'region': 'North',
        'channel': 'online'
    })
    sales_df.rename(columns={'date': 'ds', 'units_sold': 'y'}, inplace=True)
    
except FileNotFoundError:
    print("Warning: Mock sales data not found.")
    sales_df = pd.DataFrame()


def generate_forecast(sku: str, region: str, channel: str, horizon: str) -> List[Dict]:
    # 1. Filter Data for specific Time Series (SKU-Region-Channel)
    filtered_df = sales_df[
        (sales_df['sku'] == sku) & 
        (sales_df['region'] == region) & 
        (sales_df['channel'] == channel)
    ].copy()
    
    if filtered_df.empty:
        # Fallback for missing data
        return []

    # 2. Add Holidays (Customizing for Nordic retail)
    # Using holidays for Denmark as a Nordic example
    # Note: Prophet's holiday functionality needs a 'holidays' df.
    # The `make_holidays_df` function is usually for external use,
    # Prophet supports adding country holidays directly via `add_country_holidays`.
    
    # 3. Initialize and Fit Prophet Model
    m = Prophet(
        interval_width=0.90, # 90% confidence interval
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False
    )
    # m.add_country_holidays(country_name='DK') # Denmark holidays for Nordic example

    m.fit(filtered_df[['ds', 'y']])

    # 4. Create Future Dataframe and Predict
    # horizon e.g., '8w' for 8 weeks
    future = m.make_future_dataframe(periods=pd.to_timedelta(horizon).days, freq='D')
    forecast = m.predict(future)

    # 5. Format Output
    # Select only the future dates for the API response
    future_forecast = forecast[forecast['ds'] > filtered_df['ds'].max()]
    
    result = []
    for _, row in future_forecast.iterrows():
        result.append({
            'date': row['ds'].strftime('%Y-%m-%d'),
            'demand': max(0, int(round(row['yhat']))), # Demand must be non-negative integer
            'confidence_low': max(0, int(round(row['yhat_lower']))),
            'confidence_high': max(0, int(round(row['yhat_upper']))),
        })
        
    return result