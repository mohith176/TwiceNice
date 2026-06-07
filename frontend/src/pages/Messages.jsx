import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, MessagesSquare } from 'lucide-react';
import api from '../lib/api';
import { Avatar } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { formatTime } from '../lib/format';
import { useAuth } from '../context/AuthContext';

// Picks the participant who isn't me from a populated conversation.
function otherOf(conv, myId) {
  if (!conv) return null;
  const buyerId = conv.buyer?._id || conv.buyer;
  return String(buyerId) === String(myId) ? conv.seller : conv.buyer;
}

export default function Messages() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loadingInbox, setLoadingInbox] = useState(true);

  // Inbox: load + poll every 10s.
  useEffect(() => {
    let active = true;
    const load = () =>
      api
        .get('/conversations')
        .then(({ data }) => active && setConversations(data.items))
        .catch(() => {})
        .finally(() => active && setLoadingInbox(false));
    load();
    const t = setInterval(load, 10000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-4 text-2xl">Messages</h1>
      <div className="grid grid-cols-1 overflow-hidden rounded-[10px] border-2 border-ink shadow-neo md:h-[70vh] md:grid-cols-[320px_1fr]">
        {/* Inbox list */}
        <div className={cn('overflow-y-auto bg-white md:border-r-2 md:border-ink', conversationId && 'hidden md:block')}>
          {loadingInbox ? (
            <div className="p-6 text-center font-heading text-ink/60">Loading…</div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center text-sm text-ink/60">
              No conversations yet. Message a seller from a listing to start one.
            </div>
          ) : (
            conversations.map((c) => (
              <Link
                key={c._id}
                to={`/messages/${c._id}`}
                className={cn(
                  'flex gap-3 border-b-2 border-ink p-3 hover:bg-muted',
                  c._id === conversationId && 'bg-primary/30'
                )}
              >
                <Avatar name={c.otherParty?.name || '?'} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn('truncate font-heading', c.unread > 0 ? 'font-bold' : 'font-bold')}>
                      {c.otherParty?.name || 'Unknown'}
                    </span>
                    {c.unread > 0 && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-ink bg-pink px-1 text-[10px] font-bold text-white">
                        {c.unread}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-ink/50">{c.listing?.title || 'Listing removed'}</p>
                  <p className={cn('truncate text-sm', c.unread > 0 ? 'font-bold text-ink' : 'text-ink/60')}>
                    {c.lastMessage}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Thread */}
        <div className={cn('flex flex-col bg-muted/30', !conversationId && 'hidden md:flex')}>
          {conversationId ? (
            <Thread key={conversationId} conversationId={conversationId} myId={user?._id} />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-ink/50">
              <MessagesSquare className="mb-2 h-10 w-10" />
              <p className="font-heading font-bold">Select a conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Thread({ conversationId, myId }) {
  const navigate = useNavigate();
  const [conv, setConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  // Load + poll every 4s. Fetching also marks the other party's messages read.
  useEffect(() => {
    let active = true;
    setLoading(true);
    const load = () =>
      api
        .get(`/conversations/${conversationId}/messages`)
        .then(({ data }) => {
          if (!active) return;
          setConv(data.conversation);
          setMessages(data.messages);
        })
        .catch(() => {})
        .finally(() => active && setLoading(false));
    load();
    const t = setInterval(load, 4000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await api.post(`/conversations/${conversationId}/messages`, { body: text.trim() });
      setText('');
      const { data } = await api.get(`/conversations/${conversationId}/messages`);
      setConv(data.conversation);
      setMessages(data.messages);
    } catch {
      /* ignore; next poll will reconcile */
    } finally {
      setSending(false);
    }
  }

  const other = otherOf(conv, myId);
  const listing = conv?.listing;

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 border-b-2 border-ink bg-white p-3">
        <button onClick={() => navigate('/messages')} className="md:hidden" aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Avatar name={other?.name || '?'} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading font-bold leading-tight">{other?.name || 'Conversation'}</p>
          {listing ? (
            <Link to={`/listings/${listing._id}`} className="truncate text-xs text-ink/60 hover:underline">
              About: {listing.title}
            </Link>
          ) : (
            <p className="truncate text-xs text-ink/40">Listing removed</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {loading && messages.length === 0 ? (
          <p className="text-center font-heading text-ink/50">Loading…</p>
        ) : (
          messages.map((m) => {
            const mine = String(m.sender?._id || m.sender) === String(myId);
            return (
              <div key={m._id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[75%] rounded-[10px] border-2 border-ink px-3 py-2 shadow-neo-sm',
                    mine ? 'bg-primary' : 'bg-white'
                  )}
                >
                  <p className="whitespace-pre-wrap break-words text-sm">{m.body}</p>
                  <p className="mt-0.5 text-right text-[10px] text-ink/50">{formatTime(m.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form onSubmit={send} className="flex gap-2 border-t-2 border-ink bg-white p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="h-11 flex-1 rounded-[6px] border-2 border-ink bg-white px-3 shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-info"
        />
        <Button type="submit" size="icon" disabled={sending || !text.trim()} aria-label="Send">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </>
  );
}
