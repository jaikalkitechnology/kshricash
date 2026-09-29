import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ChevronRight, Key, Link, FileText, CheckCircle, AlertCircle } from "lucide-react";

// Small helper to render code blocks
function Code({ children }) {
  return (
    <pre className="bg-gray-900 text-gray-100 p-3 md:p-4 rounded-lg text-xs md:text-sm overflow-x-auto font-mono border" style={{ borderColor: '#00ADEF' }}>{children}</pre>
  );
}

function CodeInline({ children }) {
  return (
    <code className="bg-gray-100 px-1 md:px-2 py-0.5 md:py-1 rounded text-xs md:text-sm font-mono break-words" style={{ color: '#3871C2' }}>{children}</code>
  );
}

function Section({ title, description, children }) {
  return (
    <section className="space-y-4 p-4 md:p-6 rounded-xl border mb-4 md:mb-6" style={{ borderColor: '#00ADEF', backgroundColor: '#F0F9FF' }}>
      <div className="pb-3 md:pb-4 border-b" style={{ borderColor: 'rgba(0, 173, 239, 0.2)' }}>
        <h3 className="text-lg md:text-xl font-bold flex items-center gap-2" style={{ color: '#3871C2' }}>
          <FileText className="h-4 w-4 md:h-5 md:w-5" />
          {title}
        </h3>
        {description && (
          <p className="text-gray-600 mt-1 text-sm md:text-base">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function EndpointCard({ method, path, description, color = '#3871C2' }) {
  const methodColor = method === 'GET' ? '#41B93D' : 
                     method === 'POST' ? '#3871C2' : 
                     method === 'PUT' ? '#F68713' : 
                     method === 'DELETE' ? '#DC2626' : '#6B7280';
  
  return (
    <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-white rounded-lg border" style={{ borderColor: '#00ADEF' }}>
      <div className="px-2 md:px-3 py-1 rounded-md font-bold text-white text-xs md:text-sm" style={{ backgroundColor: methodColor }}>
        {method}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-mono text-xs md:text-sm break-words" style={{ color: '#3871C2' }}>{path}</div>
        <div className="text-gray-600 text-xs md:text-sm mt-1">{description}</div>
      </div>
    </div>
  );
}

export default function ApiDocs() {
  const base = "https://api.neopayment.in";

  // --- PayIn Examples (existing) --------------------------------------------
  const createOrderRequestExample = {
    order_id: "ORDER_12345",
    amount: "150.00",
    p_info: "Ticket purchase",
    customer_name: "Amit Kumar",
    customer_email: "amit@example.com",
    customer_mobile: "9123456789",
    redirect_url: "https://merchant.example.com/return"
  };

  const createOrderResponseExample = {
    status: true,
    msg: "Order Created",
    data: {
      client_txn_id: "PG_ORDER_98765",
      payment_url: "https://pay.partner/checkout/PG_ORDER_98765",
      session_id: "SESS_abcdef123",
    }
  };

  const txnListResponseExample = {
    total: 2,
    items: [
      {
        transaction_type: "PayIn",
        credit_debit: "credit",
        amount: 1500.0,
        status: "success",
        order_id: "ORDER_12345",
        txn_id: "RZP_TXN_891",
        reference_id: "PG_REF_445567",
        description: "Wallet top-up",
        created_at: "2025-10-04T14:20:01"
      }
    ]
  };

  const txnStatusResponseExample = {
    transaction_type: "PayIn",
    credit_debit: "credit",
    amount: 1500.0,
    status: "success",
    order_id: "ORDER_12345",
    txn_id: "RZP_TXN_891",
    reference_id: "PG_REF_445567",
    description: "Wallet top-up",
    created_at: "2025-10-04T14:20:01"
  };

  const loginRequestExample = {
    username: "merchant@example.com",
    password: "secret_password"
  };

  const loginResponseExample = {
    access_token: "eyJhbGciOiJI...",
    token_type: "bearer",
    expires_in: 180,
    expires_at: "2025-10-04T18:20:01Z"
  };

  // --- NEW: PayOut Examples --------------------------------------------------
  const payoutDirectRequestExample = {
    orderId: "ORD1234568",
    amount: "10.00",
    ifsc: "HDFC0001234",
    accountno: "123456789012",
    name: "Rohan Gupta",
    branch: "Andheri East",
    paymode: "IMPS",
    udf1: "personal",
    udf2: "test-transfer",
    udf3: "NA",
    remarks: "Saving transfer test ₹10",
    mode: "bank"
  };

  const payoutDirectResponseExample = {
    success: true,
    message: "Payout initiated and is in progress",
    order_id: "ORD1234568",
    beneficiary_amount: 10,
    charges: 0.2,
    gst: 0.04,
    settle_amount: 10.24,
    wallet_balance: 74.26,
    universepay_raw: {
      status: true,
      data: {
        success: true,
        data: {
          orderId: "557179688",
          udf1: "personal",
          udf2: "test-transfer",
          udf3: "NA",
          status: "InProgress",
          transactionId: "",
          creationDateTime: "2025-11-05T20:12:53.000000+05:30"
        },
        message: "Payment initiated successfully...!!!",
        errors: null,
        exception: null
      }
    },
    upstream_status: "InProgress",
    upstream_order_id: "557179688"
  };

  const payoutStatusQueryExample = "upstream_order_id=557179688";

  const walletTransactionsResponseExample = {
    items: [
      {
        id: 55,
        user_id: "MER-6377A5C9",
        transaction_type: "PayOut",
        credit_debit: "debit",
        order_id: "ORD1234568",
        order_token: null,
        payIn_mode: null,
        status: "InProgress",
        customer_id: null,
        amount: 10,
        settle_amount: 10.24,
        balance_amount: 74.26,
        charges: 0.2,
        gst: 0.04,
        reference_id: null,
        txn_id: "557179688",
        description: "Saving transfer test ₹10",
        instrument_mode: "IMPS",
        api_name: "universepay.direct",
        created_at: "2025-11-05T20:12:50",
        refund_id: null
      }
    ],
    meta: { page: 1, per_page: 20, total: 17, total_pages: 1 }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#3871C2' }}>API Documentation</h1>
        <p className="text-gray-600 text-sm md:text-base">Integration guides and endpoints for RootPay merchant APIs</p>
        <div className="mt-4 p-3 md:p-4 rounded-lg border" style={{ borderColor: '#00ADEF', backgroundColor: '#F0F9FF' }}>
          <div className="flex items-center gap-2 mb-2">
            <Key className="h-4 md:h-5 w-4 md:w-5" style={{ color: '#3871C2' }} />
            <span className="font-medium text-sm md:text-base" style={{ color: '#3871C2' }}>Base URL</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <code className="text-sm md:text-lg font-mono break-all" style={{ color: '#3871C2' }}>{base}</code>
            <Button
              onClick={() => copyToClipboard(base)}
              size="sm"
              variant="outline"
              className="self-start sm:self-center"
              style={{ borderColor: '#00ADEF', color: '#3871C2' }}
            >
              <Copy className="h-3 w-3 md:h-4 md:w-4 mr-2" />
              Copy
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="p-4 rounded-lg border" style={{ borderColor: '#00ADEF', backgroundColor: 'white' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-md" style={{ backgroundColor: '#41B93D20' }}>
              <Key className="h-4 md:h-5 w-4 md:w-5" style={{ color: '#41B93D' }} />
            </div>
            <h3 className="font-bold text-sm md:text-base" style={{ color: '#3871C2' }}>Authentication</h3>
          </div>
          <p className="text-xs md:text-sm text-gray-600 mb-3">Get your Bearer token for API access</p>
          <Button 
            onClick={() => copyToClipboard(`${base}/api/v1/auth/login`)}
            size="sm"
            variant="outline"
            className="w-full text-xs md:text-sm"
            style={{ borderColor: '#00ADEF', color: '#3871C2' }}
          >
            <Copy className="h-3 w-3 mr-1 md:mr-2" />
            Copy Login URL
          </Button>
        </div>

        <div className="p-4 rounded-lg border" style={{ borderColor: '#00ADEF', backgroundColor: 'white' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-md" style={{ backgroundColor: '#3871C220' }}>
              <Link className="h-4 md:h-5 w-4 md:w-5" style={{ color: '#3871C2' }} />
            </div>
            <h3 className="font-bold text-sm md:text-base" style={{ color: '#3871C2' }}>Payments (PayIn)</h3>
          </div>
          <p className="text-xs md:text-sm text-gray-600 mb-3">Accept customer payments</p>
          <Button 
            onClick={() => copyToClipboard(`${base}/live/create_order`)}
            size="sm"
            variant="outline"
            className="w-full text-xs md:text-sm"
            style={{ borderColor: '#00ADEF', color: '#3871C2' }}
          >
            <Copy className="h-3 w-3 mr-1 md:mr-2" />
            Copy Create Order URL
          </Button>
        </div>

        <div className="p-4 rounded-lg border" style={{ borderColor: '#00ADEF', backgroundColor: 'white' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-md" style={{ backgroundColor: '#F6871320' }}>
              <AlertCircle className="h-4 md:h-5 w-4 md:w-5" style={{ color: '#F68713' }} />
            </div>
            <h3 className="font-bold text-sm md:text-base" style={{ color: '#3871C2' }}>Payouts (PayOut)</h3>
          </div>
          <p className="text-xs md:text-sm text-gray-600 mb-3">Send money to bank accounts</p>
          <Button 
            onClick={() => copyToClipboard(`${base}/api/v1/merchant/payout/direct`)}
            size="sm"
            variant="outline"
            className="w-full text-xs md:text-sm"
            style={{ borderColor: '#00ADEF', color: '#3871C2' }}
          >
            <Copy className="h-3 w-3 mr-1 md:mr-2" />
            Copy Payout URL
          </Button>
        </div>
      </div>

      {/* All Endpoints Overview */}
      <Section title="API Endpoints Overview">
        <div className="space-y-3">
          <EndpointCard 
            method="POST" 
            path="/api/v1/auth/login" 
            description="Obtain Bearer token for API authentication"
          />
          <EndpointCard 
            method="POST" 
            path="/live/create_order" 
            description="Create payment order (initiate gateway session)"
          />
          <EndpointCard 
            method="GET" 
            path="/live/get-txn-report" 
            description="Paginated list of wallet transactions"
          />
          <EndpointCard 
            method="GET" 
            path="/live/get-txn-report/status/{client_txn_id}" 
            description="Fetch a single PayIn transaction"
          />
          <EndpointCard 
            method="POST" 
            path="/api/v1/merchant/payout/direct" 
            description="Initiate payout to bank (IMPS/NEFT/etc.)"
          />
          <EndpointCard 
            method="POST" 
            path="/api/v1/merchant/payout/status/check" 
            description="Check payout status"
          />
          <EndpointCard 
            method="GET" 
            path="/api/v1/merchant/wallet-transactions" 
            description="Wallet transactions (PayOut & PayIn)"
          />
        </div>
      </Section>

      {/* Authentication Section */}
      <Section 
        title="Authentication" 
        description="Obtain Bearer token. Token expires in ACCESS_TOKEN_EXPIRE_MINUTES (default: 180 minutes)."
      >
        <div className="space-y-4">
          <div>
            <h4 className="font-bold mb-2 text-sm md:text-base" style={{ color: '#3871C2' }}>Request</h4>
            <div className="p-3 rounded-lg bg-white border" style={{ borderColor: '#00ADEF' }}>
              <div className="text-xs md:text-sm font-medium mb-1">Content-Type: application/x-www-form-urlencoded</div>
              <code className="text-xs md:text-sm break-all">grant_type=password&username={loginRequestExample.username}&password=secret_password</code>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-2 text-sm md:text-base" style={{ color: '#3871C2' }}>Curl Example</h4>
            <Code>{`curl -X POST ${base}/login \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d 'username=${loginRequestExample.username}&password=secret_password'`}</Code>
          </div>
          
          <div>
            <h4 className="font-bold mb-2 text-sm md:text-base" style={{ color: '#3871C2' }}>Response</h4>
            <Code>{JSON.stringify(loginResponseExample, null, 2)}</Code>
          </div>
          
          <div className="p-3 md:p-4 rounded-lg border" style={{ borderColor: '#41B93D', backgroundColor: '#F0FDF4' }}>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 md:h-5 w-4 md:w-5 mt-0.5" style={{ color: '#41B93D' }} />
              <div>
                <div className="font-medium text-sm md:text-base" style={{ color: '#3871C2' }}>Note:</div>
                <div className="text-xs md:text-sm text-gray-600">
                  Store <CodeInline>access_token</CodeInline> and send it in the <CodeInline>Authorization: Bearer {"<token>"}</CodeInline> header for subsequent requests.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Create Order Section */}
      <Section 
        title="Create Payment Order (PayIn)" 
        description="Creates a new wallet transaction and initiates payment session"
      >
        <div className="space-y-4">
          <div>
            <h4 className="font-bold mb-2 text-sm md:text-base" style={{ color: '#3871C2' }}>Required Fields</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
              {[
                { field: 'order_id', desc: 'Merchant order ID (6-64 chars)' },
                { field: 'amount', desc: 'Numeric string, 2 decimals' },
                { field: 'p_info', desc: 'Product information' },
                { field: 'customer_name', desc: 'Customer full name' },
                { field: 'customer_email', desc: 'Customer email' },
                { field: 'customer_mobile', desc: 'Customer phone number' },
                { field: 'redirect_url', desc: 'Merchant return URL (optional)' },
              ].map((item) => (
                <div key={item.field} className="p-3 bg-white rounded-lg border" style={{ borderColor: '#00ADEF' }}>
                  <div className="font-mono text-xs md:text-sm font-bold" style={{ color: '#3871C2' }}>{item.field}</div>
                  <div className="text-xs md:text-sm text-gray-600">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-2 text-sm md:text-base" style={{ color: '#3871C2' }}>Request Example</h4>
            <Code>{JSON.stringify(createOrderRequestExample, null, 2)}</Code>
          </div>
          
          <div>
            <h4 className="font-bold mb-2 text-sm md:text-base" style={{ color: '#3871C2' }}>Curl Example</h4>
            <Code>{`curl -X POST ${base}/create_order \\
  -H "Authorization: Bearer <API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(createOrderRequestExample)}'`}</Code>
          </div>
          
          <div>
            <h4 className="font-bold mb-2 text-sm md:text-base" style={{ color: '#3871C2' }}>Response</h4>
            <Code>{JSON.stringify(createOrderResponseExample, null, 2)}</Code>
          </div>
        </div>
      </Section>

      {/* Payout Direct Section */}
      <Section 
        title="Direct Payout (PayOut)" 
        description="Initiate payout to bank account. Amount debited from payout wallet with fees and GST applied."
      >
        <div className="space-y-4">
          <div>
            <h4 className="font-bold mb-2 text-sm md:text-base" style={{ color: '#3871C2' }}>Request Example</h4>
            <Code>{JSON.stringify(payoutDirectRequestExample, null, 2)}</Code>
          </div>
          
          <div>
            <h4 className="font-bold mb-2 text-sm md:text-base" style={{ color: '#3871C2' }}>Curl Example</h4>
            <Code>{`curl -X POST ${base}/api/v1/merchant/payout/direct \\
  -H "Authorization: Bearer <API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(payoutDirectRequestExample)}'`}</Code>
          </div>
          
          <div>
            <h4 className="font-bold mb-2 text-sm md:text-base" style={{ color: '#3871C2' }}>Response</h4>
            <Code>{JSON.stringify(payoutDirectResponseExample, null, 2)}</Code>
          </div>
          
          <div className="p-3 md:p-4 rounded-lg border" style={{ borderColor: '#F68713', backgroundColor: '#FEF6EC' }}>
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 md:h-5 w-4 md:w-5 mt-0.5" style={{ color: '#F68713' }} />
              <div>
                <div className="font-medium text-sm md:text-base" style={{ color: '#3871C2' }}>Important:</div>
                <div className="text-xs md:text-sm text-gray-600">
                  Save <CodeInline>upstream_order_id</CodeInline> from the provider response and <CodeInline>order_id</CodeInline> (your reference). Use the status check API with <CodeInline>upstream_order_id</CodeInline>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Status Check Section */}
      <Section 
        title="Payout Status Check" 
        description="Check payout status using upstream_order_id as query parameter"
      >
        <div className="space-y-4">
          <div>
            <h4 className="font-bold mb-2 text-sm md:text-base" style={{ color: '#3871C2' }}>Query Parameter</h4>
            <div className="p-3 md:p-4 bg-white rounded-lg border" style={{ borderColor: '#00ADEF' }}>
              <div className="font-mono text-xs md:text-sm" style={{ color: '#3871C2' }}>upstream_order_id (string, required)</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-2 text-sm md:text-base" style={{ color: '#3871C2' }}>Curl Example</h4>
            <Code>{`curl -X POST '${base}/api/v1/merchant/payout/status/check?${payoutStatusQueryExample}' \\
  -H "Authorization: Bearer <API_KEY>"`}</Code>
          </div>
        </div>
      </Section>

      {/* Quick Copy Buttons */}
      <div className="p-4 md:p-6 rounded-xl border" style={{ borderColor: '#00ADEF', backgroundColor: '#F0F9FF' }}>
        <h3 className="text-lg font-bold mb-3 md:mb-4" style={{ color: '#3871C2' }}>Quick Copy URLs</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
          {[
            { label: 'Login URL', url: `${base}/api/v1/auth/login` },
            { label: 'Create Order', url: `${base}/live/create_order` },
            { label: 'Transactions List', url: `${base}/live/get-txn-report` },
            { label: 'Payout Direct', url: `${base}/api/v1/merchant/payout/direct` },
            { label: 'Payout Status', url: `${base}/api/v1/merchant/payout/status/check?upstream_order_id=<ID>` },
            { label: 'Wallet Transactions', url: `${base}/api/v1/merchant/wallet-transactions` },
          ].map((item) => (
            <Button
              key={item.label}
              onClick={() => copyToClipboard(item.url)}
              variant="outline"
              className="justify-start text-xs md:text-sm"
              style={{ borderColor: '#00ADEF', color: '#3871C2' }}
            >
              <Copy className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="p-3 md:p-4 rounded-lg border text-center" style={{ borderColor: '#41B93D', backgroundColor: '#F0FDF4' }}>
        <div className="flex items-center justify-center gap-2">
          <CheckCircle className="h-4 md:h-5 w-4 md:w-5" style={{ color: '#41B93D' }} />
          <span className="font-medium text-sm md:text-base" style={{ color: '#3871C2' }}>All endpoints require Bearer token authentication</span>
        </div>
      </div>
    </div>
  );
}