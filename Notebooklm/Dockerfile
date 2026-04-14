FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    STREAMLIT_SERVER_PORT=8501 \
    STREAMLIT_SERVER_ADDRESS=0.0.0.0

WORKDIR /app

COPY pyproject.toml README.md LICENSE ./
COPY src ./src
COPY streamlit_app.py ./
COPY AGENTS.md SKILL.md ./

RUN python -m pip install --upgrade pip && \
    pip install . streamlit

EXPOSE 8501

CMD ["streamlit", "run", "streamlit_app.py", "--server.address=0.0.0.0", "--server.port=8501"]
