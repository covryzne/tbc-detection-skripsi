from .models import User
from .schemas import UserCreate
from databases import Database

DATABASE_URL = "postgresql://postgres:12345678@localhost:5432/skripsi-tb-detection"
database = Database(DATABASE_URL)


async def create_admin():
    print("Connecting to db")
    await database.connect()
    print("Creating admin")

    data = {
        'full_name': 'Admin',
        'email': 'admin@admin.com',
        'password': 'password',
        'confirm_password': 'password',
        'is_admin': True
    }
    user = UserCreate(**data)
    user.hash_password()
    query = User.__table__.insert().values(**user.dict(exclude={'confirm_password'})).returning(User)
    try:
        data = await database.fetch_one(query)
        print("Admin user created with email: ", data.email)
    except IntegrityError as e:
        print("ERROR: Email already exists")
    except Exception as e:
        print("ERROR:", e)

    await database.disconnect()
