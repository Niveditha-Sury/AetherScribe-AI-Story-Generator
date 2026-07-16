import React from 'react';
import { BookOpen, Plus, Settings, Trash2, Download, FileText, Sparkles } from 'lucide-react';
import type { AISettings } from '../services/ai';

export interface Story {
  id: string;
  title: string;
  genre: string;
  tone: string;
  uncensored: boolean;
  prompt: string;
  paragraphs: string[];
  customLore?: string;
  fandom?: string;
  isFanfiction?: boolean;
  createdAt: number;
}

interface SidebarProps {
  stories: Story[];
  activeStoryId: string | null;
  onSelectStory: (id: string) => void;
  onNewStory: () => void;
  onDeleteStory: (id: string) => void;
  onOpenSettings: () => void;
  activeStory: Story | null;
  aiSettings: AISettings;
}

export const Sidebar: React.FC<SidebarProps> = ({
  stories,
  activeStoryId,
  onSelectStory,
  onNewStory,
  onDeleteStory,
  onOpenSettings,
  activeStory,
  aiSettings
}) => {
  // Export active story to file helper
  const exportStory = (format: 'txt' | 'md') => {
    if (!activeStory || activeStory.paragraphs.length === 0) return;

    let content = '';
    const title = activeStory.title || 'Untitled Story';
    const filename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${format}`;

    if (format === 'md') {
      content = `# ${title}\n\n`;
      content += `* **Genre:** ${activeStory.genre}\n`;
      content += `* **Tone:** ${activeStory.tone}\n`;
      content += `* **Uncensored Mode:** ${activeStory.uncensored ? 'Active (NSFW)' : 'Inactive (SFW)'}\n`;
      content += `* **Original Prompt:** ${activeStory.prompt}\n\n`;
      content += `***\n\n`;
      content += activeStory.paragraphs.join('\n\n');
    } else {
      content = `${title}\n`;
      content += `Genre: ${activeStory.genre} | Tone: ${activeStory.tone} | Uncensored: ${activeStory.uncensored ? 'Yes' : 'No'}\n`;
      content += `Original Prompt: ${activeStory.prompt}\n\n`;
      content += `=========================\n\n`;
      content += activeStory.paragraphs.join('\n\r\n');
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <aside style={{
      width: '280px',
      height: '100%',
      backgroundColor: 'rgba(10, 10, 15, 0.9)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      zIndex: 10
    }}>
      {/* Sidebar Header */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
          padding: '8px',
          borderRadius: '10px',
          boxShadow: 'var(--glow-purple)'
        }}>
          <Sparkles size={20} style={{ color: '#fff' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', fontWeight: 700, margin: 0, letterSpacing: '0.02em' }}>
            AetherScribe
          </h1>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Uncensored Gen
          </span>
        </div>
      </div>

      {/* New Story Button */}
      <div style={{ padding: '16px 20px 8px' }}>
        <button 
          onClick={onNewStory} 
          className="btn btn-primary"
          style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)' }}
        >
          <Plus size={16} />
          New Story
        </button>
      </div>

      {/* Stories list */}
      <div style={{
        flexGrow: 1,
        overflowY: 'auto',
        padding: '12px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <h3 style={{
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-muted)',
          marginBottom: '6px',
          fontFamily: 'var(--font-display)'
        }}>
          Library ({stories.length})
        </h3>

        {stories.length === 0 ? (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            border: '1px dashed var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            marginTop: '10px'
          }}>
            No stories saved yet. Craft your first story now!
          </div>
        ) : (
          stories.map((story) => {
            const isActive = story.id === activeStoryId;
            return (
              <div 
                key={story.id}
                onClick={() => onSelectStory(story.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isActive ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(139, 92, 246, 0.3)' : 'transparent'}`,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                className="story-item-hover"
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '80%' }}>
                  <BookOpen size={16} style={{ color: isActive ? 'var(--accent-purple)' : 'var(--text-muted)', flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <span style={{ 
                      fontSize: '0.85rem', 
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {story.title || 'Untitled Story'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {story.genre} • {story.paragraphs.length} paras
                      {story.isFanfiction && story.fandom && (
                        <span style={{ color: '#f9a8d4', marginLeft: '4px' }}>• ♥ {story.fandom}</span>
                      )}
                    </span>
                  </div>
                </div>
                
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this story forever?')) {
                      onDeleteStory(story.id);
                    }
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    opacity: isActive ? 1 : 0,
                    transition: 'all var(--transition-fast)'
                  }}
                  className="sidebar-delete-btn"
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-red)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Active Story Export Section */}
      {activeStory && activeStory.paragraphs.length > 0 && (
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.01)'
        }}>
          <span style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-display)'
          }}>
            Export Options
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button 
              onClick={() => exportStory('txt')} 
              className="btn btn-secondary" 
              style={{ padding: '8px', fontSize: '0.8rem', gap: '6px' }}
            >
              <FileText size={14} />
              Plain Text
            </button>
            <button 
              onClick={() => exportStory('md')} 
              className="btn btn-secondary" 
              style={{ padding: '8px', fontSize: '0.8rem', gap: '6px' }}
            >
              <Download size={14} />
              Markdown
            </button>
          </div>
        </div>
      )}

      {/* Sidebar Footer (Settings and Provider Badge) */}
      <div style={{
        padding: '20px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            AI Status
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: aiSettings.provider === 'demo' ? 'var(--accent-amber)' : 'var(--accent-teal)',
              boxShadow: aiSettings.provider === 'demo' ? '0 0 8px var(--accent-amber)' : '0 0 8px var(--accent-teal)'
            }} />
            <span style={{ fontSize: '0.8rem', textTransform: 'capitalize', fontWeight: 500 }}>
              {aiSettings.provider}
            </span>
          </div>
        </div>
        <button 
          onClick={onOpenSettings} 
          className="btn btn-secondary"
          style={{ padding: '8px', borderRadius: 'var(--radius-sm)' }}
          title="AI Connection Settings"
        >
          <Settings size={16} />
        </button>
      </div>
    </aside>
  );
};
