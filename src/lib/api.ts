const API_BASE = "http://localhost:8000";

export async function fetchCandles() {
  const res = await fetch(`${API_BASE}/api/candles`);
  if (!res.ok) throw new Error("Failed to fetch candles");
  return res.json();
}

export async function fetchVolume() {
  const res = await fetch(`${API_BASE}/api/volume`);
  if (!res.ok) throw new Error("Failed to fetch volume");
  return res.json();
}

export async function fetchIndicators() {
  const res = await fetch(`${API_BASE}/api/indicators`);
  if (!res.ok) throw new Error("Failed to fetch indicators");
  return res.json();
}

export async function fetchOptionsOI() {
  const res = await fetch(`${API_BASE}/api/options/oi`);
  if (!res.ok) throw new Error("Failed to fetch options OI");
  return res.json();
}

export async function fetchOptionsPCR() {
  const res = await fetch(`${API_BASE}/api/options/pcr`);
  if (!res.ok) throw new Error("Failed to fetch PCR");
  return res.json();
}

export async function fetchSummary() {
  const res = await fetch(`${API_BASE}/api/summary`);
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
}

export async function fetchSignals() {
  const res = await fetch(`${API_BASE}/api/signals`);
  if (!res.ok) throw new Error("Failed to fetch signals");
  return res.json();
}
