"""Request models for the recommendation API."""

from pydantic import BaseModel


class ProductIdRequest(BaseModel):
    productId: str


class UserIdRequest(BaseModel):
    userId: str
