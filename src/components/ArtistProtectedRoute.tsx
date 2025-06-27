import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ArtistApplication } from '@/pages/AdminDashboard'; // Re-use the type

const ArtistProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const [artist, setArtist] = useState<ArtistApplication | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        const { data: artistData, error } = await supabase
          .from('artists')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
          console.error("Error fetching artist profile:", error);
        }
        setArtist(artistData);
      }
      setLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        // You might want to re-fetch the artist profile here as well
      } else {
        setUser(null);
        setArtist(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!user) {
    return <Navigate to="/artist-login" replace />;
  }

  if (artist?.status === 'approved') {
    return <Outlet />; // Render the child route (e.g., Artist Dashboard)
  }

  if (artist?.status === 'pending' || artist?.status === 'rejected') {
    return <Navigate to="/pending-approval" replace />;
  }

  // This case handles when the user is logged in but has no artist profile yet.
  // It could happen if the DB record wasn't created properly.
  // Or if a non-artist user tries to access an artist route.
  return <Navigate to="/join-as-artist" replace />;
};

export default ArtistProtectedRoute; 