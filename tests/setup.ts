import fc from "fast-check";

// Fixed seed by default so CI is reproducible. FC_SEED=<n> reruns a printed failing seed.
const seed = process.env.FC_SEED === undefined ? 20261029 : Number(process.env.FC_SEED);
fc.configureGlobal({ seed, numRuns: 200 });
