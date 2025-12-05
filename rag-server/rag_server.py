#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RAG 서버 - 면접 우수 답변 검색 시스템
실행: python rag_server.py
"""

import os
import sys
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import chromadb
from chromadb.config import Settings
import google.generativeai as genai
from dotenv import load_dotenv
import uvicorn

# Windows 콘솔 UTF-8 인코딩 설정
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# .env 파일 로드
load_dotenv()

# Gemini API 설정
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("ERROR: GEMINI_API_KEY가 .env 파일에 없습니다!")
    sys.exit(1)

genai.configure(api_key=GEMINI_API_KEY)

# FastAPI 앱
app = FastAPI(
    title="Raon RAG Server",
    description="면접 우수 답변 검색 시스템",
    version="1.0.0"
)

# Chroma 클라이언트 초기화
chroma_client = chromadb.PersistentClient(path="./chroma_data")
collection = chroma_client.get_or_create_collection(
    name="interview_examples",
    metadata={"description": "면접 우수 답변 예시"}
)

# 요청/응답 모델
class SearchRequest(BaseModel):
    question: str
    top_k: int = 3

class SearchResponse(BaseModel):
    examples: List[dict]

class AddExampleRequest(BaseModel):
    question: str
    answer: str
    score: int
    category: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    collection_count: int

# Google Embedding API로 임베딩 생성
def get_embedding(text: str) -> List[float]:
    """Google Embedding API를 사용하여 텍스트를 벡터로 변환"""
    try:
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=text,
            task_type="retrieval_document"
        )
        return result['embedding']
    except Exception as e:
        print(f"❌ 임베딩 생성 실패: {e}")
        raise HTTPException(status_code=500, detail=f"임베딩 생성 실패: {str(e)}")

@app.get("/")
def root():
    """루트 엔드포인트"""
    return {
        "message": "Raon RAG Server",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "search": "POST /search",
            "add": "POST /add",
            "stats": "/stats"
        }
    }

@app.get("/health", response_model=HealthResponse)
def health_check():
    """헬스 체크"""
    count = collection.count()
    return HealthResponse(status="ok", collection_count=count)

@app.post("/search", response_model=SearchResponse)
def search_similar_examples(request: SearchRequest):
    """
    질문과 유사한 우수 답변 검색

    Args:
        request.question: 검색할 질문
        request.top_k: 반환할 결과 개수 (기본 3개)

    Returns:
        유사한 답변 예시 목록
    """
    try:
        # 1. 질문을 벡터로 변환
        print(f"🔍 검색 요청: {request.question[:50]}...")
        query_embedding = get_embedding(request.question)

        # 2. 벡터 유사도 검색
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=min(request.top_k, collection.count()) if collection.count() > 0 else 1
        )

        # 3. 결과 포맷팅
        examples = []
        if results['documents'] and len(results['documents'][0]) > 0:
            for i in range(len(results['documents'][0])):
                examples.append({
                    "question": results['metadatas'][0][i].get('question', ''),
                    "answer": results['documents'][0][i],
                    "score": results['metadatas'][0][i].get('score', 0),
                    "category": results['metadatas'][0][i].get('category', '일반'),
                    "similarity": 1 - results['distances'][0][i] if results['distances'] else 0
                })

            print(f"✅ {len(examples)}개 결과 반환")
        else:
            print("⚠️ 검색 결과 없음")

        return SearchResponse(examples=examples)

    except Exception as e:
        print(f"❌ 검색 실패: {e}")
        raise HTTPException(status_code=500, detail=f"검색 실패: {str(e)}")

@app.post("/add")
def add_example(request: AddExampleRequest):
    """
    우수 답변 예시 추가

    Args:
        request.question: 질문
        request.answer: 답변
        request.score: 점수 (0-100)
        request.category: 카테고리 (선택)
    """
    try:
        # 1. 질문을 벡터로 변환
        print(f"➕ 답변 추가: {request.question[:50]}... (점수: {request.score})")
        embedding = get_embedding(request.question)

        # 2. Chroma에 저장
        doc_id = f"example_{hash(request.question + request.answer)}"
        collection.add(
            documents=[request.answer],
            embeddings=[embedding],
            metadatas=[{
                "question": request.question,
                "score": request.score,
                "category": request.category or "일반"
            }],
            ids=[doc_id]
        )

        print(f"✅ 답변 추가 완료 (ID: {doc_id})")
        return {
            "status": "ok",
            "message": "답변이 성공적으로 추가되었습니다",
            "id": doc_id,
            "total_count": collection.count()
        }

    except Exception as e:
        print(f"❌ 답변 추가 실패: {e}")
        raise HTTPException(status_code=500, detail=f"답변 추가 실패: {str(e)}")

@app.get("/stats")
def get_stats():
    """저장된 예시 통계"""
    count = collection.count()
    return {
        "total_examples": count,
        "collection_name": collection.name,
        "status": "ok" if count > 0 else "empty"
    }

@app.delete("/clear")
def clear_all():
    """모든 데이터 삭제 (개발용)"""
    try:
        # 컬렉션 삭제 후 재생성
        chroma_client.delete_collection(name="interview_examples")
        global collection
        collection = chroma_client.get_or_create_collection(
            name="interview_examples",
            metadata={"description": "면접 우수 답변 예시"}
        )
        return {"status": "ok", "message": "모든 데이터가 삭제되었습니다"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"삭제 실패: {str(e)}")

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Raon RAG Server 시작")
    print("=" * 60)
    print(f"📊 저장된 예시 개수: {collection.count()}")
    print(f"🔑 Gemini API Key: {GEMINI_API_KEY[:10]}...")
    print("=" * 60)

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
