import React from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Clock, Mail, LogOut, CheckCircle } from 'lucide-react';

const PendingApproval = () => {
  const handleLogout = async () => {
    try {
      // Sign out from Supabase Auth
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
      }
      
      // Redirecting is handled by the auth listener in App.tsx or router
      // The auth state change will automatically redirect
      
    } catch (error) {
      console.error('Unexpected logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-2xl mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-yellow-800">
              Application Under Review
            </CardTitle>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 mx-auto mt-2">
              Pending Approval
            </Badge>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-4">
              <p className="text-lg text-foreground/80">
                Thank you for submitting your artist application! 🎉
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  What happens next?
                </h3>
                <ul className="text-sm text-blue-700 space-y-1 text-left">
                  <li>• Our team is reviewing your application and ID document</li>
                  <li>• We typically process applications within 2-3 business days</li>
                  <li>• You'll receive an email notification once approved</li>
                  <li>• Once approved, you can access your full artist dashboard</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center justify-center gap-2">
                  <Mail className="h-5 w-5" />
                  While you wait
                </h3>
                <ul className="text-sm text-gray-700 space-y-1 text-left">
                  <li>• Check your email regularly for updates</li>
                  <li>• Make sure your contact information is up to date</li>
                  <li>• Prepare your portfolio and media files</li>
                  <li>• Review our platform guidelines and policies</li>
                </ul>
              </div>

              <div className="text-sm text-foreground/60">
                <p className="mb-2">
                  <strong>Need help?</strong> Contact our support team if you have any questions about your application.
                </p>
                <p>
                  <strong>Application taking longer?</strong> Processing times may vary during peak periods.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button onClick={handleLogout} className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              <p className="text-xs text-foreground/50 mt-2">
                You can log back in anytime to check your application status
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default PendingApproval; 