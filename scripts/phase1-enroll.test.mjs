function enrolledCount(tournamentId, enrollments) {
  const ids = new Set();
  enrollments.forEach((e) => {
    if (e.tournamentId === tournamentId && e.playerId) ids.add(e.playerId);
  });
  return ids.size;
}

function assert(cond, name) {
  if (!cond) {
    console.error("FAIL", name);
    process.exitCode = 1;
  } else {
    console.log("OK", name);
  }
}

const tid = "t1";
const e = (id, pid) => ({ id, tournamentId: tid, playerId: pid, joinedAt: "2026-09-15" });

assert(enrolledCount(tid, []) === 0, "0 inscritos");
assert(enrolledCount(tid, [e("1", "p1")]) === 1, "1 inscrito");
assert(enrolledCount(tid, [e("1", "p1"), e("2", "p2"), e("3", "p3")]) === 3, "3 inscritos");
assert(enrolledCount(tid, [e("1", "p1"), e("2", "p1")]) === 1, "duplicado no infla cupo");
assert(enrolledCount("t2", [e("1", "p1")]) === 0, "otro torneo no cuenta");
assert(
  enrolledCount(
    tid,
    [1, 2, 3, 4, 5, 6, 7, 8].map((n) => e(String(n), "p" + n))
  ) === 8,
  "8 inscritos"
);
assert(enrolledCount(tid, Array.from({ length: 16 }, (_, i) => e(String(i), "p" + i))) === 16, "cupo 16");

console.log(process.exitCode ? "RESULT FAIL" : "RESULT PASS");
