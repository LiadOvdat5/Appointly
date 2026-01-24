import { useEffect } from "react";
import { me } from "../api/auth";
import { useAppDispatch } from "../redux/hooks";
import { setSession, setGuest } from "../redux/authSlice";

function toEpochMs(expiresAt: string) {
  const ms = new Date(expiresAt).getTime();
  return Number.isFinite(ms) ? ms : Date.now();
}

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    (async () => {
      try {
        const session = await me();
        dispatch(
          setSession({
            user: session.user,
            expiresAt: toEpochMs(session.expiresAt),
          }),
        );
      } catch {
        dispatch(setGuest());
      }
    })();
  }, [dispatch]);

  return <>{children}</>;
}
