import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getEventSeats } from "../api/events";
import type { EventSeat, SeatUpdatePayload } from "../types";

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

interface UseEventSeatsReturn {
  seats: EventSeat[];
  connectionStatus: ConnectionStatus;
  recentlyUpdatedIds: Set<string>;
}

const WS_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(
    /\/v\d+$/,
    "",
  ) ?? "http://localhost:3000";

const FLASH_DURATION_MS = 1500;

export function useEventSeats(
  eventId: string | undefined,
  token: string | null,
): UseEventSeatsReturn {
  const [seats, setSeats] = useState<EventSeat[]>([]);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [recentlyUpdatedIds, setRecentlyUpdatedIds] = useState<Set<string>>(
    new Set(),
  );

  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSeats = useCallback(async () => {
    if (!eventId) return;
    try {
      const res = await getEventSeats(eventId, {
        sortBy: "row",
        sortOrder: "ASC",
      });
      setSeats(res.data.data ?? []);
    } catch (error) {
      console.error("Failed to fetch seats", error);
    }
  }, [eventId]);

  useEffect(() => {
    if (!eventId) {
      return;
    }

    void fetchSeats();

    setConnectionStatus("connecting");

    const socket: Socket = io(`${WS_BASE_URL}/seats`, {
      auth: {
        token: token ?? "",
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    });

    socket.on("connect", () => {
      setConnectionStatus("connected");

      socket.emit("join:event", {
        eventId,
      });
    });

    socket.on("disconnect", () => {
      setConnectionStatus("disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setConnectionStatus("error");
    });

    socket.on("seat:update", (payload: SeatUpdatePayload) => {
      if (payload.eventId !== eventId) {
        return;
      }

      const updatedIds = new Set(payload.seats.map((seat) => seat.id));

      setSeats((prevSeats) =>
        prevSeats.map((seat) => {
          const update = payload.seats.find(
            (updatedSeat) => updatedSeat.id === seat.id,
          );

          return update
            ? {
                ...seat,
                status: update.status,
              }
            : seat;
        }),
      );

      setRecentlyUpdatedIds(updatedIds);

      if (flashTimerRef.current) {
        clearTimeout(flashTimerRef.current);
      }

      flashTimerRef.current = setTimeout(() => {
        setRecentlyUpdatedIds(new Set());
      }, FLASH_DURATION_MS);
    });

    return () => {
      socket.emit("leave:event", {
        eventId,
      });

      socket.disconnect();

      if (flashTimerRef.current) {
        clearTimeout(flashTimerRef.current);
      }
    };
  }, [eventId, token, fetchSeats]);

  return {
    seats,
    connectionStatus,
    recentlyUpdatedIds,
  };
}
