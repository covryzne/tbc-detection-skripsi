from pydantic import BaseModel

class ResultsModel(BaseModel):
    name: str
    description: str
