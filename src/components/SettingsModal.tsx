import React, { useState } from 'react';
import { X, Sliders, ShieldAlert, Check, Zap, ExternalLink } from 'lucide-react';
import type { AISettings } from '../services/ai';

interface SettingsModalProps {
  settings: AISettings;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newSettings: AISettings) => void;
}

// Curated list of uncensored / adult-capable models on OpenRouter
const UNCENSORED_MODELS: { label: string; id: string; description: string; free?: boolean }[] = [
  {
    label: 'Sao10K Llama 3.1 Euryale',
    id: 'sao10k/l3.1-euryale-70b',
    description: 'Best for adult fiction. Uncensored, very high quality creative writing.',
  },
  {
    label: 'Sao10K Llama 3.3 Euryale',
    id: 'sao10k/l3.3-euryale-70b',
    description: 'Latest Euryale — top choice for explicit & romance writing.',
  },
  {
    label: 'Midnight Rose (RP)',
    id: 'sophosympatheia/midnight-rose-70b',
    description: 'Roleplay & explicit fiction specialist. No content filters.',
  },
  {
    label: 'MythoMax L2 13B',
    id: 'gryphe/mythomax-l2-13b',
    description: 'Classic uncensored creative writing model. Fast, reliable.',
    free: true,
  },
  {
    label: 'Dolphin Mixtral 8x7B',
    id: 'cognitivecomputations/dolphin-mixtral-8x7b',
    description: 'Completely uncensored dolphin finetune on Mixtral. Very capable.',
  },
  {
    label: 'Noromaid 20B (RP)',
    id: 'neversleep/noromaid-20b',
    description: 'Explicit roleplay & storytelling. No restrictions.',
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  isOpen,
  onClose,
  onSave,
}) => {
  const [provider, setProvider] = useState<AISettings['provider']>(settings.provider);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [endpoint, setEndpoint] = useState(settings.endpoint);
  const [model, setModel] = useState(settings.model);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      provider,
      apiKey,
      endpoint: endpoint.trim(),
      model: model.trim(),
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  const getProviderInfo = () => {
    switch (provider) {
      case 'demo':
        return "Demo Mode runs completely client-side. No API keys or external servers required. Ideal for testing aesthetics.";
      case 'ollama':
        return "Connect to a locally running Ollama instance. Default endpoint is http://localhost:11434. Recommended models for uncensored output: dolphin-llama3, wizardlm-uncensored, or dolphin-mixtral.";
      case 'openrouter':
        return "Access top uncensored open-weight models via OpenRouter. Requires a free API key from openrouter.ai. Select from our curated NSFW-capable models below — Euryale 70B and MythoMax L2 are top picks for explicit creative writing.";
      case 'custom':
        return "Connect to any custom OpenAI-compatible API endpoint. Enter the base URL and API key.";
      default:
        return "";
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ border: '1px solid var(--border-color-glow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.6rem', color: 'var(--text-primary)' }}>
            <Sliders size={22} style={{ color: 'var(--accent-purple)' }} />
            AI Integration Settings
          </h2>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-muted)', 
              cursor: 'pointer',
              transition: 'color var(--transition-fast)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Provider Selection */}
          <div>
            <label className="input-label">API Provider</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {(['demo', 'ollama', 'openrouter', 'custom'] as const).map((prov) => (
                <button
                  key={prov}
                  type="button"
                  onClick={() => {
                    setProvider(prov);
                    if (prov === 'ollama') {
                      setEndpoint('http://localhost:11434');
                      setModel('dolphin-llama3');
                    } else if (prov === 'openrouter') {
                      setEndpoint('https://openrouter.ai/api/v1');
                      setModel('sao10k/l3.1-euryale-70b');
                    } else if (prov === 'demo') {
                      setEndpoint('');
                      setModel('Demo Engine');
                    } else {
                      setEndpoint('');
                      setModel('');
                    }
                  }}
                  className={`btn ${provider === prov ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    textTransform: 'capitalize',
                    padding: '8px',
                    fontSize: '0.85rem'
                  }}
                >
                  {prov}
                </button>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.03)', 
            borderLeft: '3px solid var(--accent-purple)', 
            padding: '12px 16px', 
            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)'
          }}>
            {getProviderInfo()}
          </div>

          {/* Endpoint (Optional for Demo) */}
          {provider !== 'demo' && (
            <div>
              <label className="input-label">API Endpoint URL</label>
              <input
                type="text"
                className="input-field"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder={provider === 'ollama' ? 'http://localhost:11434' : 'https://api.openai.com/v1'}
                required
              />
            </div>
          )}

          {/* API Key (for OpenRouter and Custom) */}
          {(provider === 'openrouter' || provider === 'custom') && (
            <div>
              <label className="input-label">API Key</label>
              <input
                type="password"
                className="input-field"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key..."
                required
              />
            </div>
          )}

          {/* Model Name (Optional for Demo) */}
          {provider !== 'demo' && (
            <div>
              <label className="input-label">Model Identifier</label>
              <input
                type="text"
                className="input-field"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={provider === 'ollama' ? 'dolphin-llama3' : 'sao10k/l3.1-euryale-70b'}
                required
              />
            </div>
          )}

          {/* Uncensored Model Quick-Select for OpenRouter */}
          {provider === 'openrouter' && (
            <div>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={13} style={{ color: 'var(--accent-amber)' }} />
                Recommended Uncensored Models
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '260px', overflowY: 'auto', paddingRight: '4px' }}>
                {UNCENSORED_MODELS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setModel(m.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '10px 12px',
                      background: model === m.id
                        ? 'rgba(139, 92, 246, 0.12)'
                        : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${model === m.id ? 'var(--accent-purple)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'all var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      if (model !== m.id) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (model !== m.id) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                      }
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: model === m.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                          {m.label}
                        </span>
                        {m.free && (
                          <span style={{
                            fontSize: '0.65rem',
                            padding: '1px 6px',
                            background: 'rgba(20,184,166,0.15)',
                            border: '1px solid rgba(20,184,166,0.3)',
                            borderRadius: '4px',
                            color: 'var(--accent-teal)',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                          }}>
                            FREE
                          </span>
                        )}
                        <span style={{
                          fontSize: '0.65rem',
                          padding: '1px 6px',
                          background: 'rgba(239,68,68,0.12)',
                          border: '1px solid rgba(239,68,68,0.25)',
                          borderRadius: '4px',
                          color: '#fca5a5',
                          fontWeight: 700,
                          letterSpacing: '0.05em',
                        }}>
                          NSFW ✓
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>{m.description}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px', fontFamily: 'var(--font-mono)', opacity: 0.7 }}>{m.id}</div>
                    </div>
                    {model === m.id && <Check size={14} style={{ color: 'var(--accent-purple)', flexShrink: 0, marginTop: '2px' }} />}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ExternalLink size={11} />
                <span>Get your API key at <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-purple)' }}>openrouter.ai/keys</a></span>
              </div>
            </div>
          )}

          {/* Mature Content Warning note */}
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            backgroundColor: 'rgba(239, 68, 68, 0.06)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px'
          }}>
            <ShieldAlert size={20} style={{ color: 'var(--accent-red)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <strong>Uncensored Generation Warning:</strong> Ensure your selected model supports unrestricted generation. OpenRouter and Local Ollama models without strict safety tuning are highly recommended for uncensored creative writing.
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saveSuccess}>
              Cancel
            </button>
            <button 
              type="submit" 
              className={`btn btn-primary`}
              style={saveSuccess ? { background: 'var(--accent-teal)', boxShadow: 'var(--glow-teal)' } : {}}
              disabled={saveSuccess}
            >
              {saveSuccess ? (
                <>
                  <Check size={16} /> Saved!
                </>
              ) : (
                'Save Connection'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
