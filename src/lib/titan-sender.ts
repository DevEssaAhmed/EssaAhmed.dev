export const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024;
export const MAX_SENDS_PER_RUN = 10;
export function isAuthorized(request: Request) {
 const expected=process.env.EMAIL_SENDER_ACCESS_KEY; const supplied=request.headers.get("x-sender-key");
 return Boolean(expected&&supplied&&supplied.length===expected.length&&supplied===expected);
}
export function getRequiredEnv(name:string) {
 const value=process.env[name]; if(!value)throw new Error(`Missing required environment variable: ${name}`); return value;
}