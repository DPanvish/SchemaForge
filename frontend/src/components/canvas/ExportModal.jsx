import { useState } from 'react';
import { X, Copy, Check, FileCode2 } from 'lucide-react';
import { generateMongooseModels } from '../../lib/codeGenerator';

export default function ExportModal({ isOpen, onClose, nodes }) {
  const [copiedFile, setCopiedFile] = useState(null);
  const [activeFile, setActiveFile] = useState(0);

  if (!isOpen) return null;

  // Run the compiler engine
  const generatedFiles = generateMongooseModels(nodes);

  const handleCopy = (filename, code) => {
    navigator.clipboard.writeText(code);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-panel-header">
          <div className="flex items-center gap-2 text-text-main font-mono font-bold">
            <FileCode2 className="text-accent-cyan" size={20} />
            <span>Compiled Mongoose Models</span>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-accent-amber transition">
            <X size={20} />
          </button>
        </div>

        {generatedFiles.length === 0 ? (
          <div className="p-12 text-center text-text-muted font-mono">
            No tables found on the canvas to compile.
          </div>
        ) : (
          <div className="flex h-[60vh]">
            {/* Left Sidebar: File List */}
            <div className="w-1/4 border-r border-border bg-panel overflow-y-auto p-2">
              {generatedFiles.map((file, index) => (
                <button
                  key={file.filename}
                  onClick={() => setActiveFile(index)}
                  className={`w-full text-left px-3 py-2 rounded font-mono text-sm mb-1 transition-all ${
                    activeFile === index 
                      ? 'bg-panel-hover text-accent-cyan border border-accent-cyan/30 shadow-glow' 
                      : 'text-text-muted hover:bg-panel-hover hover:text-text-main'
                  }`}
                >
                  {file.filename}
                </button>
              ))}
            </div>

            {/* Right Side: Code Viewer */}
            <div className="w-3/4 bg-[#0E0E0E] relative flex flex-col">
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => handleCopy(generatedFiles[activeFile].filename, generatedFiles[activeFile].code)}
                  className="flex items-center gap-2 bg-panel hover:bg-panel-hover border border-border px-3 py-1.5 rounded text-xs font-mono text-text-main transition"
                >
                  {copiedFile === generatedFiles[activeFile].filename ? (
                    <><Check size={14} className="text-[#4CAF50]"/> Copied!</>
                  ) : (
                    <><Copy size={14} className="text-text-muted"/> Copy Code</>
                  )}
                </button>
              </div>
              <pre className="p-6 text-sm font-mono text-[#A8FFB2] overflow-auto h-full">
                <code>{generatedFiles[activeFile].code}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}