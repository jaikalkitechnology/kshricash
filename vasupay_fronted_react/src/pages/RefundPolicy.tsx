import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Simple Header */}


      <section className="pt-[150px] pb-[100px] bg-gradient-to-br from-primary to-primary-dark">
        <div className="max-w-4xl mx-auto px-10 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Cancellation & Refund Policy
            </h1>
            <p className="text-white text-lg">
              Issued by Paramvasu Technologies Private Limited (operating as "VasuPay")
            </p>

          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="pb-12 pt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="space-y-8">

            {/* 1. GENERAL */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-foreground mb-3">1. General</h2>
              <p className="text-muted-foreground">
                All transactions processed through VasuPay are executed in real-time
                and are generally irreversible once completed.
              </p>
            </div>

            {/* 2. NON-REFUNDABLE */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Non-Refundable Transactions</h2>
              <p className="text-muted-foreground mb-3">
                The following transactions are strictly non-refundable:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Successful AEPS withdrawals
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Successful BBPS bill payments
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Wallet credits after confirmation
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Service charges once authentication is initiated
                </li>
              </ul>
            </div>

            {/* 3. REFUND ELIGIBILITY */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Refund Eligibility</h2>
              <p className="text-muted-foreground mb-3">
                Refunds may be initiated only in the following cases:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Failed transactions where the amount was debited
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Duplicate debits
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  System or processing errors attributable to VasuPay
                </li>
              </ul>
            </div>

            {/* 4. TIMELINE */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Refund Timeline</h2>
              <p className="text-muted-foreground">
                Eligible refunds shall be processed within{" "}
                <span className="font-semibold text-foreground">7–14 working days</span>{" "}
                in accordance with RBI and NPCI dispute resolution guidelines.
              </p>
            </div>

            {/* 5. HOW TO CONTACT */}
            <div className="pb-2">
              <h2 className="text-xl font-semibold text-foreground mb-3">5. How to Reach Us for Refund Related Queries?</h2>
              <p className="text-muted-foreground mb-4">
                For any refund-related concerns, you may contact us at:
              </p>
              <div className="pl-4">
                <p className="font-medium text-foreground mb-1">Email:</p>
                <p className="text-primary font-medium mb-4">contact@paramvasu.com</p>
                <p className="text-sm text-muted-foreground">
                  Our team will respond within{" "}
                  <span className="font-medium text-foreground">24–48 hours</span>{" "}
                  of receiving your request.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default RefundPolicy;