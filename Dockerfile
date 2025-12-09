FROM python:3.7-slim-buster

WORKDIR .

COPY requirements.txt .

COPY setup.py .

RUN python -m pip install --upgrade pip

RUN pip install --no-cache-dir -r requirements.txt

RUN pip install -e .

COPY . .

EXPOSE 5000

CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]