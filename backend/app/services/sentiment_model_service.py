from datetime import datetime, timezone
from typing import Optional, List
import os
import re
import numpy as np
from sqlalchemy import func, select
import tensorflow as tf
import emoji
from googletrans import Translator
from sqlalchemy.ext.asyncio import AsyncSession
from tensorflow.keras import datasets, layers, models, preprocessing
imdb = datasets.imdb
pad_sequences = preprocessing.sequence.pad_sequences
Sequential = models.Sequential
load_model = models.load_model
Embedding = layers.Embedding
LSTM = layers.LSTM
Dense = layers.Dense

from app.models.models import Post, SentimentRecord

class SentimentModelService:
    def __init__(self):
        os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
        tf.get_logger().setLevel('ERROR')

        self.VOCAB_SIZE = 10000
        self.MAX_LEN = 100
        self.EMBED_DIM = 32
        self.MODEL_PATH = "sentiment_lstm.h5"

        self.translator = Translator()
        self.model = self._get_model()
        self.word_index = self._prepare_word_index()

    def _get_model(self):
        if os.path.exists(self.MODEL_PATH):
            return load_model(self.MODEL_PATH)
        
        (x_train, y_train), _ = imdb.load_data(num_words=self.VOCAB_SIZE)
        x_train = pad_sequences(x_train, maxlen=self.MAX_LEN)
        model = Sequential([
            Embedding(self.VOCAB_SIZE, self.EMBED_DIM, input_length=self.MAX_LEN),
            LSTM(64),
            Dense(1, activation='sigmoid')
        ])
        model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])
        model.fit(x_train, y_train, epochs=2, batch_size=64, verbose=0)
        model.save(self.MODEL_PATH)
        return model

    def _prepare_word_index(self):
        raw_word_index = imdb.get_word_index()
        word_index = {k: (v + 3) for k, v in raw_word_index.items()}
        word_index.update({"<PAD>": 0, "<START>": 1, "<UNK>": 2})
        return word_index

    def extract_comments(self, text: str):
        TS_PAT = r"^\d+[hdmy]$"
        NOISE = ["Reply", "Edited", "Share", "Like", "React", "View more", "See translation"]
        
        lines = [line.strip() for line in text.splitlines() if line.strip() and line.strip() != "·"]
        results = []
        i = 0
        while i < len(lines):
            line = lines[i]
            if re.match(TS_PAT, line) or line in NOISE:
                i += 1
                continue

            if i + 1 < len(lines):
                name = line
                comment_lines = []
                i += 1
                while i < len(lines) and not re.match(TS_PAT, lines[i]) and lines[i] not in NOISE:
                    if re.match(r"^[A-Z][a-z]+ [A-Z][a-z]+$", lines[i]) and comment_lines:
                        if i + 1 < len(lines) and (re.match(TS_PAT, lines[i+1]) or lines[i+1] in NOISE):
                            break
                        if any(p in lines[i].lower() for p in ["congrats", "congratulations", "good job", "well done"]):
                            pass
                        else:
                             break
                    comment_lines.append(lines[i])
                    i += 1

                if comment_lines:
                    comment_text = " ".join(comment_lines).strip()
                    results.append((name, comment_text))
            else:
                i += 1
        return results

    def _encode_comment(self, text: str):
        clean_text = re.sub(r'[^\w\s]', ' ', text.lower())
        tokens = clean_text.split()
        encoded = [1] # Start token
        for word in tokens:
            idx = self.word_index.get(word, 2)
            encoded.append(idx if idx < self.VOCAB_SIZE else 2)
        return pad_sequences([encoded], maxlen=self.MAX_LEN)

    def analyze_sentiment(self, text: str):
        try:
            # Expanded keyword lists with Tagalog and English slang
            POSITIVE_KEYS = [
                "congrats", "congratulations", "proud", "galing", "lodi", "idol", "good", "great", "best", "amazing", "wow", 
                "happy", "love", "dasurv", "deserve", "panalo", "nice", "keep it up", "suwerte", "blessed", "petmalu", 
                "werpa", "salamat", "thank", "thanks", "hope", "faith", "strong", "inspire", "inspiring"
            ]
            NEGATIVE_KEYS = [
                "bad", "worst", "fail", "sad", "disappoint", "mali", "panget", "galit", "bulok", "talo", "sayang", "tambak", 
                "corny", "fake", "bobo", "tanga", "gago", "puta", "pakshet", "basura", "patapon", "kupal", "hayop", "salot", 
                "trauma", "scam", "kadiri", "nandidiri", "pwe", "eww", "baliw", "siraulo", "mamatay", "kulong", "criminal", 
                "kriminal", "magnanakaw", "kurakot", "abuso", "abusado", "takot", "panganib", "pdf file", "pedophile", 
                "predator", "creep", "stupid", "idiot", "trash", "garbage", "scum", "disgusting", "horrible", "terrible", 
                "arrested", "charged", "crime", "allegation", "allegations", "suspect", "suspects", "guilty", "nakaaresto",
                "ironic", "irony", "usual suspect", "reveal", "always the", "practice makes perfect", "pano pa", "allegations"
            ]

            text_lower = text.lower()
            
            # 1. Manual keyword boost (Balanced weight to avoid excessive stacking)
            boost = 0.0
            found_negatives = set()
            for k in POSITIVE_KEYS:
                if k in text_lower: boost += 0.35
            
            for k in NEGATIVE_KEYS:
                if k in text_lower:
                    # Prevent over-stacking for very similar keywords (e.g., suspect vs usual suspect)
                    is_subpart = False
                    for existing in found_negatives:
                        if k in existing: 
                            is_subpart = True
                            break
                    
                    if not is_subpart:
                        boost -= 0.35
                        found_negatives.add(k)

            # 2. Translation & Cleaning
            text_cleaned = emoji.demojize(text, delimiters=(" ", " ")).replace("_", " ")
            try:
                translated_obj = self.translator.translate(text_cleaned, dest='en')
                translated = translated_obj.text
            except Exception as e:
                # If translation fails, use cleaned original text
                translated = text_cleaned
            
            # 3. Model Prediction
            encoded = self._encode_comment(translated)
            raw_score = float(self.model.predict(encoded, verbose=0)[0][0])

            # Apply boost and clamp between 0 and 1
            final_score = max(0.0, min(1.0, raw_score + boost))

            # DEBUG LOGGING: Check your console to see why a comment got its label
            print(f"DEBUG | Text: {text[:30]}... | Raw: {raw_score:.2f} | Boost: {boost:.2f} | Final: {final_score:.2f}")

            # 4. Refined Thresholds
            # Widened neutral zone to prevent "uncertain" model scores from defaulting to negative
            if final_score >= 0.65:
                return "positive", float(round(final_score, 4))
            elif final_score <= 0.35:
                return "negative", float(round(final_score, 4))
            else:
                return "neutral", float(round(final_score, 4))

        except Exception as e:
            print(f"SENTIMENT ERROR: {e}")
            return "analysis_error", 0.0

    async def analyze_bulk_and_save(self, db: AsyncSession, post_content: str, raw_text: str, scan_date: Optional[str] = None):
        extracted = self.extract_comments(raw_text)
        
        # Use provided scan_date or current time
        if scan_date:
            try:
                created_at = datetime.strptime(scan_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
                # Set time to current time but keep the date
                now = datetime.now(timezone.utc)
                created_at = created_at.replace(hour=now.hour, minute=now.minute, second=now.second)
            except ValueError:
                created_at = datetime.now(timezone.utc)
        else:
            created_at = datetime.now(timezone.utc)

        new_post = Post(
            content=post_content,
            reactions_count=np.random.randint(5, 150),
            comments_count=len(extracted),
            shares_count=np.random.randint(0, 20),
            created_at=created_at
        )
        db.add(new_post)
        await db.flush()

        results = []
        stats = {"positive": 0, "negative": 0, "neutral": 0, "analysis_error": 0}

        for name, comment in extracted:
            sentiment, score = self.analyze_sentiment(comment)
            stats[sentiment] += 1

            db_record = SentimentRecord(
                post_id=new_post.id,
                username=name,
                comment_text=comment,
                sentiment_label=sentiment,
                confidence_score=score,
                created_at=created_at
            )
            db.add(db_record)

            results.append({
                "name": name,
                "comment": comment,
                "sentiment": sentiment,
                "score": score
            })

        await db.commit()
        return {"results": results, "summary": stats, "total": len(results)}
    
    async def get_comment_stats(self, db: AsyncSession, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, search: Optional[str] = None):
        try:
            total_stmt = select(func.count(SentimentRecord.id))
            sentiment_stmt = select(
                SentimentRecord.sentiment_label,
                func.count(SentimentRecord.id)
            ).group_by(SentimentRecord.sentiment_label)

            if start_date and end_date:
                total_stmt = total_stmt.where(SentimentRecord.created_at.between(start_date, end_date))
                sentiment_stmt = sentiment_stmt.where(SentimentRecord.created_at.between(start_date, end_date))
            elif start_date:
                total_stmt = total_stmt.where(SentimentRecord.created_at >= start_date)
                sentiment_stmt = sentiment_stmt.where(SentimentRecord.created_at >= start_date)
            elif end_date:
                total_stmt = total_stmt.where(SentimentRecord.created_at <= end_date)
                sentiment_stmt = sentiment_stmt.where(SentimentRecord.created_at <= end_date)

            if search:
                total_stmt = total_stmt.join(Post, SentimentRecord.post_id == Post.id).where(Post.content.ilike(f"%{search}%"))
                sentiment_stmt = sentiment_stmt.join(Post, SentimentRecord.post_id == Post.id).where(Post.content.ilike(f"%{search}%"))

            total_result = await db.execute(total_stmt)
            total = total_result.scalar() or 0

            sentiment_result = await db.execute(sentiment_stmt)

            stats = {
                "total": total,
                "positive": 0,
                "negative": 0,
                "neutral": 0,
                "analysis_error": 0,
            }

            for label, count in sentiment_result.all():
                if label in stats:
                    stats[label] = count

            return stats

        except Exception as e:
            print(f"ERROR fetching stats: {e}")
            return {
                "total": 0,
                "positive": 0,
                "negative": 0,
                "neutral": 0,
                "analysis_error": 0,
            }
        
    async def get_daily_trends(self, db: AsyncSession, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, search: Optional[str] = None):
        try:
            stmt = (
                select(
                    func.date(SentimentRecord.created_at).label("date"),
                    SentimentRecord.sentiment_label,
                    func.count(SentimentRecord.id).label("count")
                )
            )

            if start_date and end_date:
                stmt = stmt.where(SentimentRecord.created_at.between(start_date, end_date))
            elif start_date:
                stmt = stmt.where(SentimentRecord.created_at >= start_date)
            elif end_date:
                stmt = stmt.where(SentimentRecord.created_at <= end_date)

            if search:
                stmt = stmt.join(Post, SentimentRecord.post_id == Post.id).where(Post.content.ilike(f"%{search}%"))

            stmt = stmt.group_by("date", SentimentRecord.sentiment_label).order_by("date")
            
            result = await db.execute(stmt)
            rows = result.all()

            trends = {}
            for date_obj, label, count in rows:
                date_str = str(date_obj)
                if date_str not in trends:
                    trends[date_str] = {"positive": 0, "neutral": 0, "negative": 0}
                
                if label in trends[date_str]:
                    trends[date_str][label] = count

            return trends
        except Exception as e:
            print(f"ERROR fetching trends: {e}")
            return {}