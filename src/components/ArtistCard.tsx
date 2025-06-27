import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

export interface Artist {
  id: string;
  name: string;
  category: string;
  image: string;
  fee: string;
  location: string;
  featured?: boolean;
}

interface ArtistCardProps {
  artist: Artist;
  index: number;
}

const ArtistCard = ({ artist, index }: ArtistCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobile();
  const delay = index * 100;
  
  return (
    <div 
      className="artist-card group animate-scale-in"
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden">
        <img 
          src={artist.image} 
          alt={artist.name} 
          className="artist-card-image group-hover:scale-105"
        />
        
        {artist.featured && (
          <Badge 
            className="absolute top-2 left-2 bg-primary text-white animate-pulse-slow"
          >
            Featured
          </Badge>
        )}
        
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className="glass-card">
            {artist.location}
          </Badge>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg">{artist.name}</h3>
          <Badge variant="secondary">{artist.category}</Badge>
        </div>
        
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm text-foreground/70">Starting from</p>
          <p className="font-semibold text-primary">{artist.fee}</p>
        </div>
        
        <div 
          className={`mt-4 transition-all duration-300 ${
            (isHovered || isMobile) ? 'opacity-100 max-h-20 animate-fade-in' : 'opacity-0 max-h-0 overflow-hidden'
          }`}
        >
          <Link to={`/artists/${artist.id}`}>
            <Button className="w-full hover:scale-105 transition-transform">View Profile</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArtistCard;
