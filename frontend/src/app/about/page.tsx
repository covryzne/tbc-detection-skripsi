import Header from "@/app/header";
import Footer from "../footer";
import AboutContent from "./about";

export default function About() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Main */}
      <main className="flex flex-col items-center justify-start flex-grow">
        <div className="flex flex-col space-y items-center mt-10 pt-[60pt]">
          <h1 className="font-bold text-center text-[3.2rem] text-primary">
            ABOUT
          </h1>
        </div>
        {/* AboutContent Section */}
        <div className="my-10">
          <AboutContent />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
