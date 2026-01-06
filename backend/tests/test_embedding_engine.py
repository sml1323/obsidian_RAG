import pytest
from unittest.mock import MagicMock, patch
from app.embedding_engine import EmbeddingStrategy, LocalEmbeddingStrategy, OpenAIEmbeddingStrategy, VectorStoreManager

@patch("app.embedding_engine.HuggingFaceEmbeddings")
def test_local_strategy_structure(mock_hf):
    # Setup mock
    mock_instance = MagicMock()
    mock_hf.return_value = mock_instance
    mock_instance.embed_documents.return_value = [[0.1, 0.2]]
    mock_instance.embed_query.return_value = [0.1, 0.2]

    strategy = LocalEmbeddingStrategy()
    assert isinstance(strategy, EmbeddingStrategy)
    
    # Test delegation
    res = strategy.embed_documents(["test"])
    mock_instance.embed_documents.assert_called_with(["test"])
    assert res == [[0.1, 0.2]]

@patch("app.embedding_engine.OpenAIEmbeddings")
def test_openai_strategy_structure(mock_openai):
    # Setup mock
    mock_instance = MagicMock()
    mock_openai.return_value = mock_instance
    
    strategy = OpenAIEmbeddingStrategy()
    assert isinstance(strategy, EmbeddingStrategy)

@patch("app.embedding_engine.Chroma")
@patch("app.embedding_engine.HuggingFaceEmbeddings") # Mock strategy dependency too
def test_vector_store_manager_init(mock_hf, mock_chroma):
    mock_strategy = LocalEmbeddingStrategy()
    
    manager = VectorStoreManager(mock_strategy, persist_directory="./test_db")
    
    assert manager.strategy == mock_strategy
    assert manager.persist_directory == "./test_db"
    mock_chroma.assert_called_once()
    
@patch("app.embedding_engine.Chroma")
@patch("app.embedding_engine.HuggingFaceEmbeddings")
def test_vector_store_upsert(mock_hf, mock_chroma):
    mock_strategy = LocalEmbeddingStrategy()
    mock_vectorstore_instance = MagicMock()
    mock_chroma.return_value = mock_vectorstore_instance
    
    manager = VectorStoreManager(mock_strategy)
    
    # Test empty upsert
    manager.upsert_documents([])
    mock_vectorstore_instance.add_documents.assert_not_called()
    
    # Test valid upsert
    docs = [MagicMock()]
    manager.upsert_documents(docs)
    mock_vectorstore_instance.add_documents.assert_called_once_with(docs)
