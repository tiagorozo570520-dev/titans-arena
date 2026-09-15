import { createRequire } from "module";
import { pathToFileURL } from "url";

// Pure reimplementation of contract rules for node without TS loader
const CONTRACTS = {
  liga: ["league", "done"],
  mundial: ["draw", "group", "r16", "qf", "sf", "final", "done"],
  grupos_eliminacion: ["draw", "group", "r16", "qf", "sf", "final", "done"],
  champions: ["league", "r16", "qf", "sf", "final", "done"],
  eliminacion_directa: ["r16", "qf", "sf", "final", "done"],
  ida_vuelta: ["r16", "qf", "sf", "final", "done"],
  copa: ["r16", "qf", "sf", "final", "done"],
  "2vs2": ["r16", "qf", "sf", "final", "done"],
  relampago: ["r16", "qf", "sf", "final", "done"],
  partido_unico: ["final", "done"],
};

function nextPhase(format, current) {
  const phases = CONTRACTS[format];
  const i = phases.indexOf(current);
  return phases[i + 1] || null;
}

function phaseAction(format, phase, complete) {
  if (phase === "draw") return "draw";
  if (phase === "done") return "finish";
  if (!complete) return "wait";
  const nxt = nextPhase(format, phase);
  if (!nxt || nxt === "done") return "finish";
  return "continue";
}

function assert(c, n) {
  if (!c) {
    console.error("FAIL", n);
    process.exitCode = 1;
  } else console.log("OK", n);
}

const formats = Object.keys(CONTRACTS);
formats.forEach((f) => {
  const p = CONTRACTS[f];
  assert(p[p.length - 1] === "done", `${f} termina en done`);
  p.slice(0, -1).forEach((phase) => {
    assert(nextPhase(f, phase) != null, `${f} ${phase} tiene siguiente`);
  });
});

assert(nextPhase("champions", "league") === "r16", "Champions-8 liga → octavos (no RR extra)");
assert(nextPhase("liga", "league") === "done", "Liga cierra en done");
assert(nextPhase("mundial", "group") === "r16", "Mundial grupos → octavos");
assert(phaseAction("mundial", "group", false) === "wait", "fase incompleta espera");
assert(phaseAction("mundial", "group", true) === "continue", "grupos completos → continuar");
assert(phaseAction("mundial", "final", true) === "finish", "final completa → finish");
assert(phaseAction("champions", "league", true) === "continue", "C8 liga completa → continuar KO");
assert(!CONTRACTS.champions.includes("group"), "C8 no usa fase group");

console.log(process.exitCode ? "RESULT FAIL" : "RESULT PASS");
