// Small deterministic PRNG so mock data is stable across reloads within a session.
let seed = 42;

export function rand(): number {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}

export function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

export function pick<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
