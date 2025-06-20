
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Eye, Check, X, Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Mock data for artist applications
const mockApplications = [
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

const AdminDashboard = () => {
  const [applications, setApplications] = useState(mockApplications);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  const handleApprove = (id: number) => {
    setApplications(prev => 
      prev.map(app => 
        app.id === id ? { ...app, status: 'approved' } : app
      )
    );
    toast({
      title: "Application Approved",
      description: "Artist has been approved and notified.",
    });
  };

  const handleReject = (id: number) => {
    setApplications(prev => 
      prev.map(app => 
        app.id === id ? { ...app, status: 'rejected' } : app
      )
    );
    toast({
      title: "Application Rejected",
      description: "Artist has been notified of the rejection.",
      variant: "destructive"
    });
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
      <Header />
      
      <div className="py-16">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-4">Admin Dashboard</h1>
            <p className="text-foreground/70">
              Manage artist registrations and platform settings
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">
                        {application.artistName}
                      </TableCell>
                      <TableCell>{application.fullName}</TableCell>
                      <TableCell className="capitalize">
                        {application.category.replace('s', '')}
                      </TableCell>
                      <TableCell>{application.location}</TableCell>
                      <TableCell>
                        {getStatusBadge(application.status)}
                      </TableCell>
                      <TableCell>{application.submittedAt}</TableCell>
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
                                onClick={() => handleApprove(application.id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReject(application.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
                      <p>{selectedApplication.fullName}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Artist Name</Label>
                      <p>{selectedApplication.artistName}</p>
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
                      <p className="capitalize">{selectedApplication.category}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Location</Label>
                      <p>{selectedApplication.location}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="font-semibold">ID Document</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm">{selectedApplication.idDocument}</span>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedApplication(null)}
                    >
                      Close
                    </Button>
                    {selectedApplication.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => {
                            handleApprove(selectedApplication.id);
                            setSelectedApplication(null);
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            handleReject(selectedApplication.id);
                            setSelectedApplication(null);
                          }}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
