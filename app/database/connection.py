from app.database.database import Base,engine,SessionLocal

def db_init():
    Base.metadata.create_all(bind=engine)

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()