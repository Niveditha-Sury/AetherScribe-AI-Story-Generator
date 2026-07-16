import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import type { Story } from './components/Sidebar';
import { ConfigPanel } from './components/ConfigPanel';
import { StoryCanvas } from './components/StoryCanvas';
import { SettingsModal } from './components/SettingsModal';
import { generateStorySegment, rewriteParagraphSegment } from './services/ai';
import type { AISettings } from './services/ai';
import { ShieldAlert, Check } from 'lucide-react';
import './App.css';

const DEFAULT_SETTINGS: AISettings = {
  provider: 'demo',
  apiKey: '',
  endpoint: '',
  model: 'Demo Engine',
};

function App() {
  // AI Settings
  const [aiSettings, setAiSettings] = useState<AISettings>(() => {
    const stored = localStorage.getItem('aetherscribe_settings');
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  });

  // Stories Library
  const [stories, setStories] = useState<Story[]>(() => {
    const stored = localStorage.getItem('aetherscribe_stories');
    return stored ? JSON.parse(stored) : [];
  });

  const [activeStoryId, setActiveStoryId] = useState<string | null>(() => {
    const stored = localStorage.getItem('aetherscribe_active_id');
    return stored || null;
  });

  // Story configuration parameters
  const [genre, setGenre] = useState('fantasy');
  const [tone, setTone] = useState('adventurous');
  const [uncensored, setUncensored] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxLength, setMaxLength] = useState<number | null>(150);
  const [customLore, setCustomLore] = useState('');
  const [fandom, setFandom] = useState('');
  const [isFanfiction, setIsFanfiction] = useState(false);

  // Rewriting States
  const [rewritingIndex, setRewritingIndex] = useState<number | null>(null);
  const [rewritingText, setRewritingText] = useState('');
  const [originalParagraphBackup, setOriginalParagraphBackup] = useState('');
  
  // Prompt and generation buffers
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingText, setGeneratingText] = useState('');

  // Modals status
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('aetherscribe_settings', JSON.stringify(aiSettings));
  }, [aiSettings]);

  useEffect(() => {
    localStorage.setItem('aetherscribe_stories', JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    if (activeStoryId) {
      localStorage.setItem('aetherscribe_active_id', activeStoryId);
    } else {
      localStorage.removeItem('aetherscribe_active_id');
    }
  }, [activeStoryId]);

  // Pull parameter settings when selected story changes
  const activeStory = stories.find(s => s.id === activeStoryId) || null;
  useEffect(() => {
    if (activeStory) {
      setGenre(activeStory.genre);
      setTone(activeStory.tone);
      setUncensored(activeStory.uncensored);
      setCustomLore(activeStory.customLore || '');
      setFandom(activeStory.fandom || '');
      setIsFanfiction(activeStory.isFanfiction || false);
    }
  }, [activeStoryId]);

  // Sync parameter adjustments back into active story metadata
  const handleUpdateActiveParams = (key: string, value: any) => {
    if (!activeStory) return;
    const updated = { ...activeStory, [key]: value };
    handleUpdateStory(updated);
  };

  // Create a new empty story
  const handleNewStory = () => {
    const num = stories.length + 1;
    const newStory: Story = {
      id: crypto.randomUUID(),
      title: `Narrative Chapter ${num}`,
      genre: 'fantasy',
      tone: 'adventurous',
      uncensored: false,
      prompt: '',
      paragraphs: [],
      customLore: '',
      fandom: '',
      isFanfiction: false,
      createdAt: Date.now()
    };
    setStories([newStory, ...stories]);
    setActiveStoryId(newStory.id);
  };

  // Delete target story
  const handleDeleteStory = (id: string) => {
    const updated = stories.filter(s => s.id !== id);
    setStories(updated);
    if (activeStoryId === id) {
      setActiveStoryId(updated.length > 0 ? updated[0].id : null);
    }
  };

  // Select target story
  const handleSelectStory = (id: string) => {
    setActiveStoryId(id);
  };

  // Update specific story inside story array
  const handleUpdateStory = (updatedStory: Story) => {
    setStories(stories.map(s => s.id === updatedStory.id ? updatedStory : s));
  };

  // Generate next narrative paragraph
  const handleGenerateNext = async (promptOverride?: string) => {
    if (!activeStory || isGenerating) return;
    
    const activePrompt = promptOverride !== undefined ? promptOverride : prompt;
    if (!activePrompt.trim()) return;

    setIsGenerating(true);
    setGeneratingText('');
    setPrompt(''); // Clear field immediately

    // Build history for context feeding
    const historyContext = activeStory.paragraphs.slice(-4); // Limit history window for performance

    try {
      // Call service
      const rawParagraph = await generateStorySegment(aiSettings, {
        prompt: activePrompt,
        genre: activeStory.genre,
        tone: activeStory.tone,
        uncensored: activeStory.uncensored,
        temperature,
        maxLength,
        customLore: activeStory.customLore,
        fandom: activeStory.fandom,
        isFanfiction: activeStory.isFanfiction,
        history: historyContext
      });

      // Typwriter simulation stream effect
      const words = rawParagraph.split(' ');
      let index = 0;
      let currentOutput = '';

      const timer = setInterval(() => {
        if (index < words.length) {
          currentOutput += (index === 0 ? '' : ' ') + words[index];
          setGeneratingText(currentOutput);
          index++;
        } else {
          clearInterval(timer);
          
          // Save result once typed out
          const updatedParagraphs = [...activeStory.paragraphs, rawParagraph];
          const updatedStory = {
            ...activeStory,
            paragraphs: updatedParagraphs,
            // Capture initial prompt if story was empty
            prompt: activeStory.paragraphs.length === 0 ? activePrompt : activeStory.prompt
          };
          handleUpdateStory(updatedStory);
          
          setIsGenerating(false);
          setGeneratingText('');
        }
      }, 50); // Speed of word output: 50ms per word

    } catch (err: any) {
      alert(err?.message || "Generation error encountered");
      setIsGenerating(false);
      setGeneratingText('');
    }
  };

  // Rewrite paragraph handler
  const handleRewriteParagraph = async (index: number, instructions: string) => {
    if (!activeStory || rewritingIndex !== null || isGenerating) return;

    const paragraphToRewrite = activeStory.paragraphs[index];
    if (!paragraphToRewrite) return;

    setRewritingIndex(index);
    setRewritingText('');
    setOriginalParagraphBackup(paragraphToRewrite);

    const historyBefore = activeStory.paragraphs.slice(0, index);

    try {
      const rewrittenContent = await rewriteParagraphSegment(aiSettings, {
        originalText: paragraphToRewrite,
        instructions,
        genre: activeStory.genre,
        tone: activeStory.tone,
        uncensored: activeStory.uncensored,
        temperature,
        maxLength,
        customLore: activeStory.customLore,
        historyBefore
      });

      const words = rewrittenContent.split(' ');
      let wordIdx = 0;
      let currentOutput = '';

      const timer = setInterval(() => {
        if (wordIdx < words.length) {
          currentOutput += (wordIdx === 0 ? '' : ' ') + words[wordIdx];
          setRewritingText(currentOutput);
          wordIdx++;
        } else {
          clearInterval(timer);
          const updatedParagraphs = [...activeStory.paragraphs];
          updatedParagraphs[index] = rewrittenContent;
          handleUpdateStory({
            ...activeStory,
            paragraphs: updatedParagraphs
          });
          setRewritingText('');
        }
      }, 50);

    } catch (err: any) {
      alert(err?.message || "Rewrite error encountered");
      setRewritingIndex(null);
      setRewritingText('');
    }
  };

  const handleRestoreOriginalParagraph = () => {
    if (!activeStory || rewritingIndex === null) return;
    const updatedParagraphs = [...activeStory.paragraphs];
    updatedParagraphs[rewritingIndex] = originalParagraphBackup;
    handleUpdateStory({
      ...activeStory,
      paragraphs: updatedParagraphs
    });
    setRewritingIndex(null);
    setOriginalParagraphBackup('');
  };

  const handleAcceptRewrite = () => {
    setRewritingIndex(null);
    setOriginalParagraphBackup('');
  };

  // Intercept uncensored toggles to verify age compliance
  const handleUncensoredSetting = (checked: boolean) => {
    if (checked) {
      setDisclaimerOpen(true);
    } else {
      handleUpdateActiveParams('uncensored', false);
      setUncensored(false);
    }
  };

  const confirmUncensored = () => {
    handleUpdateActiveParams('uncensored', true);
    setUncensored(true);
    setDisclaimerOpen(false);
  };

  return (
    <div className="app-container">
      {/* Background ambient glows */}
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      {/* Left Sidebar: Stories library & settings action */}
      <Sidebar
        stories={stories}
        activeStoryId={activeStoryId}
        onSelectStory={handleSelectStory}
        onNewStory={handleNewStory}
        onDeleteStory={handleDeleteStory}
        onOpenSettings={() => setSettingsOpen(true)}
        activeStory={activeStory}
        aiSettings={aiSettings}
      />

      {/* Main Workspace split */}
      <main style={{
        flexGrow: 1,
        display: 'flex',
        overflow: 'hidden',
        height: '100%'
      }}>
        {activeStory ? (
          <>
            {/* Center Story Canvas */}
            <StoryCanvas
              activeStory={activeStory}
              onUpdateStory={handleUpdateStory}
              onGenerateNext={handleGenerateNext}
              isGenerating={isGenerating}
              generatingText={generatingText}
              prompt={prompt}
              setPrompt={setPrompt}
              onRewriteParagraph={handleRewriteParagraph}
              rewritingIndex={rewritingIndex}
              rewritingText={rewritingText}
              onRestoreOriginal={handleRestoreOriginalParagraph}
              onAcceptRewrite={handleAcceptRewrite}
            />

            {/* Right Configuration Bar */}
            <ConfigPanel
              genre={genre}
              setGenre={(val) => { setGenre(val); handleUpdateActiveParams('genre', val); }}
              tone={tone}
              setTone={(val) => { setTone(val); handleUpdateActiveParams('tone', val); }}
              uncensored={uncensored}
              setUncensored={handleUncensoredSetting}
              temperature={temperature}
              setTemperature={setTemperature}
              maxLength={maxLength}
              setMaxLength={setMaxLength}
              customLore={customLore}
              setCustomLore={(val) => { setCustomLore(val); handleUpdateActiveParams('customLore', val); }}
              fandom={fandom}
              setFandom={(val) => { setFandom(val); handleUpdateActiveParams('fandom', val); }}
              isFanfiction={isFanfiction}
              setIsFanfiction={(val) => { setIsFanfiction(val); handleUpdateActiveParams('isFanfiction', val); }}
              onSelectPrompt={(p) => setPrompt(p)}
            />
          </>
        ) : (
          /* Empty State View */
          <StoryCanvas
            activeStory={null}
            onUpdateStory={() => {}}
            onGenerateNext={() => {}}
            isGenerating={false}
            generatingText=""
            prompt=""
            setPrompt={() => {}}
            onRewriteParagraph={async () => {}}
            rewritingIndex={null}
            rewritingText=""
            onRestoreOriginal={() => {}}
            onAcceptRewrite={() => {}}
          />
        )}
      </main>

      {/* API Configuration Modal */}
      <SettingsModal
        settings={aiSettings}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={(newSettings) => setAiSettings(newSettings)}
      />

      {/* Age verification / Disclaimer popup */}
      {disclaimerOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ border: '1px solid rgba(239, 68, 68, 0.4)', maxWidth: '460px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '20px' }}>
              <ShieldAlert size={28} style={{ color: 'var(--accent-red)', flexShrink: 0 }} />
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Age Verification & Warning
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  You are attempting to activate **Uncensored Mode**. This removes the AI narrative content filters, allowing potential themes of violence, dark behaviors, explicit romance, and adult subjects.
                </p>
              </div>
            </div>

            <div style={{
              backgroundColor: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-color)',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginBottom: '20px',
              lineHeight: '1.4'
            }}>
              By clicking agree, you confirm that you are at least **18 years of age** and consent to viewing unfiltered, mature creative content.
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => { setDisclaimerOpen(false); setUncensored(false); }}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Go Back
              </button>
              <button 
                className="btn btn-danger" 
                onClick={confirmUncensored}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <Check size={14} /> I am 18+ / Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
