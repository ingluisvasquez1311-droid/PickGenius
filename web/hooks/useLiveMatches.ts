"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export function useLiveMatches() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "matches", "live"),
      (snap) => {
        if (snap.exists()) {
          setMatches(snap.data().matches ?? []);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error escuchando partidos en vivo:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return { matches, loading };
}
