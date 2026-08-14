import { useEffect, useState } from "react";
import type { Vehicle } from "@/modules/inventory/domain/vehicle";
import { getVehicles } from "@/modules/inventory/infrastructure/supabase-vehicle-repository";

interface State {
  vehicles: Vehicle[];
  loading: boolean;
  error: boolean;
}

export function useVehicles(): State {
  const [state, setState] = useState<State>({ vehicles: [], loading: true, error: false });

  useEffect(() => {
    let cancelled = false;

    getVehicles()
      .then((vehicles) => {
        if (!cancelled) setState({ vehicles, loading: false, error: false });
      })
      .catch(() => {
        if (!cancelled) setState({ vehicles: [], loading: false, error: true });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
