import { NextResponse } from "next/server";
import { isAuthorized, MAX_ATTACHMENT_BYTES } from "@/lib/titan-sender";
export const runtime = "nodejs";
const REPO = "DevEssaAhmed/syedamahamfahim.tech";
const PREFIX = "Maham Telecom/";
const EXT = new Set([".jpg",".jpeg",".png",".webp",".gif",".mp4",".mov",".opus",".mp3",".m4a",".pdf",".doc",".docx",".txt",".webm",".wav"]);
function ext(p: string) { const n=p.split("/").pop()||""; return n.slice(n.lastIndexOf(".")).toLowerCase(); }
export async function GET(request: Request) {
 if (!isAuthorized(request)) return NextResponse.json({error:"Unauthorized."},{status:401});
 const token=process.env.GITHUB_MEDIA_TOKEN;
 if (!token) return NextResponse.json({error:"Add GITHUB_MEDIA_TOKEN in Vercel with read-only access to the private media repo."},{status:500});
 try {
  const r=await fetch(`https://api.github.com/repos/${REPO}/git/trees/main?recursive=1`,{headers:{Authorization:`Bearer ${token}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"},cache:"no-store"});
  if(!r.ok) return NextResponse.json({error:"Could not read the private media repository. Check GITHUB_MEDIA_TOKEN permissions."},{status:502});
  const tree=await r.json();
  const files=(tree.tree||[]).filter((x:any)=>x.type==="blob"&&typeof x.path==="string"&&x.path.startsWith(PREFIX)&&EXT.has(ext(x.path))&&Number(x.size)>0&&Number(x.size)<=MAX_ATTACHMENT_BYTES&&!/\/WhatsApp Chat with .*\.txt$/i.test(x.path)&&!/\/chat\.txt$/i.test(x.path)).map((x:any)=>({path:x.path,name:x.path.slice(PREFIX.length),size:x.size,type:ext(x.path).slice(1)})).sort((a:any,b:any)=>b.name.localeCompare(a.name));
  return NextResponse.json({files});
 } catch { return NextResponse.json({error:"Failed to list repository media."},{status:500}); }
}