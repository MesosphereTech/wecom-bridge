import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

let jsTicket: { v: string; t: number } | null = null;
let agentTicket: { v: string; t: number } | null = null;

async function getToken(baseUrl?: string) {
  const url = baseUrl ? `${baseUrl}/api/gettoken` : `/api/gettoken`;
  const r = await fetch(url);
  const j = await r.json();
  return j.access_token as string;
}

async function getJsapiTicket(token: string) {
  const now = Date.now();
  if (jsTicket && jsTicket.t - now > 60_000) return jsTicket.v;
  const r = await fetch(`https://qyapi.weixin.qq.com/cgi-bin/get_jsapi_ticket?access_token=${token}`);
  const j = await r.json();
  if (j.errcode) throw j;
  jsTicket = { v: j.ticket, t: now + (j.expires_in || 7200) * 1000 };
  return jsTicket.v;
}

async function getAgentTicket(token: string) {
  const now = Date.now();
  if (agentTicket && agentTicket.t - now > 60_000) return agentTicket.v;
  const r = await fetch(`https://qyapi.weixin.qq.com/cgi-bin/ticket/get?access_token=${token}&type=agent_config`);
  const j = await r.json();
  if (j.errcode) throw j;
  agentTicket = { v: j.ticket, t: now + (j.expires_in || 7200) * 1000 };
  return agentTicket.v;
}

function sign(ticket: string, url: string) {
  const u = new URL(url);
  const full = u.origin + u.pathname + (u.search || "");
  const nonceStr = crypto.randomBytes(8).toString("hex");
  const timestamp = Math.floor(Date.now() / 1000);
  const raw = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${full}`;
  const signature = crypto.createHash("sha1").update(raw).digest("hex");
  return { nonceStr, timestamp, signature };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = String(req.query.url || "");
  if (!url) return res.status(400).send({ errcode: 400, errmsg: "url required" });

  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
  const token = await getToken(baseUrl);
  const jt = await getJsapiTicket(token);
  const at = await getAgentTicket(token);

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  return res.status(200).send(JSON.stringify({
    corpId: process.env.WECOM_CORP_ID,
    agentId: process.env.WECOM_AGENT_ID,
    base:  sign(jt, url),
    agent: sign(at, url)
  }));
}
