# Backend Setup

Be sure you are in the backend directory to run these commands.
```bash
cd Backend
```
### Local Setup Instructions

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

### Docker Setup Instructions

1. Ensure your Docker engine is running

2. Build the Docker image 

```bash

docker build -t ner-flask .

```

3. Run the Docker container

```bash

docker run --name ner-flask-container -p 5000 ner-flask

```

# Frontend Setup

Be sure you are in the frontend directory to run these commands.
```bash
cd Frontend
```
### Local Setup Instructions
1. Ensure you have Node.js and npm installed
```bash
node -v
npm -v
```
2. Install the required packages
```bash
npm install
```
3. Build the React application 
```bash
node_modules/.bin/vite build
```

4. Start the React development server
```bash
node_modules/.bin/vite preview --host
```

### Docker Setup Instructions
1. Ensure your Docker engine is running
2. Build the Docker image 
```bash
docker build -t ner-react .
```
3. Run the Docker container
```bash
docker run --name ner-react-container -p 5173:5173 ner-react
```
