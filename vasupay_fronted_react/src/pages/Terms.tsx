import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Minimal Header */}
      <section className="pt-[150px] pb-[100px] bg-gradient-to-br from-primary to-primary-dark">
        <div className="max-w-4xl mx-auto px-10 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Terms & Conditions
            </h1>
            <p className="text-white text-lg">
              Please read these terms carefully before using Kshricash services.
            </p>
            <div className="mt-4 text-sm text-white">
              Last Updated: 10 December 2025
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Intro Note */}
          <div className="bg-muted/30 p-6 rounded-lg mb-8">
            <p className="text-sm font-medium">
              THIS DOCUMENT IS AN ELECTRONIC RECORD IN TERMS OF THE INFORMATION
              TECHNOLOGY ACT, 2000 AND THE RULES MADE THEREUNDER AND DOES NOT
              REQUIRE ANY PHYSICAL OR DIGITAL SIGNATURE.
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-8 text-foreground">
            <div>
              <p className="mb-4">
                These Terms and Conditions ("Terms") constitute a legally binding
                agreement between
                <strong> Paramvasu Technologies Private Limited</strong>,
                operating under the brand name
                <strong> Kshricash</strong> (hereinafter "Company", "Kshricash", "We",
                "Us", "Our"), and any individual, customer, agent, merchant or
                business entity ("User", "You", "Your") accessing or using the
                platform.
              </p>

              <div className="bg-primary/5 border-l-4 border-primary p-4 my-4">
                <p className="font-medium">
                  BY ACCESSING OR USING THE PLATFORM, YOU AGREE TO BE BOUND BY
                  THESE TERMS.
                </p>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-8">
              {[
                {
                  title: "1. Regulatory Status and Role of Kshricash",
                  items: [
                    "Kshricash acts solely as a Technology Service Provider (TSP).",
                    "We do not provide banking services or issue prepaid instruments.",
                    "All regulated services such as AEPS, BBPS wallet services are provided through RBI-authorised entities.",
                    "Our role is limited to technology infrastructure, routing, reporting, reconciliation, and support.",
                  ],
                },
                {
                  title: "2. Applicable Laws and Regulations",
                  content: "These Terms comply with Indian laws including:",
                  items: [
                    "Information Technology Act, 2000",
                    "Payment and Settlement Systems Act, 2007",
                    "RBI KYC Master Directions",
                    "NPCI & BBPS guidelines",
                    "Prevention of Money Laundering Act, 2002",
                  ],
                },
                {
                  title: "3. Eligibility and Onboarding",
                  items: [
                    "Users must be 18+ and legally competent.",
                    "RBI-mandated KYC is compulsory.",
                    "Kshricash may accept, reject or terminate onboarding without reason.",
                    "Submitting forged documents may result in legal action.",
                  ],
                },
                {
                  title: "4. Services",
                  content: "Kshricash facilitates the following:",
                  items: [
                    "Aadhaar Enabled Payment System (AEPS)",
                    "Bharat Bill Payment System (BBPS)",
                    "Semi-closed wallet services",
                    "Agent-assisted financial services",
                  ],
                },
                {
                  title: "5. AEPS Terms and Disclaimers",
                  items: [
                    "AEPS requires Aadhaar-based authentication.",
                    "Success depends on UIDAI, NPCI, and bank servers.",
                    "Kshricash is not liable for biometric mismatches or downtimes.",
                    "Charges become non-refundable after authentication attempt.",
                  ],
                },
                {
                  title: "6. Wallet Terms",
                  items: [
                    "Semi-closed, non–interest bearing wallets.",
                    "Balances may be frozen for AML or regulatory reasons.",
                    "Wallet balance is not a bank deposit.",
                  ],
                },
                {
                  title: "7. Agent Obligations",
                  items: [
                    "Follow RBI, NPCI and BBPS rules.",
                    "Display charges transparently.",
                    "Maintain confidentiality.",
                    "No fraud, misrepresentation, or overcharging.",
                    "Cooperate with audits and investigations.",
                  ],
                },
                {
                  title: "8. Fees, Commissions and Settlement",
                  items: [
                    "Fee structures are communicated electronically.",
                    "Pricing may be revised anytime.",
                    "Commissions depend on reconciliation and bank settlement.",
                  ],
                },
                {
                  title: "9. Indemnification",
                  text:
                    "Users agree to indemnify and hold harmless Kshricash, its employees and partners from claims arising due to misuse, fraud, law violations or breach of these Terms.",
                },
                {
                  title: "10. Limitation of Liability",
                  text:
                    "Kshricash shall not be liable for indirect, incidental, or consequential damages. Total liability shall not exceed fees paid by the User in the last 12 months.",
                },
                {
                  title: "11. Force Majeure",
                  text:
                    "We shall not be responsible for delays due to events outside reasonable control such as natural disasters, server outages, strikes, or government orders.",
                },
                {
                  title: "12. Confidentiality",
                  text:
                    "Users must maintain strict confidentiality of all platform and customer information.",
                },
                {
                  title: "13. Suspension and Termination",
                  text:
                    "Kshricash may terminate or suspend access immediately in cases of fraud or regulatory breach.",
                },
                {
                  title: "14. Severability, Waiver and Assignment",
                  text:
                    "Invalid clauses do not affect the remaining Terms. Kshricash may assign rights without notice.",
                },
                {
                  title: "15. Governing Law and Jurisdiction",
                  text: (
                    <>
                      These Terms are governed by Indian law. Courts at{" "}
                      <strong>Thane, Maharashtra</strong> have exclusive
                      jurisdiction.
                    </>
                  ),
                },
              ].map((section, index) => (
                <div key={index} className="border-b pb-6">
                  <h2 className="text-xl font-semibold mb-4 text-foreground">
                    {section.title}
                  </h2>

                  {section.content && (
                    <p className="mb-3 text-muted-foreground">
                      {section.content}
                    </p>
                  )}

                  {section.text && (
                    <p className="text-muted-foreground">{section.text}</p>
                  )}

                  {section.items && (
                    <ul className="space-y-2 text-muted-foreground">
                      {section.items.map((item, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Terms;
