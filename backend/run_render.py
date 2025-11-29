import uvicorn
import os

def start():
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=False
    )

if __name__ == "__main__":
    start()
