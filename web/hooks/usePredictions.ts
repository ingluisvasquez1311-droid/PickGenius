"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export function usePredictions() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "predictions", "latest"),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setPredictions(data.predictions ?? []);
        } else {
          setPredictions([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error escuchando predicciones:", err);
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return { predictions, loading, error };
}
