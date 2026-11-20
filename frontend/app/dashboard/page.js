'use client';

import { useEffect, useState } from 'react';
import AdminDashboard from '../../components/AdminDashboard';
import AnggotaDashboard from '../../components/AnggotaDashboard';
import { getSession } from '../../lib/api';

export default function DashboardPage() {
  const [role, setRole] = useState('');

  useEffect(() => {
    setRole(getSession()?.user?.role || '');
  }, []);

  if (!role) return <div className="loading">Memuat dashboard...</div>;
  return role === 'anggota' ? <AnggotaDashboard /> : <AdminDashboard />;
}
