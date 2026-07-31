import { useCallback, useEffect, useRef, useState } from "react";

function socketUrl() {
  const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
  const url = new URL(apiUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws";
  url.search = "";
  return url.toString();
}

function frames(data) {
  return String(data).split("\0").map((frame) => {
    const divider = frame.indexOf("\n\n");
    if (divider < 0) return null;
    const lines = frame.slice(0, divider).split("\n");
    return { command: lines.shift(), body: frame.slice(divider + 2) };
  }).filter(Boolean);
}

// A small STOMP 1.2 client keeps the transport dependency-free and makes the
// server destination explicit. Actions use envelopes, never raw UI events.
export default function useMatchSocket(matchId, onMessage) {
  const socketRef = useRef(null);
  const onMessageRef = useRef(onMessage);
  const [status, setStatus] = useState("offline");
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!matchId) return undefined;
    let intentionalClose = false;
    const socket = new WebSocket(socketUrl());
    socketRef.current = socket;
    setStatus("connecting");
    socket.onopen = () => socket.send("CONNECT\naccept-version:1.2\n\n\0");
    socket.onmessage = (event) => frames(event.data).forEach((frame) => {
      if (frame.command === "CONNECTED") {
        socket.send(`SUBSCRIBE\nid:match-${matchId}\ndestination:/topic/match/${matchId}\n\n\0`);
        // Topics are not retained by Spring's simple broker. Request the last
        // persisted snapshot only after this subscription is in place.
        socket.send(`SEND\ndestination:/app/match/${matchId}/action\ncontent-type:application/json\n\n${JSON.stringify({ version: 1, type: "SYNC_REQUEST", matchId, actorColor: "SYSTEM", actionId: `sync-${Date.now()}`, sequence: 0, phase: null, payload: {} })}\0`);
        setStatus("connected");
      } else if (frame.command === "MESSAGE") {
        try { onMessageRef.current?.(JSON.parse(frame.body)); } catch { /* ignore invalid broker payload */ }
      } else if (frame.command === "ERROR") setStatus("error");
    });
    socket.onerror = () => setStatus("error");
    socket.onclose = () => { if (!intentionalClose) setStatus("offline"); };
    return () => { intentionalClose = true; socket.close(); socketRef.current = null; };
  }, [matchId]);

  const send = useCallback((envelope) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    socket.send(`SEND\ndestination:/app/match/${matchId}/action\ncontent-type:application/json\n\n${JSON.stringify(envelope)}\0`);
    return true;
  }, [matchId]);

  return { status, send };
}
