class SubscriptionEngine:
    """
    Lightweight continuous subscription detection based on transaction history.
    """
    
    @staticmethod
    def detect_subscriptions(transactions: list) -> list:
        """
        Group transactions by description and evaluate against subscription patterns.
        Expected input list of dicts: {"date": date, "amount": float, "description": str}
        """
        if not transactions:
            return []
            
        import collections
        merchant_groups = collections.defaultdict(list)
        
        # Group by a normalized version of description to handle variations
        for tx in transactions:
            name = tx["description"].lower()
            # Simple normalization (e.g., UP-SWIGGY-123 -> swiggy)
            # Just take the first two meaningful words if present, very simple heuristic
            words = [w for w in name.replace('-', ' ').split() if len(w) > 2]
            key = " ".join(words[:2]) if words else name
            if not key:
                key = name
            
            merchant_groups[key].append(tx)
            
        subscriptions = []
        
        for merchant, txs in merchant_groups.items():
            if len(txs) < 3:
                continue # Needs at least 3 transactions to be a reliable pattern
                
            # Sort chronologically
            txs = sorted(txs, key=lambda x: x["date"])
            
            # 1. Amount variance check
            amounts = [x["amount"] for x in txs]
            avg_amount = sum(amounts) / len(amounts)
            
            # If the max deviation is more than 15% of the average, it's probably not a fixed subscription
            max_deviation = max(abs(a - avg_amount) for a in amounts)
            if float(avg_amount) > 0 and (max_deviation / float(avg_amount)) > 0.15:
                continue
                
            # 2. Date intervals check
            intervals = []
            for i in range(1, len(txs)):
                delta = (txs[i]["date"] - txs[i-1]["date"]).days
                intervals.append(delta)
                
            avg_interval = sum(intervals) / len(intervals)
            
            # Classify subscription type based on the average interval
            billing_type = None
            if 25 <= avg_interval <= 35:
                billing_type = "monthly"
                yearly_cost = avg_amount * 12
            elif 350 <= avg_interval <= 380:
                billing_type = "yearly"
                yearly_cost = avg_amount
            else:
                # Doesn't fit a standard monthly or yearly pattern safely
                continue
                
            # Formatting the display name (capitalize words)
            display_name = " ".join(word.capitalize() for word in merchant.split())
            
            subscriptions.append({
                "service_name": display_name,
                "billing_type": billing_type,
                "latest_amount": round(txs[-1]["amount"], 2),
                "monthly_cost": round(avg_amount if billing_type == "monthly" else avg_amount / 12, 2),
                "yearly_cost": round(yearly_cost, 2),
                "confidence_score": "high" if len(txs) > 4 else "medium"
            })
            
        return subscriptions
