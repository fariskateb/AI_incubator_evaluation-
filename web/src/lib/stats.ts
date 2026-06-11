import { db } from '@/db';
import { project, evaluation } from '@/db/schema';
import { desc, eq, isNull } from 'drizzle-orm';

export type Decision = 'direct' | 'conditional' | 'develop' | 'unsuitable';

export interface DashboardStats {
  total: number;
  evaluated: number;
  pending: number;
  avgScore: number;
  decisions: Record<Decision, number>;
  sectors: { sector: string; avg: number; count: number }[];
}

// Computes dashboard stats from the latest evaluation per project.
export async function getDashboardStats(): Promise<DashboardStats> {
  const projects = await db
    .select()
    .from(project)
    .where(isNull(project.deletedAt));

  const decisions: Record<Decision, number> = { direct: 0, conditional: 0, develop: 0, unsuitable: 0 };
  const sectorAgg: Record<string, { sum: number; n: number }> = {};
  let scoreSum = 0;
  let evaluated = 0;

  for (const p of projects) {
    const [latest] = await db
      .select({ totalScore: evaluation.totalScore, decision: evaluation.decision })
      .from(evaluation)
      .where(eq(evaluation.projectId, p.id))
      .orderBy(desc(evaluation.createdAt))
      .limit(1);

    if (!latest) continue;
    evaluated += 1;
    scoreSum += latest.totalScore;
    decisions[latest.decision as Decision] += 1;
    const agg = (sectorAgg[p.sector] ??= { sum: 0, n: 0 });
    agg.sum += latest.totalScore;
    agg.n += 1;
  }

  const sectors = Object.entries(sectorAgg)
    .map(([sector, { sum, n }]) => ({ sector, avg: Math.round(sum / n), count: n }))
    .sort((a, b) => b.avg - a.avg);

  return {
    total: projects.length,
    evaluated,
    pending: projects.length - evaluated,
    avgScore: evaluated ? Math.round(scoreSum / evaluated) : 0,
    decisions,
    sectors,
  };
}
