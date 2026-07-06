import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  clearDraft,
  hasDraftContent,
  loadDraft,
  saveDraft,
} from '../storage/draftStorage';
import {
  loadEntries,
  loadOnboardingCompleted,
  saveEntries,
  saveOnboardingCompleted,
} from '../storage/diaryStorage';
import type { DiaryEntry, DraftEntry, EntryUpdates, Mood } from '../types/entry';
import type { FutureSelfReflectionResult } from '../types/reflection';

interface DiaryContextValue {
  entries: DiaryEntry[];
  draft: DraftEntry;
  isHydrated: boolean;
  hasCompletedOnboarding: boolean;
  isDraftSaved: boolean;
  setDraftMood: (mood: Mood) => void;
  setDraftText: (text: string) => void;
  setDraftIntention: (intention: string) => void;
  resetDraft: () => Promise<void>;
  saveDraftAsEntry: (reflection: FutureSelfReflectionResult) => Promise<DiaryEntry | null>;
  updateEntry: (id: string, updates: EntryUpdates) => Promise<DiaryEntry | null>;
  deleteEntry: (id: string) => Promise<boolean>;
  completeOnboarding: () => Promise<void>;
  getEntryById: (id: string) => DiaryEntry | undefined;
}

const defaultDraft: DraftEntry = {
  mood: 'okay',
  text: '',
  intention: '',
};

const DiaryContext = createContext<DiaryContextValue | null>(null);

function createEntryId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function DiaryProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [draft, setDraft] = useState<DraftEntry>(defaultDraft);
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function hydrate() {
      try {
        const [storedEntries, onboardingCompleted, storedDraft] = await Promise.all([
          loadEntries(),
          loadOnboardingCompleted(),
          loadDraft(),
        ]);

        if (!isMounted) {
          return;
        }

        setEntries(storedEntries);
        setHasCompletedOnboarding(onboardingCompleted);
        if (storedDraft) {
          setDraft(storedDraft);
          setIsDraftSaved(hasDraftContent(storedDraft));
        }
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    }

    hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    let isMounted = true;

    async function persistDraft() {
      await saveDraft(draft);
      if (isMounted) {
        setIsDraftSaved(hasDraftContent(draft));
      }
    }

    persistDraft();

    return () => {
      isMounted = false;
    };
  }, [draft, isHydrated]);

  const persistEntries = useCallback(async (nextEntries: DiaryEntry[]) => {
    setEntries(nextEntries);
    await saveEntries(nextEntries);
  }, []);

  const setDraftMood = useCallback((mood: Mood) => {
    setDraft((current) => ({ ...current, mood }));
  }, []);

  const setDraftText = useCallback((text: string) => {
    setDraft((current) => ({ ...current, text }));
  }, []);

  const setDraftIntention = useCallback((intention: string) => {
    setDraft((current) => ({ ...current, intention }));
  }, []);

  const resetDraft = useCallback(async () => {
    setDraft(defaultDraft);
    await clearDraft();
    setIsDraftSaved(false);
  }, []);

  const saveDraftAsEntry = useCallback(
    async (reflection: FutureSelfReflectionResult) => {
      const trimmedText = draft.text.trim();
      if (!trimmedText) {
        return null;
      }

      const trimmedIntention = draft.intention?.trim();

      const entry: DiaryEntry = {
        id: createEntryId(),
        mood: draft.mood,
        text: trimmedText,
        reflection: reflection.reflection,
        tinyAction: reflection.tinyAction,
        affirmation: reflection.affirmation,
        quote: reflection.quote,
        createdAt: new Date().toISOString(),
        reflectionSource: reflection.source,
        reflectionUsedFallback: reflection.usedFallback,
        ...(trimmedIntention ? { intention: trimmedIntention } : {}),
      };

      const nextEntries = [entry, ...entries];
      await persistEntries(nextEntries);
      await resetDraft();
      return entry;
    },
    [draft, entries, persistEntries, resetDraft],
  );

  const updateEntry = useCallback(
    async (id: string, updates: EntryUpdates) => {
      const existing = entries.find((entry) => entry.id === id);
      if (!existing) {
        return null;
      }

      const trimmedText = updates.text !== undefined ? updates.text.trim() : existing.text;
      if (!trimmedText) {
        return null;
      }

      const trimmedIntention =
        updates.intention !== undefined
          ? updates.intention.trim()
          : existing.intention ?? '';

      const updated: DiaryEntry = {
        ...existing,
        text: trimmedText,
        ...(trimmedIntention ? { intention: trimmedIntention } : {}),
      };

      if (!trimmedIntention && updated.intention !== undefined) {
        delete updated.intention;
      }

      const nextEntries = entries.map((entry) => (entry.id === id ? updated : entry));
      await persistEntries(nextEntries);
      return updated;
    },
    [entries, persistEntries],
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      const exists = entries.some((entry) => entry.id === id);
      if (!exists) {
        return false;
      }

      const nextEntries = entries.filter((entry) => entry.id !== id);
      await persistEntries(nextEntries);
      return true;
    },
    [entries, persistEntries],
  );

  const completeOnboarding = useCallback(async () => {
    setHasCompletedOnboarding(true);
    await saveOnboardingCompleted();
  }, []);

  const getEntryById = useCallback(
    (id: string) => entries.find((entry) => entry.id === id),
    [entries],
  );

  const value = useMemo(
    () => ({
      entries,
      draft,
      isHydrated,
      hasCompletedOnboarding,
      isDraftSaved,
      setDraftMood,
      setDraftText,
      setDraftIntention,
      resetDraft,
      saveDraftAsEntry,
      updateEntry,
      deleteEntry,
      completeOnboarding,
      getEntryById,
    }),
    [
      entries,
      draft,
      isHydrated,
      hasCompletedOnboarding,
      isDraftSaved,
      setDraftMood,
      setDraftText,
      setDraftIntention,
      resetDraft,
      saveDraftAsEntry,
      updateEntry,
      deleteEntry,
      completeOnboarding,
      getEntryById,
    ],
  );

  return <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>;
}

export function useDiary(): DiaryContextValue {
  const context = useContext(DiaryContext);
  if (!context) {
    throw new Error('useDiary must be used within a DiaryProvider');
  }
  return context;
}
