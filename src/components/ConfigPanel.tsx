import React, { useState, useEffect } from 'react';
import { Settings, Users, BookOpen, AlertTriangle, Lightbulb, Heart, Star } from 'lucide-react';
import { suggestPrompts } from '../services/ai';

interface ConfigPanelProps {
  genre: string;
  setGenre: (g: string) => void;
  tone: string;
  setTone: (t: string) => void;
  uncensored: boolean;
  setUncensored: (u: boolean) => void;
  temperature: number;
  setTemperature: (t: number) => void;
  maxLength: number | null;
  setMaxLength: (l: number | null) => void;
  customLore: string;
  setCustomLore: (l: string) => void;
  fandom: string;
  setFandom: (f: string) => void;
  isFanfiction: boolean;
  setIsFanfiction: (f: boolean) => void;
  onSelectPrompt: (p: string) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  genre,
  setGenre,
  tone,
  setTone,
  uncensored,
  setUncensored,
  temperature,
  setTemperature,
  maxLength,
  setMaxLength,
  customLore,
  setCustomLore,
  fandom,
  setFandom,
  isFanfiction,
  setIsFanfiction,
  onSelectPrompt,
}) => {
  const [showLore, setShowLore] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showFandomPicker, setShowFandomPicker] = useState(false);

  const POPULAR_FANDOMS = [
    // Anime/Manga
    { name: 'Naruto', icon: '🍃', category: 'Anime' },
    { name: 'Attack on Titan', icon: '⚔️', category: 'Anime' },
    { name: 'My Hero Academia', icon: '💥', category: 'Anime' },
    { name: 'Demon Slayer', icon: '🌸', category: 'Anime' },
    { name: 'One Piece', icon: '🏴‍☠️', category: 'Anime' },
    { name: 'Jujutsu Kaisen', icon: '👁️', category: 'Anime' },
    { name: 'Fairy Tail', icon: '✨', category: 'Anime' },
    // Movies/TV
    { name: 'Harry Potter', icon: '⚡', category: 'Books/Film' },
    { name: 'Game of Thrones', icon: '🐲', category: 'TV' },
    { name: 'The Witcher', icon: '🐺', category: 'TV/Games' },
    { name: 'Marvel MCU', icon: '🦸', category: 'Film' },
    { name: 'Star Wars', icon: '⭐', category: 'Film' },
    { name: 'Twilight', icon: '🌙', category: 'Books/Film' },
    { name: 'Outlander', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', category: 'TV' },
    // Games
    { name: 'Genshin Impact', icon: '🌊', category: 'Games' },
    { name: 'Honkai: Star Rail', icon: '🚂', category: 'Games' },
    { name: 'Final Fantasy', icon: '🌀', category: 'Games' },
    { name: 'The Elder Scrolls', icon: '🏔️', category: 'Games' },
    // K-Pop / Real Person
    { name: 'BTS (KPOP)', icon: '💜', category: 'K-Pop' },
    { name: 'BLACKPINK', icon: '🌹', category: 'K-Pop' },
    { name: 'STRAY KIDS', icon: '🎵', category: 'K-Pop' },
    // Other
    { name: 'Bridgerton', icon: '🌺', category: 'TV' },
    { name: 'Vampire Diaries', icon: '🩸', category: 'TV' },
    { name: 'Supernatural', icon: '🔮', category: 'TV' },
  ];

  const categories = [...new Set(POPULAR_FANDOMS.map(f => f.category))];;

  // Update suggestions whenever genre or uncensored status changes
  useEffect(() => {
    setSuggestions(suggestPrompts(genre, uncensored));
  }, [genre, uncensored]);

  const genres = [
    { value: 'fantasy', label: 'Fantasy' },
    { value: 'dark-fantasy', label: 'Dark Fantasy' },
    { value: 'sci-fi', label: 'Sci-Fi' },
    { value: 'cyberpunk', label: 'Cyberpunk' },
    { value: 'romance', label: 'Romance' },
    { value: 'noir', label: 'Noir/Mystery' },
  ];

  const tones = [
    { value: 'adventurous', label: 'Adventurous' },
    { value: 'dark', label: 'Dark & Gritty' },
    { value: 'suspenseful', label: 'Suspenseful' },
    { value: 'erotic', label: 'Erotic & Sensual', censoredOnly: false },
    { value: 'humorous', label: 'Humorous' },
  ];

  const handleUncensoredToggle = (checked: boolean) => {
    setUncensored(checked);
    if (checked) {
      setTone('erotic'); // Default to erotic/sensual on uncensored activation
    } else {
      if (tone === 'erotic') {
        setTone('dark'); // Revert tone if uncensored is turned off
      }
    }
  };

  return (
    <div style={{
      width: '360px',
      height: '100%',
      backgroundColor: 'rgba(12, 12, 20, 0.85)',
      borderRight: '1px solid var(--border-color)',
      padding: '24px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      overflowY: 'auto',
      flexShrink: 0
    }}>
      <div>
        <h2 style={{
          fontSize: '1.2rem',
          fontFamily: 'var(--font-display)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text-primary)',
          marginBottom: '4px'
        }}>
          <Settings size={18} style={{ color: 'var(--accent-purple)' }} />
          Story Parameters
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Configure writing styles and AI focus.
        </p>
      </div>

      {/* Safety Toggle / Uncensored Toggle */}
      <div 
        className={`glass-panel ${uncensored ? 'uncensored-glowing-glow' : ''}`}
        style={{
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: uncensored ? 'rgba(239, 68, 68, 0.03)' : 'rgba(255, 255, 255, 0.01)',
          border: uncensored ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-color)',
          transition: 'all var(--transition-normal)'
        }}
      >
        <div className="toggle-container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ 
              fontWeight: 600, 
              fontSize: '0.9rem', 
              color: uncensored ? 'var(--accent-red)' : 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              Uncensored Mode
              {uncensored && <span className="badge badge-red">18+ NSFW</span>}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Bypass writing filters & safety blocks.
            </span>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={uncensored} 
              onChange={(e) => handleUncensoredToggle(e.target.checked)} 
            />
            <span className="slider uncensored-slider"></span>
          </label>
        </div>

        {uncensored && (
          <div style={{
            marginTop: '10px',
            padding: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            borderRadius: '4px',
            fontSize: '0.75rem',
            color: '#fca5a5',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start'
          }}>
            <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>Allows graphic, violent, romance, and sensual themes. Ensure your connected model supports uncensored generations.</span>
          </div>
        )}
      </div>

      {/* Genre Selector */}
      <div>
        <label className="input-label">Story Genre</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {genres.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => setGenre(g.value)}
              style={{
                padding: '8px 10px',
                fontSize: '0.85rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: genre === g.value ? 'rgba(139, 92, 246, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                borderColor: genre === g.value ? 'var(--accent-purple)' : 'var(--border-color)',
                color: genre === g.value ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tone Selector */}
      <div>
        <label className="input-label">Narrative Tone</label>
        <select
          className="input-field"
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          style={{ textTransform: 'capitalize' }}
        >
          {tones.map((t) => {
            // Disable Erotic if Uncensored mode is OFF
            const isErotic = t.value === 'erotic';
            if (isErotic && !uncensored) return null;
            return (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            );
          })}
        </select>
      </div>

      {/* Sliders Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Creativity Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label className="input-label" style={{ marginBottom: 0 }}>Temperature (Creativity)</label>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', fontWeight: 'bold' }}>{temperature}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.5"
            step="0.05"
            className="input-field"
            style={{ padding: 0, height: '6px', WebkitAppearance: 'none', background: 'rgba(255,255,255,0.1)', cursor: 'pointer' }}
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span>Precise (0.1)</span>
            <span>Unpredictable (1.5)</span>
          </div>
        </div>

        {/* Max length Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="input-label" style={{ marginBottom: 0 }}>Paragraph Length</label>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', fontWeight: 'bold' }}>
              {maxLength === null ? 'Unlimited' : `${maxLength} words`}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <input
              type="checkbox"
              id="enable-word-limit"
              checked={maxLength !== null}
              onChange={(e) => {
                if (e.target.checked) {
                  setMaxLength(150);
                } else {
                  setMaxLength(null);
                }
              }}
              style={{ accentColor: 'var(--accent-purple)', cursor: 'pointer' }}
            />
            <label htmlFor="enable-word-limit" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Limit word length
            </label>
          </div>

          {maxLength !== null && (
            <input
              type="range"
              min="50"
              max="500"
              step="10"
              className="input-field"
              style={{ padding: 0, height: '6px', WebkitAppearance: 'none', background: 'rgba(255,255,255,0.1)', cursor: 'pointer' }}
              value={maxLength}
              onChange={(e) => setMaxLength(parseInt(e.target.value))}
            />
          )}
        </div>
      </div>

      {/* Lore book / context details */}
      <div>
        <button
          type="button"
          onClick={() => setShowLore(!showLore)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            padding: '4px 0',
            fontFamily: 'var(--font-display)'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <Users size={16} style={{ color: 'var(--accent-purple)' }} />
            Lore Book & Characters
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {showLore ? 'Hide' : 'Expand'}
          </span>
        </button>

        {showLore && (
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <textarea
              className="input-field"
              rows={4}
              placeholder="e.g. Jax: cybernetic blade-master, rogue, cold attitude. Neo-Tokyo: neon-drenched city ruled by tech-clans."
              value={customLore}
              onChange={(e) => setCustomLore(e.target.value)}
              style={{ resize: 'vertical', fontSize: '0.85rem', fontFamily: 'var(--font-sans)', lineHeight: '1.4' }}
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BookOpen size={12} />
              This context is injected into the AI generation prompt.
            </span>
          </div>
        )}
      </div>

      {/* Fanfiction / Fandom Section */}
      <div style={{
        borderRadius: 'var(--radius-md)',
        border: isFanfiction ? '1px solid rgba(236, 72, 153, 0.35)' : '1px solid var(--border-color)',
        backgroundColor: isFanfiction ? 'rgba(236, 72, 153, 0.04)' : 'rgba(255,255,255,0.01)',
        padding: '14px 16px',
        transition: 'all var(--transition-normal)'
      }}>
        {/* Toggle Header */}
        <div className="toggle-container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{
              fontWeight: 600,
              fontSize: '0.9rem',
              color: isFanfiction ? 'var(--accent-pink)' : 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Heart size={14} style={{ color: isFanfiction ? 'var(--accent-pink)' : 'var(--text-muted)' }} />
              Fanfiction Mode
              {isFanfiction && <span className="badge badge-purple" style={{ fontSize: '0.6rem' }}>FF ON</span>}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Write in an existing fictional universe.
            </span>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={isFanfiction}
              onChange={(e) => setIsFanfiction(e.target.checked)}
            />
            <span className="slider" style={{ backgroundColor: isFanfiction ? 'var(--accent-pink)' : undefined }}></span>
          </label>
        </div>

        {/* Fandom picker, shown when FF mode is on */}
        {isFanfiction && (
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Text input */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Naruto, Harry Potter, BTS..."
                value={fandom}
                onChange={(e) => setFandom(e.target.value)}
                style={{ fontSize: '0.9rem', paddingRight: '90px' }}
              />
              <button
                type="button"
                onClick={() => setShowFandomPicker(p => !p)}
                style={{
                  position: 'absolute',
                  right: '6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.7rem',
                  padding: '4px 8px',
                  background: 'rgba(236,72,153,0.1)',
                  border: '1px solid rgba(236,72,153,0.3)',
                  borderRadius: '5px',
                  color: 'var(--accent-pink)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-display)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Star size={10} />
                Browse
              </button>
            </div>

            {/* Popular Fandom Quick-Pick Grid */}
            {showFandomPicker && (
              <div style={{
                backgroundColor: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                maxHeight: '240px',
                overflowY: 'auto'
              }}>
                {categories.map(cat => (
                  <div key={cat} style={{ marginBottom: '10px' }}>
                    <div style={{
                      fontSize: '0.65rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--text-muted)',
                      marginBottom: '6px',
                      fontFamily: 'var(--font-display)'
                    }}>
                      {cat}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {POPULAR_FANDOMS.filter(f => f.category === cat).map(f => (
                        <button
                          key={f.name}
                          type="button"
                          onClick={() => {
                            setFandom(f.name);
                            setShowFandomPicker(false);
                          }}
                          style={{
                            fontSize: '0.75rem',
                            padding: '4px 9px',
                            background: fandom === f.name
                              ? 'rgba(236,72,153,0.18)'
                              : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${fandom === f.name ? 'var(--accent-pink)' : 'var(--border-color)'}`,
                            borderRadius: '20px',
                            color: fandom === f.name ? 'var(--accent-pink)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {f.icon} {f.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {fandom.trim() && (
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--accent-pink)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                background: 'rgba(236,72,153,0.06)',
                borderRadius: '6px',
                border: '1px solid rgba(236,72,153,0.2)'
              }}>
                <Heart size={11} />
                <span>Writing in the <strong>{fandom}</strong> universe. The AI will use canon characters & lore.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Prompt Suggestions Library */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 }}>
        <span style={{
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--font-display)'
        }}>
          <Lightbulb size={14} style={{ color: 'var(--accent-amber)' }} />
          Starter Seeds
        </span>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          overflowY: 'auto',
          maxHeight: '180px',
          paddingRight: '4px'
        }}>
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(s)}
              style={{
                textAlign: 'left',
                padding: '8px 10px',
                fontSize: '0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                lineHeight: '1.4',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              {s.length > 85 ? s.substring(0, 85) + '...' : s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
