/**
 * Helper to create admin account
 * Run in browser console: window.createAdmin()
 */

import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export async function createAdmin(
  email: string = 'admin@hurdle.edu',
  password: string = '123456',
  name: string = 'Admin'
) {
  try {
    console.log('🚀 Creating admin account...');
    console.log('Email:', email);
    console.log('Password:', password);

    // Check if email exists
    const q = query(collection(db, 'staff'), where('email', '==', email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      console.error('❌ Email already exists!');
      console.log('Existing staff:', snapshot.docs[0].id, snapshot.docs[0].data());
      return { success: false, message: 'Email đã tồn tại' };
    }

    // Create admin
    const adminData = {
      name: name,
      code: 'ADMIN' + Date.now().toString().slice(-6),
      email: email,
      password: password,
      role: 'Quản lý',
      roles: ['Quản lý'],
      department: 'Điều hành',
      position: 'Quản lý (Admin)',
      phone: '0901234567',
      status: 'Active',
      branch: 'Cơ sở chính',
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'staff'), adminData);

    console.log('✅ Admin created successfully!');
    console.log('ID:', docRef.id);
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('\n🎯 You can now login with these credentials!');

    return {
      success: true,
      id: docRef.id,
      email: email,
      password: password
    };

  } catch (error: any) {
    console.error('❌ Error creating admin:', error);
    
    if (error.code === 'permission-denied') {
      console.error('⚠️  Firestore Rules blocked the operation!');
      console.error('   Update rules to: allow read, write: if true;');
    }
    
    return { success: false, message: error.message };
  }
}

// Make it available globally in browser console
if (typeof window !== 'undefined') {
  (window as any).createAdmin = createAdmin;
  console.log('✅ createAdmin() is now available in console');
  console.log('Usage: createAdmin("email@example.com", "password", "Name")');
}
