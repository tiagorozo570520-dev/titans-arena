import type { Enrollment } from "@/lib/types";

/** Unique players enrolled in a tournament. Source: enrollments rows, not current_players. */
export function enrolledCount(tournamentId: string, enrollments: Enrollment[]): number {
  const ids = new Set<string>();
  enrollments.forEach((e) => {
    if (e.tournamentId === tournamentId && e.playerId) ids.add(e.playerId);
  });
  return ids.size;
}
