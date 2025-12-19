import React, { useState } from 'react';
import { X, Send, Lightbulb, MessageSquare } from 'lucide-react';
import { cn } from '../utils';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !message) return;

    setIsSending(true);
    
    // Simulate network request
    setTimeout(() => {
        setIsSending(false);
        setIsSent(true);
        setTimeout(() => {
            setIsSent(false);
            setTopic('');
            setMessage('');
            onClose();
        }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                    <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="font-bold text-xl text-slate-800">Zgłoś sugestię</h2>
                    <p className="text-xs text-slate-500">Masz pomysł na nową funkcję?</p>
                </div>
            </div>
            <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
        </div>

        <div className="p-6">
            {!isSent ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Temat</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-medium"
                            placeholder="np. Nowy typ zmiany, Eksport do Excela..."
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Wiadomość</label>
                        <textarea 
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-medium min-h-[120px] resize-none"
                            placeholder="Opisz dokładnie swój pomysł..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSending}
                            className={cn(
                                "w-full py-2.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]",
                                isSending ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-500/20"
                            )}
                        >
                            {isSending ? (
                                <span className="animate-pulse">Wysyłanie...</span>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Wyślij zgłoszenie
                                </>
                            )}
                        </button>
                    </div>
                    
                    <p className="text-[10px] text-center text-slate-400 mt-2">
                        Twoja wiadomość zostanie przekazana bezpośrednio do administratora systemu.
                    </p>
                </form>
            ) : (
                <div className="py-8 flex flex-col items-center text-center animate-in fade-in duration-300">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                        <Send className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Dziękujemy!</h3>
                    <p className="text-slate-600 text-sm max-w-xs">
                        Twoja sugestia została wysłana. Dziękujemy za pomoc w rozwijaniu aplikacji.
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
