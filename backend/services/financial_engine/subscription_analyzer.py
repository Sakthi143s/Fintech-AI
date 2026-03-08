from typing import List, Dict

class SubscriptionAnalyzer:
    @staticmethod
    def summarize(subscriptions: List[Dict]) -> str:
        sub_month = sum(s.get("monthly_cost", 0) for s in subscriptions)
        sub_year = sum(s.get("yearly_cost", 0) for s in subscriptions)
        return f"You spend approximately ₹{sub_month:,.0f} per month on {len(subscriptions)} active subscriptions, totaling ₹{sub_year:,.0f} a year."
