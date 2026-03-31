"""
ML module: Accident Severity Predictor
Uses a Random Forest trained on DGMS incident features.
Features: accident_type, mine_type, state, shift, is_underground, workers_on_site
Target: severity (Low/Medium/High/Critical)
"""
import json
import os
import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

MODEL_PATH = os.path.join(os.path.dirname(__file__), "severity_model.pkl")
ENCODERS_PATH = os.path.join(os.path.dirname(__file__), "label_encoders.pkl")
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "dgms_incidents.json")

FEATURE_COLS = ["accident_type", "mine_type", "state", "shift", "is_underground", "workers_on_site"]
TARGET = "severity"
SEVERITY_ORDER = {"Low": 0, "Medium": 1, "High": 2, "Critical": 3}

def load_data():
    with open(DATA_PATH) as f:
        records = json.load(f)
    return records

def build_features(records, encoders=None, fit=False):
    cat_cols = ["accident_type", "mine_type", "state", "shift"]
    if fit:
        encoders = {}
        for col in cat_cols:
            le = LabelEncoder()
            le.fit([r[col] for r in records])
            encoders[col] = le

    X = []
    for r in records:
        row = []
        for col in cat_cols:
            try:
                row.append(encoders[col].transform([r[col]])[0])
            except ValueError:
                row.append(0)
        row.append(int(r["is_underground"]))
        row.append(r["workers_on_site"])
        X.append(row)

    y = [SEVERITY_ORDER[r[TARGET]] for r in records]
    return np.array(X), np.array(y), encoders

def train_model():
    records = load_data()
    X, y, encoders = build_features(records, fit=True)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    clf = RandomForestClassifier(n_estimators=150, max_depth=10, random_state=42, class_weight="balanced")
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, labels=list(range(4)), target_names=list(SEVERITY_ORDER.keys()), output_dict=True, zero_division=0)

    # Feature importance
    feature_names = ["accident_type", "mine_type", "state", "shift", "is_underground", "workers_on_site"]
    importances = {name: round(float(imp), 4) for name, imp in zip(feature_names, clf.feature_importances_)}

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(clf, f)
    with open(ENCODERS_PATH, "wb") as f:
        pickle.dump(encoders, f)

    print(f"Model trained. Accuracy: {acc:.2%}")
    return {"accuracy": round(acc, 4), "report": report, "feature_importance": importances}

def predict_severity(accident_type: str, mine_type: str, state: str,
                     shift: str, is_underground: bool, workers_on_site: int) -> dict:
    """Predict severity for a given incident profile."""
    if not os.path.exists(MODEL_PATH):
        train_model()

    with open(MODEL_PATH, "rb") as f:
        clf = pickle.load(f)
    with open(ENCODERS_PATH, "rb") as f:
        encoders = pickle.load(f)

    record = [{
        "accident_type": accident_type,
        "mine_type": mine_type,
        "state": state,
        "shift": shift,
        "is_underground": is_underground,
        "workers_on_site": workers_on_site,
        "severity": "Low"  # placeholder
    }]
    X, _, _ = build_features(record, encoders=encoders)

    proba = clf.predict_proba(X)[0]
    pred_idx = int(np.argmax(proba))
    inv_map = {v: k for k, v in SEVERITY_ORDER.items()}
    prediction = inv_map[pred_idx]

    return {
        "prediction": prediction,
        "confidence": round(float(max(proba)), 3),
        "probabilities": {inv_map[i]: round(float(p), 3) for i, p in enumerate(proba)},
    }

def get_model_stats() -> dict:
    if not os.path.exists(MODEL_PATH):
        return train_model()
    # Return cached stats
    records = load_data()
    X, y, encoders = build_features(records, fit=True)
    with open(MODEL_PATH, "rb") as f:
        clf = pickle.load(f)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    feature_names = ["accident_type", "mine_type", "state", "shift", "is_underground", "workers_on_site"]
    importances = {name: round(float(imp), 4) for name, imp in zip(feature_names, clf.feature_importances_)}
    return {"accuracy": round(acc, 4), "feature_importance": importances, "training_samples": len(X_train)}

if __name__ == "__main__":
    stats = train_model()
    print(json.dumps(stats, indent=2))
