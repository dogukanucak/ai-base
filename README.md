# RAG System with LangChain

A flexible and configurable Retrieval-Augmented Generation (RAG) system built with LangChain.

## Features

- Multiple text splitting strategies (Character, Markdown, Recursive, Token-based)
- Advanced retrieval methods (Similarity, MMR, Hybrid search)
- Support for various document types (PDF, DOCX, Markdown, Text)
- Configurable chunking and retrieval parameters
- Integration with ChromaDB for vector storage
- Optional OpenAI integration for enhanced capabilities

## Configuration

All settings can be configured through environment variables:

### Embedding Configuration

- `EMBEDDING_MODEL`: Model name for embeddings (default: "Xenova/all-MiniLM-L6-v2")

### Chunking Configuration

- `CHUNKING_TYPE`: Type of text splitter ("character", "markdown", "recursive", "token")
- `CHUNK_SIZE`: Size of text chunks
- `CHUNK_OVERLAP`: Overlap between chunks
- `CHUNK_SEPARATORS`: JSON array of custom separators
- `TOKEN_ENCODING`: Encoding name for token-based splitting
- `TOKEN_BUDGET`: Token budget for splitting

### Retrieval Configuration

- `RETRIEVAL_TYPE`: Type of retrieval ("similarity", "mmr", "hybrid")
- `FETCH_K`: Number of documents to fetch
- `LAMBDA_MULT`: Lambda multiplier for MMR
- `SCORE_THRESHOLD`: Minimum similarity score threshold
- `USE_RERANKING`: Enable/disable reranking (true/false)
- `QUERY_COUNT`: Number of query variations for hybrid search

### Vector Store Configuration

- `COLLECTION_NAME`: Name of the ChromaDB collection
- `CHROMA_URL`: URL of the ChromaDB instance

### Document Loader Configuration

- `DOCUMENT_TYPE`: Type of documents to load
- `DOCUMENTS_PATH`: Path to documents directory
- `LOAD_DOCUMENTS`: Enable/disable document loading (true/false)

### OpenAI Configuration

- `USE_OPENAI`: Enable/disable OpenAI integration (true/false)
- `OPENAI_API_KEY`: OpenAI API key
- `OPENAI_MODEL`: OpenAI model name
- `OPENAI_MAX_TOKENS`: Maximum tokens for OpenAI responses
- `OPENAI_TEMPERATURE`: Temperature for OpenAI responses

### Console Configuration

- `CONSOLE_MAX_RESPONSE_LENGTH`: Maximum length for console responses
- `SHOW_DEBUG_INFO`: Show debug information (true/false)
- `TRUNCATE_DOCUMENTS`: Truncate document previews (true/false)
- `DOCUMENT_PREVIEW_LENGTH`: Length of document previews

## Example .env file

```env
# Embedding
EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2

# Chunking
CHUNKING_TYPE=recursive
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
CHUNK_SEPARATORS=["\\n\\n", "\\n", " ", ""]
TOKEN_ENCODING=cl100k_base
TOKEN_BUDGET=4000

# Retrieval
RETRIEVAL_TYPE=mmr
FETCH_K=10
LAMBDA_MULT=0.7
SCORE_THRESHOLD=0.8
USE_RERANKING=true
QUERY_COUNT=3

# Vector Store
COLLECTION_NAME=documents
CHROMA_URL=http://localhost:8000

# Document Loader
DOCUMENT_TYPE=multi
DOCUMENTS_PATH=./documents
LOAD_DOCUMENTS=true

# OpenAI
USE_OPENAI=true
OPENAI_API_KEY=your-api-key
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7

# Console
CONSOLE_MAX_RESPONSE_LENGTH=1000
SHOW_DEBUG_INFO=true
TRUNCATE_DOCUMENTS=true
DOCUMENT_PREVIEW_LENGTH=200
```

## Usage

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Copy `.env.example` to `.env` and configure as needed
4. Start the server: `pnpm start:server`

## License

MIT
