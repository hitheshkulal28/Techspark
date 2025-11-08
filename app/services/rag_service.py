import json
from typing import List, Dict, Optional, Tuple
from langchain_community.llms import Ollama
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import PydanticOutputParser
from app.schemas import DealResponse
import os
import sys

# Configuration
OLLAMA_URL = "http://localhost:11434"
OLLAMA_MODEL = "llama3.2" 
EMBEDDING_MODEL = "nomic-embed-text" 
CHROMA_PATH = "./chroma_db"
CHROMA_COLLECTION = "retail_products"

# Global cache for components (initialized only once)
_rag_cache: Dict[str, Optional[any]] = {
    "llm": None,
    "embeddings": None,
    "vectorstore": None,
    "parser": PydanticOutputParser(pydantic_object=DealResponse)
}

def get_rag_components():
    """Initializes and returns Ollama and Chroma components, caching them after first use."""
    global _rag_cache
    
    if _rag_cache["vectorstore"] is None:
        try:
            print("RAG: Initializing Ollama embeddings and Chroma connection...")
            _rag_cache["llm"] = Ollama(model=OLLAMA_MODEL, base_url=OLLAMA_URL)
            _rag_cache["embeddings"] = OllamaEmbeddings(model=EMBEDDING_MODEL, base_url=OLLAMA_URL)
            
            _rag_cache["vectorstore"] = Chroma(
                persist_directory=CHROMA_PATH, 
                embedding_function=_rag_cache["embeddings"],
                collection_name=CHROMA_COLLECTION
            )
        except Exception as e:
            print(f"RAG Service Initialization Error: {e}")
            raise ConnectionError(f"RAG service failed to connect to Ollama or Chroma. Error: {e}")

    return _rag_cache["llm"], _rag_cache["vectorstore"], _rag_cache["parser"]


def format_docs(docs: List) -> str:
    """Formats retrieved documents into a string for the LLM prompt."""
    context_list = []
    for i, doc in enumerate(docs):
        metadata = doc.metadata
        context_list.append(
            f"--- Product {i+1} ---\n"
            f"SKU: {metadata.get('sku', 'N/A')}\n"
            f"Name: {metadata.get('name', 'N/A')}\n"
            f"Description: {doc.page_content[:150]}...\n"
            f"Price: {metadata.get('price', 999.0):.2f}\n"
            f"Discount: {metadata.get('discount', 0.0):.2f}%\n"
            f"Quality Score: {metadata.get('quality_score', 5)}/10\n"
        )
    return "\n".join(context_list)


def search_deals(query: str, region: str, channel: str, top_k: int) -> DealResponse:
    llm, vectorstore, parser = get_rag_components() # Initialize components here
    
    chroma_filter = {
        "$and": [
            {"region": {"$eq": region}},
            {"channel": {"$eq": channel}}
        ]
    }
    
    retrieved_docs = vectorstore.similarity_search(query, k=top_k * 3, where=chroma_filter)

    if not retrieved_docs:
        return DealResponse(query=query, deals=[], explanation=f"No products found matching '{query}' in {region}/{channel}. Run ingestion first?")

    context_str = format_docs(retrieved_docs)

    template = f"""
    You are an expert retail deals analyzer. Your task is to rank the best product deals from the provided context 
    based on the user's query, prioritizing products with a low price, high quality_score (1-10), and a high discount.
    
    User Query: {{query}}
    Filter Details: Region={{region}}, Channel={{channel}}
    
    **CRITERIA**: Rank by a balanced score of (Discount * QualityScore) / Price. Select only the top {{{{top_k}}}} items.
    
    CONTEXT (Retrieved Products):
    {{context}}
    
    INSTRUCTIONS: 
    1. STRICTLY follow the JSON schema provided below for your response.
    2. Do NOT include any text outside the JSON block.
    3. The 'reason' field for each deal must be a single, friendly, and concise sentence.
    4. The 'explanation' field must be a short paragraph summarizing why these deals were chosen overall.
    
    JSON Schema:
    {{format_instructions}}
    """
    
    # 1. Create the prompt template
    prompt = ChatPromptTemplate.from_messages([
        ("system", template.replace("{{format_instructions}}", parser.get_format_instructions())),
        ("human", f"Find the best deals for: {{query}}")
    ])

    # 2. Define the input variables for the chain
    # This dictionary provides all the necessary values for the prompt templates.
    chain_input = {
        "query": query,
        "region": region,
        "channel": channel,
        "top_k": top_k,
        "context": context_str
    }
    
    # 3. Create the final chain: prompt -> llm -> parser
    # The PydanticOutputParser (parser) is now correctly integrated at the end of the chain.
    chain = prompt | llm | parser
    
    # 4. Invoke the chain
    try:
        # Pass the prepared input dictionary to the chain
        return chain.invoke(chain_input)
    except Exception as e:
        print(f"LLM Chain Invocation or Parsing Error: {e}")
        # Fallback response if LLM output cannot be parsed
        return DealResponse(query=query, deals=[], explanation=f"AI parsing failed. Error: {e}. Check Ollama server logs.")