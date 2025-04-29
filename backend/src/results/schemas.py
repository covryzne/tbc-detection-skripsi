from pydantic import BaseModel

class ResultsSchema(BaseModel):
    name: str
    description: str
