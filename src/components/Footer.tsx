import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-secondary/50">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="font-display font-bold text-lg mb-4 gradient-text">BookSA</h3>
            <p className="text-sm text-foreground/70 mb-4">
              The ultimate platform for booking South Africa's top performing artists directly.
            </p>
            <p className="text-sm text-foreground/70">
              © {new Date().getFullYear()} BookSA. All rights reserved.
            </p>
          </div>
          
          <div>
            <h3 className="font-display font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/artists" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Artists
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-display font-bold mb-4">For Artists</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/join-as-artist" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Join as an Artist
                </Link>
              </li>
              <li>
                <Link to="/artist-login" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Artist Login
                </Link>
              </li>
              {/* <li>
                <Link to="/pricing" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Resources
                </Link>
              </li> */}
            </ul>
          </div>
          
          <div>
            <h3 className="font-display font-bold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-sm text-foreground/70">
                <span className="font-medium">Email:</span> contact@booksa.co.za
              </li>
              <li className="text-sm text-foreground/70">
                <span className="font-medium">Phone:</span> +27 10 123 4567
              </li>
              <li className="text-sm text-foreground/70">
                <span className="font-medium">Address:</span> 123 Main Street, Johannesburg, South Africa
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
