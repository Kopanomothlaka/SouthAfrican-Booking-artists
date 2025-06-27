import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Menu, X, LogOut, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<{ full_name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // First check if user is a client
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('full_name')
          .eq('id', session.user.id)
          .single();
        
        if (!clientError && clientData) {
          // User is a client
          setUserInfo({ full_name: clientData.full_name, role: 'client' });
        } else {
          // Check if user is in users table (for admin/artist)
          const { data, error } = await supabase
            .from('users')
            .select('full_name, role')
            .eq('id', session.user.id)
            .single();
          
          console.log('Header - User info fetch:', { data, error, userId: session.user.id });
          
          if (!error && data) {
            setUserInfo(data);
          } else {
            console.error('Header - Failed to fetch user info:', error);
          }
        }
      }
      setLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        
        // First check if user is a client
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('full_name')
          .eq('id', session.user.id)
          .single();
        
        if (!clientError && clientData) {
          // User is a client
          setUserInfo({ full_name: clientData.full_name, role: 'client' });
        } else {
          // Check if user is in users table (for admin/artist)
          const { data, error } = await supabase
            .from('users')
            .select('full_name, role')
            .eq('id', session.user.id)
            .single();
          
          console.log('Header - Auth state change user info:', { data, error, userId: session.user.id });
          
          if (!error && data) {
            setUserInfo(data);
          } else {
            console.error('Header - Auth state change failed to fetch user info:', error);
          }
        }
      } else {
        setUser(null);
        setUserInfo(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Sign out from Supabase Auth
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        // Even if there's an error, we should still clear local state
        setUser(null);
        setUserInfo(null);
      }
      
      // Clear local state regardless of error
      setUser(null);
      setUserInfo(null);
      
      // Navigate to home page
      navigate('/');
      
    } catch (error) {
      console.error('Unexpected logout error:', error);
      // Clear local state even if there's an error
      setUser(null);
      setUserInfo(null);
      navigate('/');
    }
  };

  const getDashboardLink = () => {
    if (!userInfo) return null;
    
    if (userInfo.role === 'admin') {
      return '/admin';
    } else if (userInfo.role === 'artist') {
      return '/artist/dashboard';
    } else if (userInfo.role === 'client') {
      return '/client-dashboard';
    }
    return null;
  };

  const dashboardLink = getDashboardLink();

  // Don't show navigation for authenticated users (they have their own dashboards)
  const shouldShowNavigation = !user || !userInfo;

  // Debug logging
  console.log('Header Debug:', {
    user: !!user,
    userInfo: userInfo,
    shouldShowNavigation,
    userRole: userInfo?.role
  });

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src="/Energetic_Logo_with_Musical_Note-removebg-preview.png" alt="BookSA Logo" className="h-10 w-auto" />
          </Link>
        </div>
        
        {shouldShowNavigation && (
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-foreground/80 hover:text-primary font-medium transition-colors">Home</Link>
            <Link to="/artists" className="text-foreground/80 hover:text-primary font-medium transition-colors">Artists</Link>
            <Link to="/categories" className="text-foreground/80 hover:text-primary font-medium transition-colors">Categories</Link>
            <Link to="/about" className="text-foreground/80 hover:text-primary font-medium transition-colors">About</Link>
          </nav>
        )}
        
        <div className="hidden md:flex items-center gap-4">
          {shouldShowNavigation && (
            <Button variant="outline" size="icon" className="rounded-full">
              <Search className="h-4 w-4" />
            </Button>
          )}
          
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-3">
                  {dashboardLink && (
                    <Link to={dashboardLink}>
                      <Button variant="outline" size="sm">
                        <User className="h-4 w-4 mr-2" />
                        {userInfo?.role === 'client' ? 'My Dashboard' : 'Dashboard'}
                      </Button>
                    </Link>
                  )}
                  <div className="text-sm text-foreground/70">
                    Hi, {userInfo?.full_name || user.email}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline">Login</Button>
                  </Link>
                  <div className="flex gap-2">
                    <Link to="/client-register">
                      <Button variant="outline">Join as Client</Button>
                    </Link>
                    <Link to="/join-as-artist">
                      <Button>Join as Artist</Button>
                    </Link>
                  </div>
                </>
              )}
            </>
          )}
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
          {shouldShowNavigation && (
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
            </nav>
          )}
          
          <div className="flex items-center gap-4 py-2">
            {shouldShowNavigation && (
              <Button variant="outline" size="icon" className="rounded-full">
                <Search className="h-4 w-4" />
              </Button>
            )}
            
            {!loading && (
              <>
                {user ? (
                  <div className="flex flex-col gap-2 w-full">
                    {dashboardLink && (
                      <Link to={dashboardLink} onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full">
                          <User className="h-4 w-4 mr-2" />
                          {userInfo?.role === 'client' ? 'My Dashboard' : 'Dashboard'}
                        </Button>
                      </Link>
                    )}
                    <div className="text-sm text-foreground/70 px-2">
                      Hi, {userInfo?.full_name || user.email}
                    </div>
                    <Button variant="outline" onClick={handleLogout} className="w-full">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline">Login</Button>
                    </Link>
                    <Link to="/client-register" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline">Join as Client</Button>
                    </Link>
                    <Link to="/join-as-artist" onClick={() => setIsMenuOpen(false)}>
                      <Button>Join as Artist</Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
