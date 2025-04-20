"use client";

import React, { useState } from "react";

const TbNews: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const articles = [
    {
      title:
        "Kemenkes Selenggarakan Pertemuan Nasional Organisasi Penyintas Tuberkulosis Tahun 2024",
      image: "./artikel1.jpg",
      content:
        "Indonesia merupakan salah satu negara dengan beban Tuberkulosis (TBC) dan Tuberkulosis Resistan Obat (TBC RO) nomor kedua di dunia setelah India...",
      source: "TB Indonesia",
      date: "June 21, 2024",
      link: "https://www.tbindonesia.or.id/pertemuan-nasional-organisasi-penyintas-tuberkulosis-tahun-2024/",
    },
    {
      title: "Kasus TBC Tinggi Karena Perbaikan Sistem Deteksi dan Pelaporan",
      image: "./artikel2.png",
      content:
        "Deteksi TBC mirip dengan deteksi Covid-19, yakni jika tidak dites, dideteksi, dan dilaporkan maka angkanya terlihat rendah sehingga...",
      source: "Kemenkes",
      date: "Januari 29, 2024",
      link: "https://sehatnegeriku.kemkes.go.id/baca/rilis-media/20240129/2644877/kasus-tbc-tinggi-karena-perbaikan-sistem-deteksi-dan-pelaporan/",
    },
    {
      title: "Lagi, Kasus TBC Indonesia Peringkat Kedua di Dunia",
      image: "./artikel3.png",
      content:
        "Dalam laporan juga disebutkan bahwa 83 negara di dunia mengalami penurunan kasus TBC rata-rata sekitar 20 persen...",
      source: "CNN Indonesia",
      date: "9 November, 2023",
      link: "https://www.cnnindonesia.com/gaya-hidup/20231109133544-255-1021991/lagi-kasus-tbc-indonesia-peringkat-kedua-di-dunia",
    },
  ];

  const handleLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    link: string
  ) => {
    event.preventDefault();
    window.open(link, "_blank");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div
        style={{
          display: "flex",
          gap: "20px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {articles.map((article, index) => (
          <div
            key={index}
            style={{
              flex: "0 0 32%",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "500px",
                height: "auto",
                overflow: "hidden",
                borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.20)",
                margin: "0 auto",
              }}
            >
              <img
                src={article.image}
                alt={article.title}
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: "10px",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  color: "#001A6E",
                  fontWeight: "bold",
                  marginBottom: "10px",
                }}
              >
                {article.title}
              </h3>
              <p
                style={{
                  color: "#666",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  textAlign: "justify",
                }}
              >
                {article.content}
              </p>
              <h3
                style={{ fontSize: "14px", color: "#999", marginTop: "10px" }}
              >
                {article.source} | {article.date}
              </h3>
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  color: hoveredIndex === index ? "#001A6E" : "#001A6E",
                  textDecoration: hoveredIndex === index ? "underline" : "none",
                  fontSize: "14px",
                  marginTop: "10px",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
              >
                Baca Selengkapnya →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TbNews;
