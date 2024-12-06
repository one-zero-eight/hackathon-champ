import io

from fastapi import HTTPException
from minio import Minio

from src.config import settings

minio_client = Minio(
    settings.minio.endpoint,
    access_key=settings.minio.access_key,
    secret_key=settings.minio.secret_key.get_secret_value(),
    secure=settings.minio.secure,
)
BUCKET_NAME = "fsp-link"


class FileWorker:
    def create_bucket(self):
        if not minio_client.bucket_exists(bucket_name=BUCKET_NAME):
            minio_client.make_bucket(BUCKET_NAME)

    def upload_file(self, filename: str, file_data: bytes, file_size: int) -> str:
        res = minio_client.put_object(
            bucket_name=BUCKET_NAME, object_name=filename, data=io.BytesIO(file_data), length=file_size
        )
        return f"{res.bucket_name}/{res.object_name}"

    def download_file(self, bucket_name: str, object_name: str) -> bytes:
        res = minio_client.get_object(bucket_name=bucket_name, object_name=object_name)
        if res.status == 200:
            return res.data
        if res.status == 404:
            raise HTTPException(status_code=404)
        raise HTTPException(status_code=500, detail=res.reason)


file_worker_repository: FileWorker = FileWorker()
