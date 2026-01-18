/**
 * Script to check staff accounts in Firestore
 * Run: node scripts/check-staff-accounts.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
try {
  const serviceAccount = require(path.join(__dirname, '../.firebase/serviceAccountKey.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('❌ Cannot load serviceAccountKey.json');
  console.error('   Please download it from Firebase Console > Project Settings > Service Accounts');
  process.exit(1);
}

const db = admin.firestore();

async function checkStaffAccounts() {
  try {
    console.log('🔍 Checking staff accounts in Firestore...\n');

    // Get all staff
    const staffSnapshot = await db.collection('staff').get();
    
    if (staffSnapshot.empty) {
      console.log('⚠️  No staff found in Firestore!');
      console.log('\n📝 To create admin account:');
      console.log('   1. Run: node scripts/create-simple-admin.js');
      console.log('   2. Or manually create in Firebase Console');
      return;
    }

    console.log(`✅ Found ${staffSnapshot.size} staff member(s)\n`);
    console.log('═'.repeat(80));

    staffSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n${index + 1}. Staff ID: ${doc.id}`);
      console.log('   Name:', data.name || '(no name)');
      console.log('   Email:', data.email || '❌ NO EMAIL');
      console.log('   Password:', data.password ? '✅ Set (' + data.password + ')' : '❌ NOT SET');
      console.log('   Role:', data.role || '(no role)');
      console.log('   Position:', data.position || '(no position)');
      console.log('   Status:', data.status || '(no status)');
      console.log('   Department:', data.department || '(no department)');
      
      // Check if can login
      const canLogin = data.email && data.password && data.status === 'Active';
      console.log('   Can Login:', canLogin ? '✅ YES' : '❌ NO');
      
      if (!canLogin) {
        console.log('   Issues:');
        if (!data.email) console.log('      - Missing email');
        if (!data.password) console.log('      - Missing password');
        if (data.status !== 'Active') console.log('      - Status is not Active:', data.status);
      }
    });

    console.log('\n' + '═'.repeat(80));
    
    // Find admin accounts
    const adminStaff = staffSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.role === 'Quản lý' || 
             data.position?.includes('Admin') || 
             data.position?.includes('Quản lý');
    });

    if (adminStaff.length > 0) {
      console.log('\n👑 Admin accounts:');
      adminStaff.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.name} (${data.email || 'no email'})`);
      });
    } else {
      console.log('\n⚠️  No admin account found!');
      console.log('   Run: node scripts/create-simple-admin.js');
    }

    // Find accounts with login credentials
    const loginableStaff = staffSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.email && data.password && data.status === 'Active';
    });

    console.log(`\n✅ ${loginableStaff.length} account(s) can login:`);
    loginableStaff.forEach(doc => {
      const data = doc.data();
      console.log(`   - Email: ${data.email}`);
      console.log(`     Password: ${data.password}`);
      console.log(`     Name: ${data.name}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error checking staff:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

checkStaffAccounts();
