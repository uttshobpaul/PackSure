FROM python:3.12-slim

WORKDIR /app

# Install Tesseract OCR and required system libraries
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libgl1 \
    libglib2.0-0 && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements first for better Docker caching
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Database migration
RUN python manage.py migrate

EXPOSE 10000

CMD ["gunicorn", "--bind", "0.0.0.0:10000", "config.wsgi:application"]