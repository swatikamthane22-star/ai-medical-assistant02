"""Disease prediction microservice (Flask + scikit-learn RandomForest).
Trains automatically on first start and caches the model in model.pkl."""
import json, os, pickle
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.ensemble import RandomForestClassifier

BASE = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE, "model.pkl")
DATA = json.load(open(os.path.join(BASE, "data", "diseases.json"), encoding="utf-8"))
DISEASES = DATA["diseases"]
SYMPTOMS = sorted({s for d in DISEASES for s in d["symptoms"]})
INDEX = {s: i for i, s in enumerate(SYMPTOMS)}


def build_training_set(samples_per_disease=300, seed=42):
    """Creates synthetic patient records from the disease-symptom knowledge base:
    each real symptom appears with ~75% chance, unrelated symptoms with ~3% noise."""
    rng = np.random.default_rng(seed)
    X, y = [], []
    for d in DISEASES:
        own = {INDEX[s] for s in d["symptoms"]}
        for _ in range(samples_per_disease):
            row = np.zeros(len(SYMPTOMS))
            for i in range(len(SYMPTOMS)):
                p = 0.75 if i in own else 0.03
                row[i] = 1 if rng.random() < p else 0
            if row.sum() == 0:
                row[rng.choice(list(own))] = 1
            X.append(row); y.append(d["name"])
    return np.array(X), np.array(y)


def load_or_train():
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            return pickle.load(f)
    X, y = build_training_set()
    model = RandomForestClassifier(n_estimators=200, random_state=42).fit(X, y)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    print("Model trained and saved to model.pkl")
    return model


model = load_or_train()
app = Flask(__name__)
CORS(app)


@app.get("/health")
def health():
    return jsonify(ok=True, symptoms=len(SYMPTOMS), diseases=len(DISEASES))


@app.post("/predict")
def predict():
    chosen = (request.get_json(silent=True) or {}).get("symptoms", [])
    vec = np.zeros((1, len(SYMPTOMS)))
    for s in chosen:
        if s in INDEX:
            vec[0, INDEX[s]] = 1
    if vec.sum() == 0:
        return jsonify(predictions=[])
    probs = model.predict_proba(vec)[0]
    top = np.argsort(probs)[::-1][:3]
    return jsonify(predictions=[
        {"disease": str(model.classes_[i]), "probability": float(probs[i])}
        for i in top if probs[i] > 0.01
    ])


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
