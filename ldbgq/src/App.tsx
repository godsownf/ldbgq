import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, FileCode } from "lucide-react";
import LdbUploader from "../components/LdbUploader";
import LdbViewer from "../components/LdbViewer";
import { LdbEntry } from "../types";

function App() {
  const [entries, setEntries] = useState<LdbEntry[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);

  const handleFileLoaded = (data: LdbEntry[], name: string, size: number) => {
    setEntries(data);
    setFileName(name);
    setFileSize(size);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-12 font-mono">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-50 flex items-center gap-3">
              <Database className="w-8 h-8 text-emerald-500" />
              LDB Inspector
            </h1>
            <p className="text-zinc-400 mt-2">
              Zero-Loss Text Island Scanner & Hybrid Decoder
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded text-xs text-zinc-500">
              v3.0.0 • Perfect Decode
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="bg-zinc-900 border border-zinc-800 p-1 w-full md:w-auto">
            <TabsTrigger value="upload" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400">
              <FileCode className="w-4 h-4 mr-2" />
              Load File
            </TabsTrigger>
            <TabsTrigger value="view" disabled={entries.length === 0} className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400 disabled:opacity-50">
              <Database className="w-4 h-4 mr-2" />
              Data View ({entries.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card className="bg-zinc-900 border-zinc-800 shadow-none">
              <CardHeader>
                <CardTitle className="text-zinc-100">Import .ldb File</CardTitle>
                <CardDescription className="text-zinc-400">
                  This tool uses a "Text Island" algorithm to extract every readable string. 
                  It automatically switches between UTF-8 and Latin-1 decoding to ensure no data is lost.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LdbUploader onFileLoaded={handleFileLoaded} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="view">
            <div className="space-y-4">
              {fileName && (
                <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-500/10 p-2 rounded">
                      <FileCode className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <div className="font-medium text-zinc-200">{fileName}</div>
                      <div className="text-xs text-zinc-500">
                        {(fileSize / 1024).toFixed(2)} KB • {entries.length} strings extracted
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Card className="bg-zinc-900 border-zinc-800 shadow-none min-h-[500px]">
                <CardContent className="p-0">
                  <LdbViewer entries={entries} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;