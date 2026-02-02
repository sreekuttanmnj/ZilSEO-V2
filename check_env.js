import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

console.log('Environment Variables Check:');
console.log('MW_API_KEY:', process.env.MW_API_KEY ? `${process.env.MW_API_KEY.substring(0, 10)}...` : 'NOT SET');
console.log('MW_BASE_URL:', process.env.MW_BASE_URL || 'NOT SET (will use default)');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET');
