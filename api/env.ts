import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(200).send(JSON.stringify({
    corpId: process.env.WECOM_CORP_ID,
    agentId: process.env.WECOM_AGENT_ID
  }));
}
