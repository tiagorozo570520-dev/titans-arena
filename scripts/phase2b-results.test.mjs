function careerFromConfirmed(players, matches) {
  const valid = matches.filter((m) => m.status === "confirmed" && m.scoreA != null && m.scoreB != null);
  return players.map((p) => {
    let points = 0, wins = 0, draws = 0, losses = 0, played = 0, goals = 0, ga = 0;
    valid.forEach((m) => {
      if (p.id !== m.playerAId && p.id !== m.playerBId) return;
      const isA = p.id === m.playerAId;
      const gf = isA ? m.scoreA : m.scoreB;
      const gac = isA ? m.scoreB : m.scoreA;
      played++; goals += gf; ga += gac;
      if (gf > gac) { wins++; points += 25; }
      else if (gf === gac) { draws++; points += 8; }
      else { losses++; points += 5; }
    });
    return { ...p, points, wins, draws, losses, matches: played, goals, goalsAgainst: ga };
  });
}

function assert(c, n) {
  if (!c) { console.error("FAIL", n); process.exitCode = 1; }
  else console.log("OK", n);
}

const players = [{ id: "a" }, { id: "b" }];
const m = (st, sa, sb) => ({ id: "1", playerAId: "a", playerBId: "b", status: st, scoreA: sa, scoreB: sb });

let r = careerFromConfirmed(players, [m("reported", 2, 1)]);
assert(r[0].points === 0 && r[1].points === 0, "reportado no cuenta");

r = careerFromConfirmed(players, [m("confirmed", 2, 1)]);
assert(r[0].points === 25 && r[0].wins === 1 && r[1].points === 5 && r[1].losses === 1, "confirmado 2-1");

r = careerFromConfirmed(players, [m("disputed", 2, 1)]);
assert(r[0].points === 0, "disputado no cuenta");

r = careerFromConfirmed(players, [m("confirmed", 3, 0)]);
assert(r[0].goals === 3 && r[1].goals === 0, "corregido 3-0");

r = careerFromConfirmed(players, [m("reported", 2, 1)]);
assert(r[0].wins === 0, "reabierto no cuenta");

r = careerFromConfirmed(players, [m("confirmed", 2, 1)]);
assert(r[0].wins === 1, "reconfirmado una vez");

r = careerFromConfirmed(players, [m("voided", 2, 1)]);
assert(r[0].points === 0 && r[0].wins === 0, "anulado no cuenta");

r = careerFromConfirmed(players, [m("confirmed", 1, 0), m("confirmed", 1, 0)]);
assert(r[0].wins === 2 && r[0].points === 50, "dos confirmados no duplican mal");

console.log(process.exitCode ? "RESULT FAIL" : "RESULT PASS");
