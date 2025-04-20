"use client";

import { useState } from "react";

const FaqContent: React.FC = () => {
  const faqs = [
    {
      question: "Bagaimana cara kerja TB Detector?",
      answer:
        "Unggah X-Ray → Sistem menganalisis → Hasil muncul dalam hitungan detik",
    },
    {
      question: "Apakah TB Detector menggantikan dokter?",
      answer:
        "Tidak. Ini hanya alat bantu, hasil tetap perlu dikonfirmasi oleh dokter.",
    },
    {
      question: "Seberapa akurat deteksi AI ini?",
      answer:
        "Menggunakan model DenseNet121 yang dilatih dengan dataset X-Ray TB, sehingga memiliki akurasi tinggi.",
    },
  ];

  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const toggleFaq = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6">
      {faqs.map((faq, index) => (
        <div key={index} className="border-b border-gray-300 py-4">
          <button
            onClick={() => toggleFaq(index)}
            className="flex items-center justify-between w-full text-left py-2"
          >
            {/* Pertanyaan dikunci lebarnya */}
            <span className="text-lg font-semibold text-sky-900 pr-4 flex-1">
              {faq.question}
            </span>

            {/* Ikon dikunci lebar dan tidak menyusut */}
            <span className="text-xl text-sky-700 font-bold w-8 h-8 text-center select-none flex justify-center items-center transition-all duration-300 ease-in-out">
              {openIndexes.includes(index) ? "−" : "+"}
            </span>
          </button>

          {/* Jawaban dengan transisi smooth */}
          <div
            className={`mt-2 text-gray-700 text-base transition-all duration-300 ease-in-out ${
              openIndexes.includes(index)
                ? "max-h-screen"
                : "max-h-0 overflow-hidden"
            }`}
          >
            {openIndexes.includes(index) && <p>{faq.answer}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FaqContent;
