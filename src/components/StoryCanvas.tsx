import React, { useState, useRef, useEffect } from 'react';
import { Send, Edit3, Trash2, RefreshCw, Plus, Save, Compass } from 'lucide-react';
import type { Story } from './Sidebar';

interface StoryCanvasProps {
  activeStory: Story | null;
  onUpdateStory: (updatedStory: Story) => void;
  onGenerateNext: (promptOverride?: string) => void;
  isGenerating: boolean;
  generatingText: string;
  prompt: string;
  setPrompt: (p: string) => void;
  onRewriteParagraph: (index: number, instructions: string) => Promise<void>;
  rewritingIndex: number | null;
  rewritingText: string;
  onRestoreOriginal: () => void;
  onAcceptRewrite: () => void;
}

export const StoryCanvas: React.FC<StoryCanvasProps> = ({
  activeStory,
  onUpdateStory,
  onGenerateNext,
  isGenerating,
  generatingText,
  prompt,
  setPrompt,
  onRewriteParagraph,
  rewritingIndex,
  rewritingText,
  onRestoreOriginal,
  onAcceptRewrite
}) => {
  const [editingParagraphIdx, setEditingParagraphIdx] = useState<number | null>(null);
  const [editBuffer, setEditBuffer] = useState('');
  const [titleEditing, setTitleEditing] = useState(false);
  const [titleBuffer, setTitleBuffer] = useState('');

  // Local states for rewrite panel
  const [activeRewritePromptIdx, setActiveRewritePromptIdx] = useState<number | null>(null);
  const [rewriteInstructions, setRewriteInstructions] = useState('');
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when text is generating
  useEffect(() => {
    if (isGenerating && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isGenerating, generatingText]);

  if (!activeStory) {
    return (
      <div style={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        textAlign: 'center',
        background: 'radial-gradient(circle at center, rgba(16, 16, 24, 0.5) 0%, var(--bg-dark) 100%)',
        position: 'relative'
      }}>
        <div className="ambient-glow-1"></div>
        <div style={{
          maxWidth: '480px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            background: 'rgba(139, 92, 246, 0.05)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '50%',
            padding: '24px',
            boxShadow: 'var(--glow-purple)',
            marginBottom: '10px'
          }}>
            <Compass size={40} style={{ color: 'var(--accent-purple)' }} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            Forge Your Narrative
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Choose an existing story from the library sidebar, or create a brand new adventure to begin writing with uncensored AI generation.
          </p>
        </div>
      </div>
    );
  }

  // Handle saving edited paragraph
  const handleSaveParagraph = (index: number) => {
    if (editingParagraphIdx === null) return;
    const newParagraphs = [...activeStory.paragraphs];
    newParagraphs[index] = editBuffer;
    onUpdateStory({ ...activeStory, paragraphs: newParagraphs });
    setEditingParagraphIdx(null);
  };

  // Handle deleting paragraph
  const handleDeleteParagraph = (index: number) => {
    const newParagraphs = activeStory.paragraphs.filter((_, idx) => idx !== index);
    onUpdateStory({ ...activeStory, paragraphs: newParagraphs });
  };

  // Handle saving updated title
  const handleSaveTitle = () => {
    if (titleBuffer.trim() === '') return;
    onUpdateStory({ ...activeStory, title: titleBuffer.trim() });
    setTitleEditing(false);
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerateNext();
  };

  return (
    <div style={{
      flexGrow: 1,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'rgba(8, 8, 12, 0.65)',
      position: 'relative'
    }}>
      <div className="ambient-glow-2"></div>

      {/* Story Header */}
      <div style={{
        padding: '20px 30px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backdropFilter: 'blur(8px)',
        zIndex: 2
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '70%' }}>
          {titleEditing ? (
            <input
              type="text"
              className="input-field"
              value={titleBuffer}
              onChange={(e) => setTitleBuffer(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
              autoFocus
              style={{ fontSize: '1.4rem', fontWeight: 600, fontFamily: 'var(--font-display)', padding: '4px 8px' }}
            />
          ) : (
            <h2 
              onClick={() => {
                setTitleBuffer(activeStory.title);
                setTitleEditing(true);
              }}
              style={{ 
                fontSize: '1.5rem', 
                fontWeight: 600, 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                color: 'var(--text-primary)'
              }}
              title="Click to rename"
            >
              {activeStory.title}
              <Edit3 size={14} style={{ color: 'var(--text-muted)' }} />
            </h2>
          )}
          
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>{activeStory.genre}</span>
            <span className="badge badge-purple" style={{ fontSize: '0.65rem', textTransform: 'capitalize' }}>{activeStory.tone}</span>
            {activeStory.uncensored && <span className="badge badge-red" style={{ fontSize: '0.65rem' }}>Uncensored</span>}
            {activeStory.isFanfiction && activeStory.fandom && (
              <span style={{
                fontSize: '0.65rem',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: 'rgba(236,72,153,0.15)',
                color: '#f9a8d4',
                border: '1px solid rgba(236,72,153,0.3)'
              }}>
                ♥ FF: {activeStory.fandom}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div style={{
        flexGrow: 1,
        overflowY: 'auto',
        padding: '30px 40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {activeStory.paragraphs.length === 0 && !isGenerating ? (
          <div style={{
            margin: 'auto',
            textAlign: 'center',
            color: 'var(--text-muted)',
            maxWidth: '400px',
            padding: '20px'
          }}>
            <p style={{ fontSize: '1rem', marginBottom: '10px' }}>Your parchment is empty.</p>
            <p style={{ fontSize: '0.85rem' }}>Write an opening prompt below to ignite the story generation.</p>
          </div>
        ) : (
          activeStory.paragraphs.map((p, index) => {
            const isEditing = editingParagraphIdx === index;
            const isPromptingRewrite = activeRewritePromptIdx === index;
            const isStreamingRewrite = rewritingIndex === index && rewritingText !== '';
            const isRewriteCompleted = rewritingIndex === index && rewritingText === '';

            return (
              <div 
                key={index}
                style={{
                  position: 'relative',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isEditing || isPromptingRewrite || isRewriteCompleted ? 'rgba(0,0,0,0.4)' : 'transparent',
                  border: `1px solid ${isEditing ? 'var(--accent-purple)' : isPromptingRewrite ? 'var(--accent-teal)' : isRewriteCompleted ? 'var(--accent-amber)' : 'transparent'}`,
                  transition: 'background-color var(--transition-fast)',
                  lineHeight: '1.8',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1.05rem',
                  color: 'var(--text-secondary)'
                }}
                className="paragraph-container"
              >
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <textarea
                      className="input-field"
                      value={editBuffer}
                      onChange={(e) => setEditBuffer(e.target.value)}
                      rows={5}
                      style={{ fontSize: '1.05rem', lineHeight: '1.8' }}
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => setEditingParagraphIdx(null)}
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        Cancel
                      </button>
                      <button 
                        className="btn btn-primary" 
                        onClick={() => handleSaveParagraph(index)}
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        <Save size={12} /> Save
                      </button>
                    </div>
                  </div>
                ) : isPromptingRewrite ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <RefreshCw size={12} style={{ animation: 'spin 4s linear infinite' }} />
                      Rewrite instructions (leave blank for general enhancement):
                    </div>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Make it more descriptive, add more tension, make it uncensored..."
                      value={rewriteInstructions}
                      onChange={(e) => setRewriteInstructions(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onRewriteParagraph(index, rewriteInstructions);
                          setActiveRewritePromptIdx(null);
                        }
                      }}
                      autoFocus
                      style={{ fontSize: '0.95rem' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => {
                          setActiveRewritePromptIdx(null);
                          setRewriteInstructions('');
                        }}
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        Cancel
                      </button>
                      <button 
                        className="btn btn-primary" 
                        onClick={() => {
                          onRewriteParagraph(index, rewriteInstructions);
                          setActiveRewritePromptIdx(null);
                        }}
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        Rewrite Segment
                      </button>
                    </div>
                  </div>
                ) : isStreamingRewrite ? (
                  <div style={{ color: 'var(--text-primary)' }}>
                    {rewritingText}
                    <span className="cursor-blink"></span>
                  </div>
                ) : (
                  <>
                    <p style={{ whiteSpace: 'pre-line' }}>{p}</p>
                    
                    {isRewriteCompleted && (
                      <div style={{
                        marginTop: '12px',
                        padding: '10px 14px',
                        backgroundColor: 'rgba(245, 158, 11, 0.05)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', fontWeight: 'bold' }}>
                          Paragraph Rewritten
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-secondary"
                            onClick={() => {
                              onRestoreOriginal();
                              setActiveRewritePromptIdx(index);
                            }}
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          >
                            Retry
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={onRestoreOriginal}
                            style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}
                          >
                            Undo / Restore
                          </button>
                          <button
                            className="btn btn-primary"
                            onClick={onAcceptRewrite}
                            style={{ padding: '4px 10px', fontSize: '0.75rem', background: 'linear-gradient(135deg, var(--accent-teal), #0d9488)' }}
                          >
                            Keep Changes
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Hover Paragraph Actions */}
                    {!isRewriteCompleted && (
                      <div className="paragraph-actions" style={{
                        position: 'absolute',
                        right: '10px',
                        top: '-15px',
                        display: 'flex',
                        gap: '4px',
                        backgroundColor: 'var(--bg-dark)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '4px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        opacity: 0,
                        transition: 'opacity var(--transition-fast)'
                      }}>
                        <button
                          title="Rewrite with AI"
                          onClick={() => {
                            setRewriteInstructions('');
                            setActiveRewritePromptIdx(index);
                          }}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '4px', cursor: 'pointer' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-teal)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                        >
                          <RefreshCw size={13} />
                        </button>
                        <button
                          title="Edit Paragraph"
                          onClick={() => {
                            setEditBuffer(p);
                            setEditingParagraphIdx(index);
                          }}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '4px', cursor: 'pointer' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-purple)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          title="Delete Section"
                          onClick={() => handleDeleteParagraph(index)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '4px', cursor: 'pointer' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-red)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}

        {/* Real-time Typing Generation Effect */}
        {isGenerating && (
          <div style={{
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            lineHeight: '1.8',
            fontFamily: 'var(--font-sans)',
            fontSize: '1.05rem',
            color: 'var(--text-primary)',
            backgroundColor: 'rgba(139, 92, 246, 0.03)',
            borderLeft: '3px solid var(--accent-purple)'
          }}>
            {generatingText ? (
              <>
                {generatingText}
                <span className="cursor-blink"></span>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                <span className="loading-dots">
                  <span></span><span></span><span></span>
                </span>
                AI is structuring the narrative...
              </div>
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Story Canvas Footer (Prompt Input Section) */}
      <div style={{
        padding: '24px 30px',
        borderTop: '1px solid var(--border-color)',
        backdropFilter: 'blur(8px)',
        zIndex: 2,
        backgroundColor: 'rgba(12, 12, 20, 0.9)'
      }}>
        {/* Helper quick action bar */}
        {activeStory.paragraphs.length > 0 && !isGenerating && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px'
          }}>
            <button
              onClick={() => onGenerateNext()}
              className="btn btn-secondary"
              style={{
                fontSize: '0.8rem',
                padding: '6px 12px',
                gap: '6px',
                borderColor: 'rgba(139, 92, 246, 0.2)'
              }}
            >
              <Plus size={14} style={{ color: 'var(--accent-purple)' }} />
              Continue Narrative
            </button>

            <button
              onClick={() => {
                const updatedParagraphs = activeStory.paragraphs.slice(0, -1);
                onUpdateStory({ ...activeStory, paragraphs: updatedParagraphs });
                onGenerateNext(activeStory.prompt); // Re-run with original seed or last prompt
              }}
              className="btn btn-secondary"
              style={{
                fontSize: '0.8rem',
                padding: '6px 12px',
                gap: '6px'
              }}
            >
              <RefreshCw size={12} />
              Regenerate Last Segment
            </button>
          </div>
        )}

        <form onSubmit={handlePromptSubmit} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
          <textarea
            className="input-field"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type what happens next or describe a starting scene..."
            rows={2}
            style={{
              resize: 'none',
              paddingRight: '60px',
              fontSize: '0.95rem',
              borderRadius: 'var(--radius-md)',
              lineHeight: '1.4'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handlePromptSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="btn btn-primary"
            style={{
              position: 'absolute',
              right: '10px',
              bottom: '10px',
              width: '42px',
              height: '42px',
              padding: 0,
              borderRadius: '50%',
              opacity: !prompt.trim() || isGenerating ? 0.5 : 1,
              cursor: !prompt.trim() || isGenerating ? 'not-allowed' : 'pointer'
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* Paragraph actions CSS injection */}
      <style>{`
        .paragraph-container:hover .paragraph-actions {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};
