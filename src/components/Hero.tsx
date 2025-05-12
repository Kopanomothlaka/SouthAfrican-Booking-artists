
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

const Hero = () => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const artistTypes = ["Musicians", "DJs", "Dancers", "Comedians", "MCs"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % artistTypes.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-secondary/50 to-background pb-10">
      {/* Animated shapes */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-20 left-[10%] h-32 w-32 rounded-full bg-primary/30 animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-60 left-[80%] h-20 w-20 rounded-full bg-accent/30 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-40 left-[25%] h-40 w-40 rounded-full bg-primary/20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-80 left-[60%] h-28 w-28 rounded-full bg-accent/20 animate-float" style={{ animationDelay: '3s' }}></div>
      </div>
      
      <div className="container px-4 pt-24 pb-16 sm:px-6 sm:pt-32 sm:pb-24 lg:px-8 relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
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
                    <span className="gradient-text">{type}</span>
                  </div>
                ))}
              </div>
            </div>
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-foreground/80 max-w-2xl mx-auto">
            Discover and book South Africa's most talented artists directly.
            No more endless emails or phone calls. Find your perfect talent at the right price.
          </p>
          
          <div className="mt-10 flex items-center justify-center gap-6">
            <Button size="lg">
              Browse Artists
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg">
              How It Works
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
