import { useState, useEffect } from 'react';
import { AuthService, AuthUser } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChange((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const user = await AuthService.signIn(email, password);
      setUser(user);
      return user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await AuthService.signOut();
      setUser(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (
    email: string,
    password: string,
    staffData: {
      name: string;
      code: string;
      role: string;
      department: string;
      position: string;
      phone: string;
    }
  ) => {
    try {
      setError(null);
      const uid = await AuthService.registerStaff(email, password, staffData);
      return uid;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    user,
    staffData: user?.staffData || null,
    loading,
    error,
    signIn,
    signOut,
    register,
    isAuthenticated: !!user,
    isAdmin: user?.staffData?.role === 'Quản trị viên' || user?.staffData?.role === 'Quản lý'
  };
};
