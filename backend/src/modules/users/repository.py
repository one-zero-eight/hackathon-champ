__all__ = ["user_repository"]

from beanie import PydanticObjectId

from src.modules.users.schemas import CreateUser
from src.storages.mongo.users import User


# noinspection PyMethodMayBeStatic
class UserRepository:
    async def create(self, user: CreateUser) -> User:
        from src.modules.login_and_password.repository import login_password_repository

        data = user.model_dump()
        password = data.pop("password")
        data["password_hash"] = login_password_repository.get_password_hash(password)
        created = User(**data)

        return await created.insert()

    async def read(self, user_id: PydanticObjectId) -> User | None:
        return await User.get(user_id)

    async def read_id_and_password_hash(self, login: str) -> tuple[PydanticObjectId, str] | None:
        user = await User.find_one(User.login == login)
        if user is None:
            return None
        return user.id, user.password_hash

    async def exists(self, user_id: PydanticObjectId) -> bool:
        return bool(await User.find(User.id == user_id, limit=1).count())

    async def is_banned(self, user_id: str | PydanticObjectId) -> bool:
        return False


user_repository: UserRepository = UserRepository()
