import { z } from 'zod';

export const projectInput = z.object({
  name: z.string().min(2, 'الاسم قصير جداً').max(200),
  sector: z.string().min(1, 'القطاع مطلوب').max(100),
  description: z.string().min(20, 'الوصف يجب ألا يقل عن 20 حرفاً').max(5000),
  problem: z.string().max(5000).optional(),
  targetAudience: z.string().max(2000).optional(),
  marketSize: z.string().max(500).optional(),
  competitors: z.string().max(2000).optional(),
  techStack: z.string().max(1000).optional(),
  usesAi: z.boolean().optional(),
  aiDescription: z.string().max(2000).optional(),
  stage: z.string().max(100).optional(),
  teamSize: z.number().int().min(1).max(100).optional(),
  teamSkills: z.string().max(2000).optional(),
  revenueModel: z.string().max(1000).optional(),
  fundingAsk: z.string().max(200).optional(),
});

export const projectUpdate = projectInput.partial();

export type ProjectInput = z.infer<typeof projectInput>;
