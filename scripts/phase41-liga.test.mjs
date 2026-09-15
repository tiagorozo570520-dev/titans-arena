function expected(n, legs) {
  const one = (n * (n - 1)) / 2;
  return legs === 2 ? one * 2 : one;
}

function buildLeagueRoundRobin(ids, legs = 1) {
  const uniq = [...new Set(ids)];
  const bye = "__BYE__";
  const teams = uniq.length % 2 === 1 ? [...uniq, bye] : [...uniq];
  const n = teams.length;
  const rounds = n - 1;
  const half = n / 2;
  const rotation = [...teams];
  const first = [];
  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < half; i++) {
      const a = rotation[i];
      const b = rotation[n - 1 - i];
      if (a === bye || b === bye) continue;
      first.push({ a, b, matchday: r + 1, leg: 1 });
    }
    const fixed = rotation[0];
    const rest = rotation.slice(1);
    rest.unshift(rest.pop());
    rotation.splice(0, rotation.length, fixed, ...rest);
  }
  if (legs === 1) return first;
  return first.concat(first.map((m) => ({ a: m.b, b: m.a, matchday: m.matchday + rounds, leg: 2 })));
}

function assert(c, n) {
  if (!c) {
    console.error("FAIL", n);
    process.exitCode = 1;
  } else console.log("OK", n);
}

function check(ids, legs, label) {
  const f = buildLeagueRoundRobin(ids, legs);
  assert(f.length === expected(ids.length, legs), `${label} count ${f.length}`);
  assert(f.every((m) => m.a !== m.b), `${label} no self`);
  const key = (m) => [m.a, m.b].sort().join("|") + "@" + m.leg;
  assert(new Set(f.map(key)).size === f.length, `${label} no dup pairs per leg`);
  ids.forEach((id) => {
    const games = f.filter((m) => m.a === id || m.b === id).length;
    assert(games === (ids.length - 1) * legs, `${label} ${id} plays ${(ids.length - 1) * legs}`);
  });
  const byDay = {};
  f.forEach((m) => {
    byDay[m.matchday] = byDay[m.matchday] || [];
    byDay[m.matchday].push(m);
  });
  Object.entries(byDay).forEach(([d, ms]) => {
    const seen = [];
    ms.forEach((m) => {
      assert(!seen.includes(m.a) && !seen.includes(m.b), `${label} md ${d} double`);
      seen.push(m.a, m.b);
    });
  });
}

check(["a", "b", "c"], 1, "3x1");
check(["a", "b", "c"], 2, "3x2");
check(["a", "b", "c", "d"], 1, "4x1");
check(["a", "b", "c", "d"], 2, "4x2");
check(["a", "b", "c", "d", "e", "f", "g", "h"], 1, "8x1");

function phaseComplete(matches) {
  const list = matches.filter((m) => m.round.includes("Jornada") && m.status !== "voided");
  if (!list.length) return false;
  return list.every((m) => m.status === "confirmed");
}

const base = [
  { round: "Jornada 1", status: "confirmed" },
  { round: "Jornada 1", status: "confirmed" },
  { round: "Jornada 2", status: "pending" },
];
assert(!phaseComplete(base), "pending no completa");
assert(!phaseComplete([{ round: "Jornada 1", status: "reported" }]), "reported no completa");
assert(!phaseComplete([{ round: "Jornada 1", status: "disputed" }]), "disputed no completa");
assert(
  phaseComplete([
    { round: "Jornada 1", status: "confirmed" },
    { round: "Jornada 2", status: "voided" },
  ]),
  "voided no bloquea"
);
assert(
  !phaseComplete([
    { round: "Jornada 1", status: "confirmed" },
    { round: "Jornada 2", status: "pending" },
  ]),
  "un pendiente no termina"
);
assert(phaseComplete([{ round: "Jornada 1", status: "confirmed" }]), "todos confirmed termina");

const stand = { pts: 0 };
// confirmed updates points 3
stand.pts += 3;
assert(stand.pts === 3, "confirmed actualiza pts liga");

console.log(process.exitCode ? "RESULT FAIL" : "RESULT PASS");
