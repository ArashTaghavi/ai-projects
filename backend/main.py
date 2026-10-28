import core.localization
from admin.users import router as user_router
from core.auth import router as auth_router
from core.exceptions import validation_handler
from core.exceptions.validation_exception import ValidationException
from core.websocket.websocket import router as websocket_router
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from projects.chat_with_document.router import router as cwd

app = FastAPI(title="AI Projects")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def handle_validation_error(
    request: Request,
    exc: RequestValidationError,
):
    return await validation_handler(request, exc)


@app.exception_handler(ValidationException)
async def handle_custom_validation_error(
    request: Request,
    exc: ValidationException,
):
    return await validation_handler(request, exc)


app.include_router(auth_router)
app.include_router(user_router)
app.include_router(websocket_router)
app.include_router(cwd)
