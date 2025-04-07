import streamlit as st
import numpy as np
import onnxruntime as ort
import torch
from PIL import Image
from torchvision import transforms
from pathlib import Path

# Path model ONNX
onnx_model_path = "models/tuberModel.onnx"
ort_session = ort.InferenceSession(onnx_model_path)

# Label kelas
classes = ["Normal", "Tuberculosis"]

# Transformasi gambar (harus sama dengan training)
transform = transforms.Compose([
    transforms.Grayscale(num_output_channels=1),
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5], [0.5])
])

# Setup Streamlit
st.set_page_config(page_title="Deteksi Tuberkulosis", layout="centered")
st.title("🩻 Deteksi Tuberkulosis dari Citra X-Ray")
st.write("Upload gambar X-Ray dada untuk mendeteksi kemungkinan Tuberkulosis.")

# Upload file
uploaded_file = st.file_uploader("📤 Upload Gambar", type=["png", "jpg", "jpeg"])

if uploaded_file is not None:
    # Baca gambar & tampilkan
    image = Image.open(uploaded_file).convert("RGB")
    st.image(image, caption="🖼️ Gambar yang Diupload", use_container_width=True)

    # Preprocessing
    input_tensor = transform(image).unsqueeze(0).numpy()

    # Inference dengan ONNX
    output = ort_session.run(None, {"actual_input": input_tensor})[0]  # (1, 1) atau (1, 2)

    # Deteksi bentuk output
    if output.shape[1] == 1:
        # Binary logit (pakai BCEWithLogitsLoss waktu training)
        prob = torch.sigmoid(torch.tensor(output)).numpy()[0][0]
        predicted_class = 1 if prob >= 0.5 else 0
        confidence = prob
    elif output.shape[1] == 2:
        # Dua logit (pakai CrossEntropyLoss)
        softmaxed = torch.softmax(torch.tensor(output), dim=1).numpy()[0]
        predicted_class = int(np.argmax(softmaxed))
        confidence = softmaxed[predicted_class]
    else:
        st.error("❌ Output model tidak dikenali.")
        st.stop()

    # Tampilkan hasil prediksi
    st.subheader("🧠 Hasil Prediksi:")
    st.write(f"**{classes[predicted_class]}** ({confidence * 100:.2f}% yakin)")

    if predicted_class == 1:
        st.error("⚠️ Pasien terindikasi **Tuberkulosis**.")
    else:
        st.success("✅ Pasien dalam kondisi **Normal**.")
