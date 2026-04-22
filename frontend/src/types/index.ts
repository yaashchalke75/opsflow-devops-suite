export type Role =
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'devops'
  | 'developer'
  | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarColor: string;
  initials: string;
  title?: string;
  team?: string;
  status?: 'online' | 'away' | 'offline';
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  lead?: string;
  color: string;
}

export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'investigating' | 'monitoring' | 'resolved';

export interface IncidentComment {
  id: string;
  authorId: string;
  authorName: string;
  message: string;
  createdAt: string;
  type?: 'comment' | 'status_change' | 'assigned';
}

export interface Incident {
  id: string;
  key: string; // INC-1042
  title: string;
  description: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  ownerId: string;
  ownerName: string;
  service: string;
  reporterId: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  comments: IncidentComment[];
  tags: string[];
}

export type DeploymentStatus = 'success' | 'failed' | 'in_progress' | 'rolled_back';
export type Environment = 'dev' | 'staging' | 'production';

export interface Deployment {
  id: string;
  version: string;
  service: string;
  environment: Environment;
  status: DeploymentStatus;
  triggeredBy: string;
  commitSha: string;
  commitMessage: string;
  durationSec: number;
  createdAt: string;
  releaseNotes?: string;
  logs?: string[];
}

export type AlertSeverity = 'warning' | 'major' | 'critical';
export type AlertStatus = 'firing' | 'acknowledged' | 'muted' | 'resolved';

export interface Alert {
  id: string;
  title: string;
  source: string;
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  createdAt: string;
  resource?: string;
  metricValue?: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigneeId: string;
  assigneeName: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt?: string;
  createdAt: string;
}

export interface Runbook {
  id: string;
  title: string;
  category: string;
  content: string;
  authorId: string;
  authorName: string;
  updatedAt: string;
  version: number;
  tags: string[];
}

export type NotificationType =
  | 'incident_assigned'
  | 'alert_fired'
  | 'deployment_done'
  | 'task_due'
  | 'mention';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  target: string;
  createdAt: string;
  ip?: string;
}

export interface DashboardStats {
  openIncidents: number;
  openIncidentsDelta: number;
  activeAlerts: number;
  activeAlertsDelta: number;
  deploymentsToday: number;
  deploymentsDelta: number;
  activeEngineers: number;
  uptimePct: number;
  mttrMinutes: number;
  trend: Array<{ date: string; incidents: number; deployments: number; alerts: number }>;
  severityMix: Array<{ name: string; value: number }>;
  activity: Array<{ id: string; message: string; timestamp: string; type: string }>;
}

export interface AnalyticsPayload {
  mttrMinutes: number;
  incidentFrequency: Array<{ week: string; count: number }>;
  deploymentSuccess: Array<{ week: string; success: number; failed: number }>;
  teamWorkload: Array<{ name: string; open: number; resolved: number }>;
  topServices: Array<{ service: string; incidents: number }>;
}

export interface AuthPayload {
  user: User;
  token: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
