import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Simple Header */}
      <section className="pt-[150px] pb-[100px] bg-gradient-to-br from-primary to-primary-dark">
        <div className="max-w-4xl mx-auto px-10 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Privacy Policy
            </h1>
            <p className="text-white text-lg">
              Issued by Paramvasu Technologies Private Limited (operating as "VasuPay")
            </p>

            <p className="text-white text-lg">
              This Policy is governed under the Information Technology Act, 2000.
            </p>

          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-12 pt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="space-y-8">

            {/* 1. INFORMATION COLLECTED */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Information Collected</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Personal data
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Sensitive personal data including Aadhaar and bank details
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Transaction, device and IP data
                </li>
              </ul>
            </div>

            {/* 2. PURPOSE */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Purpose</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  KYC and AML compliance
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Transaction processing
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Fraud prevention
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Statutory and regulatory reporting
                </li>
              </ul>
            </div>

            {/* 3. DISCLOSURE */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Disclosure</h2>
              <p className="text-muted-foreground">
                Information may be shared with RBI-authorised banks, NPCI, BBPOUs, UIDAI, FIU-IND,
                regulators and law enforcement agencies as required under applicable law.
              </p>
            </div>

            {/* 4. DATA SECURITY */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Security</h2>
              <p className="text-muted-foreground">
                Reasonable security practices including encryption, access controls,
                monitoring and periodic audits are implemented in compliance with the
                Information Technology Act, 2000 and the Rules made thereunder.
              </p>
            </div>

            {/* 5. DATA RETENTION */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Data Retention</h2>
              <p className="text-muted-foreground">
                Data shall be retained as mandated by RBI regulations, PMLA, the IT Act, 2000,
                tax laws and other applicable statutory guidelines.
              </p>
            </div>

            {/* 6. GRIEVANCE OFFICER */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Grievance Officer</h2>
              <p className="text-muted-foreground mb-4">
                In compliance with the Information Technology (Reasonable Security Practices and Procedures
                and Sensitive Personal Data or Information) Rules, 2011, the Grievance Officer details are provided below:
              </p>
              <div className="bg-muted/20 rounded-lg p-4">
                <p className="font-medium text-foreground mb-1">Contact:</p>
                <p className="text-primary font-medium mb-4">contact@paramvasu.com</p>
                <p className="font-medium text-foreground mb-1">Registered Office Address:</p>
                <p className="text-muted-foreground">
                  Paramvasu Technologies Private Limited<br />
                  SH N B1/A, H N 01, Ground, Mahavir Nagar,<br />
                  Deepak Hos, Mira Road,<br />
                  Thane, Maharashtra - 401107.
                </p>
              </div>
            </div>

            {/* Compliance Section Header */}
            <div className="pt-4">
              <h2 className="text-2xl font-semibold text-foreground mb-6">Compliance, AML & Risk Management Policy</h2>
            </div>

            {/* 7. AML Compliance */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">7. AML / CFT Compliance</h3>
              <p className="text-muted-foreground">
                VasuPay complies with the Prevention of Money Laundering Act (PMLA), 2002,
                RBI KYC Master Directions and FIU-IND reporting obligations.
              </p>
            </div>

            {/* 8. Risk Management */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">8. Risk Management</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Agent audits and monitoring
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Transaction velocity controls
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Geo-location and device tracking
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Blacklisting and suspension mechanisms
                </li>
              </ul>
            </div>

            {/* 9. Regulatory Cooperation */}
            <div className="pb-2">
              <h3 className="text-lg font-semibold text-foreground mb-3">9. Regulatory Cooperation</h3>
              <p className="text-muted-foreground">
                VasuPay shall cooperate with RBI, NPCI, BBPS, partner banks, enforcement agencies,
                and other statutory bodies for compliance, investigations and regulatory reporting.
              </p>
            </div>

          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;