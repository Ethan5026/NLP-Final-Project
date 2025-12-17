FROM python:3.7

# Set proper workdir
WORKDIR /app

# Copy files over
COPY .. .

# Upgrade pip
RUN python -m pip install --upgrade pip

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install your package
RUN pip install -e .

# Expose port
EXPOSE 5000

# Set Flask env
ENV FLASK_APP=NERFlask
ENV FLASK_RUN_HOST=0.0.0.0

# Run server
CMD ["flask", "run"]
