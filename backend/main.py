import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
from mangum import Mangum

load_dotenv()

app = FastAPI(title="AI Content Writer Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Home route (backend live hone ka check)
@app.get("/")
def home():
    return {"message": "AI Content Writer Backend is running successfully!"}

class PromptRequest(BaseModel):
    prompt: str

@app.post("/api/generate")
def generate_content(data: PromptRequest):
    api_key = os.getenv("GROQ_API_KEY")
    
    if not api_key:
        raise HTTPException(status_code=500, detail="API key not found!")

    try:
        client = Groq(api_key=api_key)
        
        completion = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[{"role": "user", "content": data.prompt}],
        )
        
        return {
            "output": completion.choices[0].message.content
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Vercel handler
handler = Mangum(app)