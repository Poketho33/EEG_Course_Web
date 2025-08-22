// pages/api/protected.ts
import { getToken } from "next-auth/jwt";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Now you can safely use token.id or token.email
  // Or call your public API with it
  const response = await fetch(`${process.env.PUBLIC_API_URL}/endpoint`, {
    headers: {
      Authorization: `Bearer ${token.id}`, // or some custom token
    },
  });

  const data = await response.json();
  res.status(200).json(data);
}
