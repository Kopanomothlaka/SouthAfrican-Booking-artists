import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  description: string;
}

const categoryDefinitions: Omit<Category, 'count'>[] = [
  { id: 'musicians', name: 'Musicians', icon: '🎸', description: 'Professional singers and instrumentalists for live performances at your events.' },
  { id: 'djs', name: 'DJs', icon: '🎧', description: 'Experienced DJs specializing in various music genres to keep your guests dancing.' },
  { id: 'dancers', name: 'Dancers', icon: '💃', description: 'Talented dance performers for entertainment and choreographed routines.' },
  { id: 'comedians', name: 'Comedians', icon: '🎭', description: 'Stand-up comedians and humorous hosts to entertain your audience.' },
  { id: 'mcs', name: 'MCs', icon: '🎤', description: 'Professional masters of ceremonies to host and guide your events.' },
  { id: 'bands', name: 'Bands', icon: '🥁', description: 'Full bands delivering live music experiences for all occasions.' },
];

const CategoryItem = ({ category, index }: { category: Category; index: number }) => {
  const fadeInAnimationVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.5,
      },
    }),
  };

  return (
    <motion.div
      variants={fadeInAnimationVariants}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      custom={index}
      className="w-full"
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="text-5xl md:text-6xl mb-4 md:mb-0">{category.icon}</div>
            <div className="flex-grow">
              <h3 className="text-xl md:text-2xl font-bold font-display mb-2">{category.name}</h3>
              <p className="text-foreground/70 mb-3">{category.description}</p>
              <div className="flex justify-between items-center">
                <span className="bg-secondary/20 text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  {category.count} Artists
                </span>
                <Link to={`/artists?category=${category.id}`}>
                  <Button size="sm" variant="outline">Browse Artists</Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      setLoading(true);
      // Fetch all active and available bookings
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select('id, category')
        .eq('is_active', true)
        .eq('status', 'available');

      let counts: Record<string, number> = {};
      if (!error && bookingsData) {
        for (const def of categoryDefinitions) {
          counts[def.id] = bookingsData.filter((b: any) => b.category === def.id).length;
        }
      } else {
        // fallback: all zero
        for (const def of categoryDefinitions) {
          counts[def.id] = 0;
        }
      }
      setCategories(
        categoryDefinitions.map(def => ({ ...def, count: counts[def.id] }))
      );
      setLoading(false);
    };
    fetchCategoryCounts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="bg-gradient-to-b from-secondary/50 to-background py-12">
        <div className="container">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-display font-bold mb-4">Artist Categories</h1>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Explore our diverse range of talented performers across various entertainment categories
            </p>
          </div>
        </div>
      </div>
      <div className="py-16">
        <div className="container">
          <div className="grid gap-6 md:gap-8">
            {loading ? (
              <div className="text-center">Loading categories...</div>
            ) : (
              categories.map((category, index) => (
                <CategoryItem key={category.id} category={category} index={index} />
              ))
            )}
          </div>
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold font-display mb-4">Looking for Something Special?</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto mb-6">
              Can't find what you're looking for? Contact our team and we'll help you find the perfect artist for your event.
            </p>
            <Button size="lg" variant="default" asChild>
              <a href="mailto:contact@booksa.co.za">Contact Us</a>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CategoriesPage;
