import os
import shutil
import subprocess
from pathlib import Path

import yaml

BASE_DIR = Path(__file__).resolve().parents[1]
SETTINGS_TEMPLATE = BASE_DIR / "settings.example.yaml"
SETTINGS_FILE = BASE_DIR / "settings.yaml"
PRE_COMMIT_CONFIG = BASE_DIR / ".pre-commit-config.yaml"


def get_settings():
    """
    Load and return the settings from `settings.yaml` if it exists.
    """
    if not SETTINGS_FILE.exists():
        raise RuntimeError("❌ No `settings.yaml` found.")

    try:
        with open(SETTINGS_FILE) as f:
            return yaml.safe_load(f) or {}
    except Exception as e:
        raise RuntimeError("❌ No `settings.yaml` found.") from e


def ensure_settings_file():
    """
    Ensure `settings.yaml` exists. If not, copy `settings.yaml.example`.
    """
    if not SETTINGS_TEMPLATE.exists():
        print("❌ No `settings.yaml.example` found. Skipping copying.")
        return

    if SETTINGS_FILE.exists():
        print("✅ `settings.yaml` exists.")
        return

    shutil.copy(SETTINGS_TEMPLATE, SETTINGS_FILE)
    print(f"✅ Copied `{SETTINGS_TEMPLATE}` to `{SETTINGS_FILE}`")


def ensure_pre_commit_hooks():
    """
    Ensure `pre-commit` hooks are installed.
    """

    def is_pre_commit_installed():
        pre_commit_hook = BASE_DIR / ".git" / "hooks" / "pre-commit"
        return pre_commit_hook.exists() and os.access(pre_commit_hook, os.X_OK)

    if not PRE_COMMIT_CONFIG.exists():
        print("❌ No `.pre-commit-config.yaml` found. Skipping pre-commit setup.")
        return

    if is_pre_commit_installed():
        print("✅ Pre-commit hooks are installed.")
        return

    try:
        subprocess.run(
            ["poetry", "run", "pre-commit", "install", "--install-hooks", "-t", "pre-commit", "-t", "commit-msg"],
            check=True,
            text=True,
        )
        print("✅ Pre-commit hooks installed successfully.")
    except subprocess.CalledProcessError as e:
        print(
            f"❌ Error setting up pre-commit hooks:\n{e.stderr}\n  Please, setup it manually with `poetry run pre-commit install --install-hooks -t pre-commit -t commit-msg`"
        )


def check_database_access():
    """
    Ensure the database is accessible using `database_uri` from `settings.yaml`. If missing, set a default value.
    """
    import asyncio

    from motor.motor_asyncio import AsyncIOMotorClient
    from pymongo import timeout

    DEFAULT_DB_URL = "mongodb://mongoadmin:secret@localhost:27017/db?authSource=admin"
    settings = get_settings()
    database_uri = settings.get("database_uri")

    if not database_uri or database_uri == "...":
        print("⚠️ `database_uri` is missing in `settings.yaml`. Setting default one.")

        try:
            with open(SETTINGS_FILE) as f:
                as_text = f.read()
            as_text = as_text.replace("database_uri: null", f"database_uri: {DEFAULT_DB_URL}")
            as_text = as_text.replace("database_uri: ...", f"database_uri: {DEFAULT_DB_URL}")
            with open(SETTINGS_FILE, "w") as f:
                f.write(as_text)
            print("  ✅ `database_uri` has been updated in `settings.yaml`.")
            database_uri = DEFAULT_DB_URL
        except Exception as e:
            print(f"  ❌ Error updating `settings.yaml`: {e}")
            return

    def get_docker_compose_command():
        commands = ["docker compose", "docker-compose"]

        for cmd in commands:
            try:
                subprocess.run(cmd.split(), check=True, text=True, capture_output=True)
                return cmd
            except subprocess.CalledProcessError:
                # Command not available
                continue
        return None

    async def test_connection():
        try:
            motor_client = AsyncIOMotorClient(database_uri)
            motor_client.get_io_loop = asyncio.get_running_loop  # type: ignore[method-assign]

            with timeout(2):
                await motor_client.server_info()
                print("✅ Successfully connected to the database.")
        except Exception:
            print(f"⚠️ Failed to connect to the database at `{database_uri}`")
            docker_compose = get_docker_compose_command()

            if docker_compose:
                print(f"  ➡ Attempting to start the database using `{docker_compose} up -d db` (wait for it)")
                try:
                    subprocess.run(
                        [*docker_compose.split(), "up", "-d", "--wait", "db"],
                        check=True,
                        text=True,
                        capture_output=True,
                    )
                    print(f"  ✅ `{docker_compose} up -d db` executed successfully. Retrying connection...")
                    # Retry the database connection after starting the container
                    motor_client = AsyncIOMotorClient(database_uri)
                    motor_client.get_io_loop = asyncio.get_running_loop  # type: ignore[method-assign]

                    with timeout(2):
                        await motor_client.server_info()
                        print("  ✅ Successfully connected to the database after starting the container.")
                except subprocess.CalledProcessError as docker_error:
                    print(f"  ❌ Failed to start the database using `{docker_compose} up -d db`:\n  {docker_error}")
                except Exception as retry_error:
                    print(f"  ❌ Retried database connection but failed again:\n  {retry_error}")
            else:
                print("  ❌ Docker Compose is not available, so not able to start db automatically.")

    asyncio.run(test_connection())


def check_and_generate_session_secret_key():
    """
    Ensure the `check_and_generate_session_secret_key` is set in `settings.yaml`.
    If missing, generate random_one
    """
    import secrets

    settings = get_settings()
    session_secret_key = settings.get("session_secret_key")

    if not session_secret_key or session_secret_key == "...":
        print("⚠️ `session_secret_key` is missing in `settings.yaml`.")
        print("  ➡️ Generate a random one")
        secret = secrets.token_hex(32)
        try:
            with open(SETTINGS_FILE) as f:
                as_text = f.read()
            as_text = as_text.replace("session_secret_key: null", f"session_secret_key: {secret}")
            as_text = as_text.replace("session_secret_key: ...", f"session_secret_key: {secret}")
            with open(SETTINGS_FILE, "w") as f:
                f.write(as_text)
            print("  ✅ `session_secret_key` has been updated in `settings.yaml`.")
        except Exception as e:
            print(f"  ❌ Error updating `settings.yaml`: {e}")

    else:
        print("✅ `session_secret_key` is specified.")


def prepare():
    ensure_settings_file()
    ensure_pre_commit_hooks()
    check_database_access()
    check_and_generate_session_secret_key()
