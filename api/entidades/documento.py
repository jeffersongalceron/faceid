from pydantic import BaseModel
from typing import Optional

class Documento(BaseModel):
    image: Optional[str] = None