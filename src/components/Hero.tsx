import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const artistTypes = ["Musicians", "DJs", "Dancers", "Comedians", "MCs"];
  const navigate = useNavigate();

  useEffect(() => {
    // Start animating text rotation
    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % artistTypes.length);
    }, 3000);
    
    // Trigger entrance animation
    setIsVisible(true);
    
    return () => clearInterval(interval);
  }, []);

  // Scroll to How It Works section
  const handleHowItWorksClick = () => {
    const section = document.getElementById('how-it-works-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-secondary/50 to-background pb-10">
      {/* Animated shapes */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-20 left-[10%] h-32 w-32 rounded-full bg-primary/30 animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-60 left-[80%] h-20 w-20 rounded-full bg-accent/30 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-40 left-[25%] h-40 w-40 rounded-full bg-primary/20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-80 left-[60%] h-28 w-28 rounded-full bg-accent/20 animate-float" style={{ animationDelay: '3s' }}></div>
      </div>
      
      <div className={`container px-4 pt-24 pb-16 sm:px-6 sm:pt-32 sm:pb-24 lg:px-8 relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="mx-auto max-w-4xl text-center">
          <h1 className={`font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl animate-float-in`} style={{ animationDelay: '0.3s' }}>
            Book South Africa's Top
            <div className="h-16 sm:h-20 overflow-hidden mt-2">
              <div 
                className="transition-transform duration-500 ease-in-out"
                style={{ transform: `translateY(-${currentTextIndex * 100}%)` }}
              >
                {artistTypes.map((type, index) => (
                  <div 
                    key={index} 
                    className="h-16 sm:h-20 flex items-center justify-center"
                  >
                    <span className="gradient-text animate-pulse-slow">{type}</span>
                  </div>
                ))}
              </div>
            </div>
          </h1>
          
          <p className={`mt-6 text-lg leading-8 text-foreground/80 max-w-2xl mx-auto animate-float-in`} style={{ animationDelay: '0.5s' }}>
            Discover and book South Africa's most talented artists directly.
            No more endless emails or phone calls. Find your perfect talent at the right price.
          </p>
          
          <div className={`mt-10 flex items-center justify-center gap-6 animate-float-in`} style={{ animationDelay: '0.7s' }}>
            <Button size="lg" className="animate-bounce-subtle" onClick={() => navigate('/artists')}>
              Browse Artists
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="hover:scale-105 transition-transform" onClick={handleHowItWorksClick}>
              How It Works
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
