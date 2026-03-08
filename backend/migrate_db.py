import sqlite3

def add_source_column():
    conn = sqlite3.connect("budget_planner.db")
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE expenses ADD COLUMN source VARCHAR DEFAULT 'manual'")
        conn.commit()
        print("Successfully added 'source' column to 'expenses' table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Column 'source' already exists in 'expenses' table.")
        else:
            print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    add_source_column()
