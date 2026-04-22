import { Incident } from '../models/Incident.js';
import { Alert } from '../models/Alert.js';
import { Deployment } from '../models/Deployment.js';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';

export async function stats(_req, res) {
  const [openIncidents, activeAlerts, deploymentsToday, activeEngineers, totalIncidents, resolved] = await Promise.all([
    Incident.countDocuments({ status: { $ne: 'resolved' } }),
    Alert.countDocuments({ status: 'firing' }),
    Deployment.countDocuments({ createdAt: { $gte: new Date(Date.now() - 86400000) } }),
    User.countDocuments({ status: 'online' }),
    Incident.countDocuments({}),
    Incident.countDocuments({ status: 'resolved' }),
  ]);

  const days = 14;
  const trend = [];
  for (let i = days - 1; i >= 0; i--) {
    const start = new Date(Date.now() - i * 86400000); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(end.getDate() + 1);
    const filter = { createdAt: { $gte: start, $lt: end } };
    const [inc, dep, alr] = await Promise.all([
      Incident.countDocuments(filter),
      Deployment.countDocuments(filter),
      Alert.countDocuments(filter),
    ]);
    trend.push({
      date: start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      incidents: inc, deployments: dep, alerts: alr,
    });
  }

  const severityAgg = await Incident.aggregate([
    { $group: { _id: '$priority', count: { $sum: 1 } } },
  ]);
  const sevMap = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };
  const severityMix = ['critical', 'high', 'medium', 'low'].map((k) => ({
    name: sevMap[k],
    value: severityAgg.find((s) => s._id === k)?.count ?? 0,
  }));

  const activityLogs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(8).lean();
  const activity = activityLogs.map((a) => ({
    id: a._id.toString(),
    type: a.action.toLowerCase().includes('deploy') ? 'deploy'
      : a.action.toLowerCase().includes('alert') ? 'alert'
      : a.action.toLowerCase().includes('runbook') ? 'runbook' : 'incident',
    message: `${a.actorName} · ${a.action}`,
    timestamp: a.createdAt.toISOString(),
  }));

  const uptimePct = 99.982;
  const mttrDocs = await Incident.find({ status: 'resolved', resolvedAt: { $exists: true } })
    .sort({ resolvedAt: -1 }).limit(30).lean();
  const mttrMinutes = mttrDocs.length
    ? Math.round(
      mttrDocs.reduce((acc, i) => acc + (new Date(i.resolvedAt) - new Date(i.createdAt)), 0) /
      mttrDocs.length / 60000,
    )
    : 42;

  res.json({
    openIncidents, openIncidentsDelta: -12,
    activeAlerts, activeAlertsDelta: 24,
    deploymentsToday, deploymentsDelta: 16,
    activeEngineers,
    uptimePct, mttrMinutes,
    trend, severityMix, activity,
    _meta: { totalIncidents, resolved },
  });
}
