### Setup
1. Ensure you are running Python 3.7
```python
python --version
```
2. Verify you are running an upgraded version of pip
```python
python -m pip install --upgrade pip
```
3. Install the required packages and include the CuPUL project

```python
pip install -r requirements.txt
python -m pip install -e .
```

4. Run the Flask application (backend)

```python
python NERFlask.py
```

### Setup with Docker

1. Ensure your Docker engine is running

2. Build the Docker image 

```bash

docker build -t ner-flask .

```

3. Run the Docker container

```bash

docker run --name ner-flask-container -p 5000 ner-flask

```


