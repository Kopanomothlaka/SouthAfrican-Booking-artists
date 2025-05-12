
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold gradient-text">BookSA</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-foreground/80 hover:text-primary font-medium transition-colors">Home</Link>
          <Link to="/artists" className="text-foreground/80 hover:text-primary font-medium transition-colors">Artists</Link>
          <Link to="/categories" className="text-foreground/80 hover:text-primary font-medium transition-colors">Categories</Link>
          <Link to="/about" className="text-foreground/80 hover:text-primary font-medium transition-colors">About</Link>
        </nav>
        
        <div className="hidden md:flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-full">
            <Search className="h-4 w-4" />
          </Button>
          <Button>Book Now</Button>
        </div>
        
        <button 
          className="flex md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden container py-4 animate-fade-in">
          <nav className="flex flex-col gap-4">
            <Link 
              to="/" 
              className="text-foreground/80 hover:text-primary font-medium transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/artists" 
              className="text-foreground/80 hover:text-primary font-medium transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Artists
            </Link>
            <Link 
              to="/categories" 
              className="text-foreground/80 hover:text-primary font-medium transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Categories
            </Link>
            <Link 
              to="/about" 
              className="text-foreground/80 hover:text-primary font-medium transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <div className="flex items-center gap-4 py-2">
              <Button variant="outline" size="icon" className="rounded-full">
                <Search className="h-4 w-4" />
              </Button>
              <Button>Book Now</Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
