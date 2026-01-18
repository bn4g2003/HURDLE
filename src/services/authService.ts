import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Staff } from '../../types';

const AUTH_STORAGE_KEY = 'brisky_auth_user';

export interface AuthUser {
  uid: string;
  email: string;
  role?: string;
  staffData?: Staff;
}

export class AuthService {
  
  // Sign in with email and password (check against staff collection)
  static async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      console.log('[AuthService] Attempting login with email:', email);
      
      // Query staff by email
      const staffQuery = query(
        collection(db, 'staff'),
        where('email', '==', email),
        where('status', '==', 'Active')
      );
      
      console.log('[AuthService] Executing Firestore query...');
      const snapshot = await getDocs(staffQuery);
      console.log('[AuthService] Query result - found docs:', snapshot.size);
      
      if (snapshot.empty) {
        // Debug: Try to find staff without status filter
        console.log('[AuthService] No active staff found. Checking all staff...');
        const allStaffQuery = query(
          collection(db, 'staff'),
          where('email', '==', email)
        );
        const allSnapshot = await getDocs(allStaffQuery);
        console.log('[AuthService] All staff with this email:', allSnapshot.size);
        
        if (!allSnapshot.empty) {
          const doc = allSnapshot.docs[0];
          console.log('[AuthService] Found staff but status is:', doc.data().status);
          throw new Error(`Tài khoản đã bị khóa (status: ${doc.data().status})`);
        }
        
        throw new Error('Email không tồn tại trong hệ thống');
      }
      
      const staffDoc = snapshot.docs[0];
      const staffData = staffDoc.data() as Staff;
      console.log('[AuthService] Found staff:', staffDoc.id, staffData.name);
      
      // Check password
      if (!staffData.password) {
        console.error('[AuthService] Staff has no password field!');
        throw new Error('Tài khoản chưa được thiết lập mật khẩu');
      }
      
      console.log('[AuthService] Checking password...');
      if (staffData.password !== password) {
        console.error('[AuthService] Password mismatch');
        throw new Error('Mật khẩu không đúng');
      }
      
      console.log('[AuthService] Login successful!');
      const authUser: AuthUser = {
        uid: staffDoc.id,
        email: staffData.email || email,
        role: staffData.role,
        staffData: { ...staffData, id: staffDoc.id }
      };
      
      // Save to localStorage
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      
      return authUser;
    } catch (error: any) {
      console.error('[AuthService] Sign in error:', error);
      throw error;
    }
  }
  
  // Sign out
  static async signOut(): Promise<void> {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }
  
  // Register new staff (no longer needed - just create staff with password)
  static async registerStaff(
    email: string,
    password: string,
    staffData: {
      name: string;
      code: string;
      role: string;
      department: string;
      position: string;
      phone: string;
      dob?: string;
      startDate?: string;
      branch?: string;
      roles?: string[];
    }
  ): Promise<string> {
    // This is now handled by StaffService.createStaff with password field
    throw new Error('Use StaffService.createStaff instead');
  }
  
  // Get current user from localStorage
  static getCurrentUser(): AuthUser | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  
  // Listen to auth state changes (simulate with localStorage)
  static onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    // Initial call
    const user = this.getCurrentUser();
    callback(user);
    
    // Listen to storage events (for multi-tab sync)
    const handler = (e: StorageEvent) => {
      if (e.key === AUTH_STORAGE_KEY) {
        const user = e.newValue ? JSON.parse(e.newValue) : null;
        callback(user);
      }
    };
    
    window.addEventListener('storage', handler);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('storage', handler);
    };
  }

  // Update staff password (admin only - direct update)
  static async updateStaffPassword(staffId: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const { StaffService } = await import('./staffService');
      await StaffService.updateStaff(staffId, { password: newPassword });
      return { success: true, message: 'Đổi mật khẩu thành công' };
    } catch (error: any) {
      console.error('Error updating password:', error);
      throw new Error(error.message || 'Có lỗi xảy ra khi đổi mật khẩu.');
    }
  }

  // Create account for existing staff (admin only - add password to staff)
  static async createStaffAccount(
    staffId: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string; uid?: string }> {
    try {
      const { StaffService } = await import('./staffService');
      await StaffService.updateStaff(staffId, { email, password });
      return { success: true, message: 'Tạo tài khoản thành công', uid: staffId };
    } catch (error: any) {
      console.error('Error creating account:', error);
      throw new Error(error.message || 'Có lỗi xảy ra khi tạo tài khoản.');
    }
  }
}
