__all__ = ["user_repository"]

from beanie import PydanticObjectId

from src.modules.users.schemas import CreateUser, UpdateUser
from src.storages.mongo.users import User, UserRole


# noinspection PyMethodMayBeStatic
class UserRepository:
    async def create(self, user: CreateUser) -> User:
        from src.modules.login_and_password.repository import login_password_repository

        data = user.model_dump()
        password = data.pop("password")
        data["password_hash"] = login_password_repository.get_password_hash(password)
        created = User(**data)

        return await created.insert()

    async def update(self, user_id: PydanticObjectId, data: UpdateUser) -> User | None:
        from src.modules.login_and_password.repository import login_password_repository

        data = data.model_dump(exclude_unset=True)
        password = data.pop("password", None)
        if password is not None:
            data["password_hash"] = login_password_repository.get_password_hash(password)

        await User.find_one(User.id == user_id).update({"$set": data})
        return await User.get(user_id)

    async def read(self, user_id: PydanticObjectId) -> User | None:
        return await User.get(user_id)

    async def read_by_email(self, email: str) -> User | None:
        return await User.find_one(User.email == email)

    async def read_by_login(self, login: str) -> User | None:
        return await User.find_one(User.login == login)

    async def read_all(self) -> list[User]:
        return await User.all().to_list()

    async def read_all_admins(self) -> list[User]:
        return await User.find(User.role == UserRole.ADMIN).to_list()

    async def read_for_federation(self, federation_id: PydanticObjectId) -> list[User]:
        return await User.find(User.federation == federation_id).to_list()

    async def read_id_and_password_hash(self, login: str) -> tuple[PydanticObjectId, str] | None:
        user = await User.find_one(User.login == login)
        if user is None:
            return None
        return user.id, user.password_hash

    async def exists(self, user_id: PydanticObjectId) -> bool:
        return bool(await User.find(User.id == user_id, limit=1).count())

    async def is_banned(self, user_id: str | PydanticObjectId) -> bool:
        return False

    async def set_email(self, user_id: PydanticObjectId, email: str) -> User | None:
        await User.find_one(User.id == user_id).update({"$set": {"email": email}})
        return await User.get(user_id)


user_repository: UserRepository = UserRepository()
