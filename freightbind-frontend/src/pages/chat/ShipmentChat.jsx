import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiAlertCircle, FiArrowLeft, FiMessageSquare, FiSend } from "react-icons/fi";
import ContentContainer from "../../components/page/ContentContainer";
import Button from "../../components/Button/Button";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import PriorityBadge from "../../components/StatusBadge/PriorityBadge";
import Skeleton from "../../components/Skeleton/Skeleton";
import useAuth from "../../hooks/useAuth";
import useRealtimeChat from "../../hooks/useRealtimeChat";
import {
  fetchChatContext,
  fetchMessages,
  sendChatMessage,
  resetChat,
  clearSendError,
} from "../../features/chat/chatSlice";
import { formatTime } from "../../utils/helpers";
import { cn } from "../../utils/cn";

/**
 * ShipmentChat — the operational conversation between the assigned Carrier
 * Dispatcher and the Hub Operators of the shipment's hub. Shipment-specific
 * by design; access is enforced server-side (403 otherwise). Realtime
 * delivery goes through the shared SocketProvider + eventManager and appends
 * into the chat slice.
 */
const ShipmentChat = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { context, contextLoading, contextError, messages, messagesLoading, messagesError, sending, sendError } =
    useSelector((state) => state.chat);

  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useRealtimeChat(id);

  useEffect(() => {
    dispatch(fetchChatContext(id));
    dispatch(fetchMessages(id));
    return () => {
      dispatch(resetChat());
    };
  }, [dispatch, id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const participants = useMemo(() => {
    if (!context) return [];
    const list = [];
    if (context.dispatcher) {
      list.push({
        _id: context.dispatcher._id,
        fullName: context.dispatcher.fullName,
        email: context.dispatcher.email,
        roleLabel: "Carrier Dispatcher",
      });
    }
    (context.hubOperators || []).forEach((operator) => {
      list.push({
        _id: operator._id,
        fullName: operator.fullName,
        email: operator.email,
        roleLabel: "Hub Operator",
      });
    });
    return list;
  }, [context]);

  const canSend = draft.trim().length > 0 && !sending && !messagesError;

  const handleSend = async (event) => {
    event?.preventDefault();
    if (!draft.trim() || sending) return;
    const text = draft.trim();
    setDraft("");
    const result = await dispatch(sendChatMessage({ shipmentId: id, message: text }));
    if (sendChatMessage.rejected.match(result)) {
      setDraft(text);
      inputRef.current?.focus();
    }
  };

  const renderMessageList = () => {
    if (messagesLoading) {
      return (
        <div className="space-y-4 p-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className={cn("flex", i % 2 === 0 ? "justify-end" : "justify-start")}>
              <Skeleton className={cn("h-12 w-64 rounded-2xl", i % 2 === 0 ? "rounded-br-md" : "rounded-bl-md")} />
            </div>
          ))}
        </div>
      );
    }

    if (messagesError) {
      return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
          <FiAlertCircle size={32} className="text-red-400" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-slate-700 dark:text-zinc-200">
            {messagesError || "Unable to load messages."}
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => dispatch(fetchMessages(id))}>
            Retry
          </Button>
        </div>
      );
    }

    if (messages.length === 0) {
      return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500">
            <FiMessageSquare size={24} aria-hidden="true" />
          </span>
          <p className="mt-4 text-sm font-medium text-slate-700 dark:text-zinc-200">No messages yet</p>
          <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-zinc-400">
            Start the shipment handoff conversation with the{" "}
            {context?.dispatcher ? "Hub Operator team" : "Carrier Dispatcher"}.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3 p-4">
        {messages.map((message) => {
          const senderId = message.sender?._id || message.sender;
          const mine = user && String(senderId) === String(user._id);
          return (
            <div key={message._id || message.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm sm:max-w-[70%]",
                  mine
                    ? "rounded-br-md bg-harbor-600 text-white dark:bg-harbor-500"
                    : "rounded-bl-md border border-slate-200 bg-white text-slate-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                )}
              >
                {!mine && (
                  <p className="mb-0.5 text-xs font-semibold text-harbor-600 dark:text-harbor-400">
                    {message.sender?.fullName || "Hub Operator"}
                  </p>
                )}
                <p className="whitespace-pre-wrap break-words leading-relaxed">{message.message}</p>
                <p
                  className={cn(
                    "mt-1 text-right text-[10px]",
                    mine ? "text-harbor-100/80 dark:text-harbor-100/90" : "text-slate-400 dark:text-zinc-500"
                  )}
                >
                  {formatTime(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    );
  };

  if (contextLoading) {
    return (
      <ContentContainer>
        <div className="flex h-[calc(100vh-9rem)] flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
          <div className="border-b border-slate-100 p-4 dark:border-zinc-800">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="mt-2 h-4 w-40" />
          </div>
          <div className="flex-1 space-y-4 p-4">
            <Skeleton className="h-12 w-64 rounded-2xl" />
            <Skeleton className="ml-auto h-12 w-56 rounded-2xl" />
          </div>
        </div>
      </ContentContainer>
    );
  }

  if (contextError) {
    const isForbidden = /403|forbidden|permission|assigned|relevant/i.test(contextError || "");
    return (
      <ContentContainer>
        <div className="mx-auto max-w-md rounded-[20px] border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
            <FiAlertCircle size={26} aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
            {isForbidden ? "Chat unavailable for this shipment" : "Unable to open chat"}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
            {isForbidden ? "You can only chat on shipments assigned to you or relevant to your hub." : contextError}
          </p>
          <Button className="mt-6" variant="outline" onClick={() => navigate(-1)}>
            <FiArrowLeft size={16} aria-hidden="true" /> Go back
          </Button>
        </div>
      </ContentContainer>
    );
  }

  return (
    <ContentContainer>
      <div className="flex h-[calc(100vh-9rem)] min-h-[480px] flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        {/* Conversation header */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-zinc-800">
          <Button variant="ghost" size="sm" aria-label="Back" onClick={() => navigate(-1)}>
            <FiArrowLeft size={16} aria-hidden="true" />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/shipments/${id}`}
                className="truncate text-sm font-bold text-slate-900 hover:text-harbor-600 dark:text-white dark:hover:text-harbor-400"
              >
                {context?.shipment?.shipmentId}
              </Link>
              <StatusBadge status={context?.shipment?.status} />
              <PriorityBadge priority={context?.shipment?.priority} />
            </div>
            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-zinc-400">{context?.shipment?.title}</p>
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-zinc-500">
              Participants
            </p>
            <div className="mt-1 flex items-center justify-end gap-1">
              {participants.length === 0 ? (
                <span className="text-xs text-slate-400 dark:text-zinc-500">Loading...</span>
              ) : (
                participants.map((participant) => (
                  <span
                    key={participant._id}
                    title={`${participant.fullName} — ${participant.roleLabel}`}
                    className="-ml-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-semibold text-slate-600 dark:border-zinc-900 dark:bg-zinc-700 dark:text-zinc-200"
                  >
                    {participant.fullName
                      .split(" ")
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-slate-50/60 dark:bg-zinc-950/40">{renderMessageList()}</div>

        {/* Composer */}
        <form onSubmit={handleSend} className="border-t border-slate-100 p-3 dark:border-zinc-800">
          {sendError && (
            <p className="mb-2 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
              <FiAlertCircle size={12} aria-hidden="true" />
              {sendError.message || "Failed to send message"}
              <button
                type="button"
                className="font-medium underline underline-offset-2 hover:text-red-700"
                onClick={() => dispatch(clearSendError())}
              >
                Dismiss
              </button>
            </p>
          )}
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <textarea
                ref={inputRef}
                rows={1}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type an operational message... (Shift+Enter for new line)"
                aria-label="Message"
                className="max-h-32 w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-harbor-400 focus:ring-2 focus:ring-harbor-400/40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100 dark:placeholder-zinc-500 dark:focus:border-harbor-500/60"
              />
            </div>
            <Button type="submit" disabled={!canSend} loading={sending} aria-label="Send message" className="shrink-0">
              <FiSend size={15} aria-hidden="true" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>
        </form>
      </div>
    </ContentContainer>
  );
};

export default ShipmentChat;
