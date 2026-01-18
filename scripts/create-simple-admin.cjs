/**
 * Script to create admin account without Firebase Auth
 * Run: node scripts/create-simple-admin.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, '../.firebase/serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createSimpleAdmin() {
  try {
    console.log('🚀 Creating admin account...\n');

    const adminData = {
      name: 'Admin',
      code: 'ADMIN001',
      email: 'admin@hurdle.edu',
      password: '123456', // Plain text password for demo
      role: 'Quản lý',
      roles: ['Quản lý'],
      department: 'Điều hành',
      position: 'Quản lý (Admin)',
      phone: '0901234567',
      status: 'Active',
      branch: 'Cơ sở chính',
      startDate: new Date().toISOString().split('T')[0],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Check if admin already exists
    const existingAdmin = await db.collection('staff')
      .where('email', '==', adminData.email)
      .limit(1)
      .get();

    if (!existingAdmin.empty) {
      console.log('⚠️  Admin account already exists!');
      const doc = existingAdmin.docs[0];
      console.log('\n📋 Existing admin info:');
      console.log('   ID:', doc.id);
      console.log('   Email:', doc.data().email);
      console.log('   Password:', doc.data().password);
      console.log('\n✅ You can use these credentials to login.');
      return;
    }

    // Create admin
    const docRef = await db.collection('staff').add(adminData);
    
    console.log('✅ Admin account created successfully!\n');
    console.log('📋 Login credentials:');
    console.log('   Email:', adminData.email);
    console.log('   Password:', adminData.password);
    console.log('\n⚠️  IMPORTANT: Password is stored in plain text (not hashed)');
    console.log('   This is only for demo purposes. Add proper hashing later!\n');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

createSimpleAdmin();
