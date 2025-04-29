from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def read_results():
    return {'msg': 'Hello from results!'}
