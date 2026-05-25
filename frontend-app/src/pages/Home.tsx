import { Link } from 'react-router-dom';
import { PhoneCall } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative h-[calc(100vh-104px)] flex items-center bg-[#020617] overflow-hidden text-white">
      <div className="container mx-auto px-6 md:px-12 py-4 flex flex-col md:flex-row items-center justify-between z-10 w-full h-full">
        
        {/* Left Column: Text */}
        <div className="flex flex-col items-start w-full md:w-5/12 md:pr-4">
          <h1 className="text-4xl md:text-[52px] font-extrabold text-white leading-[1.15] tracking-tight mb-4 max-w-xl">
            A Better <span className="text-brand-yellow drop-shadow-sm">Way</span><br/>
            To buy, sell or finance<br/>
            your car.
          </h1>
          
          <p className="text-base md:text-lg text-gray-300 font-medium mb-8 max-w-lg drop-shadow-sm">
            Your Car Journey, All in One Place — Everything You Need, Before and After the Drive.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link to="/register" className="bg-brand-yellow hover:opacity-90 text-white font-bold py-2.5 px-6 rounded-md shadow-md transform transition-transform hover:-translate-y-1 text-base text-center w-full sm:w-auto">
              Sign Up
            </Link>
            <Link to="/login" className="bg-transparent hover:bg-white/10 text-white border-2 border-white/20 font-bold py-2.5 px-6 rounded-md shadow-sm transform transition-transform hover:-translate-y-1 text-base text-center w-full sm:w-auto backdrop-blur-sm">
              Login
            </Link>
            
            <div className="flex items-center ml-2 mt-4 sm:mt-0">
              <PhoneCall className="text-brand-red w-6 h-6 mr-2" />
              <div className="flex flex-col whitespace-nowrap">
                <span className="text-gray-400 text-[10px] font-semibold tracking-wide uppercase">Call Us Today!</span>
                <span className="text-white font-bold text-base">+1 800 123 4567</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Image */}
        <div className="w-full md:w-7/12 mt-8 md:mt-0 flex justify-end items-center relative h-full">
           <img 
              src="/hero-cars.png" 
              alt="Luxury Car" 
              className="w-full max-w-[850px] h-auto object-contain mix-blend-screen brightness-110 contrast-125 transform md:translate-x-12 lg:scale-110"
           />
        </div>
      </div>

      
      {/* Dark bar at the bottom */}
      <div className="absolute bottom-0 w-full h-8 bg-black z-20"></div>
    </div>
  );
}
