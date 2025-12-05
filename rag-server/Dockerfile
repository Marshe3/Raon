FROM python:3.11-slim

WORKDIR /app

# 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 복사
COPY rag_server.py .

# Chroma 데이터 디렉토리
RUN mkdir -p /app/chroma_data

# 포트 노출
EXPOSE 8000

# 서버 실행
CMD ["python", "rag_server.py"]
