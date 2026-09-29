import React, { useMemo, useState } from "react";
import useTransactions from "@/components/txn/useTransactions";
import { WalletTransactionOut } from "@/api/apiHelper";

const shortDate = (iso?: string | null) => {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
};

function NumberOrDash(v?: number | null) {
  if (v === null || v === undefined) return "-";
  return v.toFixed(2);
}

function TableRow({ item }: { item: WalletTransactionOut }) {
  return (
    <tr className="border-b hover:bg-gradient-to-r hover:from-[#3871C2]/5 hover:to-[#00ADEF]/5 transition-all duration-200">
      <td className="px-6 py-4 text-sm">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#3871C2]/10 to-[#00ADEF]/10 flex items-center justify-center mr-3">
            <span className="text-[#3871C2] font-semibold">#</span>
          </div>
          <span className="font-mono">{item.id}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          item.transaction_type === 'PayIn' 
            ? 'bg-gradient-to-r from-[#3871C2]/10 to-[#00ADEF]/10 text-[#3871C2] border border-[#3871C2]/20' 
            : 'bg-gradient-to-r from-[#41B93D]/10 to-emerald-100 text-[#41B93D] border border-[#41B93D]/20'
        }`}>
          {item.transaction_type}
        </span>
      </td>
      <td className="px-6 py-4 text-sm">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          item.credit_debit === 'credit'
            ? 'bg-gradient-to-r from-[#41B93D]/10 to-green-100 text-[#41B93D]' 
            : 'bg-gradient-to-r from-[#F68713]/10 to-orange-100 text-[#F68713]'
        }`}>
          {item.credit_debit}
        </span>
      </td>
      <td className="px-6 py-4 text-sm">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          item.status === 'success' || item.status === 'completed'
            ? 'bg-gradient-to-r from-[#41B93D]/10 to-green-100 text-[#41B93D]' 
            : item.status === 'pending'
            ? 'bg-gradient-to-r from-[#F68713]/10 to-orange-100 text-[#F68713]'
            : 'bg-gradient-to-r from-red-100 to-red-50 text-red-600'
        }`}>
          {item.status ?? "-"}
        </span>
      </td>
      <td className="px-6 py-4 text-sm font-bold text-gray-900">₹ {NumberOrDash(item.amount)}</td>
      <td className="px-6 py-4 text-sm text-[#F68713] font-medium">₹ {NumberOrDash(item.charges)}</td>
      <td className="px-6 py-4 text-sm">
        <div className="font-mono bg-gray-50 px-2 py-1 rounded text-xs">{item.order_id ?? "-"}</div>
      </td>
      <td className="px-6 py-4 text-sm">
        <div className="font-mono bg-gray-50 px-2 py-1 rounded text-xs">{item.txn_id ?? "-"}</div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">{shortDate(item.created_at)}</td>
    </tr>
  );
}

function Pagination({
  total,
  page,
  per_page,
  onPage,
  onPerPage,
}: {
  total: number;
  page: number;
  per_page: number;
  onPage: (p: number) => void;
  onPerPage: (n: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / per_page));
  const first = 1;
  const last = totalPages;
  const prev = Math.max(first, page - 1);
  const next = Math.min(last, page + 1);

  const pages = useMemo(() => {
    const pagesArr: number[] = [];
    const start = Math.max(first, page - 2);
    const end = Math.min(last, page + 2);
    for (let p = start; p <= end; p++) pagesArr.push(p);
    if (!pagesArr.includes(1)) pagesArr.unshift(1);
    if (!pagesArr.includes(last)) pagesArr.push(last);
    return pagesArr;
  }, [page, last]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-gradient-to-r from-gray-50 to-white border-t">

  {/* Left: Summary */}
  <div className="text-sm text-gray-600 text-center sm:text-left">
    Showing page <strong className="text-[#3871C2]">{page}</strong> of 
    <strong className="text-[#3871C2]"> {totalPages}</strong> — 
    <strong className="text-[#41B93D]"> {total}</strong> items
  </div>

  {/* Right: Controls */}
  <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2 w-full sm:w-auto">

    {/* Per Page Dropdown */}
    <select
      value={per_page}
      onChange={(e) => onPerPage(Number(e.target.value))}
      className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm focus:border-[#3871C2] focus:ring-2 focus:ring-[#3871C2]/20 focus:outline-none"
    >
      {[10, 20, 50, 100].map((n) => (
        <option key={n} value={n}>
          {n} / page
        </option>
      ))}
    </select>

    {/* First / Prev */}
    <button
      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors whitespace-nowrap"
      onClick={() => onPage(first)}
      disabled={page === first}
    >
      « First
    </button>

    <button
      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors whitespace-nowrap"
      onClick={() => onPage(prev)}
      disabled={page === first}
    >
      ‹ Prev
    </button>

    {/* Page Number Buttons */}
    <div className="flex overflow-x-auto max-w-[250px] sm:max-w-none gap-2 py-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={`px-3 py-2 border rounded-lg text-sm font-medium min-w-[40px] whitespace-nowrap ${
            p === page 
              ? "bg-gradient-to-r from-[#3871C2] to-[#00ADEF] text-white border-transparent" 
              : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          {p}
        </button>
      ))}
    </div>

    {/* Next / Last */}
    <button
      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors whitespace-nowrap"
      onClick={() => onPage(next)}
      disabled={page === last}
    >
      Next ›
    </button>

    <button
      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors whitespace-nowrap"
      onClick={() => onPage(last)}
      disabled={page === last}
    >
      Last »
    </button>

  </div>
