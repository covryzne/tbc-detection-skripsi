import os
import sys
from typing import List


def generate_description_of_start_app_command() -> None:
    """Generates the description of this command."""
    print("python start_app.py [APP_NAME]")
    print(f'Create an app with router, models, and controllers inside src.')


def handle_generate_app(args: List[str]) -> None:
    """This function handles to create an app.
    Args:
        args (List[str]): List of commands
    """
    try:
        app_name = args[1]
        # Check if the app already exists inside src
        if os.path.exists(f"src/{app_name}"):
            raise Exception(f"App with name '{app_name}' already exists")
        else:
            print(f"Creating app with name '{app_name}'")
            os.mkdir(f"src/{app_name}")
            
            # Create the default files directly inside the app folder
            # Create router.py file
            with open(f"src/{app_name}/router.py", "w") as f:
                f.write(f"""from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def read_{app_name}():
    return {{'msg': 'Hello from {app_name}!'}}
""")
                
            # Create models.py file
            with open(f"src/{app_name}/model.py", "w") as f:
                f.write(f"""from pydantic import BaseModel

class {app_name.capitalize()}Model(BaseModel):
    name: str
    description: str
""")
            
            # Create schemas.py file
            with open(f"src/{app_name}/schemas.py", "w") as f:
                f.write(f"""from pydantic import BaseModel

class {app_name.capitalize()}Schema(BaseModel):
    name: str
    description: str
""")
            print(f"App {app_name} created with default files.")
            
    except IndexError:
        raise Exception("Please provide the app name")


if __name__ == "__main__":
    # Parse command line args
    args = sys.argv

    if len(args) < 2:
        generate_description_of_start_app_command()
    else:
        handle_generate_app(args)
