import pandas as pd
import numpy as np
import os
import sys
import time
from langchain_core.documents import Document
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings
from typing import Dict, List, Tuple

# --- CONFIGURATION ---
DATASET_ID = "svizor/retail-sales-forecasting-data"
DOWNLOAD_PATH = "data/kaggle"
CHROMA_PATH = "./chroma_db"
EMBEDDING_MODEL = "nomic-embed-text" 
CHROMA_COLLECTION = "retail_products"
PROCESSED_DATA_PATH = "data/processed_sales.pkl"
OLLAMA_URL = "http://localhost:11434"


def get_kaggle_api():
    """
    Lazy load Kaggle API only when needed.
    This prevents import-time authentication errors.
    """
    try:
        from kaggle.api.kaggle_api_extended import KaggleApi
        api = KaggleApi()
        api.authenticate()
        return api
    except Exception as e:
        raise ConnectionError(
            f"❌ Kaggle API authentication failed: {e}\n"
            f"Make sure kaggle.json is in: {os.path.expanduser('~')}/.kaggle/\n"
            f"See: https://github.com/Kaggle/kaggle-api#api-credentials"
        )


def download_kaggle_dataset(dataset_id: str, path: str):
    """Downloads the Kaggle dataset using lazy-loaded API."""
    print(f"📥 Attempting to download {dataset_id}...")
    try:
        api = get_kaggle_api()  # ✅ Only loads when called
        os.makedirs(path, exist_ok=True)
        api.dataset_download_files(dataset_id, path=path, unzip=True)
        print(f"✅ Dataset downloaded successfully to {path}")
    except Exception as e:
        print(f"❌ Kaggle API Error: {e}")
        raise e


def preprocess_data(path: str) -> Tuple[pd.DataFrame, List[Document]]:
    """
    Loads raw data, applies business rules (defaults/features), 
    and creates LangChain Documents for RAG, and a DataFrame for ML services.
    """
    print("📊 Starting data preprocessing...")
    
    try:
        catalog_df = pd.read_csv(os.path.join(path, 'catalog.csv'))
        sales_df = pd.read_csv(os.path.join(path, 'sales.csv'), parse_dates=['date'])
    except FileNotFoundError as e:
        print(f"❌ Required files not found in {path}. Did the download fail?")
        raise FileNotFoundError(f"Missing CSV files in {path}: {e}")
        
    # Standardize column names
    catalog_df.rename(columns={'item_id': 'sku', 'item_type': 'name'}, inplace=True)
    sales_df.rename(columns={
        'item_id': 'sku', 
        'price_base': 'price', 
        'quantity': 'units_sold', 
        'store_id': 'region'
    }, inplace=True)
    
    # Merge a single price onto the catalog for RAG indexing
    price_map = sales_df.groupby('sku')['price'].mean()
    catalog_df['price'] = catalog_df['sku'].map(price_map).fillna(100.0)

    # Apply project assumptions/defaults to Catalog
    catalog_df['quality_score'] = catalog_df['dept_name'].astype('category').cat.codes.apply(
        lambda x: (x % 5) + 6
    )  # Score 6-10
    catalog_df['channel'] = np.random.choice(['online', 'in-store'], size=len(catalog_df))
    catalog_df['discount'] = np.random.uniform(0.0, 30.0, size=len(catalog_df))  # Random discount 0-30%
    catalog_df['region'] = catalog_df['region'].astype(str)  # Ensure region is string

    # Create LangChain Documents (for ChromaDB)
    documents = []
    current_season = time.strftime('%B')
    
    for _, row in catalog_df.iterrows():
        content = (
            f"Product: {row['name']} (SKU: {row['sku']}). "
            f"Category: {row['dept_name']} / {row['class_name']}. "
            f"Price: ${row['price']:.2f}. Quality: {row['quality_score']}/10. "
            f"Discount: {row['discount']:.1f}%."
        )
        
        metadata = {
            "sku": str(row['sku']),
            "name": str(row['name']),
            "region": str(row['region']), 
            "channel": str(row['channel']), 
            "quality_score": int(row['quality_score']),
            "price": float(row['price']),
            "discount": float(row['discount']),
            "seasonality_tags": current_season
        }
        
        documents.append(Document(page_content=content, metadata=metadata))

    # --- ML: Sales Data Processing ---
    sales_df['cost'] = sales_df['price'] * 0.6
    sales_df['promo'] = np.random.randint(0, 2, size=len(sales_df))
    sales_df['stock_level'] = np.random.randint(50, 500, size=len(sales_df))
    sales_df['channel'] = 'in-store'  # Set default channel
    sales_df['region'] = sales_df['region'].astype(str)  # Ensure region is string
    
    processed_sales_df = sales_df.dropna(subset=['price', 'units_sold']).copy()
    print(f"✅ Preprocessing complete. {len(documents)} documents created, {len(processed_sales_df)} sales records processed.")

    return processed_sales_df, documents


def ingest_data_setup(processed_sales_df: pd.DataFrame, documents: List[Document]):
    """Embeds documents and loads them into ChromaDB, and saves the ML DataFrame."""
    
    print("🔄 Initializing Ollama embeddings...")
    embeddings = OllamaEmbeddings(model=EMBEDDING_MODEL, base_url=OLLAMA_URL)

    print(f"📚 Loading {len(documents)} documents into ChromaDB...")
    
    # Ensure the directory exists
    os.makedirs(CHROMA_PATH, exist_ok=True)
    
    # Initialize the vector store with documents
    vector_store = Chroma.from_documents(
        documents=documents,
        embedding=embeddings,
        collection_name=CHROMA_COLLECTION,
        persist_directory=CHROMA_PATH
    )
    
    print("✅ ChromaDB population complete and persisted.")

    # Save the processed sales data for ML services
    os.makedirs(os.path.dirname(PROCESSED_DATA_PATH), exist_ok=True)
    processed_sales_df.to_pickle(PROCESSED_DATA_PATH)
    print(f"💾 Processed sales data saved at {PROCESSED_DATA_PATH}.")


def run_full_ingestion() -> str:
    """
    Orchestrates the entire ingestion process.
    This is the main entry point called by the FastAPI endpoint.
    """
    try:
        print("="*60)
        print("🚀 Starting Full Data Ingestion Pipeline")
        print("="*60)
        
        # Step 1: Download
        download_kaggle_dataset(DATASET_ID, DOWNLOAD_PATH)
        
        # Step 2: Preprocess
        processed_sales_df, documents = preprocess_data(DOWNLOAD_PATH)
        
        # Step 3: Ingest to ChromaDB and save ML data
        ingest_data_setup(processed_sales_df, documents)
        
        success_msg = (
            f"✅ Data ingestion successful!\n"
            f"   - {len(documents)} products indexed in ChromaDB\n"
            f"   - {len(processed_sales_df)} sales records saved for ML\n"
            f"   - ChromaDB location: {CHROMA_PATH}\n"
            f"   - ML data location: {PROCESSED_DATA_PATH}"
        )
        print("="*60)
        print(success_msg)
        print("="*60)
        return success_msg
        
    except Exception as e:
        error_msg = f"❌ Ingestion Failed: {str(e)}"
        print(error_msg, file=sys.stderr)
        return error_msg


# Optional: Allow running this script directly for testing
if __name__ == "__main__":
    result = run_full_ingestion()
    print(result)