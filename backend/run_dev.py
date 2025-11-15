from dotenv import load_dotenv
import uvicorn

def start():
    load_dotenv(".env.dev")
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

if __name__ == "__main__":
    start()
