from fastapi import APIRouter

from .user_controller import UserController

router = APIRouter(prefix="/users", tags=["Admin"])

controller = UserController()

router.add_api_route("/", controller.index, methods=["GET"], status_code=200)
