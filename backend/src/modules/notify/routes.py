from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException

from src.api.dependencies import USER_AUTH
from src.modules.notify.repository import notify_repository
from src.modules.users.repository import user_repository
from src.storages.mongo.notify import Notify, NotifySchema
from src.storages.mongo.users import UserRole

router = APIRouter(prefix="/notify", tags=["Notifications"])


@router.post(
    "/",
    responses={
        200: {"description": "Create notification"},
        403: {"description": "Only admins can access this resource"},
    },
)
async def create_notification(notify: NotifySchema, auth: USER_AUTH) -> Notify:
    """
    Create a notification.
    """
    user = await user_repository.read(auth.user_id)
    if user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can access this resource")
    return await notify_repository.create_notify(notify)


@router.get("/admin", responses={200: {"description": "Get all notifications for admins"}})
async def get_notifications_for_admin(auth: USER_AUTH) -> list[Notify]:
    """
    Get all notifications for admins.
    """
    user = await user_repository.read(auth.user_id)
    if user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can access this resource")
    return await notify_repository.get_for_admin()


@router.get("/admin/unread", responses={200: {"description": "Get unread notifications for admin"}})
async def get_unread_notifications_for_admin(auth: USER_AUTH) -> list[Notify]:
    """
    Get unread notifications for the current admin user.
    """
    user = await user_repository.read(auth.user_id)
    if user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can access this resource")
    return await notify_repository.get_unread_for_admin(user.id)


@router.get(
    "/federation/{federation_id}",
    responses={
        200: {"description": "Get notifications for a federation"},
        403: {"description": "Only admins or federation owners can access this resource"},
    },
)
async def get_notifications_for_federation(federation_id: PydanticObjectId, auth: USER_AUTH) -> list[Notify]:
    """
    Get all notifications for a specific federation.
    """
    user = await user_repository.read(auth.user_id)

    if user.role != UserRole.ADMIN and user.federation_id != federation_id:
        raise HTTPException(status_code=403, detail="Only admins or federation owners can access this resource")

    return await notify_repository.get_for_federation(federation_id)


@router.get(
    "/federation/{federation_id}/unread",
    responses={
        200: {"description": "Get unread notifications for federation"},
        403: {"description": "Only admins or federation owners can access this resource"},
    },
)
async def get_unread_notifications_for_federation(federation_id: PydanticObjectId, auth: USER_AUTH) -> list[Notify]:
    """
    Get unread notifications for a specific federation.
    """

    user = await user_repository.read(auth.user_id)
    if user.role != UserRole.ADMIN and user.federation_id != federation_id:
        raise HTTPException(status_code=403, detail="Only admins or federation owners can access this resource")

    return await notify_repository.read_unread_for_federation(federation_id, auth.user_id)


@router.put("/{notify_id}/read", responses={200: {"description": "Mark notification as read"}})
async def mark_notification_as_read(notify_id: PydanticObjectId, auth: USER_AUTH) -> None:
    """
    Mark a notification as read by the current user.
    """
    notification = await notify_repository.add_read_by(notify_id, auth.user_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")


@router.get(
    "/{notify_id}",
    responses={
        200: {"description": "Get notification details"},
        404: {"description": "Notification not found"},
        403: {"description": "Only admins can access this resource"},
    },
)
async def get_notification(notify_id: PydanticObjectId, auth: USER_AUTH) -> Notify:
    """
    Get details of a specific notification by ID.
    """
    user = await user_repository.read(auth.user_id)
    if user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can access this resource")
    notification = await notify_repository.get_notify(notify_id)
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification
