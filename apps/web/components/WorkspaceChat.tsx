"use client";

import { useState, useRef, useEffect } from "react";
import { agents } from "@/lib/data";
import { getChatMemory } from "@/lib/chatMemory";
import type { ChatSession } from "@/lib/chatMemory";
import ChatHistory from "@/components/ChatHistory";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  agent?: string;
  timestamp: Date;
}

const EXAMPLE_QUERIES = [
  "Run pvlib analysis for Mumbai (19.07N, 72.87E) with a 500 kWp ground-mount system",
  "Generate IEC 61215 test protocol for a 400W bifacial module",
  "Calculate LCOE for a 1 MW rooftop solar project in Rajasthan",
  "Perform Weibull analysis for module failure rate prediction",
  "What is the P90 energy yield for a 5 MW project in Tamil Nadu?",
  "Run shading analysis for a ground-mount array with 25 tilt",
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const WELCOME_MSG: Message = {
  id: "welcome",
  role: "assistant",
  content: "Namaste! I am **Surya-Orchestrator**. I route your PV engineering queries to the appropriate domain agent.\n\nI can help you with:\n- **Energy yield** modeling with pvlib (Phala-Agent)\n- **Testing protocols** for IEC 61215/61730 (Pariksha-Agent)\n- **Financial modeling** - LCOE, IRR, NPV (Nivesha-Agent)\n- **Material analysis** for silicon, perovskite (Dravya-Agent)\n- **Plant design** - layout, shading, string sizing (Vinyasa-Agent)\n- And much more across all 10 skill packs!\n\nWhat PV challenge can I help you solve today?",
  agent: "Surya-Orchestrator",
  timestamp: new Date(),
};

export default function WorkspaceChat() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("auto");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const memory = typeof window !== "undefined" ? getChatMemory() : null;

  useEffect(() => {
    if (!memory) return;
    const sessions = memory.listSessions();
    if (sessions.length > 0) {
      const latest = sessions[0];
      setActiveSessionId(latest.id);
      if (latest.messages.length > 0) {
        setMessages([WELCOME_MSG, ...latest.messages.map((m) => ({ id: m.id, role: m.role, content: m.content, agent: m.agent, timestamp: new Date(m.timestamp) }))]);
      }
    } else {
      const session = memory.createSession();
      setActiveSessionId(session.id);
    }
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleNewChat = () => {
    if (!memory) return;
    const session = memory.createSession();
    setActiveSessionId(session.id);
    setMessages([WELCOME_MSG]);
  };

  const handleSelectSession = (session: ChatSession) => {
    setActiveSessionId(session.id);
    setMessages([WELCOME_MSG, ...session.messages.map((m) => ({ id: m.id, role: m.role, content: m.content, agent: m.agent, timestamp: new Date(m.timestamp) }))]);
  };

  const routeToAgent = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes("pvlib") || q.includes("energy yield") || q.includes("p50") || q.includes("p90")) return "Phala-Agent";
    if (q.includes("weather") || q.includes("irradiance") || q.includes("ghi")) return "Megha-Agent";
    if (q.includes("iec") || q.includes("test") || q.includes("qualification")) return "Pariksha-Agent";
    if (q.includes("lcoe") || q.includes("irr") || q.includes("npv") || q.includes("finance")) return "Nivesha-Agent";
    if (q.includes("material") || q.includes("silicon") || q.includes("perovskite")) return "Dravya-Agent";
    if (q.includes("fmea") || q.includes("weibull") || q.includes("reliability")) return "Nityata-Agent";
    if (q.includes("layout") || q.includes("shading") || q.includes("string")) return "Vinyasa-Agent";
    if (q.includes("grid") || q.includes("inverter") || q.includes("bess")) return "Vidyut-Agent";
    if (q.includes("bom") || q.includes("module construction")) return "Kosha-Agent";
    if (q.includes("iv curve") || q.includes("efficiency") || q.includes("diode")) return "Shakti-Agent";
    return "Surya-Orchestrator";
  };

  const generateResponse = (query: string, agent: string): string => {
    return `**${agent}** received your query.\n\nRouting: Surya-Orchestrator -> ${agent}\n\nTo execute with real computation, configure your API keys in Settings. This workspace is a preview of the full SuryaPrajna capability.`;
  };

  const handleSubmit = async (query?: string) => {
    const q = query ?? input.trim();
    if (!q || isLoading) return;
    setInput("");
    const userMessage: Message = { id: `user-${Date.now()}`, role: "user", content: q, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    if (memory && activeSessionId) { memory.addMessage(activeSessionId, { role: "user", content: q }); }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));
    const routedAgent = selectedAgent === "auto" ? routeToAgent(q) : selectedAgent;
    const response = generateResponse(q, routedAgent);
    const assistantMessage: Message = { id: `assistant-${Date.now()}`, role: "assistant", content: response, agent: routedAgent, timestamp: new Date() };
    setMessages((prev) => [...prev, assistantMessage]);
    if (memory && activeSessionId) { memory.addMessage(activeSessionId, { role: "assistant", content: response, agent: routedAgent }); }
    setIsLoading(false);
  };

  const renderContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold text-white">{line.slice(2, -2)}</p>;
      if (line.startsWith("- ")) return <li key={i} className="ml-4 text-gray-300">{line.slice(2).replace(/\*\*(.*?)\*\*/g, (_, t) => t)}</li>;
      if (line.startsWith("#")) return null;
      if (line.trim() === "") return <br key={i} />;
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return <p key={i} className="text-gray-300 leading-relaxed">{parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{part}</strong> : part)}</p>;
    });
  };

  return (
    <div className="flex flex-col h-[600px] card overflow-hidden relative">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60">
        <div className="flex items-center gap-2">
          <span className="text-lg">☀️</span>
          <span className="font-medium text-sm text-gray-300">SuryaPrajna Workspace</span>
          <span className="badge-available text-xs">Live Preview</span>
        </div>
        <div className="flex items-center gap-2">
          <ChatHistory onSelectSession={handleSelectSession} onNewChat={handleNewChat} activeSessionId={activeSessionId || undefined} />
          <label className="text-xs text-gray-500">Agent:</label>
          <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} className="text-xs bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-300 focus:outline-none">
            <option value="auto">Auto-route</option>
            {agents.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
          </select>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-xl px-4 py-3 ${msg.role === "user" ? "bg-amber-500/15 border border-amber-500/20 text-gray-200" : "bg-gray-800/60 border border-gray-700/40"}`}>
              {msg.role === "assistant" && msg.agent && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700/40">
                  <span className="text-xs font-mono text-amber-400">{msg.agent}</span>
                  <span className="text-xs text-gray-600">{formatTime(msg.timestamp)}</span>
                </div>
              )}
              <div className="text-sm space-y-1">{msg.role === "assistant" ? renderContent(msg.content) : msg.content}</div>
              {msg.role === "user" && <div className="text-xs text-gray-600 mt-1 text-right">{formatTime(msg.timestamp)}</div>}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800/60 border border-gray-700/40 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="animate-pulse">Routing to agent</span>
                <span className="flex gap-1">{[0,1,2].map((i) => <span key={i} className="w-1 h-1 rounded-full bg-amber-500 animate-bounce" style={{animationDelay:`${i*0.15}s`}} />)}</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="px-4 py-2 border-t border-gray-800/40 flex gap-2 overflow-x-auto">
        {EXAMPLE_QUERIES.slice(0, 3).map((q) => <button key={q} onClick={() => handleSubmit(q)} className="text-xs text-gray-500 hover:text-amber-400 whitespace-nowrap px-2 py-1 rounded hover:bg-gray-800/60 transition-colors flex-shrink-0">{q.slice(0, 45)}...</button>)}
      </div>
      <div className="px-4 py-3 border-t border-gray-800/60">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a PV engineering question..." className="input flex-1 text-sm" disabled={isLoading} />
          <button type="submit" disabled={!input.trim() || isLoading} className="btn-primary text-sm px-4 disabled:opacity-50 disabled:cursor-not-allowed">Send</button>
        </form>
      </div>
    </div>
  );
}
