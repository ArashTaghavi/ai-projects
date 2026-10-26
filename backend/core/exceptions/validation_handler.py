from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from core.exceptions.validation_exception import ValidationException
from core.localization.translator import translator


async def validation_handler(
    request: Request,
    exc: RequestValidationError | ValidationException,
):
    locale = translator.locale
    errors = {}

    if isinstance(exc, ValidationException):
        errors[exc.field] = [exc.message]

    else:
        for error in exc.errors():
            field = ".".join(str(part) for part in error["loc"][1:])
            key = f"validation.{error['type']}"

            try:
                message = translator.get(key, locale)
            except KeyError:
                message = translator.get("validation.default", locale)

            message = message.format(**error.get("ctx", {}))
            errors.setdefault(field, []).append(message)

    return JSONResponse(
        status_code=422,
        content={
            "errors": errors,
        },
    )
