import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
console.log('[test] connecting to:', uri.replace(/:([^:@]+)@/, ':***@'));

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  console.log('[test] ✓ connected');
  console.log('[test] host   :', mongoose.connection.host);
  console.log('[test] db name:', mongoose.connection.name);
  const cols = await mongoose.connection.db.listCollections().toArray();
  console.log('[test] collections:', cols.map((c) => c.name).join(', ') || '(none yet)');
  await mongoose.disconnect();
  console.log('[test] ✓ disconnected cleanly');
  process.exit(0);
} catch (err) {
  console.error('[test] ✗ connection failed');
  console.error('        name :', err.name);
  console.error('        msg  :', err.message);
  if (err.reason) console.error('        reason:', err.reason);
  process.exit(1);
}
