import fs from "fs";
import path from "path";
import { ref as dbRef, get, set, update, remove } from "firebase/database";
import { db } from "../../src/services/firebase/db";
import { LeadRecord } from "./leadTypes";

const BACKUP_FILE = path.join(process.cwd(), "leads_backup.json");

function readLocalBackup(): LeadRecord[] {
  try {
    if (fs.existsSync(BACKUP_FILE)) {
      const data = fs.readFileSync(BACKUP_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("[LeadRepository] Error reading local backup:", err);
  }
  return [];
}

function writeLocalBackup(leads: LeadRecord[]): void {
  try {
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(leads, null, 2), "utf-8");
  } catch (err) {
    console.error("[LeadRepository] Error writing local backup:", err);
  }
}

function sanitizeForFirebase<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export async function createLeadRecord(lead: LeadRecord): Promise<void> {
  // 1. Save to local fallback backup first so lead is never lost
  const localLeads = readLocalBackup();
  const existingIndex = localLeads.findIndex(l => l.id === lead.id);
  if (existingIndex >= 0) {
    localLeads[existingIndex] = lead;
  } else {
    localLeads.unshift(lead);
  }
  writeLocalBackup(localLeads);

  // 2. Persist to Firebase Realtime Database
  try {
    const leadPath = dbRef(db, `leads/${lead.id}`);
    await set(leadPath, sanitizeForFirebase(lead));
    console.log(`[LeadRepository] Lead ${lead.id} created successfully in Firebase.`);
  } catch (err) {
    console.warn(`[LeadRepository] Firebase write warning for ${lead.id} (persisted locally):`, err);
  }
}

export async function updateLeadRecord(id: string, updates: Partial<LeadRecord>): Promise<void> {
  const updatedAt = new Date().toISOString();
  const mergedUpdates = { ...updates, updatedAt };

  // 1. Update local backup
  const localLeads = readLocalBackup();
  const idx = localLeads.findIndex(l => l.id === id);
  if (idx >= 0) {
    localLeads[idx] = { ...localLeads[idx], ...mergedUpdates };
    writeLocalBackup(localLeads);
  }

  // 2. Update Firebase
  try {
    const leadPath = dbRef(db, `leads/${id}`);
    await update(leadPath, sanitizeForFirebase(mergedUpdates));
    console.log(`[LeadRepository] Lead ${id} updated in Firebase.`);
  } catch (err) {
    console.warn(`[LeadRepository] Firebase update warning for ${id}:`, err);
  }
}

export async function getLeadById(id: string): Promise<LeadRecord | null> {
  try {
    const leadPath = dbRef(db, `leads/${id}`);
    const snapshot = await get(leadPath);
    if (snapshot.exists()) {
      return snapshot.val() as LeadRecord;
    }
  } catch (err) {
    console.warn(`[LeadRepository] Firebase read error for ${id}, checking backup:`, err);
  }

  // Fallback to local backup
  const localLeads = readLocalBackup();
  const found = localLeads.find(l => l.id === id);
  return found || null;
}

export async function getAllLeads(): Promise<LeadRecord[]> {
  try {
    const leadsRef = dbRef(db, "leads");
    const snapshot = await get(leadsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const list: LeadRecord[] = Object.keys(data).map(key => data[key]);
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    }
  } catch (err) {
    console.warn("[LeadRepository] Firebase getAllLeads error, falling back to local:", err);
  }

  const localLeads = readLocalBackup();
  localLeads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return localLeads;
}

export async function deleteLeadById(id: string): Promise<boolean> {
  let deleted = false;

  // 1. Delete from local backup
  const localLeads = readLocalBackup();
  const filtered = localLeads.filter(l => l.id !== id);
  if (filtered.length !== localLeads.length) {
    writeLocalBackup(filtered);
    deleted = true;
  }

  // 2. Delete from Firebase
  try {
    const leadPath = dbRef(db, `leads/${id}`);
    await remove(leadPath);
    deleted = true;
    console.log(`[LeadRepository] Lead ${id} deleted from Firebase.`);
  } catch (err) {
    console.warn(`[LeadRepository] Firebase delete error for ${id}:`, err);
  }

  return deleted;
}
