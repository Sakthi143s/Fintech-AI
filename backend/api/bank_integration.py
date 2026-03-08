from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import traceback

from database import get_db
from models import User, Expense, Income
from api.auth import get_current_user
from bank_integration.csv_importer import CSVImporter
from services.ml_engine import ml_service

router = APIRouter(prefix="/api/bank", tags=["Bank Integration"])

@router.post("/import-csv")
async def import_csv(file: UploadFile = File(...), db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Imports bank transactions from a CSV file.
    Automatically categorizes using ML and splits into Expenses (debit) and Income (credit).
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
        
    try:
        content = await file.read()
        transactions = CSVImporter.parse_csv(content)
    except Exception as e:
        import logging
        logging.getLogger("uvicorn").error(f"Failed to parse CSV upload: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: Please ensure it is a valid bank statement format.")
        
    if not transactions:
        raise HTTPException(status_code=400, detail="No readable transactions found in the CSV.")
        
    # Process transactions
    expenses_added = 0
    incomes_added = 0
    
    for tx in transactions:
        amount = tx["amount"]
        desc = tx["description"]
        date_obj = tx["date"]
        tx_type = tx["type"]
        
        # Determine category using the ML Engine
        category = ml_service.predict_category(desc)
        
        if tx_type == "debit":
            expense = Expense(
                user_id=user.id,
                category=category,
                amount=amount,
                date=date_obj,
                description=desc,
                source="csv_import"
            )
            db.add(expense)
            expenses_added += 1
        elif tx_type == "credit":
            # For incomes, format date to YYYY-MM
            month_str = date_obj.strftime("%Y-%m")
            income = Income(
                user_id=user.id,
                amount=amount,
                month=month_str,
                source=f"Bank Import: {desc}"
            )
            db.add(income)
            incomes_added += 1
            
    db.commit()
    
    return {
        "message": "Import successful",
        "expenses_added": expenses_added,
        "incomes_added": incomes_added,
        "total_processed": expenses_added + incomes_added
    }
