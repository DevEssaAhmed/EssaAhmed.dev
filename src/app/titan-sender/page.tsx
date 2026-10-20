"use client";

import { useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, CircleAlert, FileUp, Mail, Paperclip, Play, ShieldCheck, Square, Trash2 } from "lucide-react";

const MAX_FILE_BYTES = 15 * 1024 * 1024;
type LogEntry = { index: number; status: "sent" | "failed" | "stopped"; detail: string; time: string };

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function TitanSenderPage() {
  const [accessKey, setAccessKey] = useState("");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("Titan SMTP delivery test");
  const [text, setText] = useState("This is a test email sent using Titan SMTP.");
  const [file, setFile] = useState<File | null>(null);
  const [count, setCount] = useState(3);
  const [delaySeconds, setDelaySeconds] = useState(3);
  const [running, setRunning] = useState(false);
  const [stopRequested, setStopRequested] = useState(false);
  const [status, setStatus] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [confirmRun, setConfirmRun] = useState(false);
  const stopRef = useRef(false);

  async function api(path: string, body: unknown) {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-sender-key": accessKey },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
    return data;
  }

  async function startRun() {
    if (!accessKey.trim()) return setStatus("Enter the sender access key configured in Vercel.");
    if (!to.trim() || !subject.trim()) return setStatus("Recipient and subject are required.");
    if (file && file.size > MAX_FILE_BYTES) return setStatus("The attachment must be 15 MiB or smaller.");
    if (count < 1 || count > 10) return setStatus("Repeat count must be between 1 and 10.");
    if (!confirmRun) return setStatus("Tick the confirmation checkbox before starting the send loop.");

    setRunning(true);
    setStopRequested(false);
    stopRef.current = false;
    setLogs([]);
    setStatus("Preparing run…");
    let attachmentPath = "";
    let completed = 0;

    try {
      if (file) {
        setStatus("Creating a temporary private attachment upload…");
        const upload = await api("/api/titan-sender/upload", { fileName: file.name, contentType: file.type || "application/octet-stream", size: file.size });
        const uploadResponse = await fetch(upload.signedUrl, {
          method: "PUT",
          headers: { "Content-Type": upload.contentType, "x-upsert": "false" },
          body: file,
        });
        if (!uploadResponse.ok) throw new Error("Attachment upload failed. Check the private Supabase Storage bucket and try again.");
        attachmentPath = upload.path;
      }

      for (let i = 1; i <= count; i++) {
        if (stopRef.current) break;
        setStatus(`Sending ${i} of ${count}…`);
        const now = () => new Date().toLocaleTimeString();
        try {
          const result = await api("/api/titan-sender/send", { to: to.trim(), subject: subject.trim(), text, attachmentPath });
          completed++;
          setLogs((previous) => [...previous, { index: i, status: "sent", detail: result.response || "Accepted by Titan SMTP", time: now() }]);
        } catch (error) {
          setLogs((previous) => [...previous, { index: i, status: "failed", detail: error instanceof Error ? error.message : "Send failed", time: now() }]);
        }
        if (i < count && !stopRef.current) {
          const waitMs = Math.max(2, delaySeconds) * 1000;
          const end = Date.now() + waitMs;
          while (Date.now() < end && !stopRef.current) {
            await new Promise((resolve) => setTimeout(resolve, Math.min(200, end - Date.now())));
          }
        }
      }
      setStatus(stopRef.current ? `Stopped. ${completed} message(s) accepted by SMTP.` : `Run complete. ${completed} of ${count} message(s) accepted by SMTP.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "The run could not be completed.");
    } finally {
      if (attachmentPath) {
        try { await api("/api/titan-sender/cleanup", { path: attachmentPath }); }
        catch { setStatus((current) => current + " Temporary attachment cleanup failed; remove it from Supabase Storage."); }
      }
      setRunning(false);
      setStopRequested(false);
    }
  }

  function stopRun() {
    stopRef.current = true;
    setStopRequested(true);
    setStatus("Stop requested. The current message may finish; no next message will be started.");
  }

  return (
    <main className="min-h-screen bg-[#0b1020] px-4 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <a href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"><ArrowLeft size={16} /> Back to EssaAhmed.dev</a>
        <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-xs font-medium text-sky-200"><Mail size={14} /> SMTP LAB / TITAN</div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Titan Email Sender</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Repeatable SMTP delivery tests with a reusable attachment and per-attempt results.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-amber-300/20 bg-amber-300/5 px-3 py-2 text-xs text-amber-100"><ShieldCheck size={16} /> Access key required to send</div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
          <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-7">
            <h2 className="mb-5 text-lg font-semibold">Message configuration</h2>
            <div className="space-y-5">
              <label className="block text-sm"><span className="mb-2 block text-slate-300">Sender access key</span><input type="password" autoComplete="current-password" value={accessKey} onChange={(e) => setAccessKey(e.target.value)} placeholder="Configured in Vercel environment variables" className="w-full rounded-xl border border-white/10 bg-[#080d19] px-4 py-3 outline-none transition focus:border-sky-300/60" /></label>
              <label className="block text-sm"><span className="mb-2 block text-slate-300">Recipient email</span><input type="email" required value={to} onChange={(e) => setTo(e.target.value)} placeholder="recipient@example.com" className="w-full rounded-xl border border-white/10 bg-[#080d19] px-4 py-3 outline-none focus:border-sky-300/60" /></label>
              <label className="block text-sm"><span className="mb-2 block text-slate-300">Subject</span><input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} className="w-full rounded-xl border border-white/10 bg-[#080d19] px-4 py-3 outline-none focus:border-sky-300/60" /></label>
              <label className="block text-sm"><span className="mb-2 block text-slate-300">Plain-text message</span><textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} maxLength={20000} className="w-full resize-y rounded-xl border border-white/10 bg-[#080d19] px-4 py-3 leading-6 outline-none focus:border-sky-300/60" /></label>
              <div>
                <span className="mb-2 block text-sm text-slate-300">Attachment <span className="text-slate-500">(optional · max 15 MiB)</span></span>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/20 bg-[#080d19]/70 p-4 transition hover:border-sky-300/50">
                  <span className="rounded-lg bg-sky-300/10 p-3 text-sky-200"><FileUp size={20} /></span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{file ? file.name : "Choose a file to attach"}</span><span className="mt-1 block text-xs text-slate-500">{file ? formatBytes(file.size) + " · reused for each send" : "PDF, documents, images, or other file types"}</span></span>
                  <Paperclip size={18} className="text-slate-500" />
                  <input type="file" className="sr-only" onChange={(e) => { const next = e.target.files?.[0] || null; setFile(next); if (next && next.size > MAX_FILE_BYTES) setStatus("This file exceeds the 15 MiB limit."); }} />
                </label>
                {file && <button type="button" onClick={() => setFile(null)} className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white"><Trash2 size={13} /> Remove attachment</button>}
              </div>
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
              <h2 className="mb-5 text-lg font-semibold">Repeat-send loop</h2>
              <div className="grid grid-cols-2 gap-4">
                <label className="text-sm"><span className="mb-2 block text-slate-300">Messages</span><input type="number" min={1} max={10} value={count} onChange={(e) => setCount(Math.min(10, Math.max(1, Number(e.target.value))))} disabled={running} className="w-full rounded-xl border border-white/10 bg-[#080d19] px-3 py-3 outline-none focus:border-sky-300/60" /><span className="mt-1 block text-xs text-slate-500">Maximum 10 per run</span></label>
                <label className="text-sm"><span className="mb-2 block text-slate-300">Delay (seconds)</span><input type="number" min={2} max={60} value={delaySeconds} onChange={(e) => setDelaySeconds(Math.min(60, Math.max(2, Number(e.target.value))))} disabled={running} className="w-full rounded-xl border border-white/10 bg-[#080d19] px-3 py-3 outline-none focus:border-sky-300/60" /><span className="mt-1 block text-xs text-slate-500">At least 2 seconds</span></label>
              </div>
              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-[#080d19]/70 p-3 text-sm text-slate-300"><input type="checkbox" checked={confirmRun} onChange={(e) => setConfirmRun(e.target.checked)} disabled={running} className="mt-1 accent-sky-300" /><span>I confirm these are intentional test messages to a recipient I control or have permission to contact.</span></label>
              <div className="mt-5 flex gap-3">
                {!running ? <button type="button" onClick={startRun} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-sky-200"><Play size={17} /> Start test run</button> : <button type="button" onClick={stopRun} disabled={stopRequested} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-400 px-4 py-3 font-semibold text-rose-950 transition hover:bg-rose-300 disabled:opacity-50"><Square size={16} /> {stopRequested ? "Stopping…" : "Stop after current send"}</button>}
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">Messages are sent sequentially. Each send is a separate SMTP transaction; stopping prevents the next attempt but cannot recall a message already submitted.</p>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Run activity</h2><span className="text-xs text-slate-500">{logs.length} attempt(s)</span></div>
              {status && <div className="mb-4 flex gap-2 rounded-xl border border-white/10 bg-[#080d19] p-3 text-sm leading-5 text-slate-300"><CircleAlert size={17} className="mt-0.5 shrink-0 text-sky-200" /><span>{status}</span></div>}
              {logs.length === 0 ? <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-500">No messages sent in this session yet.</div> : <div className="space-y-2">{logs.map((log) => <div key={log.index} className="flex gap-3 rounded-xl border border-white/10 bg-[#080d19] p-3"><span className={log.status === "sent" ? "mt-0.5 text-emerald-300" : "mt-0.5 text-rose-300"}>{log.status === "sent" ? <CheckCircle2 size={17} /> : <CircleAlert size={17} />}</span><div className="min-w-0 flex-1"><div className="flex justify-between gap-2 text-sm"><span className="font-medium">Attempt {log.index} · {log.status === "sent" ? "SMTP accepted" : "Failed"}</span><span className="shrink-0 text-xs text-slate-500">{log.time}</span></div><p className="mt-1 break-words text-xs leading-5 text-slate-400">{log.detail}</p></div></div>)}</div>}
            </section>
          </div>
        </div>
        <p className="mt-7 text-center text-xs leading-5 text-slate-600">Experimental utility · Use only for low-volume tests with consent. SMTP acceptance does not guarantee inbox delivery. Configure a protected route before using this for anything sensitive.</p>
      </div>
    </main>
  );
}
