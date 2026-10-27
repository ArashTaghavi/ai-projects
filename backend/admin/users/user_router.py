from random import randint
from typing import Annotated

from core.http.responses import DataMessageResponse, DataResponse, MessageResponse
from core.websocket.websocket_manager import manager
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status

from .user_schema import UserCreate, UserResponse, UserUpdate
from .user_service import UserService

router = APIRouter(prefix="/users", tags=["Admin"])

Service = Annotated[UserService, Depends(UserService)]


@router.get("/", response_model=DataResponse[list[UserResponse]])
def index(service: Service, background_tasks: BackgroundTasks):
    users = service.index()

    # Temporary demo metric; this is not the server's actual CPU utilization.
    background_tasks.add_task(
        manager.broadcast,
        {
            "type": "server.metrics",
            "data": {"cpu_usage": randint(10, 100), "memory_usage": randint(10, 100)},
        },
    )

    return DataResponse(data=users)


@router.get("/{id}", response_model=DataResponse[UserResponse])
def show(id: int, service: Service):
    user = service.show(id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=__("users.not_found"),
        )

    return DataResponse(data=user)


@router.post(
    "/",
    response_model=DataMessageResponse[UserResponse],
    status_code=status.HTTP_201_CREATED,
)
def store(data: UserCreate, service: Service):
    user = service.store(data)

    return DataMessageResponse(
        message=__("users.created"),
        data=user,
    )


@router.put("/{id}", response_model=DataMessageResponse[UserResponse])
def update(id: int, data: UserUpdate, service: Service):
    user = service.update(id, data)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=__("users.not_found"),
        )

    return DataMessageResponse(
        message=__("users.updated"),
        data=user,
    )


@router.delete("/{id}", response_model=MessageResponse)
def destroy(id: int, service: Service):
    deleted = service.destroy(id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=__("users.not_found"),
        )

    return MessageResponse(
        message=__("users.deleted"),
    )
