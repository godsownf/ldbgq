import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Search, Cookie as CookieIcon } from "lucide-react";
import { mockCookies } from "../utils/mockData";
import { Cookie } from "../types";

export default function CookieManager() {
  const [cookies, setCookies] = useState<Cookie[]>(mockCookies);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCookies = cookies.filter(
    (cookie) =>
      cookie.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cookie.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setCookies(cookies.filter((c) => c.id !== id));
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to delete all cookies? This will log you out of sites.")) {
      setCookies([]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search cookies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <Button
          variant="destructive"
          onClick={handleClearAll}
          disabled={cookies.length === 0}
          className="w-full sm:w-auto"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All
        </Button>
      </div>

      {/* Cookie List */}
      <div className="border rounded-lg divide-y bg-white overflow-hidden">
        {filteredCookies.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CookieIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No cookies found</p>
          </div>
        ) : (
          filteredCookies.map((cookie) => (
            <div
              key={cookie.id}
              className="p-4 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4 group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-900 truncate">
                    {cookie.name}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                    {cookie.domain}
                  </span>
                </div>
                <p className="text-sm text-slate-500 font-mono truncate">
                  {cookie.value}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                  <span>Expires: {cookie.expiry}</span>
                  <span>•</span>
                  <span className={cookie.secure ? "text-green-600" : "text-amber-600"}>
                    {cookie.secure ? "Secure" : "Non-Secure"}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(cookie.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="text-sm text-slate-500 text-center">
        Showing {filteredCookies.length} of {cookies.length} cookies
      </div>
    </div>
  );
}