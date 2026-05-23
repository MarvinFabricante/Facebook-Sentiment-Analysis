import asyncio
import os
import sys

# Add project root to path
sys.path.append(os.getcwd())

from app.services.sentiment_model_service import SentimentModelService

async def test_sentiment():
    service = SentimentModelService()
    
    comments = [
        "Basta crim matic bobo",
        "How ironic, PDF file",
        "The usual suspects",
        "oh diba.. mga nag aaral nang basurang criminology course. mga patapon.. papano pala kung naging pulpulis yan. mas malala pa jan.",
        "Crim stands for criminal. aray mo",
        "Kaya pala Criminology, study of being a criminal 🤣",
        "Not all crim students but always the crim students",
        "Practice makes perfect?",
        "When they say criminology I didn’t expect it to be literally…",
        "\"never beating the allegations\" ahhh",
        "They ain't even trying to beat the allegations anymore. They're reinforcing them. 🤣🤣🤣",
        "studyante pa lang yan, pano pa kung pulis na 🤣",
        "Study of crimes ba yon?",
        "School reveal nman dyan oh 😂😅",
        "The usual suspect na naman"
    ]
    
    print(f"{'Comment':<80} | {'Sentiment':<10} | {'Score':<6}")
    print("-" * 105)
    for comment in comments:
        sentiment, score = service.analyze_sentiment(comment)
        print(f"{comment[:80]:<80} | {sentiment:<10} | {score:<6.4f}")

if __name__ == "__main__":
    asyncio.run(test_sentiment())
