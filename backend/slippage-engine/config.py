import os
from dotenv import load_dotenv

# 1. Load the variables from the .env file
load_dotenv()

# 2. Extract the specific key
COINGECKO_API_KEY = os.getenv("COINGECKO_API_KEY")