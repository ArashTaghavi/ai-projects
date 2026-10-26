from fastapi import APIRouter

from .controller import AuthController

router = APIRouter(prefix="/auth", tags=["Authentication"])

controller = AuthController()

router.add_api_route(
    "/register",
    controller.register,
    methods=["POST"],
    status_code=201,
)

router.add_api_route(
    "/login",
    controller.login,
    methods=["POST"],
)

router.add_api_route(
    "/me",
    controller.me,
    methods=["GET"],
)

router.add_api_route(
    "/logout",
    controller.logout,
    methods=["POST"],
)
