from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional

from app.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.schemas import AnalysisRequest, BulkAnalysisResponse
from app.services.sentiment_model_service import SentimentModelService


router = APIRouter(prefix="/ml", tags=["Machine Learning"])

sentiment_service = SentimentModelService()

@router.post("/analyze", response_model=BulkAnalysisResponse)
async def analyze_comments(payload: AnalysisRequest, db: AsyncSession = Depends(get_db)):
    return await sentiment_service.analyze_bulk_and_save(
        db, 
        post_content=payload.post_content, 
        raw_text=payload.raw_text,
        scan_date=payload.scan_date
    )



@router.get("/stats")
async def get_comment_stats(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns total comments and sentiment breakdown.
    """
    start = datetime.strptime(start_date, "%Y-%m-%d").replace(tzinfo=timezone.utc) if (start_date and start_date.strip()) else None
    end = datetime.strptime(end_date, "%Y-%m-%d").replace(hour=23, minute=59, second=59, tzinfo=timezone.utc) if (end_date and end_date.strip()) else None
    stats = await sentiment_service.get_comment_stats(db, start_date=start, end_date=end, search=search)
    return stats


@router.get("/trends")
async def get_trends(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Returns daily breakdown for the Growth Analysis Bar chart"""
    start = datetime.strptime(start_date, "%Y-%m-%d").replace(tzinfo=timezone.utc) if (start_date and start_date.strip()) else None
    end = datetime.strptime(end_date, "%Y-%m-%d").replace(hour=23, minute=59, second=59, tzinfo=timezone.utc) if (end_date and end_date.strip()) else None
    return await sentiment_service.get_daily_trends(db, start_date=start, end_date=end, search=search)