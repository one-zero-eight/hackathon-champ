import magic
from fastapi import APIRouter, HTTPException, UploadFile
from fastapi.responses import Response

from src.modules.files.repository import file_worker_repository

router = APIRouter(prefix="/file_worker", tags=["FileWorker"])


@router.post("/upload")
async def upload_file(file: UploadFile) -> str:
    resp = file_worker_repository.upload_file(file.filename, file.file.read(), file.size)
    return resp


@router.get("/download")
async def download_file(url: str) -> Response:
    fp_group = url.split("/")
    if len(fp_group) != 2:
        raise HTTPException(status_code=400)
    bucket_name, file_name = fp_group[0], fp_group[1]
    resp = file_worker_repository.download_file(bucket_name, file_name)
    return Response(
        content=resp,
        media_type=magic.from_buffer(resp, mime=True),
        headers={"Content-Disposition": f"attachment; filename={file_name}"},
    )
