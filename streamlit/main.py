import streamlit as st
import numpy as np
import onnxruntime as ort
import torch
from PIL import Image
from torchvision import transforms
from pathlib import Path
import streamlit as st
from utils.auth import login_user
import time
import os
from utils.auth import login_user

st.set_page_config(page_title="Deteksi TBC", layout="wide")

# Inisialisasi state
if "logged_in" not in st.session_state:
    st.session_state.logged_in = False
    st.session_state.username = ""
    st.session_state.role = ""

# Kalau belum login
if not st.session_state.logged_in:

    # Bikin 3 kolom, form login di tengah (col2)
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        st.markdown("""
            <h2 style='text-align: center;'>👋 Selamat Datang di Sistem Deteksi Tuberkulosis</h2>
            <p style='text-align: center;'>Silakan login untuk melanjutkan.</p>
        """, unsafe_allow_html=True)

        with st.form("login_form", border=True):
            st.markdown("### 🔐 Login")
            username = st.text_input("Username")
            password = st.text_input("Password", type="password")
            submit = st.form_submit_button("Login")

            if submit:
                role = login_user(username, password)
                if role:
                    st.session_state.logged_in = True
                    st.session_state.username = username
                    st.session_state.role = role
                    st.success(f"Berhasil login sebagai **{role}** ✅")
                    st.rerun()
                else:
                    st.error("Username atau password salah.")

else:
    # Sidebar aktif
    with st.sidebar:
        st.success(f"Login sebagai **{st.session_state.username}** ({st.session_state.role})")
        st.session_state.menu = st.radio("Menu", ["🏠 Dashboard", "🔍 Prediksi", "📊 Confusion Matrix", "📈 AUC ROC"]) \
            if st.session_state.role == "dokter" else st.radio("Menu", ["🏠 Dashboard", "🔍 Prediksi"])

        if st.button("Logout"):
            st.session_state.logged_in = False
            st.session_state.username = ""
            st.session_state.role = ""
            st.session_state.menu = "Dashboard"
            st.rerun()

    # Konten berdasarkan menu
    if st.session_state.menu == "🏠 Dashboard":
        st.markdown(f"# 🎉 Halo, {st.session_state.username.capitalize()}!")
        st.write("Selamat datang di sistem deteksi Tuberkulosis. Silakan pilih menu di sidebar.")
        
    elif st.session_state.menu == "🔍 Prediksi":
        st.header("🔍 Halaman Prediksi")
        st.write("🧪 Upload gambar X-Ray untuk prediksi Tuberkulosis.")
        
        # Cek login dulu
        if "logged_in" not in st.session_state or not st.session_state.logged_in:
            st.error("❌ Anda belum login.")
            st.stop()

        # Path relatif dari file ini (pages/predict.py)
        BASE_DIR = Path(__file__).resolve().parent.parent
        onnx_model_path = BASE_DIR / "models" / "tuberModel.onnx"

        # Load model ONNX
        ort_session = ort.InferenceSession(str(onnx_model_path))

        # Label kelas
        classes = ["Normal", "Tuberculosis"]

        # Transformasi gambar (harus sama dengan training)
        transform = transforms.Compose([
            transforms.Grayscale(num_output_channels=1),
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.5], [0.5])
        ])

        # Setup halaman prediksi
        st.title("🩻 Deteksi Tuberkulosis dari Citra X-Ray")
        st.write("Upload gambar X-Ray dada untuk mendeteksi kemungkinan Tuberkulosis.")

        # Upload file
        uploaded_file = st.file_uploader("📤 Upload Gambar", type=["png", "jpg", "jpeg"])

        if uploaded_file is not None:
            # Baca gambar & tampilkan
            image = Image.open(uploaded_file).convert("L")
            
            # st.image(image, caption="🖼️ Gambar yang Diupload", width=300)
            # st.image(image, caption="🖼️ Gambar yang Diupload", use_container_width=True)
            
            col1, col2, col3 = st.columns([1, 2, 1])
            with col2:
                st.image(image, caption="🖼️ Gambar yang Diupload", width=500)

            # Preprocessing
            input_tensor = transform(image).unsqueeze(0).numpy()

            # Hitung waktu inference
            
            start = time.time()
            output = ort_session.run(None, {"actual_input": input_tensor})[0]
            end = time.time()
            inference_time = end - start

            # Deteksi bentuk output
            if output.shape[1] == 1:
                prob = torch.sigmoid(torch.tensor(output)).numpy()[0][0]
                predicted_class = 1 if prob >= 0.5 else 0
                confidence = prob
            elif output.shape[1] == 2:
                softmaxed = torch.softmax(torch.tensor(output), dim=1).numpy()[0]
                predicted_class = int(np.argmax(softmaxed))
                confidence = softmaxed[predicted_class]
            else:
                st.error("❌ Output model tidak dikenali.")
                st.stop()

            col1, col2, col3 = st.columns([1, 2, 1])
            with col2:
                # Tampilkan hasil prediksi
                st.subheader("🧠 Hasil Prediksi:")
                st.write(f"**{classes[predicted_class]}**")

                st.subheader("📊 Confidence:")
                st.write(f"{confidence * 100:.2f}%")

                st.subheader("⏱️ Inference Time:")
                st.write(f"{inference_time:.4f} detik")

    elif st.session_state.menu == "📊 Confusion Matrix" and st.session_state.role == "dokter":
        st.header("📊 Confusion Matrix")
        st.image("assets/confusion_matrix.png", caption="Confusion Matrix")

    elif st.session_state.menu == "📈 AUC ROC" and st.session_state.role == "dokter":
        st.header("📈 Grafik AUC/ROC")
        st.image("assets/auc_roc.png", caption="AUC ROC Curve")
