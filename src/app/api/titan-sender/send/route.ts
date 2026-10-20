import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getRequiredEnv, isAuthorized, MAX_ATTACHMENT_BYTES } from "@/lib/titan-sender";
export const runtime = "nodejs"; export const maxDuration = 30;
const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REPO="DevEssaAhmed/syedamahamfahim.tech"; const PREFIX="Maham Telecom/";
const EXT=new Set([".jpg",".jpeg",".png",".webp",".gif",".mp4",".mov",".opus",".mp3",".m4a",".pdf",".doc",".docx",".txt",".webm",".wav"]);
function ext(p:string){const n=p.split("/").pop()||"";return n.slice(n.lastIndexOf(".")).toLowerCase();}
function mime(e:string){const m:Record<string,string>={".jpg":"image/jpeg",".jpeg":"image/jpeg",".png":"image/png",".webp":"image/webp",".gif":"image/gif",".mp4":"video/mp4",".mov":"video/quicktime",".opus":"audio/ogg",".mp3":"audio/mpeg",".m4a":"audio/mp4",".pdf":"application/pdf",".doc":"application/msword",".docx":"application/vnd.openxmlformats-officedocument.wordprocessingml.document",".txt":"text/plain",".webm":"video/webm",".wav":"audio/wav"};return m[e]||"application/octet-stream";}
export async function POST(request:Request){
 if(!isAuthorized(request))return NextResponse.json({error:"Unauthorized. Check your sender access key."},{status:401});
 let transporter:ReturnType<typeof nodemailer.createTransport>|undefined;
 try {
  const body=await request.json(); const to=typeof body.to==="string"?body.to.trim():""; const subject=typeof body.subject==="string"?body.subject.trim().slice(0,200):""; const text=typeof body.text==="string"?body.text.slice(0,20000):""; const attachmentPath=typeof body.attachmentPath==="string"?body.attachmentPath:"";
  if(!emailPattern.test(to))return NextResponse.json({error:"Enter a valid recipient email address."},{status:400}); if(!subject)return NextResponse.json({error:"Subject is required."},{status:400});
  if(attachmentPath&&(!attachmentPath.startsWith(PREFIX)||attachmentPath.includes("..")||attachmentPath.includes("\\")||!EXT.has(ext(attachmentPath))))return NextResponse.json({error:"Choose a supported media file from the archive."},{status:400});
  const attachments:Array<{filename:string;content:Buffer;contentType?:string}>=[];
  if(attachmentPath){const token=getRequiredEnv("GITHUB_MEDIA_TOKEN");const encoded=attachmentPath.split("/").map(encodeURIComponent).join("/");const r=await fetch(`https://api.github.com/repos/${REPO}/contents/${encoded}?ref=main`,{headers:{Authorization:`Bearer ${token}`,Accept:"application/vnd.github.raw+json","X-GitHub-Api-Version":"2022-11-28"},cache:"no-store"});if(!r.ok)return NextResponse.json({error:"Could not retrieve that file from the private media repository."},{status:502});const bytes=Buffer.from(await r.arrayBuffer());if(!bytes.length||bytes.length>MAX_ATTACHMENT_BYTES)return NextResponse.json({error:"Attachment is empty or exceeds 15 MiB."},{status:413});attachments.push({filename:attachmentPath.split("/").pop()||"attachment",content:bytes,contentType:mime(ext(attachmentPath))});}
  const port=Number(process.env.TITAN_SMTP_PORT||"465");transporter=nodemailer.createTransport({host:process.env.TITAN_SMTP_HOST||"smtp.titan.email",port,secure:port===465,auth:{user:getRequiredEnv("TITAN_EMAIL_USER"),pass:getRequiredEnv("TITAN_EMAIL_PASSWORD")},connectionTimeout:12000,greetingTimeout:12000,socketTimeout:20000});
  const info=await transporter.sendMail({from:process.env.TITAN_EMAIL_FROM||getRequiredEnv("TITAN_EMAIL_USER"),to,subject,text,attachments});return NextResponse.json({ok:true,messageId:info.messageId,accepted:info.accepted,rejected:info.rejected,response:info.response});
 }catch(e){console.error("Titan sender failed:",e instanceof Error?e.message:"Unknown error");return NextResponse.json({error:e instanceof Error?e.message.slice(0,300):"Email sending failed."},{status:500});}finally{if(transporter)transporter.close();}
}