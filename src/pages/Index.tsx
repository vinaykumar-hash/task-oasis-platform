
import React, { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { useAuthStore } from '@/stores/authStore';

const Index = () => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { user, isAuthenticated } = useAuthStore();

  if (isAuthenticated && user) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            TaskOasis Platform
          </h1>
          <p className="text-lg text-gray-600">
            Multi-Tenant Task Management for Modern Organizations
          </p>
        </div>
        
        <div className="max-w-md mx-auto">
          {authMode === 'login' ? (
            <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