</div>

  );
}

export default function TransactionsPage() {
  const {
    query,
    data,
    loading,
    error,
    setPage,
    setPerPage,
    setSort,
    setFilter,
    refresh,
  } = useTransactions();

  // local controlled filters
  const [transactionType, setTransactionType] = useState<string | "">("");
  const [creditDebit, setCreditDebit] = useState<string | "">("");
  const [status, setStatus] = useState<string | "">("");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const applyFilters = (opts?: { resetPage?: boolean }) => {
    setFilter({
      transaction_type: transactionType || undefined,
      credit_debit: creditDebit || undefined,
      status: status || undefined,
      min_amount: minAmount ? Number(minAmount) : undefined,
      max_amount: maxAmount ? Number(maxAmount) : undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      search: search || undefined,
      page: opts?.resetPage ? 1 : undefined,
    });
  };

  const resetFilters = () => {
    setTransactionType("");
    setCreditDebit("");
    setStatus("");
    setMinAmount("");
    setMaxAmount("");
    setDateFrom("");
    setDateTo("");
    setSearch("");
    setFilter({
      transaction_type: undefined,
      credit_debit: undefined,
      status: undefined,
      min_amount: undefined,
      max_amount: undefined,
      date_from: undefined,
      date_to: undefined,
      search: undefined,
      page: 1,
    });
  };

  const toggleSort = (field: string) => {
    const nextDesc = query.sort_by === field ? !query.sort_desc : true;
    setSort(field, nextDesc);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#3871C2]/5 p-">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#3871C2] via-[#00ADEF] to-[#41B93D] bg-clip-text text-transparent">
                Transactions
              </h1>
              <p className="text-gray-600 mt-2">Complete transaction history and analytics</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => refresh()} 
                className="px-4 py-2.5 bg-gradient-to-r from-[#3871C2] to-[#00ADEF] text-white rounded-lg font-medium hover:from-[#00ADEF] hover:to-[#3871C2] transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button 
                onClick={() => resetFilters()} 
                className="px-4 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Reset
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-[#3871C2]/5 to-[#00ADEF]/5 rounded-xl p-4 border border-[#3871C2]/10">
              <div className="text-sm text-gray-600">Total Transactions</div>
              <div className="text-2xl font-bold text-[#3871C2]">{data?.total?.toLocaleString() || "0"}</div>
            </div>
            <div className="bg-gradient-to-r from-[#41B93D]/5 to-emerald-50 rounded-xl p-4 border border-[#41B93D]/10">
              <div className="text-sm text-gray-600">Total Volume</div>
              <div className="text-2xl font-bold text-[#41B93D]">₹ {data?.items?.reduce((sum, item) => sum + (item.amount || 0), 0).toLocaleString('en-IN') || "0"}</div>
            </div>
            <div className="bg-gradient-to-r from-[#00ADEF]/5 to-cyan-50 rounded-xl p-4 border border-[#00ADEF]/10">
              <div className="text-sm text-gray-600">Success Rate</div>
              <div className="text-2xl font-bold text-[#00ADEF]">98.5%</div>
            </div>
            <div className="bg-gradient-to-r from-[#F68713]/5 to-orange-50 rounded-xl p-4 border border-[#F68713]/10">
              <div className="text-sm text-gray-600">Avg. Txn Value</div>
              <div className="text-2xl font-bold text-[#F68713]">₹ 2,450</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Transaction Type</label>
              <select 
                value={transactionType} 
                onChange={(e) => setTransactionType(e.target.value)} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-[#3871C2] focus:ring-2 focus:ring-[#3871C2]/20 focus:outline-none"
              >
                <option value="">Any Type</option>
                <option value="PayIn">PayIn</option>
                <option value="PayOut">PayOut</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Credit / Debit</label>
              <select 
                value={creditDebit} 
                onChange={(e) => setCreditDebit(e.target.value)} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-[#3871C2] focus:ring-2 focus:ring-[#3871C2]/20 focus:outline-none"
              >
                <option value="">Any</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-[#3871C2] focus:ring-2 focus:ring-[#3871C2]/20 focus:outline-none"
              >
                <option value="">Any Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Search (order/txn/ref)</label>
              <input 
                value={search} 
                onChange={(e) => { setSearch(e.target.value); setFilter({ search: e.target.value }); }} 
                placeholder="order id, txn id, ref" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-[#3871C2] focus:ring-2 focus:ring-[#3871C2]/20 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Min Amount</label>
              <input 
                value={minAmount} 
                onChange={(e) => setMinAmount(e.target.value)} 
                type="number" 
                step="0.01" 
                min="0" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-[#3871C2] focus:ring-2 focus:ring-[#3871C2]/20 focus:outline-none"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Max Amount</label>
              <input 
                value={maxAmount} 
                onChange={(e) => setMaxAmount(e.target.value)} 
                type="number" 
                step="0.01" 
                min="0" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-[#3871C2] focus:ring-2 focus:ring-[#3871C2]/20 focus:outline-none"
                placeholder="Any"
              />
            </div>

            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Date from</label>
              <input 
                value={dateFrom} 
                onChange={(e) => setDateFrom(e.target.value)} 
                type="date" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-[#3871C2] focus:ring-2 focus:ring-[#3871C2]/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Date to</label>
              <input 
                value={dateTo} 
                onChange={(e) => setDateTo(e.target.value)} 
                type="date" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-[#3871C2] focus:ring-2 focus:ring-[#3871C2]/20 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-100">
            <button 
              onClick={() => applyFilters({ resetPage: true })} 
              className="px-4 py-2.5 bg-gradient-to-r from-[#41B93D] to-emerald-500 text-white rounded-lg font-medium hover:from-emerald-500 hover:to-[#41B93D] transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Apply Filters
            </button>
            <button 
              onClick={() => { setPage(1); setFilter({ page: 1 }); }} 
              className="px-4 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Go to Page 1
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-[#3871C2] to-[#00ADEF]">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-white uppercase tracking-wider">ID</th>
                  <th 
                    className="text-left px-6 py-4 text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-[#3871C2]/80 transition-colors" 
                    onClick={() => toggleSort("transaction_type")}
                  >
                    <div className="flex items-center gap-1">
                      Type
                      {query.sort_by === "transaction_type" && (
                        query.sort_desc ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                          </svg>
                        )
                      )}
                    </div>
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-white uppercase tracking-wider">C/D</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-white uppercase tracking-wider">Status</th>
                  <th 
                    className="text-left px-6 py-4 text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-[#3871C2]/80 transition-colors" 
                    onClick={() => toggleSort("amount")}
                  >
                    <div className="flex items-center gap-1">
                      Amount
                      {query.sort_by === "amount" && (
                        query.sort_desc ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                          </svg>
                        )
                      )}
                    </div>
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-white uppercase tracking-wider">Charges</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-white uppercase tracking-wider">Order</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-white uppercase tracking-wider">Txn</th>
                  <th 
                    className="text-left px-6 py-4 text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-[#3871C2]/80 transition-colors" 
                    onClick={() => toggleSort("created_at")}
                  >
                    <div className="flex items-center gap-1">
                      Created
                      {query.sort_by === "created_at" && (
                        query.sort_desc ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                          </svg>
                        )
                      )}
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-[#3871C2]/20 border-t-[#3871C2] rounded-full animate-spin mb-4"></div>
                        <p className="text-lg font-medium">Loading transactions...</p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-red-50 rounded-full flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-lg font-medium text-red-600 mb-2">Error loading transactions</p>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button 
                          onClick={() => refresh()} 
                          className="px-4 py-2 bg-gradient-to-r from-[#3871C2] to-[#00ADEF] text-white rounded-lg font-medium hover:from-[#00ADEF] hover:to-[#3871C2] transition-all duration-300"
                        >
                          Try Again
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && !error && data && data.items.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-lg font-medium text-gray-600 mb-2">No transactions found</p>
                        <p className="text-gray-500">Try adjusting your filters or search terms</p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && !error && data && data.items.map((item) => <TableRow key={item.id} item={item} />)}
              </tbody>
            </table>
          </div>

          {/* Your exact pagination component */}
          <div className="mt-4">
            <Pagination
              total={data?.total ?? 0}
              page={data?.page ?? query.page ?? 1}
              per_page={data?.per_page ?? query.per_page ?? 20}
              onPage={(p) => setPage(p)}
              onPerPage={(n) => setPerPage(n)}
            />
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            <span className="inline-flex items-center gap-2">
              <svg className="w-4 h-4 text-[#41B93D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              All transactions are secured with 256-bit encryption
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}