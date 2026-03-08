class OpenBankingAdapter:
    """
    Placeholder/Stub architecture for future Plaid/Tink integrations.
    Provides standard interfaces that keep transactions uniform 
    regardless of source (API vs CSV).
    """
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key
        
    def fetch_transactions(self, account_id: str, start_date: str, end_date: str) -> list:
        """
        Future implementation:
        1. Query open banking API (Plaid)
        2. Map response to standard dict: [{"date": date, "description": str, "amount": float, "type": str}]
        """
        raise NotImplementedError("Open Banking integration not enabled yet.")
        
    def link_account(self, public_token: str):
        """
        Future Implementation: Exchange public token for access token.
        """
        raise NotImplementedError("Open Banking integration not enabled yet.")
