import React from "react";

const About: React.FC = () => {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div
        style={{
          display: "flex",
          gap: "80px",
          alignItems: "center", // <--- ini bikin teks sejajar sama gambar
        }}
      >
        {/* Image Section */}
        <div style={{ flex: "1.5" }}>
          <div
            style={{
              overflow: "hidden",
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
              marginLeft: "115px",
              backgroundColor: "#fff",
            }}
          >
            <img
              src="./about.png"
              alt="Our Mission"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
            />
          </div>
        </div>

        {/* Description Section */}
        <div style={{ flex: "2" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center", // <--- ini buat isi teks ketengah
              height: "100%",
            }}
          >
            <p
              style={{
                textAlign: "justify",
                marginBottom: "20px",
                marginRight: "120px",
              }}
            >
              <strong>TB Detector</strong> adalah sistem berbasis artificial
              intelligence (AI) yang dirancang untuk mendeteksi penyakit
              tuberkulosis secara otomatis melalui citra chest X-Ray.
              Menggunakan model deep learning <strong>DenseNet121</strong>, TB
              Detector mampu memberikan hasil cepat, mudah, dan akurat dalam
              mendeteksi penyakit tuberkulosis.
            </p>
            <p style={{ textAlign: "justify", marginRight: "120px" }}>
              <strong>Disclaimer:</strong> TB Detector hanya alat bantu
              diagnosis medis. Hasil deteksi harus dikonfirmasi oleh dokter.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
