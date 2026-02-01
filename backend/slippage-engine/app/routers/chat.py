from fastapi import APIRouter
from pydantic import BaseModel
from groq import Groq
import time
import asyncio
from ..config import settings

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

# --- 1. CONFIGURE GROQ ---
client = None
HAS_LLM = False

if settings.groq_api_key:
    try:
        client = Groq(api_key=settings.groq_api_key)
        HAS_LLM = True
        print("   ✅ Groq AI Connected (Llama 3.3)")
    except Exception as e:
        print(f"   ⚠️  Groq Client Error: {e}")
else:
    print("   ⚠️  No GROQ_API_KEY found. Using Offline Mode.")

# --- 2. CONTEXTUAL SYSTEM PROMPT ---
# We inject "Live" prices (mocked for demo) so it can answer "Should I buy now?" intelligently.
CURRENT_MARKET_CONTEXT = """
LIVE MARKET DATA (Use this to answer "should I buy" questions):
- ETH: $2,500 (Stable, Gas: 15 gwei) -> Verdict: Good entry for long-term.
- PEPE: $0.0000012 (Volatile, Heavy Bot Activity) -> Verdict: Risky, use high slippage.
- SHIB: $0.0000095 (Crashing, Panic Selling) -> Verdict: Wait for bottom.
"""

SYSTEM_PROMPT = f"""
You are the MEV Shield Assistant, a specialized crypto trading & security AI.
{CURRENT_MARKET_CONTEXT}

YOUR MANDATE:
1. Analyze market conditions and give TRADING PERSPECTIVES based on the data above.
2. Explain "Sandwich Attacks" and how this app prevents them.
3. Recommend Slippage settings (Low for ETH, High for Meme coins).

### STRICT GUARDRAILS:
- **ALLOW:** Questions about buying, selling, prices, tokens, gas, and strategy.
- **REFUSE:** Questions unrelated to Crypto (e.g., "Make a snake game", "Write a poem", "What is the capital of France").
- **REFUSAL MESSAGE:** "I am the MEV Shield Assistant. My protocols are restricted to blockchain security and trading operations."

TONE: Cyberpunk, professional, decisive.
"""

# --- 3. FALLBACK KNOWLEDGE BASE ---
OFFLINE_RESPONSES = {
    "mev": "MEV (Maximal Extractable Value) refers to the profit miners/bots extract by reordering your transactions. Our dashboard detects this in real-time.",
    "sandwich": "A Sandwich Attack is when a bot buys before you (front-run) and sells after you (back-run), forcing you to pay a higher price.",
    "slippage": "Slippage is the price difference between when you submit a trade and when it executes. Our engine calculates the exact slippage needed to outsmart bots.",
    "risk": "We analyze mempool gas prices and bot volume to assign a Risk Score. Green is safe; Red means bots are actively hunting.",
    "hello": "System Online. I am the MEV Shield Assistant. I monitor the mempool for threats. How can I help you trade safely?",
    "snake": "I am the MEV Shield Assistant. My protocols are restricted to blockchain security and trading operations.",
    "game": "I am the MEV Shield Assistant. My protocols are restricted to blockchain security and trading operations.",
    "code": "I am the MEV Shield Assistant. My protocols are restricted to blockchain security and trading operations."
}

@router.post("/")
async def chat(request: ChatRequest):
    user_msg = request.message.lower()
    
    # Simulate thinking time
    await asyncio.sleep(0.3)

    response_text = ""

    # STRATEGY A: TRY GROQ
    if HAS_LLM and client:
        try:
            # Run in thread to avoid blocking
            chat_completion = await asyncio.to_thread(
                client.chat.completions.create,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": request.message}
                ],
                model="llama-3.3-70b-versatile", 
                temperature=0.6, # Increased to 0.6 to allow for opinions/analysis
                max_tokens=150,
            )
            response_text = chat_completion.choices[0].message.content
        except Exception as e:
            print(f"Groq Error: {e}")
            pass

    # STRATEGY B: OFFLINE FALLBACK
    if not response_text:
        # Check specific refusal keywords first
        if "snake" in user_msg or "game" in user_msg or "write code" in user_msg:
             response_text = OFFLINE_RESPONSES["snake"]
        else:
            for key, answer in OFFLINE_RESPONSES.items():
                if key in user_msg:
                    response_text = answer
                    break
            
            if not response_text:
                response_text = "I am operating in OFFLINE MODE. I can define 'MEV', 'Sandwich Attacks', or explain 'Slippage'. Please verify your Neural Uplink (API Key)."

    return {
        "role": "assistant",
        "content": response_text,
        "timestamp": time.time()
    }