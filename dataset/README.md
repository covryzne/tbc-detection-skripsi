# 🦠 Tuberculosis (TB) Chest X-Ray Dataset

[![Kaggle Dataset](https://img.shields.io/badge/Kaggle-20BEFF?style=for-the-badge&logo=Kaggle&logoColor=white)](https://www.kaggle.com/datasets/tawsifurrahman/tuberculosis-tb-chest-xray-dataset)
[![Mendeley Dataset](https://img.shields.io/badge/Mendeley-Data-red?style=for-the-badge&logo=Mendeley&logoColor=white)](https://data.mendeley.com/datasets/8j2g3csprk/2)

---

## 📌 Overview

Proyek ini menggunakan gabungan dataset X-ray dada dari dua sumber utama yaitu **Kaggle** dan **Mendeley Data**, untuk membangun sistem deteksi Tuberkulosis (TB) berbasis deep learning. Dataset terdiri dari dua kelas:
- **Normal**
- **Tuberculosis**

Total gambar setelah penggabungan:
- **Normal:** 3708 gambar
- **Tuberculosis:** 3194 gambar

Untuk menyeimbangkan distribusi kelas, dilakukan **undersampling** pada kelas *Normal* sehingga masing-masing kelas memiliki 3194 gambar sebelum proses pelatihan.

---

## 📁 Dataset Sources

### 1. 📦 Kaggle - Tuberculosis (TB) Chest X-Ray Dataset

**Link:** [Kaggle - Tuberculosis (TB) Chest X-Ray Dataset](https://www.kaggle.com/datasets/tawsifurrahman/tuberculosis-tb-chest-xray-dataset)

Dataset ini dikembangkan oleh tim dari Qatar University, University of Dhaka, dan Hamad Medical Corporation. Dataset ini terdiri dari:
- **3500 gambar TB**
- **3500 gambar Normal**

#### 🧪 Rincian Tuberculosis:
- 700 gambar TB dikumpulkan dari dataset publik
- 2800 gambar TB dikumpulkan dari **NIAID TB portal program** (dengan perjanjian akses)

#### 💡 Rincian Normal:
- 406 gambar dari **NLM**
- 3094 gambar dari **RSNA Pneumonia Detection Challenge**

#### 📎 Format:
- Format gambar: **PNG**
- Resolusi: **512 x 512 px**

#### 📚 Mohon sitasi jika menggunakan:
> Tawsifur Rahman, et al. (2020)  
> *"Reliable Tuberculosis Detection using Chest X-ray with Deep Learning, Segmentation and Visualization"*.  
> IEEE Access, Vol. 8, pp 191586 - 191601. DOI: [10.1109/ACCESS.2020.3031384](https://doi.org/10.1109/ACCESS.2020.3031384)

---

### 2. 📦 Mendeley Data - Tuberculosis Chest X-Ray Image Dataset

**Link:** [Mendeley - Tuberculosis Chest X-ray Image Dataset](https://data.mendeley.com/datasets/8j2g3csprk/2)

Dataset ini disediakan oleh peneliti dari India, digunakan sebagai pelengkap dan penyeimbang data.  
Terdiri dari:
- **2494 gambar Tuberculosis**
- **514 gambar Normal**

#### 📎 Format:
- Format gambar: **JPEG**
- Resolusi: bervariasi, mayoritas dalam kualitas tinggi

#### 📚 Mohon sitasi jika menggunakan:
> S. R. Prajapati, R. A. Panchal. (2020)  
> *"Tuberculosis Chest X-ray Image Dataset"*.  
> Mendeley Data, V2. DOI: [10.17632/8j2g3csprk.2](https://doi.org/10.17632/8j2g3csprk.2)

---

## ⚠️ Data Imbalance Handling

Distribusi data awal:
- **Normal:** 3708 gambar
- **Tuberculosis:** 3194 gambar

Agar dataset menjadi seimbang dan menghindari bias terhadap kelas mayoritas, dilakukan **undersampling** terhadap kelas *Normal* secara acak, sehingga jumlah akhir menjadi:
- **Normal:** 3194 gambar
- **Tuberculosis:** 3194 gambar

Dataset seimbang ini kemudian digunakan dalam proses training, validation, dan testing dengan rasio pembagian: **70% train, 15% val, 15% test**.

---

## 🎯 Tujuan

Dataset gabungan ini dimanfaatkan untuk:
- Pengembangan model deteksi Tuberkulosis berbasis Deep Learning
- Eksperimen klasifikasi binary TB vs Normal
- Evaluasi model berbasis metrik seperti AUC, F1-score, dan Confusion Matrix

---
