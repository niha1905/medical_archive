import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  QrCode, 
  Search, 
  Users, 
  Clock, 
  FileText, 
  Activity, 
  Calendar, 
  ChevronRight, 
  Stethoscope,
  ClipboardList,
  UserRound,
  BarChart3
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const [qrToken, setQrToken] = useState('');
  
  // Mock data for recent patients
  const recentPatients = [
    { id: 1, name: 'John Doe', lastVisit: '2023-11-15', condition: 'Hypertension', status: 'stable' },
    { id: 2, name: 'Jane Smith', lastVisit: '2023-11-14', condition: 'Diabetes Type 2', status: 'improving' },
    { id: 3, name: 'Robert Johnson', lastVisit: '2023-11-10', condition: 'Asthma', status: 'stable' },
    { id: 4, name: 'Emily Davis', lastVisit: '2023-11-08', condition: 'Arthritis', status: 'worsening' },
  ];
  
  // Mock data for upcoming appointments
  const upcomingAppointments = [
    { id: 1, patient: 'Sarah Wilson', date: '2023-11-20', time: '09:30 AM', type: 'Follow-up' },
    { id: 2, patient: 'Michael Brown', date: '2023-11-20', time: '11:00 AM', type: 'New Patient' },
    { id: 3, patient: 'Lisa Taylor', date: '2023-11-21', time: '10:15 AM', type: 'Consultation' },
  ];
  
  // Mock data for statistics
  const statistics = {
    patientsToday: 8,
    totalPatients: 142,
    documentsReviewed: 37,
    pendingReviews: 5
  };
  
  const handleQrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrToken) {
      setLocation(`/doctor/${qrToken}`);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'improving': return 'text-green-600 bg-green-100';
      case 'worsening': return 'text-red-600 bg-red-100';
      case 'stable': return 'text-blue-600 bg-blue-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user?.displayName}</h1>
            <p className="mt-1 text-blue-100">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button 
              className="bg-white text-blue-600 hover:bg-blue-50"
              onClick={() => setLocation('/doctor')}
            >
              <QrCode className="mr-2 h-4 w-4" />
              Scan Patient QR
            </Button>
          </div>
        </div>
      </div>
      
      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-blue-100 hover:border-blue-300 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Patients Today</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{statistics.patientsToday}</h3>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={75} className="h-1 bg-blue-100">
                <div className="h-1 bg-blue-500" style={{ width: '75%' }}></div>
              </Progress>
              <p className="text-xs text-slate-500 mt-1">75% of daily average</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-purple-100 hover:border-purple-300 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Patients</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{statistics.totalPatients}</h3>
              </div>
              <div className="bg-purple-100 p-2 rounded-lg">
                <UserRound className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={85} className="h-1 bg-purple-100">
                <div className="h-1 bg-purple-500" style={{ width: '85%' }}></div>
              </Progress>
              <p className="text-xs text-slate-500 mt-1">+12 this month</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-green-100 hover:border-green-300 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Documents Reviewed</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{statistics.documentsReviewed}</h3>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={60} className="h-1 bg-green-100">
                <div className="h-1 bg-green-500" style={{ width: '60%' }}></div>
              </Progress>
              <p className="text-xs text-slate-500 mt-1">60% of weekly goal</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-amber-100 hover:border-amber-300 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Pending Reviews</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{statistics.pendingReviews}</h3>
              </div>
              <div className="bg-amber-100 p-2 rounded-lg">
                <ClipboardList className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={40} className="h-1 bg-amber-100">
                <div className="h-1 bg-amber-500" style={{ width: '40%' }}></div>
              </Progress>
              <p className="text-xs text-slate-500 mt-1">5 documents awaiting review</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - QR Scanner and Recent Patients */}
        <div className="lg:col-span-2 space-y-6">
          {/* QR Scanner Card */}
          <Card className="bg-white border-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center">
                <QrCode className="mr-2 h-5 w-5 text-blue-600" />
                Quick Patient Access
              </CardTitle>
              <CardDescription>
                Scan a QR code or enter a token to access patient records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleQrSubmit} className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Enter QR code token"
                    value={qrToken}
                    onChange={(e) => setQrToken(e.target.value)}
                    className="pl-10 border-blue-200 focus:border-blue-400"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={!qrToken}
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Access Patient Records
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Recent Patients */}
          <Card className="bg-white border-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Clock className="mr-2 h-5 w-5 text-blue-600" />
                Recent Patients
              </CardTitle>
              <CardDescription>
                Patients you've recently accessed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPatients.map(patient => (
                  <div key={patient.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="text-sm font-medium text-slate-800">{patient.name}</h4>
                        <p className="text-xs text-slate-500">Last visit: {new Date(patient.lastVisit).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(patient.status)}`}>
                        {patient.status}
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="link" className="text-blue-600 hover:text-blue-800">
                View all patients
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Right column - Appointments */}
        <div className="space-y-6">
          {/* Upcoming Appointments */}
          <Card className="bg-white border-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>
                Your schedule for the next few days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingAppointments.map(appointment => (
                  <div key={appointment.id} className="p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-medium text-slate-800">{appointment.patient}</h4>
                      <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                        {appointment.type}
                      </Badge>
                    </div>
                    <div className="flex items-center text-xs text-slate-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{new Date(appointment.date).toLocaleDateString()}</span>
                      <span className="mx-2">•</span>
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{appointment.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="link" className="text-blue-600 hover:text-blue-800">
                View full schedule
              </Button>
            </CardFooter>
          </Card>
          
          {/* Activity Summary */}
          <Card className="bg-white border-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Activity className="mr-2 h-5 w-5 text-blue-600" />
                Activity Summary
              </CardTitle>
              <CardDescription>
                Your recent activity overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-slate-600">Patients Seen</span>
                    <span className="text-xs text-slate-500">8/10</span>
                  </div>
                  <Progress value={80} className="h-1.5 bg-blue-100">
                    <div className="h-1.5 bg-blue-500" style={{ width: '80%' }}></div>
                  </Progress>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-slate-600">Documents Reviewed</span>
                    <span className="text-xs text-slate-500">37/50</span>
                  </div>
                  <Progress value={74} className="h-1.5 bg-green-100">
                    <div className="h-1.5 bg-green-500" style={{ width: '74%' }}></div>
                  </Progress>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-slate-600">Appointments Completed</span>
                    <span className="text-xs text-slate-500">6/8</span>
                  </div>
                  <Progress value={75} className="h-1.5 bg-purple-100">
                    <div className="h-1.5 bg-purple-500" style={{ width: '75%' }}></div>
                  </Progress>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;