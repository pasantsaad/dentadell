import { Upload } from "@/components/upload"
import { Features } from "@/components/features"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-white"
                >
                  <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                  <path d="M12 12 2.1 9.1a10 10 0 0 0 9.8 12.9L12 12z" />
                  <path d="M12 12v10a10 10 0 0 0 10-10h-10z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-slate-800">DentalAI Analyzer</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-teal-600 font-medium">
                Home
              </a>
              <a href="#" className="text-slate-600 hover:text-teal-600 transition-colors">
                Features
              </a>
              <a href="#" className="text-slate-600 hover:text-teal-600 transition-colors">
                Documentation
              </a>
              <a href="#" className="text-slate-600 hover:text-teal-600 transition-colors">
                Support
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Advanced Dental X-ray Analysis</h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-8">
            Upload dental X-rays to detect and segment pathologies with our AI-powered tool. All processing happens
            locally on your device for maximum privacy and security.
          </p>

          <Upload />
        </section>

        <Features />
      </main>

      <footer className="bg-slate-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">DentalAI Analyzer</h3>
              <p className="text-slate-300">
                Advanced AI-powered dental X-ray analysis that runs locally on your device. Secure, private, and
                accurate.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-slate-300">
                <li>
                  <a href="#" className="hover:text-teal-300 transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-300 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-300 transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-300 transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-slate-300">
                Have questions or need assistance?
                <br />
                <a href="mailto:support@dentalai.com" className="text-teal-300 hover:underline">
                  support@dentalai.com
                </a>
              </p>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>© {new Date().getFullYear()} DentalAI Analyzer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
