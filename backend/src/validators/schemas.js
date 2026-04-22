import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotSchema = z.object({ email: z.string().email() });
export const resetSchema = z.object({ token: z.string().min(1), password: z.string().min(6) });

export const incidentCreateSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional().default(''),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  service: z.string().min(1),
  ownerId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const incidentUpdateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['open', 'investigating', 'monitoring', 'resolved']).optional(),
  service: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const commentSchema = z.object({ message: z.string().min(1) });

export const deploymentCreateSchema = z.object({
  version: z.string().min(1),
  service: z.string().min(1),
  environment: z.enum(['dev', 'staging', 'production']),
  commitMessage: z.string().optional(),
  releaseNotes: z.string().optional(),
});

export const deploymentPatchSchema = z.object({
  status: z.enum(['success', 'failed', 'in_progress', 'rolled_back']).optional(),
  durationSec: z.number().optional(),
  logs: z.array(z.string()).optional(),
});

export const alertPatchSchema = z.object({
  status: z.enum(['firing', 'acknowledged', 'muted', 'resolved']),
});

export const taskCreateSchema = z.object({
  title: z.string().min(2),
  assigneeId: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueAt: z.string().optional(),
  description: z.string().optional(),
});

export const taskPatchSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'review', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  title: z.string().optional(),
});

export const runbookCreateSchema = z.object({
  title: z.string().min(2),
  category: z.string().min(1),
  content: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

export const userPatchSchema = z.object({
  role: z.enum(['super_admin', 'admin', 'manager', 'devops', 'developer', 'viewer']).optional(),
  name: z.string().optional(),
  title: z.string().optional(),
  team: z.string().optional(),
  status: z.enum(['online', 'away', 'offline']).optional(),
});
