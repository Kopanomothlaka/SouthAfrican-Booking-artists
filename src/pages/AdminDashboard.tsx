import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Eye, Check, X, Download, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Mock data for artist applications - This will be replaced by API call
const mockApplications: any[] = [
  {
    id: 1,
    fullName: 'John Doe',
    artistName: 'DJ Johnny',
    email: 'john@example.com',
    phone: '+27123456789',
    category: 'djs',
    location: 'Cape Town, Western Cape',
    status: 'pending',
    submittedAt: '2024-01-15',
    idDocument: 'john_doe_id.pdf'
  },
  {
    id: 2,
    fullName: 'Sarah Smith',
    artistName: 'Sarah Sings',
    email: 'sarah@example.com',
    phone: '+27987654321',
    category: 'musicians',
    location: 'Johannesburg, Gauteng',
    status: 'pending',
    submittedAt: '2024-01-14',
    idDocument: 'sarah_smith_id.jpg'
  },
  {
    id: 3,
    fullName: 'Mike Johnson',
    artistName: 'Comedy Mike',
    email: 'mike@example.com',
    phone: '+27555123456',
    category: 'comedians',
    location: 'Durban, KwaZulu-Natal',
    status: 'approved',
    submittedAt: '2024-01-10',
    idDocument: 'mike_johnson_id.pdf'
  }
];

// Define a type for our artist application data
export type ArtistApplication = {
  id: string; // user id
  created_at: string;
  full_name: string;
  artist_name: string;
  email: string;
  phone: string;
  category: string;
  location: string;
  bio: string;
  experience: string;
  id_document_url: string;
  status: 'pending' | 'approved' | 'rejected';
};

const AdminDashboard = () => {
  const [applications, setApplications] = useState<ArtistApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<ArtistApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState<{ full_name: string; email: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('full_name, email')
          .eq('id', user.id)
          .single();
        if (!error && data) {
          setAdminInfo(data);
        }
      }
    };

    fetchAdminInfo();
  }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error fetching applications",
          description: error.message,
          variant: 'destructive',
        });
        console.error('Error fetching applications:', error);
      } else {
        setApplications(data as ArtistApplication[]);
      }
      setLoading(false);
    };

    fetchApplications();
  }, []);

  const handleLogout = async () => {
    try {
      // Sign out from Supabase Auth
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
      }
      
      // Navigate to admin login page
      navigate('/admin-login');
      
    } catch (error) {
      console.error('Unexpected logout error:', error);
      navigate('/admin-login');
    }
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('artists')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({
        title: `Failed to ${status === 'approved' ? 'approve' : 'reject'} application`,
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setApplications(prev =>
        prev.map(app => (app.id === id ? { ...app, status } : app))
      );
      toast({
        title: `Application ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        description: `Artist has been notified.`,
      });
    }
  };

  const handleDownloadId = async (filePath: string) => {
    const { data, error } = await supabase.storage
      .from('artist-documents')
      .download(filePath);

    if (error) {
      toast({
        title: "Error downloading file",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filePath.split('/').pop() || 'id-document');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const approvedApplications = applications.filter(app => app.status === 'approved');
  const rejectedApplications = applications.filter(app => app.status === 'rejected');

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">Afri-Art Booking Hub - Admin</h1>
          </div>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>
      
      <div className="py-16">
        <div className="container">
          {/* Admin Info Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-display font-bold mb-4">Admin Dashboard</h1>
              <p className="text-foreground/70">
                Manage artist registrations and platform settings
              </p>
            </div>
            <div className="text-right">
              {adminInfo && (
                <div className="mb-2 text-sm text-foreground/70">
                  Logged in as: <span className="font-semibold">{adminInfo.full_name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Pending Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {pendingApplications.length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Approved Artists</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {approvedApplications.length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Rejected Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {rejectedApplications.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant="destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Applications Table */}
          <Card>
            <CardHeader>
              <CardTitle>Artist Applications</CardTitle>
              <CardDescription>
                Review and manage artist registration applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artist Name</TableHead>
                    <TableHead>Real Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Loading applications...
                      </TableCell>
                    </TableRow>
                  ) : (
                    applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">
                          {application.artist_name}
                        </TableCell>
                        <TableCell>{application.full_name}</TableCell>
                        <TableCell className="capitalize">
                          {application.category?.replace('s', '')}
                        </TableCell>
                        <TableCell>{application.location}</TableCell>
                        <TableCell>
                          {getStatusBadge(application.status)}
                        </TableCell>
                        <TableCell>
                          {new Date(application.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedApplication(application)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {application.status === 'pending' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(application.id, 'approved')}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(application.id, 'rejected')}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Application Detail Modal */}
          {selectedApplication && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>Application Details</CardTitle>
                  <CardDescription>
                    Review artist application information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold">Full Name</Label>
                      <p>{selectedApplication.full_name}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Artist Name</Label>
                      <p>{selectedApplication.artist_name}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Email</Label>
                      <p>{selectedApplication.email}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Phone</Label>
                      <p>{selectedApplication.phone}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Category</Label>
                      <p className="capitalize">{selectedApplication.category?.replace('s', '')}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Location</Label>
                      <p>{selectedApplication.location}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="font-semibold">Bio</Label>
                    <p className="text-sm text-foreground/80">{selectedApplication.bio}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Experience</Label>
                    <p className="text-sm text-foreground/80">{selectedApplication.experience}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">ID Document</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadId(selectedApplication.id_document_url)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Document
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedApplication(null)}>
                    Close
                  </Button>
                  {selectedApplication.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => {
                          handleUpdateStatus(selectedApplication.id, 'approved');
                          setSelectedApplication(null);
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleUpdateStatus(selectedApplication.id, 'rejected');
                          setSelectedApplication(null);
                        }}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
