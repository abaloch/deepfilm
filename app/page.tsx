import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="container mx-auto py-6 px-4 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-xl font-medium tracking-tight">DEEPFILM</span>
        </div>
        <div>
          <Button variant="default" className="bg-white text-black hover:bg-white/90 rounded-full px-6">
            Contact
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 mt-20">
        <h1 className="text-8xl md:text-3xl sm:text-xl leading-[1.1] font-medium tracking-tight max-w-4xl">Revolutionary AI face-swapping and de-aging tech for film. </h1>
        <p className="text-xl text-gray-400 mt-4 mb-8 max-w-2xl">
          Coming soon
        </p>

        {/* Split Image Section */}
        <div className="mt-12 mb-16 rounded-3xl overflow-hidden border border-gray-800">
          <div className="relative w-full h-[500px] md:h-[400px] sm:h-[300px]">
            <img
              src="https://sosafe-awareness.com/sosafe-files/uploads/2022/08/Comparison_deepfake_blogpost_EN.jpg"
              alt="Technology visualization"
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M60 10C32.4 10 10 32.4 10 60C10 87.6 32.4 110 60 110C87.6 110 110 87.6 110 60C110 32.4 87.6 10 60 10ZM60 100C37.9 100 20 82.1 20 60C20 37.9 37.9 20 60 20C82.1 20 100 37.9 100 60C100 82.1 82.1 100 60 100Z"
                  fill="white"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-2 gap-16 mb-20">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Currently</span>
            </div>
            <div className="space-y-1 text-gray-400">
              <p>HQ :: LOS ANGELES, CA</p>
            </div>
            
            <div className="space-y-1 text-gray-400">
              <p>ACTIVE PROTOTYPE</p>
              <p>V1</p>
            </div>
          </div>
          <div className="space-y-8">
            <p className="text-xl leading-relaxed text-gray-300">
              We make <span className="font-medium text-white">DeepFilm</span>, a revolutionary deepfake technology for
              film production. 
            </p>
            <Button variant="default" className="bg-white text-black hover:bg-white/90 rounded-full px-8 py-6">
              Try DeepFilm
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

