const PAYSTACK_BASE = "https://api.paystack.co";

async function paystackFetch<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
  const PAYSTACK_SECRET = process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY!;

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

// NEW — named type instead of an inline generic
interface PaystackTransaction {
  id: number;
  reference: string;
  amount: number;
  status: string;
  paid_at: string | null;
  currency: string;
  customer: { email: string };
}

export const paystack = {
  transaction: {
    initialize: (body: {
      email: string;
      amount: number;
      reference?: string;
      callback_url?: string;
      metadata?: Record<string, any>;
    }) =>
      paystackFetch<{ authorization_url: string; access_code: string; reference: string }>(
        "/transaction/initialize",
        { method: "POST", body: JSON.stringify(body) },
      ),

    verify: (reference: string) =>
      paystackFetch<{
        status: string;
        reference: string;
        amount: number;
        id: number;
        metadata: any;
        paid_at: string | null;
      }>(`/transaction/verify/${reference}`),

    list: (params: {
      status?: string;
      from?: string;
      to?: string;
      page?: number;
      perPage?: number;
    }): Promise<PaystackTransaction[]> => {
      const query = new URLSearchParams();
      if (params.status) query.set("status", params.status);
      if (params.from) query.set("from", params.from);
      if (params.to) query.set("to", params.to);
      query.set("page", String(params.page ?? 1));
      query.set("perPage", String(params.perPage ?? 100));

      return paystackFetch<PaystackTransaction[]>(`/transaction?${query.toString()}`);
    },
  },
};

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const PAYSTACK_SECRET = process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY!;
  const crypto = require("crypto");
  const hash = crypto.createHmac("sha512", PAYSTACK_SECRET).update(rawBody).digest("hex");
  return hash === signature;
}