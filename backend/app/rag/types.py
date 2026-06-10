from dataclasses import dataclass


@dataclass
class ChunkHit:
    chunk_id: str
    document_id: str
    content: str
    score: float
