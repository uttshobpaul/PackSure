FROM python:3.12-slim

WORKDIR /app

# Install Tesseract OCR and required system libraries
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libgl1 \
    libglib2.0-0 && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements first for Docker caching
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

EXPOSE 10000

# Run migrations and start Gunicorn
# Increased timeout for OCR/image processing
CMD ["sh", "-c", "python manage.py migrate && gunicorn --bind 0.0.0.0:${PORT:-10000} --timeout 120 config.wsgi:application"]