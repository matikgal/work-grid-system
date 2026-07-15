import React, { useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Send, Loader2 } from 'lucide-react';
import { Message } from '../../../services/messageService';
import { cn } from '../../../utils';

interface ChatPanelProps {
  messages: Message[];
  currentUserId: string;
  onSend: (content: string) => Promise<void>;
  sending?: boolean;
}

// Wyłapuje wzmianki @imię (także polskie znaki) i podświetla je w treści wiadomości.
const MENTION_RE = /(@[\p{L}0-9_]+)/u;

function renderContent(content: string, isOwn: boolean): React.ReactNode[] {
  return content.split(MENTION_RE).map((part, i) =>
    MENTION_RE.test(part) ? (
      <span
        key={i}
        className={cn(
          'rounded px-1 font-semibold',
          isOwn
            ? 'bg-white/25 text-white'
            : 'bg-indigo-500/15 text-indigo-700 dark:bg-indigo-400/20 dark:text-indigo-200',
        )}
      >
        {part}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  currentUserId,
  onSend,
  sending,
}) => {
  const [text, setText] = React.useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setText('');
    await onSend(trimmed);
  };

  return (
    <div className="dash-glass flex h-full flex-col overflow-hidden">
      <div className="dash-scroll flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="py-12 text-center text-sm text-indigo-950/40 dark:text-indigo-100/45">Brak wiadomości. Napisz pierwszą!</p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[75%] px-4 py-2.5 text-sm shadow-sm',
                  isOwn
                    ? 'rounded-2xl rounded-br-md bg-gradient-to-br from-indigo-600 to-violet-600 text-white'
                    : 'rounded-2xl rounded-bl-md border border-white/55 bg-white/70 text-indigo-950 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.06] dark:text-indigo-50',
                )}
              >
                {!isOwn && (
                  <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
                    {msg.senderName}
                  </p>
                )}
                <p className="whitespace-pre-wrap break-words">{renderContent(msg.content, isOwn)}</p>
                <p
                  className={cn(
                    'mt-1 text-[10px] tabular-nums',
                    isOwn ? 'text-indigo-100/80' : 'text-indigo-950/40 dark:text-indigo-100/40',
                  )}
                >
                  {format(new Date(msg.createdAt), 'HH:mm', { locale: pl })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-t border-white/40 bg-white/40 p-3 dark:border-white/10 dark:bg-white/[0.02]"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Napisz wiadomość..."
          className="flex-1 rounded-xl border border-indigo-950/12 bg-white/70 px-4 py-2.5 text-sm text-indigo-950 outline-none transition-all placeholder:text-indigo-950/40 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/12 dark:bg-white/5 dark:text-indigo-50 dark:placeholder:text-indigo-100/40"
          maxLength={500}
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_-10px_rgba(99,102,241,0.8)] transition-all hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
};
