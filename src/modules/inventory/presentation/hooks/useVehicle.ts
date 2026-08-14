import { useEffect, useState } from "react";
import type { Vehicle } from "@/modules/inventory/domain/vehicle";
import { getVehicleById } from "@/modules/inventory/infrastructure/supabase-vehicle-repository";

interface State {
  vehicle: Vehicle | null | undefined; // undefined = loading, null = not found
  error: boolean;
}

export function useVehicle(id: string | undefined): State {
  const [state, setState] = useState<State>({ vehicle: undefined, error: false });

  useEffect(() => {
    if (!id) {
      setState({ vehicle: null, error: false });
      return;
    }

    let cancelled = false;
    setState({ vehicle: undefined, error: false });

    getVehicleById(id)
      .then((vehicle) => {
        if (!cancelled) setState({ vehicle, error: false });
      })
      .catch(() => {
        if (!cancelled) setState({ vehicle: null, error: true });
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return state;
}
