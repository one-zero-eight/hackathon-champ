from enum import StrEnum
from pathlib import Path

import yaml
from pydantic import BaseModel, ConfigDict, Field, SecretStr


class Environment(StrEnum):
    DEVELOPMENT = "development"
    PRODUCTION = "production"


class SettingBaseModel(BaseModel):
    model_config = ConfigDict(use_attribute_docstrings=True, extra="forbid")


class SMTP(SettingBaseModel):
    host: str = "smtp.yandex.ru"
    "SMTP server host"
    port: int = 587
    "SMTP server port"
    username: str
    "SMTP server username"
    password: SecretStr
    "SMTP server password"


class MinioSettings(SettingBaseModel):
    endpoint: str = "127.0.0.1:9000"
    "URL of the target service."
    secure: bool = False
    "Use https connection to the service."
    access_key: str = Field(..., examples=["minioadmin"])
    "Access key (user ID) of a user account in the service."
    secret_key: SecretStr = Field(..., examples=["password"])
    "Secret key (password) for the user account."


class Settings(SettingBaseModel):
    """Settings for the application."""

    schema_: str = Field(None, alias="$schema")
    environment: Environment = Environment.DEVELOPMENT
    "App environment flag"
    app_root_path: str = ""
    'Prefix for the API path (e.g. "/api/v0")'
    database_uri: SecretStr = Field(
        examples=[
            "mongodb://mongoadmin:secret@localhost:27017/db?authSource=admin",
            "mongodb://mongoadmin:secret@db:27017/db?authSource=admin",
        ]
    )
    "MongoDB database settings"
    cors_allow_origin_regex: str = ".*"
    "Allowed origins for CORS: from which domains requests to the API are allowed. Specify as a regex: `https://.*.innohassle.ru`"
    session_secret_key: SecretStr
    "Secret key for session middleware"
    static_mount_path: str = "/static"
    "Path to mount static files"
    static_directory: Path = Path("static")
    "Path to the directory with static files"
    minio: MinioSettings
    "Minio settings"
    smtp: SMTP | None = None
    "SMTP settings"

    @classmethod
    def from_yaml(cls, path: Path) -> "Settings":
        with open(path) as f:
            yaml_config = yaml.safe_load(f)

        return cls.model_validate(yaml_config)

    @classmethod
    def save_schema(cls, path: Path) -> None:
        with open(path, "w") as f:
            schema = {"$schema": "https://json-schema.org/draft-07/schema", **cls.model_json_schema()}
            yaml.dump(schema, f, sort_keys=False)
