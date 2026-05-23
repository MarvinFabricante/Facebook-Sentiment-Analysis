from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db, init_db
from app.models.models import User
from app.controllers.user_controller import router as user_router
from app.controllers.post_controller import router as post_router
from app.controllers.report_controller import router as report_router
from app.controllers.sentiment_model_controller import router as sentiment_router
from app.controllers.analytics_controller import router as analytics_router
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app = FastAPI(title="SMART GENERATIONS PH - FACEBOOK SENTIMENT ANALYSIS")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# endpoint registration fo
app.include_router(user_router)
app.include_router(sentiment_router)
app.include_router(report_router)
app.include_router(post_router)
app.include_router(analytics_router)


@app.on_event("startup")
async def startup_event():
    await init_db() # kelangan to ensure ung database creation tsaka auto reload ng mga eme

@app.get("/users")
async def read_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    users = result.scalars().all()
    return users