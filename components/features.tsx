import type React from "react"
import { Shield, Zap, Cpu, BarChart4 } from "lucide-react"

export function Features() {
  return (
    <section className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
          Advanced Features for Dental Professionals
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Our AI-powered tool provides cutting-edge analysis capabilities while keeping your patients' data secure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <FeatureCard
          icon={<Shield className="h-6 w-6 text-teal-600" />}
          title="Privacy First"
          description="All processing happens locally on your device. Patient data never leaves your computer."
        />
        <FeatureCard
          icon={<Zap className="h-6 w-6 text-teal-600" />}
          title="Instant Results"
          description="Get detailed analysis in seconds with our optimized AI models."
        />
        <FeatureCard
          icon={<Cpu className="h-6 w-6 text-teal-600" />}
          title="Advanced AI"
          description="State-of-the-art deep learning models trained on thousands of dental X-rays."
        />
        <FeatureCard
          icon={<BarChart4 className="h-6 w-6 text-teal-600" />}
          title="Detailed Reports"
          description="Generate comprehensive reports with interactive visualizations for patient education."
        />
      </div>
    </section>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="h-12 w-12 rounded-lg bg-teal-50 flex items-center justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  )
}
