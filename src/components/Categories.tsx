
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

const categories: Category[] = [
  { id: 'musicians', name: 'Musicians', icon: '🎸', count: 156 },
  { id: 'djs', name: 'DJs', icon: '🎧', count: 89 },
  { id: 'dancers', name: 'Dancers', icon: '💃', count: 72 },
  { id: 'comedians', name: 'Comedians', icon: '🎭', count: 43 },
  { id: 'mcs', name: 'MCs', icon: '🎤', count: 37 },
  { id: 'bands', name: 'Bands', icon: '🥁', count: 28 },
];

const Categories = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-display mb-4">Browse by Category</h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Find the perfect artist for your event from our wide selection of talented performers
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <Card 
              key={category.id}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-bold font-display">{category.name}</h3>
                <p className="text-sm text-foreground/70 mt-1">{category.count} Artists</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <Button>Explore All Categories</Button>
        </div>
      </div>
    </div>
  );
};

export default Categories;
