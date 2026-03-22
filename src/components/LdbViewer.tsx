import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Search, ChevronDown, ChevronRight, Copy, Check, Code } from "lucide-react";
import { LdbEntry } from "../types";

interface LdbViewerProps {
  entries: LdbEntry[];
}

export default function LdbViewer({ entries }: LdbViewerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showHex, setShowHex] = useState(false);

  const filteredEntries = entries.filter(entry =>
    entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.rawHex.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (entries.length === 0) {
    return (
      <div className="p-12 text-center text-zinc-500">
        <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No data loaded. Upload an .ldb file to begin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Search content or hex..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-zinc-950 border-zinc-800 text-zinc-100 focus-visible:ring-emerald-500"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={showHex}
              onChange={(e) => setShowHex(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500"
            />
            Show Raw Hex
          </label>
          <div className="text-xs text-zinc-500 font-mono">
            {filteredEntries.length} / {entries.length}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-500 uppercase bg-zinc-950 sticky top-0">
            <tr>
              <th className="px-4 py-3 w-12"></th>
              <th className="px-4 py-3 w-32">Offset</th>
              <th className="px-4 py-3 w-24">Type</th>
              <th className="px-4 py-3">Decoded Content</th>
              {showHex && <th className="px-4 py-3 w-48">Raw Hex</th>}
              <th className="px-4 py-3 w-20 text-right">Size</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filteredEntries.map((entry) => (
              <>
                <tr 
                  key={entry.id}
                  className="hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                  onClick={() => toggleRow(entry.id)}
                >
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-zinc-100">
                      {expandedRows.has(entry.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-zinc-500 font-mono text-xs">
                      0x{entry.offset.toString(16).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`
                      inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide
                      ${entry.type === 'JSON' ? 'bg-amber-500/10 text-amber-500' : 
                        entry.type === 'URL' ? 'bg-blue-500/10 text-blue-500' :
                        entry.type === 'Number' ? 'bg-purple-500/10 text-purple-500' :
                        'bg-zinc-700/30 text-zinc-400'}
                    `}>
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-zinc-300 font-mono truncate block max-w-lg">
                      {entry.content}
                    </span>
                  </td>
                  {showHex && (
                    <td className="px-4 py-3">
                      <span className="text-zinc-600 font-mono text-xs truncate block">
                        {entry.rawHex}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3 text-right text-zinc-500 font-mono text-xs">
                    {entry.size}
                  </td>
                </tr>
                
                {expandedRows.has(entry.id) && (
                  <tr className="bg-zinc-900/50">
                    <td colSpan={showHex ? 6 : 5} className="px-4 py-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-zinc-500 uppercase tracking-wider">Full Content</span>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 text-xs text-zinc-400 hover:text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(entry.content, entry.id);
                              }}
                            >
                              {copiedId === entry.id ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                              Copy Text
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 text-xs text-zinc-400 hover:text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(entry.rawHex, entry.id + '-hex');
                              }}
                            >
                              <Code className="w-3 h-3 mr-1" />
                              Copy Hex
                            </Button>
                          </div>
                        </div>
                        
                        {/* Decoded View */}
                        <div className="bg-zinc-950 border border-zinc-800 rounded p-4 overflow-x-auto">
                          <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap break-all">
                            {entry.content}
                          </pre>
                        </div>

                        {/* Raw Hex View */}
                        <div className="bg-zinc-950 border border-zinc-800 rounded p-4 overflow-x-auto">
                          <div className="text-[10px] text-zinc-600 mb-2 uppercase">Raw Hex Dump</div>
                          <pre className="text-xs text-emerald-600/80 font-mono whitespace-pre-wrap break-all">
                            {entry.rawHex}
                          </pre>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {filteredEntries.length === 0 && searchTerm && (
        <div className="p-8 text-center text-zinc-500 text-sm">
          No entries match "{searchTerm}"
        </div>
      )}
    </div>
  );
}