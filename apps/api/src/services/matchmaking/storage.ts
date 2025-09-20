import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "apps/api/.cache");
const DATA_FILE = path.join(DATA_DIR, "matchmaking.json");

const AVAILABILITY_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
const PROPOSAL_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours safeguarding stale proposals

export type AvailabilitySlot = {
  start: Date;
  end: Date;
};

export type StoredProposal = {
  id: string;
  requesterPairId: string;
  opponentPairId: string;
  start: Date;
  end: Date;
  location: { lat: number; lon: number };
  acceptedPairIds: string[];
  createdAt: Date;
};

type SerializedSlot = {
  start: string;
  end: string;
};

type SerializedAvailability = {
  slots: SerializedSlot[];
  updatedAt: string;
};

type SerializedProposal = {
  id: string;
  requesterPairId: string;
  opponentPairId: string;
  start: string;
  end: string;
  location: { lat: number; lon: number };
  acceptedPairIds: string[];
  createdAt: string;
};

type StorageSnapshot = {
  availability: Record<string, SerializedAvailability>;
  proposals: Record<string, SerializedProposal>;
};

let snapshot: StorageSnapshot | null = null;
let persistPromise: Promise<void> | null = null;

async function ensureLoaded() {
  if (snapshot) return;
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    snapshot = JSON.parse(raw) as StorageSnapshot;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
    snapshot = { availability: {}, proposals: {} };
  }
}

async function persist() {
  if (!snapshot) return;
  if (persistPromise) {
    await persistPromise;
    return;
  }

  persistPromise = (async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(snapshot, null, 2), "utf-8");
  })();

  try {
    await persistPromise;
  } finally {
    persistPromise = null;
  }
}

function serializeSlots(slots: AvailabilitySlot[]): SerializedSlot[] {
  return slots.map((slot) => ({ start: slot.start.toISOString(), end: slot.end.toISOString() }));
}

function deserializeSlots(serialized?: SerializedSlot[]): AvailabilitySlot[] {
  if (!serialized) return [];
  return serialized
    .map((slot) => ({ start: new Date(slot.start), end: new Date(slot.end) }))
    .filter((slot) => slot.end > slot.start)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

function deserializeProposal(proposal: SerializedProposal): StoredProposal {
  return {
    ...proposal,
    start: new Date(proposal.start),
    end: new Date(proposal.end),
    createdAt: new Date(proposal.createdAt),
  };
}

export async function cleanup(now = new Date()) {
  await ensureLoaded();
  if (!snapshot) return;

  const cutoffAvailability = now.getTime() - AVAILABILITY_TTL_MS;
  const availabilityEntries = Object.entries(snapshot.availability);
  for (const [playerId, record] of availabilityEntries) {
    const updatedAt = new Date(record.updatedAt).getTime();
    if (!record.slots.length || updatedAt < cutoffAvailability) {
      delete snapshot.availability[playerId];
    }
  }

  const proposalsEntries = Object.entries(snapshot.proposals);
  for (const [proposalId, record] of proposalsEntries) {
    const end = new Date(record.end).getTime();
    const createdAt = new Date(record.createdAt).getTime();
    if (end < now.getTime() || createdAt < now.getTime() - PROPOSAL_TTL_MS) {
      delete snapshot.proposals[proposalId];
    }
  }

  await persist();
}

export async function setPlayerAvailability(playerId: string, slots: AvailabilitySlot[]) {
  await ensureLoaded();
  if (!snapshot) return;

  snapshot.availability[playerId] = {
    slots: serializeSlots(slots),
    updatedAt: new Date().toISOString(),
  };

  await persist();
}

export async function getPlayerAvailability(playerId: string): Promise<AvailabilitySlot[]> {
  await ensureLoaded();
  if (!snapshot) return [];
  const record = snapshot.availability[playerId];
  return deserializeSlots(record?.slots);
}

export async function upsertProposal(proposal: StoredProposal) {
  await ensureLoaded();
  if (!snapshot) return;

  snapshot.proposals[proposal.id] = {
    id: proposal.id,
    requesterPairId: proposal.requesterPairId,
    opponentPairId: proposal.opponentPairId,
    start: proposal.start.toISOString(),
    end: proposal.end.toISOString(),
    location: proposal.location,
    acceptedPairIds: Array.from(new Set(proposal.acceptedPairIds)),
    createdAt: proposal.createdAt.toISOString(),
  };

  await persist();
}

export async function getProposal(id: string): Promise<StoredProposal | null> {
  await ensureLoaded();
  if (!snapshot) return null;
  const record = snapshot.proposals[id];
  return record ? deserializeProposal(record) : null;
}

export async function deleteProposal(id: string) {
  await ensureLoaded();
  if (!snapshot) return;
  if (snapshot.proposals[id]) {
    delete snapshot.proposals[id];
    await persist();
  }
}

export async function listProposalsForPair(pairId: string): Promise<StoredProposal[]> {
  await ensureLoaded();
  if (!snapshot) return [];
  return Object.values(snapshot.proposals)
    .filter(
      (record) => record.requesterPairId === pairId || record.opponentPairId === pairId,
    )
    .map(deserializeProposal);
}
