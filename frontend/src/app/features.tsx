import React from "react";

type Props = {};

export default function Features({}: Props) {
  const content = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="primary"
          className="h-6 w-6"
          viewBox="0 0 24 24"
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      ),
      title: "Cepat",
      description: "Hasil analisis dalam hitungan detik",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="primary"
          className="h-6 w-6"
          viewBox="0 0 24 24"
        >
          <path d="M12 2L6.5 8H10v6h4V8h3.5L12 2zm-9 18v2h18v-2H3z" />
        </svg>
      ),
      title: "Mudah",
      description: "Cukup unggah X-Ray, sistem akan menganalisis otomatis",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="primary"
          className="h-6 w-6"
          viewBox="0 0 24 24"
        >
          <path d="M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2zm1 17.93V18a1 1 0 00-2 0v1.93A8.015 8.015 0 014.07 13H6a1 1 0 000-2H4.07A8.015 8.015 0 0111 4.07V6a1 1 0 002 0V4.07A8.015 8.015 0 0119.93 11H18a1 1 0 000 2h1.93A8.015 8.015 0 0113 19.93zM12 8a4 4 0 104 4 4.005 4.005 0 00-4-4zm0 6a2 2 0 112-2 2.003 2.003 0 01-2 2z" />
        </svg>
      ),
      title: "Akurat",
      description:
        "Didukung oleh teknologi deep learning menggunakan DenseNet-121",
    },
  ];

  return (
    <section className="w-full z-10">
      <ul className="mx-auto grid max-w-7xl grid-cols-1 rounded-t-3xl bg-primary p-8 text-white md:grid-cols-3">
        {content.map((item, i) => (
          <li
            key={i}
            className="flex cursor-pointer flex-row place-content-center items-center space-x-4 rounded p-4 transition hover:bg-sky-800"
          >
            <div className="rounded bg-white p-3 text-sky-900">{item.icon}</div>
            <div className="flex flex-col">
              <h3 className="font-medium">{item.title}</h3>
              <p className="max-w-[150px] text-xs font-light">
                {item.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
