from app.database.connection import Base, engine
from app.models import user_model, article_model, analysis_model

def create_all_tables():
    Base.metadata.create_all(bind=engine)
