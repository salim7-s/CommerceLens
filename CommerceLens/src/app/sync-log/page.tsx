import Link from "next/link";
import { syncService } from "../../services/SyncService";
import { CheckCircle2, XCircle, ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SyncLogPage() {
  const logs = await syncService.getSyncLogs(100);

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-stone-500">
        <Link href="/" className="hover:text-stone-900 transition-colors font-semibold flex items-center gap-1">
          Home
        </Link>
        <span className="text-stone-300">/</span>
        <span className="text-stone-800 font-semibold">WooCommerce Sync History</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e8e2d6] pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-[#f4efe6] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 flex items-center gap-2.5">
              <RefreshCw className="w-5 h-5 text-stone-700" />
              WooCommerce Sync Audit Log
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Audit trail of every REST API v3 synchronization event with idempotency verification.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#e8e2d6] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(28,25,23,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-700">
            <thead className="bg-[#faf8f4] text-xs font-semibold text-stone-500 uppercase tracking-wider border-b border-[#e8e2d6]">
              <tr>
                <th scope="col" className="px-6 py-3.5">Timestamp</th>
                <th scope="col" className="px-6 py-3.5">Product SKU</th>
                <th scope="col" className="px-6 py-3.5">Action</th>
                <th scope="col" className="px-6 py-3.5">Status</th>
                <th scope="col" className="px-6 py-3.5">Message / Details</th>
                <th scope="col" className="px-6 py-3.5 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0eae1]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-stone-400 text-sm">
                    No sync events recorded yet. Mark a product Approved and click Sync to generate an audit entry.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#faf8f4]/80 transition-colors text-xs">
                    <td className="px-6 py-4 font-mono text-stone-500 whitespace-nowrap">
                      {log.created_at}
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-stone-900">
                      {log.sku || "N/A"}
                    </td>
                    <td className="px-6 py-4 capitalize font-medium text-stone-700">
                      {log.action}
                    </td>
                    <td className="px-6 py-4">
                      {log.status === "synced" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 border border-emerald-200/80 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Synced
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-rose-50 border border-rose-200/80 text-rose-800">
                          <XCircle className="w-3.5 h-3.5" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-stone-600 max-w-md truncate">
                      {log.message}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.product_id && (
                        <Link
                          href={`/products/${log.product_id}/improve`}
                          className="inline-flex items-center gap-1 text-stone-800 hover:underline font-semibold"
                        >
                          Inspect <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
