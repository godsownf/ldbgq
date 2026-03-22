import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Upload, FileJson, CheckCircle, AlertCircle } from "lucide-react";
import { mockCookies } from "../utils/mockData";

export default function SessionBackup() {
  const [backupStatus, setBackupStatus] = useState<"idle" | "success" | "error">("idle");
  const [restoreStatus, setRestoreStatus] = useState<"idle" | "success" | "error">("idle");

  const handleExport = () => {
    try {
      const sessionData = {
        timestamp: new Date().toISOString(),
        cookies: mockCookies,
        userAgent: navigator.userAgent,
      };

      const dataStr = JSON.stringify(sessionData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `session-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setBackupStatus("success");
      setTimeout(() => setBackupStatus("idle"), 3000);
    } catch (error) {
      setBackupStatus("error");
      setTimeout(() => setBackupStatus("idle"), 3000);
    }
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Validate structure
        if (!data.cookies || !Array.isArray(data.cookies)) {
          throw new Error("Invalid backup format");
        }

        console.log("Restored session data:", data);
        setRestoreStatus("success");
        setTimeout(() => setRestoreStatus("idle"), 3000);
      } catch (error) {
        setRestoreStatus("error");
        setTimeout(() => setRestoreStatus("idle"), 3000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Export Section */}
      <Card className="border-slate-200">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <Download className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Export Session</h3>
              <p className="text-sm text-slate-500 mt-1">
                Download your current cookies and session data as an encrypted JSON file.
              </p>
            </div>
            <Button 
              onClick={handleExport} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <FileJson className="w-4 h-4 mr-2" />
              Download Backup
            </Button>
            {backupStatus === "success" && (
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                Backup downloaded successfully
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Restore Section */}
      <Card className="border-slate-200">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="bg-emerald-100 p-4 rounded-full">
              <Upload className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Restore Session</h3>
              <p className="text-sm text-slate-500 mt-1">
                Upload a previous backup file to restore your session and cookies.
              </p>
            </div>
            <div className="w-full">
              <input
                type="file"
                accept=".json"
                onChange={handleRestore}
                className="hidden"
                id="restore-input"
              />
              <label htmlFor="restore-input">
                <Button 
                  variant="outline" 
                  className="w-full cursor-pointer border-slate-300 hover:bg-slate-50"
                  asChild
                >
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Select Backup File
                  </span>
                </Button>
              </label>
            </div>
            {restoreStatus === "success" && (
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                Session restored successfully
              </div>
            )}
            {restoreStatus === "error" && (
              <div className="flex items-center text-sm text-red-600">
                <AlertCircle className="w-4 h-4 mr-1" />
                Invalid backup file
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}