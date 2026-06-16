from sqlalchemy.orm import Session

from app.db.models import Category
from app.db.session import SessionLocal
from app.seeds.categories import CATEGORIES


def seed_categories(db: Session) -> None:
    for item in CATEGORIES:
        category = db.get(Category, item["id"])
        if category:
            category.name = item["name"]
            category.description = item["description"]
            category.icon = item["icon"]
            category.is_active = True
        else:
            db.add(Category(**item, is_active=True))
    db.commit()


if __name__ == "__main__":
    with SessionLocal() as session:
        seed_categories(session)
        print(f"Seeded {len(CATEGORIES)} legal categories.")

