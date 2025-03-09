import os
import pandas as pd
import numpy as np
import sqlite3
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes (development only)

# Configure Gemini API securely
api_key = os.environ.get("GEMINI_API_KEY", "AIzaSyDk3wUt46Vpg8c3kIVDFbPaJOPk3FcGCkY")
genai.configure(api_key=api_key)

# Load Gemini models
fine_tuned_model = genai.GenerativeModel("tunedModels/queryyyyy-ctlppsw5b5yt")  # Fine-tuned model
general_model = genai.GenerativeModel("gemini-2.0-flash")  # General model

# Load and prepare DataFrame at startup
def clean_column_names(df):
    columns = df.columns.tolist()
    clean_columns = []

    # Normalize all column names
    for col in columns:
        normalized = col.strip().replace(".", "_").replace(" ", "_")
        clean_columns.append(normalized)

    # Fix duplicates (case-insensitive)
    unique_columns = []
    counter = {}
    for col in clean_columns:
        col_lower = col.lower()
        if col_lower in counter:
            counter[col_lower] += 1
            unique_columns.append(f"{col}_{counter[col_lower]}")
        else:
            counter[col_lower] = 0
            unique_columns.append(col)

    df.columns = unique_columns
    return df

# Load the data only once when the app starts
print("Loading stock data...")
try:
    df = pd.read_csv("stock_screener_data.csv", low_memory=False)
    df = clean_column_names(df)
    print(f"Loaded {len(df)} stocks with {len(df.columns)} metrics")
except Exception as e:
    print(f"Error loading data: {e}")
    df = None

# Define the desired column order
important_columns = [
    "Symbol",  # Always first
    "Name",  # Company name
    "Price",  # Current price
    "Market_Capitalization",  # Market cap
    "Price_to_Earnings_Ratio_(TTM)",  # P/E ratio
    "Dividend_Yield",  # Dividend yield
    "EPS",  # Earnings per share
    "Revenue_(TTM)",  # Revenue
    "Sector",  # Sector
    "Industry"  # Industry
]

# Step 1: Gemini Model Extracts Screening Criteria
def get_screening_criteria(user_input):
    prompt = f"""
    Extract *only* the explicitly stated stock screening criteria from this user query. Do not add implied or additional conditions beyond what is clearly specified. Return the criteria as a concise string.

    User Query: {user_input}

    Examples:
    - Query: "Find stocks with RSI above 70"
      Criteria: "Relative_Strength_Index_(14) > 70"
    - Query: "Companies with low P/E ratio, less than 15"
      Criteria: "Price_to_Earnings_Ratio_(TTM) < 15"
    - Query: "Stocks with market cap over 1 billion and positive earnings growth"
      Criteria: "Market_Capitalization > 1000000000 AND Net_Income_(TTM_YoY_Growth) > 0"

    Criteria:
    """
    response = fine_tuned_model.generate_content(prompt)
    return response.text.strip() if hasattr(response, "text") else "Error extracting criteria"

# Step 2: Gemini Model Converts Criteria to SQL with Ordered Columns
def generate_sql_query(screening_criteria):
    available_columns = df.columns.tolist()
    available_columns_str = ", ".join([f'"{col}"' for col in available_columns])

    # Construct the SELECT statement with ordered columns
    ordered_columns = []
    for col in important_columns:
        if col in available_columns:
            ordered_columns.append(f'"{col}"')
    # Add remaining columns not in important_columns
    for col in available_columns:
        if col not in important_columns:
            ordered_columns.append(f'"{col}"')
    select_clause = ", ".join(ordered_columns)

    prompt = f"""
    **Task:** Convert the following stock screening criteria into a SQL query. Use SELECT with the following column order: {select_clause}. Only include the exact criteria provided, without adding any extra conditions.

    **Available Columns:** {available_columns_str}

    **User Criteria:** {screening_criteria}

    **Expected Output:** A valid SQL query selecting all columns from the 'stocks' dataset in the specified order, using the given criteria.

    **Example Queries:**
    - Criteria: "Relative_Strength_Index_(14) > 70"
      SQL: SELECT {select_clause} FROM stocks WHERE "Relative_Strength_Index_(14)" > 70;
    - Criteria: "Price_to_Earnings_Ratio_(TTM) < 15"
      SQL: SELECT {select_clause} FROM stocks WHERE "Price_to_Earnings_Ratio_(TTM)" < 15;
    - Criteria: "Market_Capitalization > 1000000000 AND Net_Income_(TTM_YoY_Growth) > 0"
      SQL: SELECT {select_clause} FROM stocks WHERE "Market_Capitalization" > 1000000000 AND "Net_Income_(TTM_YoY_Growth)" > 0;

    **Output:**
    """

    response = general_model.generate_content(prompt)
    sql_text = response.text.strip() if hasattr(response, "text") else "Error generating SQL query"

    # Clean up the SQL query if it contains markdown code blocks
    if sql_text.startswith("```") and sql_text.endswith("```"):
        sql_text = sql_text.split("```")[1]
        if sql_text.startswith("sql"):
            sql_text = sql_text[3:].strip()

    return sql_text

# Step 3: Execute SQL Query
def execute_sql_query(sql_query):
    conn = sqlite3.connect(":memory:")

    try:
        # Clean the dataframe to ensure JSON serialization
        clean_df = df.copy()
        clean_df = clean_df.replace({np.nan: None})
        clean_df.to_sql("stocks", conn, if_exists="replace", index=False)

        # Execute the query
        result = pd.read_sql(sql_query, conn)
        result = result.replace({np.nan: None})

        # Convert numpy types to native Python types
        for col in result.columns:
            if result[col].dtype in [np.int64, np.int32]:
                result[col] = result[col].astype(int)
            elif result[col].dtype in [np.float64, np.float32]:
                result[col] = result[col].astype(float)
            if np.issubdtype(result[col].dtype, np.number):
                result[col] = result[col].replace([np.inf, -np.inf], None)

        return result.to_dict(orient="records")
    except Exception as e:
        return {"error": f"SQL Execution Error: {e}"}
    finally:
        conn.close()

@app.route("/")
def home():
    return """
    <html>
    <head>
        <title>Stock Screener API</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            h1 { color: #333; }
            code { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; }
        </style>
    </head>
    <body>
        <h1>Stock Screener API</h1>
        <p>Use the /screen endpoint with a 'query' parameter to screen stocks.</p>
        <p>Example: <code>/screen?query=Find stocks with P/E ratio less than 15 and dividend yield greater than 3%</code></p>
    </body>
    </html>
    """

@app.route("/screen")
def screen_stocks():
    if df is None:
        return jsonify({"error": "Stock data not loaded. Check server logs."}), 500

    user_query = request.args.get("query", "")
    if not user_query:
        return jsonify({"error": "No query provided. Use '?query=your screening criteria'"}), 400

    try:
        # Extract screening criteria
        criteria = get_screening_criteria(user_query)
        print(f"Query: '{user_query}' → Criteria: '{criteria}'")

        # Generate SQL query with ordered columns
        sql_query = generate_sql_query(criteria)
        print(f"SQL: {sql_query}")

        # Execute the query
        results = execute_sql_query(sql_query)

        # Return the response
        return jsonify({
            "query": user_query,
            "extracted_criteria": criteria,
            "sql_query": sql_query,
            "count": len(results) if isinstance(results, list) else 0,
            "results": results
        })
    except Exception as e:
        return jsonify({"error": f"Processing error: {str(e)}"}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)