import { Incident } from '../models/Incident.js';
import { Deployment } from '../models/Deployment.js';
import { Team } from '../models/Team.js';

export async function overview(_req, res) {
  // MTTR
  const resolved = await Incident.find({ status: 'resolved', resolvedAt: { $exists: true } })
    .sort({ resolvedAt: -1 }).limit(50).lean();
  const mttrMinutes = resolved.length
    ? Math.round(
      resolved.reduce((acc, i) => acc + (new Date(i.resolvedAt) - new Date(i.createdAt)), 0) /
      resolved.length / 60000,
    )
    : 42;

  // Weekly incident frequency (last 8 weeks)
  const weeks = [];
  for (let i = 7; i >= 0; i--) {
    const end = new Date(Date.now() - i * 7 * 86400000);
    const start = new Date(end.getTime() - 7 * 86400000);
    const count = await Incident.countDocuments({ createdAt: { $gte: start, $lt: end } });
    weeks.push({ week: `W${8 - i}`, count });
  }

  const deploymentSuccess = [];
  for (let i = 7; i >= 0; i--) {
    const end = new Date(Date.now() - i * 7 * 86400000);
    const start = new Date(end.getTime() - 7 * 86400000);
    const [success, failed] = await Promise.all([
      Deployment.countDocuments({ createdAt: { $gte: start, $lt: end }, status: 'success' }),
      Deployment.countDocuments({ createdAt: { $gte: start, $lt: end }, status: 'failed' }),
    ]);
    deploymentSuccess.push({ week: `W${8 - i}`, success, failed });
  }

  const teams = await Team.find({}).limit(5).lean();
  const teamWorkload = await Promise.all(teams.map(async (t) => {
    const [open, res] = await Promise.all([
      Incident.countDocuments({ service: new RegExp(t.name, 'i'), status: { $ne: 'resolved' } }),
      Incident.countDocuments({ service: new RegExp(t.name, 'i'), status: 'resolved' }),
    ]);
    return { name: t.name, open, resolved: res };
  }));

  const topAgg = await Incident.aggregate([
    { $group: { _id: '$service', incidents: { $sum: 1 } } },
    { $sort: { incidents: -1 } },
    { $limit: 6 },
  ]);
  const topServices = topAgg.map((x) => ({ service: x._id, incidents: x.incidents }));

  res.json({
    mttrMinutes,
    incidentFrequency: weeks,
    deploymentSuccess,
    teamWorkload,
    topServices,
  });
}
