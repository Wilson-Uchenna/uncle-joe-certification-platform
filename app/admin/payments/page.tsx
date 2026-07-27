"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, TrendingUp, Calendar, Download } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type Payment = {
  id: string;
  userName: string;
  email: string;
  type: "certificate" | "training_material";
  amount: number;
  status: "success" | "pending" | "failed";
  paidAt: string;
  providerReference: string;
};

export default function PaymentsPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState({ total: 0, today: 0, month: 0 });

  useEffect(() => {
    if (!session?.user || session.user.role !== "admin") {
      router.push("/login");
      return;
    }
    fetchPayments();
  }, [session]);

  const fetchPayments = async () => {
    const res = await fetch("/api/admin/payments");
    const data = await res.json();
    if (data.success) {
      setPayments(data.payments);
      setSummary(data.summary);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Payments</h1>
      <p className="text-gray-500 mb-6">Track all certificate and material purchases.</p>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <SummaryCard title="Total Revenue" value={`₦${summary.total.toLocaleString()}`} icon={TrendingUp} />
        <SummaryCard title="Today" value={`₦${summary.today.toLocaleString()}`} icon={Calendar} />
        <SummaryCard title="This Month" value={`₦${summary.month.toLocaleString()}`} icon={CreditCard} />
      </div>

      {/* Payments Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">User</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Type</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{p.userName}</p>
                  <p className="text-sm text-gray-500">{p.email}</p>
                </td>
                <td className="px-6 py-4 text-sm capitalize">{p.type.replace("_", " ")}</td>
                <td className="px-6 py-4 font-medium">₦{(p.amount / 100).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    p.status === "success" ? "bg-green-100 text-green-700" :
                    p.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{new Date(p.paidAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm font-mono">{p.providerReference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon }: any) {
  return (
    <div className="bg-white border rounded-xl p-5">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5 text-indigo-600" />
        <span className="text-sm text-gray-500">{title}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}