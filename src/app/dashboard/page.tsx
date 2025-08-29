"use client";

import { useAuth } from '@/components/AuthProvider';
import OrganizerDashboard from '@/components/dashboards/OrganizerDashboard';
import StudentDashboard from '@/components/dashboards/StudentDashboard';

export default function DashboardPage() {
  const { userData } = useAuth();

  if (userData?.role === 'student') {
    return <StudentDashboard />;
  }
  
  if (userData?.role === 'organiser' || userData?.role === 'admin') {
    return <OrganizerDashboard />;
  }

  return null; // or a loading/error state
}
