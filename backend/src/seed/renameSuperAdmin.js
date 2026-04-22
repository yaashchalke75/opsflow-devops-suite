import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { connectDB } from '../config/db.js';

(async () => {
  await connectDB();
  const res = await User.updateOne(
    { role: 'super_admin' },
    {
      $set: {
        name: 'Yash Chalke',
        email: 'yash.chalke@opsflow.io',
        initials: 'YC',
      },
    },
  );
  console.log('[rename] matched:', res.matchedCount, 'modified:', res.modifiedCount);
  const u = await User.findOne({ role: 'super_admin' }).lean();
  console.log('[rename] now:', u?.name, '·', u?.email, '·', u?.initials);
  await mongoose.disconnect();
})();
