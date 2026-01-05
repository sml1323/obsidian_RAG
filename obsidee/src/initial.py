# embeddings.py
from __future__ import annotations
from dataclasses import dataclass
from typing import Protocol, TypeAlias

Vector: TypeAlias = list[float]

class EmbeddingStrategy(Protocol):
    def embed(self, texts: list[str]) -> list[Vector]:
        ...

@dataclass
class EmbeddingConfig:
    provider: str = "bge"
    model: str | None = None
    api_key: str | None = None
    # TODO: 필요하면 추가 필드 (device, cache_dir 등)

class BGEEmbedder:
    def __init__(self, model: str | None = None) -> None:
        # TODO: 모델 로드 or 경로 저장
        ...

    def embed(self, texts: list[str]) -> list[Vector]:
        # TODO: 임베딩 계산
        ...

class OpenAIEmbedder:
    def __init__(self, model: str, api_key: str) -> None:
        # TODO: 클라이언트 초기화
        ...

    def embed(self, texts: list[str]) -> list[Vector]:
        # TODO: OpenAI 임베딩 호출
        ...

class EmbeddingProviderFactory:
    @staticmethod
    def create(config: EmbeddingConfig) -> EmbeddingStrategy:
        provider = config.provider.lower()
        if provider == "bge":
            # TODO: BGE용 검증/기본값
            return BGEEmbedder(model=config.model)
        if provider == "openai":
            if not config.api_key:
                raise ValueError("OpenAI api_key is required for provider 'openai'")
            if not config.model:
                raise ValueError("OpenAI model is required for provider 'openai'")
            return OpenAIEmbedder(model=config.model, api_key=config.api_key)
        raise ValueError(f"Unknown embedding provider: {config.provider}")
