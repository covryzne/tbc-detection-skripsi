import Header from "@/app/header";
import Footer from "../footer";
import Prediction from "./prediction";

export default function TryNow() {
  return (
    <div className="flex flex-col min-h-screen bg-yellow-50/50">
      {/* Header */}
      <Header />

      {/* Main */}
      <main className="flex flex-col items-center justify-center flex-grow">
        <div className="flex flex-col space-y-2 items-center mt-10">
          <h1 className="font-bold text-center text-2xl text-primary">
            Tuberculosis Detection App
          </h1>
        </div>
        {/* Prediction Section */}
        <div className="my-10">
          <Prediction />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
