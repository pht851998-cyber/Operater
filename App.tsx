import React, { useState, useEffect, useCallback } from 'react';
import { generateVideo } from './services/geminiService';
import { AspectRatio, VideoGenerationState } from './types';
import { LoadingOverlay } from './components/LoadingOverlay';
import { VideoPlayer } from './components/VideoPlayer';

// Default prompt provided by user
const DEFAULT_PROMPT = `छोटा सा रंगीन गाँव, मिट्टी के घर, चिड़ियों की आवाज़
कैमरा: ड्रोन शॉट – ऊपर से पूरे गाँव का व्यू, धीरे-धीरे एक छोटी सी सैलून दुकान पर ज़ूम

बैकग्राउंड म्यूज़िक: हल्का, भावनात्मक और प्यारा

नैरेटर (वॉयस ओवर):
“यह कहानी है राजू की… एक गरीब नाई लड़के की, जिसके सपने बहुत बड़े थे।”

एक्शन:
राजू (10-12 साल का, दुबला-पतला, चमकती आँखें) झाड़ू लगा रहा है। उसके पिता खांसते हुए कुर्सी पर बैठे हैं।

पिता (धीमी आवाज़ में):
“राजू बेटा… आज तुम ही दुकान संभाल लेना।”

राजू (मुस्कुराकर):
“चिंता मत करो बाबूजी, सब ठीक हो जाएगा।”`;

const App: React.FC = () => {
  const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>(DEFAULT_PROMPT);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  
  const [genState, setGenState] = useState<VideoGenerationState>({
    status: 'idle',
  });

  // Check for API key on mount
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setApiKeySelected(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Assume success to avoid race condition
      setApiKeySelected(true);
      // Also clear any previous auth errors
      if (genState.error && genState.error.includes("API Key")) {
        setGenState({ status: 'idle' });
      }
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    setGenState({ 
      status: 'generating', 
      progressMessage: 'Preparing to generate...' 
    });

    try {
      const url = await generateVideo(prompt, aspectRatio, (msg) => {
        setGenState(prev => ({ ...prev, progressMessage: msg }));
      });

      setGenState({
        status: 'completed',
        videoUrl: url,
      });
    } catch (err: any) {
        // If error suggests key issues, reset key state
        if (err.message && err.message.includes("API Key")) {
            setApiKeySelected(false);
        }
        setGenState({
            status: 'error',
            error: err.message || "An unknown error occurred",
        });
    }
  }, [prompt, aspectRatio]);

  const handleClosePlayer = () => {
    setGenState({ status: 'idle' });
  };

  if (!apiKeySelected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="max-w-md w-full bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 text-center">
            <div className="mx-auto w-16 h-16 bg-primary-900/30 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-purple-400">
                Veo Director
            </h1>
            <p className="text-gray-400 mb-8">
                To create high-definition videos with Google's Veo model, you need to connect a paid API key from Google AI Studio.
            </p>
            <button
                onClick={handleSelectKey}
                className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-semibold transition-all transform hover:scale-[1.02] shadow-lg shadow-primary-900/50"
            >
                Connect API Key
            </button>
            <p className="mt-6 text-xs text-gray-500">
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-300">
                    Learn more about billing
                </a>
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100 font-sans selection:bg-primary-500/30">
        {/* Header */}
        <header className="border-b border-gray-800 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-40">
            <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold tracking-tight">Veo Director</span>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleSelectKey}
                        className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                        Switch API Key
                    </button>
                    <div className="h-4 w-px bg-gray-700"></div>
                     <span className="text-xs font-mono text-primary-400 bg-primary-900/20 px-2 py-1 rounded">
                        veo-3.1-fast
                    </span>
                </div>
            </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wider">
                            Aspect Ratio
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setAspectRatio('16:9')}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                                    aspectRatio === '16:9' 
                                    ? 'border-primary-500 bg-primary-900/10 text-white shadow-[0_0_15px_rgba(14,165,233,0.3)]' 
                                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                                }`}
                            >
                                <div className="w-8 h-5 border-2 border-current rounded-sm mb-2 opacity-80"></div>
                                <span className="text-xs font-medium">Landscape (16:9)</span>
                            </button>
                            <button
                                onClick={() => setAspectRatio('9:16')}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                                    aspectRatio === '9:16' 
                                    ? 'border-primary-500 bg-primary-900/10 text-white shadow-[0_0_15px_rgba(14,165,233,0.3)]' 
                                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                                }`}
                            >
                                <div className="w-5 h-8 border-2 border-current rounded-sm mb-2 opacity-80"></div>
                                <span className="text-xs font-medium">Portrait (9:16)</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                         <div className="flex justify-between items-center">
                            <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                Story Prompt
                            </label>
                            <span className="text-xs text-gray-500">Be descriptive</span>
                         </div>
                        <div className="relative group">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full h-[400px] bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-sm text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none transition-all placeholder-gray-600 font-mono leading-relaxed"
                                placeholder="Describe your video scene in detail..."
                                disabled={genState.status === 'generating'}
                            />
                            <div className="absolute bottom-3 right-3 text-xs text-gray-600 bg-gray-900/80 px-2 py-1 rounded pointer-events-none">
                                {prompt.length} chars
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || genState.status === 'generating'}
                        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform flex items-center justify-center gap-2 ${
                            !prompt.trim() || genState.status === 'generating'
                            ? 'bg-gray-700 cursor-not-allowed opacity-50'
                            : 'bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 hover:scale-[1.01] hover:shadow-primary-900/40'
                        }`}
                    >
                        {genState.status === 'generating' ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Generating...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                                Generate Video
                            </>
                        )}
                    </button>
                    
                    {genState.status === 'error' && (
                        <div className="p-4 bg-red-900/20 border border-red-800 rounded-xl flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <div className="text-sm text-red-200">
                                <p className="font-semibold mb-1">Generation Failed</p>
                                <p>{genState.error}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Output Section */}
                <div className="lg:col-span-2 relative bg-gray-900 rounded-2xl border border-gray-800 p-1 min-h-[500px] flex flex-col">
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
                    
                    {genState.status === 'generating' && genState.progressMessage && (
                        <LoadingOverlay message={genState.progressMessage} />
                    )}

                    {genState.status === 'completed' && genState.videoUrl ? (
                        <div className="flex-1 flex flex-col p-4 animate-in fade-in duration-500">
                             <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    Generation Complete
                                </h2>
                             </div>
                             <div className="flex-1 flex flex-col justify-center">
                                <VideoPlayer 
                                    videoUrl={genState.videoUrl} 
                                    onClose={handleClosePlayer}
                                />
                             </div>
                        </div>
                    ) : genState.status === 'idle' || genState.status === 'error' ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center border-2 border-dashed border-gray-800 rounded-xl m-4 bg-gray-800/30">
                            <div className="w-20 h-20 mb-6 rounded-full bg-gray-800 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-300 mb-2">Ready to Direct</h3>
                            <p className="max-w-md mx-auto mb-6">
                                Enter your script on the left, choose your aspect ratio, and let Veo bring your story to life.
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                <span className="px-3 py-1 bg-gray-800 rounded-full text-xs border border-gray-700">1080p Resolution</span>
                                <span className="px-3 py-1 bg-gray-800 rounded-full text-xs border border-gray-700">60 FPS</span>
                                <span className="px-3 py-1 bg-gray-800 rounded-full text-xs border border-gray-700">Cinema Grade</span>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </main>
    </div>
  );
};

export default App;