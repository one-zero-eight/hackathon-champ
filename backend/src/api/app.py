__all__ = ["app"]

import re

from fastapi import FastAPI
from fastapi.routing import APIRoute
from fastapi_swagger import patch_fastapi
from starlette.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles

import src.logging_  # noqa: F401
from src.api.lifespan import lifespan
from src.config import settings


def generate_unique_operation_id(route: APIRoute) -> str:
    # Better names for operationId in OpenAPI schema.
    # It is needed because clients generate code based on these names.
    # Requires pair (tag name + function name) to be unique.
    # See fastapi.utils:generate_unique_id (default implementation).
    if route.tags:
        operation_id = f"{route.tags[0]}_{route.name}".lower()
    else:
        operation_id = route.name.lower()
    operation_id = re.sub(r"\W+", "_", operation_id)
    return operation_id


# App definition
app = FastAPI(
    title="ФСП Линк API",
    version="0.1.3",
    contact={
        "name": "one-zero-eight",
        "url": "https://t.me/one_zero_eight",
    },
    license_info={
        "name": "MIT License",
        "identifier": "MIT",
    },
    servers=[
        {"url": settings.app_root_path, "description": "Current"},
    ],
    root_path=settings.app_root_path,
    root_path_in_servers=False,
    generate_unique_id_function=generate_unique_operation_id,
    lifespan=lifespan,
    docs_url=None,
    redoc_url=None,
    swagger_ui_oauth2_redirect_url=None,
    separate_input_output_schemas=True,
)
patch_fastapi(app)

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=settings.cors_allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from starlette.middleware.sessions import SessionMiddleware  # noqa: E402

from src.config_schema import Environment  # noqa: E402

session_cookie = "__Secure-session" if settings.environment == Environment.PRODUCTION else "session"
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.session_secret_key.get_secret_value(),
    session_cookie=session_cookie,
    max_age=14 * 24 * 60 * 60,  # 14 days, in seconds
    path="/",
    same_site="lax",
    https_only=True if settings.environment == Environment.PRODUCTION else False,
    domain=None,
)

app.mount(settings.static_mount_path, StaticFiles(directory=settings.static_directory), name="static")

from src.modules.email.routes import router as router_email  # noqa: E402
from src.modules.events.routes import router as router_events  # noqa: E402
from src.modules.federation.routes import router as router_federation  # noqa: E402
from src.modules.feedback.routes import router as router_feedback  # noqa: E402
from src.modules.files.routes import router as router_files  # noqa: E402
from src.modules.notify.routes import router as router_notify  # noqa: E402
from src.modules.participants.routes import router as router_participants  # noqa: E402
from src.modules.results.routes import router as router_results  # noqa: E402
from src.modules.users.routes import router as router_users  # noqa: E402

app.include_router(router_users)
app.include_router(router_events)
app.include_router(router_federation)
app.include_router(router_feedback)
app.include_router(router_files)
app.include_router(router_notify)
app.include_router(router_email)
app.include_router(router_participants)
app.include_router(router_results)
