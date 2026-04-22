import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { connectDB } from '../config/db.js';

(async () => {
  await connectDB();
  const users = await User.find({}).sort({ isDemo: -1, role: 1, createdAt: 1 }).lean();
  console.log('');
  console.log('Total users:', users.length);
  console.log('='.repeat(90));
  console.log('ROLE'.padEnd(14), 'NAME'.padEnd(22), 'EMAIL'.padEnd(38), 'PASSWORD', 'TYPE');
  console.log('-'.repeat(90));
  for (const u of users) {
    const pw = u.isDemo ? 'demo1234' : '(their own)';
    const type = u.isDemo ? 'seeded' : 'signed-up';
    console.log(
      (u.role || '').padEnd(14),
      (u.name || '').padEnd(22),
      (u.email || '').padEnd(38),
      pw.padEnd(12),
      type,
    );
  }
  console.log('='.repeat(90));
  console.log('');
  await mongoose.disconnect();
})();
