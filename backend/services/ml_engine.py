"""
Machine Learning Engine for Financial Data Analysis.
Provides automatic categorization, anomaly detection, and behavior clustering 
using scikit-learn models.
"""
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import IsolationForest
from sklearn.cluster import KMeans
from typing import List, Dict, Optional

class MachineLearningEngine:
    def __init__(self):
        # Transaction Categorization Pipeline Model
        self.vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
        self.classifier = LogisticRegression(solver='lbfgs', multi_class='auto')
        self.categorization_trained = False
        
        # Enhanced Knowledge Base with detailed categories and keywords
        self.knowledge_base_categories = {
            "Food": ["swiggy", "zomato", "restaurant", "food", "lunch", "dinner", "biryani", "pizza", "cafe", "hotel", "tiffin", "sapadu"],
            "Transport": ["uber", "ola", "petrol", "fuel", "diesel", "bus", "metro", "taxi", "auto", "train"],
            "Shopping": ["amazon", "flipkart", "myntra", "ajio", "shopping", "clothes", "electronics"],
            "Groceries": ["dmart", "grocery", "supermarket", "milk", "vegetables", "fruits", "rice", "d-mart"],
            "Entertainment": ["netflix", "spotify", "youtube", "cinema", "movie", "gaming"],
            "Bills": ["electricity", "water", "internet", "wifi", "broadband", "recharge"],
            "Housing": ["rent", "apartment", "maintenance", "housing"],
            "Income": ["salary", "bonus", "freelance", "income"]
        }

    def train_categorization_model(self, transactions: List[dict]):
        """
        Trains the TF-IDF and Logistic Regression pipeline on historical user transaction descriptions.
        transactions format: [{"description": "Uber ride", "category": "Transport"}]
        """
        if not transactions or len(transactions) < 5:
            # Not enough data to train a meaningful ML model, use fallback rules
            return
            
        df = pd.DataFrame(transactions)
        
        # Filter out empty descriptions
        df = df[df['description'].str.strip() != '']
        if len(df) < 5:
            return

        # Prepare X and y
        X_docs = df['description'].fillna('unknown').tolist()
        y_labels = df['category'].tolist()

        try:
            X_vectors = self.vectorizer.fit_transform(X_docs)
            self.classifier.fit(X_vectors, y_labels)
            self.categorization_trained = True
        except Exception as e:
            print(f"Error training ML categorizer: {e}")

    def _similarity_score(self, word1: str, word2: str) -> float:
        """Simple lightweight similarity check (Jaccard-like or substring overlap) for spelling tolerance."""
        if not word1 or not word2:
            return 0.0
        # If one is fully in the other
        if word1 in word2 or word2 in word1:
            return 1.0
            
        # Very simple spelling tolerance: count matching characters in sequence
        matches = 0
        min_len = min(len(word1), len(word2))
        for i in range(min_len):
            if word1[i] == word2[i]:
                matches += 1
        return matches / max(len(word1), len(word2))

    def predict_category(self, description: str) -> str:
        """
        Predicts category based on advanced keyword rules, spelling tolerance, and fallback ML.
        """
        desc_lower = description.lower().strip()
        words_in_desc = desc_lower.split()
        
        best_match_category = None
        highest_score = 0.0
        
        # 1. Rule-based Fast Matching & Spelling Tolerance
        for category, keywords in self.knowledge_base_categories.items():
            for keyword in keywords:
                # Exact match or containment in the full description string
                if keyword in desc_lower:
                    # Give strict matches the highest priority
                    return category
                
                # Check for minor spelling variations against individual words
                for word in words_in_desc:
                    # Only check similarity if lengths are somewhat close to avoid weird false positives
                    if abs(len(word) - len(keyword)) <= 2:
                        score = self._similarity_score(word, keyword)
                        # Threshold for typing error (e.g., 'swigy' vs 'swiggy')
                        if score > 0.75 and score > highest_score:
                            highest_score = score
                            best_match_category = category

        if best_match_category:
            return best_match_category
                
        # 2. ML Prediction (Only if trained and rule base failed entirely)
        if self.categorization_trained and description.strip():
            try:
                x_vec = self.vectorizer.transform([description])
                return self.classifier.predict(x_vec)[0]
            except:
                pass
                
        # 3. Ultimate Fallback
        return "Other"

    def detect_anomalies(self, expenses: List[dict]) -> List[dict]:
        """
        Uses Isolation Forest to detect anomalous (e.g., highly unusual amount) transactions.
        expenses input: [{"id": 1, "amount": 100}, ...]
        Returns the original list dictionaries but with an 'is_anomaly' boolean field added.
        """
        if not expenses or len(expenses) < 10:
            # Isolation forest needs decent sample size to understand "normal"
            for exp in expenses:
                exp['is_anomaly'] = False
            return expenses
            
        df = pd.DataFrame(expenses)
        
        # We find anomalies strictly based on amount outliers right now
        X = df[['amount']].values
        
        # contamination = proportion of outliers we expect (set around 5%)
        model = IsolationForest(contamination=0.05, random_state=42)
        
        try:
            # Predict returns 1 for normal, -1 for anomaly
            predictions = model.fit_predict(X)
            
            # Map back to dictionaries
            for idx, exp in enumerate(expenses):
                exp['is_anomaly'] = bool(predictions[idx] == -1)
        except Exception:
            for exp in expenses:
                exp['is_anomaly'] = False

        return expenses

    def cluster_user_behavior(self, user_metrics: dict) -> str:
        """
        Predicts whether a user is a 'Saver', 'Balanced', or 'High Spender' based on their ratios.
        Expects user_metrics dict: { "savings_rate": float, "needs_ratio": float, "lifestyle_ratio": float }
        Uses predefined K-Means clustering centers.
        """
        # Feature order: [savings_rate, needs_ratio, lifestyle_ratio] all as decimals (0.0 to 1.0)
        
        # In a real system, kmeans would be trained globally across thousands of users.
        # For our MVP, we define logical cluster centroids to emulate a fitted model.
        # Centroid 1 (High Spender): low savings (<0.05), high needs (0.6), high lifestyle (0.35)
        # Centroid 2 (Balanced): avg savings (0.2), avg needs (0.5), avg lifestyle (0.3)
        # Centroid 3 (Saver): high savings (>0.35), low needs (0.4), low lifestyle (0.25)
        
        centroids = np.array([
            [0.05, 0.60, 0.35],  # High Spender (index 0)
            [0.20, 0.50, 0.30],  # Balanced     (index 1)
            [0.40, 0.40, 0.20]   # Saver        (index 2)
        ])
        
        # Ensure values are safely bounded
        s_rate = max(0, min(1.0, user_metrics.get("savings_rate", 0)))
        n_ratio = max(0, min(1.0, user_metrics.get("needs_ratio", 0)))
        l_ratio = max(0, min(1.0, user_metrics.get("lifestyle_ratio", 0)))
        
        user_vector = np.array([s_rate, n_ratio, l_ratio])
        
        # Calculate euclidean distance to each centroid
        distances = np.linalg.norm(centroids - user_vector, axis=1)
        closest_cluster = int(np.argmin(distances))
        
        mapping = {
            0: "High Spender",
            1: "Balanced",
            2: "Saver"
        }
        return mapping[closest_cluster]

# Singleton instance to be used across the app
ml_service = MachineLearningEngine()
