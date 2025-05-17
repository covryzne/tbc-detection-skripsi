import base64
import datetime
import io
import os
from pathlib import Path

import numpy as np
import onnx
import onnxruntime
import torchvision.transforms as transforms
from PIL import Image

# model

BASE_DIR = Path(__file__).resolve().parent
FILE_NAME = "tuberModel.onnx"
MODEL_PATH = os.path.join(BASE_DIR, FILE_NAME)

ort_session = onnxruntime.InferenceSession(MODEL_PATH)


def to_numpy(tensor):
    return (
        tensor.detach().cpu().numpy() if tensor.requires_grad else tensor.cpu().numpy()
    )


# classes
class_names = ["normal", "tuberculosis"]


def transform_image(image_bytes):
    my_transforms = transforms.Compose(
        [
            transforms.Grayscale(num_output_channels=1),
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.5], [0.5]),
        ]
    )
    image = Image.open(io.BytesIO(image_bytes)).convert("L")
    return my_transforms(image).unsqueeze(0)


def sigmoid(x):
    return 1.0 / (1.0 + np.exp(-x))

# def sigmoid_with_temperature(x, T=1.0):
#     return 1.0 / (1.0 + np.exp(-x / T))


def get_prediction(image_bytes):
    img = transform_image(image_bytes=image_bytes)
    ort_inputs = {ort_session.get_inputs()[0].name: to_numpy(img)}
    ort_outs = ort_session.run(None, ort_inputs)
    print("Logits:", ort_outs[0])

    img_out = sigmoid(ort_outs[0])
    print("Probabilitas:", img_out[0])
    # img_out = sigmoid_with_temperature(ort_outs[0], T=2.0)
    # print("Probabilitas (T=2):", img_out[0])
    predicted_idx = np.argmax(img_out[0])
    confidence = float(f"{float(img_out[0][predicted_idx]) * 100:.2f}")
    print(f"Backend Confidence: {confidence}%")
    return class_names[predicted_idx], confidence


def get_result(image_file, is_api=False):
    start_time = datetime.datetime.now()
    image_bytes = image_file.file.read()
    class_name, confidence = get_prediction(image_bytes)
    print(f"get_result Confidence: {confidence}")

    if not is_api:
        # Convert to grayscale for preview
        gray_image = Image.open(io.BytesIO(image_bytes)).convert("L")
        buffered = io.BytesIO()
        gray_image.save(buffered, format="JPEG")
        encoded_string = base64.b64encode(buffered.getvalue())
        bs64 = encoded_string.decode("utf-8")
        image_data = f"data:image/jpeg;base64,{bs64}"

    end_time = datetime.datetime.now()
    time_diff = end_time - start_time
    execution_time = f"{round(time_diff.total_seconds() * 1000)} ms"

    result = {
        "inference_time": execution_time,
        "predictions": {"class_name": class_name, "confidence": confidence},
    }

    if not is_api:
        result["image_data"] = image_data

    return result
