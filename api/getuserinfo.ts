import type { VercelRequest, VercelResponse } from "@vercel/node";

async function getToken(baseUrl?: string) {
  const url = baseUrl ? `${baseUrl}/api/gettoken` : `/api/gettoken`;
  const r = await fetch(url);
  const j = await r.json();
  return j.access_token as string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const code = String(req.query.code || "");
  if (!code) return res.status(400).send({ errcode: 400, errmsg: "code required" });

  // When running on Vercel, VERCEL_URL exists. In local dev, fallback to relative
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
  const token = await getToken(baseUrl);
  const u = await fetch(`https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token=${token}&code=${encodeURIComponent(code)}`);
  const info = await u.json();
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  return res.status(200).send(info);
}
