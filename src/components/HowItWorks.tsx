import { Card, CardContent } from '@/components/ui/card';
import { Search, Calendar, MessageSquare } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: JSX.Element;
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Find Your Artist',
    description: 'Browse through our curated list of South African talent and filter by category, location, and budget.',
    icon: <Search className="h-10 w-10 text-primary" />
  },
  {
    id: 2,
    title: 'Check Availability',
    description: 'View the artist\'s calendar to check their availability for your event date.',
    icon: <Calendar className="h-10 w-10 text-primary" />
  },
  {
    id: 3,
    title: 'Send Booking Request',
    description: 'Submit your booking details and wait for confirmation from the artist or their manager.',
    icon: <MessageSquare className="h-10 w-10 text-primary" />
  }
];

const HowItWorks = () => {
  return (
    <div id="how-it-works-section" className="py-16 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-display mb-4">How It Works</h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Booking your favorite South African artists has never been easier
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card 
              key={step.id}
              className="border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg animate-fade-in"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mx-auto mb-4">
                  {step.icon}
                </div>
                
                <h3 className="text-xl font-bold font-display text-center mb-3">
                  {step.title}
                </h3>
                
                <p className="text-center text-foreground/70">
                  {step.description}
                </p>
                
                <div className="mt-4 flex items-center justify-center">
                  <span className="text-2xl font-display font-bold text-primary/70">
                    {step.id}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
