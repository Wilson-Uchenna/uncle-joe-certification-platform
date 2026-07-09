const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE = "https://api.paystack.co";

async function paystackFetch<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${PAYSTACK_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const data = await res.json();
  if (!data.status) {
    throw new Error(data.message || "Paystack API error");
  }
  return data.data;
}

export const paystack = {
  transaction: {
    initialize: (body: {
      email: string;
      amount: number; // in kobo
      reference?: string;
      callback_url?: string;
      metadata?: Record<string, any>;
    }) => paystackFetch<{ authorization_url: string; access_code: string; reference: string }>("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify(body),
    }),

    verify: (reference: string) => paystackFetch<{
      status: string;
      reference: string;
      amount: number;
      id: number;
      metadata: any;
      paid_at: string | null;
    }>(`/transaction/verify/${reference}`),
  },
};

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const crypto = require("crypto");
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET)
    .update(rawBody)
    .digest("hex");
  return hash === signature;
}