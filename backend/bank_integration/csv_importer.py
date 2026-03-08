import csv
import io
import re
from datetime import datetime
from typing import List, Dict, Tuple
from dateutil import parser

class CSVImporter:
    """
    Parses bank transaction CSVs into a standardized format.
    Automatically detects columns for date, description, amount, and credit/debit types.
    """
    
    @staticmethod
    def _normalize_header(header: str) -> str:
        return re.sub(r'[^a-zA-Z0-9]', '', header).lower()

    @staticmethod
    def parse_csv(file_content: bytes) -> List[Dict]:
        content_str = file_content.decode('utf-8-sig', errors='replace')
        # Check standard delimiters
        delimiter = ','
        if ';' in content_str and content_str.count(';') > content_str.count(','):
            delimiter = ';'
            
        reader = csv.DictReader(io.StringIO(content_str), delimiter=delimiter)
        
        # Normalize the field names safely handling None
        headers = reader.fieldnames if reader.fieldnames else []
        norm_map = {h: CSVImporter._normalize_header(h) if h else '' for h in headers}
        
        # Identify columns
        date_col = next((h for h, n in norm_map.items() if 'date' in n or 'time' in n), None)
        desc_col = next((h for h, n in norm_map.items() if 'desc' in n or 'narr' in n or 'detail' in n or 'particular' in n), None)
        amount_col = next((h for h, n in norm_map.items() if n in ['amount', 'amt', 'value']), None)
        type_col = next((h for h, n in norm_map.items() if 'type' in n or 'crdr' in n or 'dr' in n), None)
        
        # Some banks split into Credit and Debit columns
        credit_col = next((h for h, n in norm_map.items() if 'credit' in n or 'deposit' in n), None)
        debit_col = next((h for h, n in norm_map.items() if 'debit' in n or 'withdrawal' in n), None)
        
        if not date_col or not desc_col:
            raise ValueError("Could not auto-detect strictly required columns: Date and Description.")
            
        transactions = []
        for row in reader:
            if not row.get(date_col) or not row.get(desc_col):
                continue
                
            try:
                date_val = parser.parse(row[date_col], fuzzy=True).date()
            except:
                continue
                
            desc_val = str(row[desc_col]).strip()
            if not desc_val:
                continue
                
            amount_val = 0.0
            tx_type = "debit" # default assumption
            
            # Determine amount and type based on columns
            if amount_col and row.get(amount_col):
                try:
                    raw_amount = row[amount_col].replace(',', '').strip()
                    amount_val = float(raw_amount)
                    if amount_val < 0:
                        tx_type = "debit"
                        amount_val = abs(amount_val)
                    elif type_col and row.get(type_col):
                        type_str = str(row[type_col]).strip().lower()
                        if 'cr' in type_str or 'credit' in type_str:
                            tx_type = "credit"
                        else:
                            tx_type = "debit"
                except ValueError:
                    continue
            elif credit_col and row.get(credit_col) and str(row[credit_col]).strip():
                try:
                    amount_val = float(str(row[credit_col]).replace(',', '').strip())
                    tx_type = "credit"
                except ValueError:
                    pass
            elif debit_col and row.get(debit_col) and str(row[debit_col]).strip():
                try:
                    amount_val = float(str(row[debit_col]).replace(',', '').strip())
                    tx_type = "debit"
                except ValueError:
                    pass
                    
            if amount_val > 0:
                transactions.append({
                    "date": date_val,
                    "description": desc_val,
                    "amount": amount_val,
                    "type": tx_type
                })
                
        return transactions
