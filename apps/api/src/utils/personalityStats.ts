import type { PersonalityAudienceStat, PersonalityStatsOverview } from '../../../../packages/shared/src/types.js';
import { prisma } from './prisma.js';

function increaseCount(counter: Map<string, number>, key: string) {
  counter.set(key, (counter.get(key) || 0) + 1);
}

export async function getPersonalityStatsOverview(): Promise<PersonalityStatsOverview> {
  const [totalUsers, totalResults, totalPersonalities, totalQuestions, stats] = await Promise.all([
    prisma.user.count(),
    prisma.testResult.count(),
    prisma.personality.count({ where: { status: 'APPROVED' } }),
    prisma.question.count({ where: { status: 'APPROVED' } }),
    getPersonalityAudienceStats(),
  ]);

  return {
    totalUsers,
    totalRegisteredParticipants: stats.totals.registered,
    totalParticipants: stats.totals.participants,
    totalResults,
    totalPersonalities,
    totalQuestions,
  };
}

export async function getPersonalityAudienceStats(): Promise<{
  stats: PersonalityAudienceStat[];
  totals: {
    registered: number;
    participants: number;
  };
}> {
  const [results, personalities] = await Promise.all([
    prisma.testResult.findMany({
      select: {
        id: true,
        personalityId: true,
        userId: true,
        guestToken: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    }),
    prisma.personality.findMany({
      where: { status: 'APPROVED' },
      select: { id: true, name: true, color: true },
    }),
  ]);

  const latestRegisteredByUser = new Map<string, string>();
  const latestParticipantByIdentity = new Map<string, string>();

  for (const result of results) {
    if (result.userId && !latestRegisteredByUser.has(result.userId)) {
      latestRegisteredByUser.set(result.userId, result.personalityId);
    }

    const identityKey = result.userId
      ? `user:${result.userId}`
      : result.guestToken
      ? `guest:${result.guestToken}`
      : null;

    if (identityKey && !latestParticipantByIdentity.has(identityKey)) {
      latestParticipantByIdentity.set(identityKey, result.personalityId);
    }
  }

  const registeredCounts = new Map<string, number>();
  const participantCounts = new Map<string, number>();

  for (const personalityId of latestRegisteredByUser.values()) {
    increaseCount(registeredCounts, personalityId);
  }

  for (const personalityId of latestParticipantByIdentity.values()) {
    increaseCount(participantCounts, personalityId);
  }

  const totalRegisteredParticipants = latestRegisteredByUser.size;
  const totalParticipants = latestParticipantByIdentity.size;

  const stats = personalities
    .map((personality) => {
      const registeredCount = registeredCounts.get(personality.id) || 0;
      const participantCount = participantCounts.get(personality.id) || 0;

      return {
        ...personality,
        registeredCount,
        registeredPercentage:
          totalRegisteredParticipants > 0
            ? Number(((registeredCount / totalRegisteredParticipants) * 100).toFixed(1))
            : 0,
        participantCount,
        participantPercentage:
          totalParticipants > 0 ? Number(((participantCount / totalParticipants) * 100).toFixed(1)) : 0,
      };
    })
    .sort(
      (a, b) =>
        b.participantCount - a.participantCount ||
        b.registeredCount - a.registeredCount ||
        a.id.localeCompare(b.id, 'zh-Hans-CN')
    );

  return {
    stats,
    totals: {
      registered: totalRegisteredParticipants,
      participants: totalParticipants,
    },
  };
}
