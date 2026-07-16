import { motion } from 'framer-motion'
import { Shield, FileText } from 'lucide-react'
import { useSEO } from '@/hooks/useSEO'

export default function PrivacyPolicyPage() {
  const { HelmetComponent } = useSEO({
    title: 'Privacy Policy & Terms of Service',
    description:
      'Read the Privacy Policy and Terms of Service for Modplint Interiors, covering how we collect, use, and protect your information.',
    keywords: 'privacy policy, terms of service, terms and conditions, Modplint Interiors',
    canonical: 'https://www.modplintinteriors.com/privacy-policy',
    ogTitle: 'Privacy Policy & Terms of Service | Modplint Interiors',
    ogDescription: 'Our commitment to protecting your privacy and the terms that govern the use of our services.',
    ogUrl: 'https://www.modplintinteriors.com/privacy-policy',
    breadcrumb: [
      { name: 'Home', url: 'https://www.modplintinteriors.com/' },
      { name: 'Privacy Policy & Terms of Service', url: 'https://www.modplintinteriors.com/privacy-policy' },
    ],
  })

  const lastUpdated = 'July 15, 2026'

  return (
    <>
      <HelmetComponent />

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 bg-charcoal overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className="inline-block px-4 py-2 bg-gold/20 text-gold text-sm font-medium rounded-full mb-6">
              Legal
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white">
              Privacy Policy &amp; Terms of Service
            </h1>
            <p className="mt-6 text-lg text-white/70 leading-relaxed">
              Last updated: {lastUpdated}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-16"
          >
            {/* Privacy Policy */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-gold" />
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-charcoal dark:text-white">
                  Privacy Policy
                </h2>
              </div>

              <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-charcoal/80 dark:text-white/70 leading-relaxed">
                <p>
                  Modplint Interiors ({'"we,"'} {'"us,"'} or {'"our"'}) respects your privacy and is
                  committed to protecting any personal information you share with us through our
                  website, consultation bookings, and contact forms.
                </p>

                <div>
                  <h3 className="text-lg font-semibold text-charcoal dark:text-white mb-2">
                    Information We Collect
                  </h3>
                  <p>
                    When you fill out our contact form, booking form, or otherwise reach out to us,
                    we may collect your name, phone number, email address, project details, and any
                    other information you choose to provide.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-charcoal dark:text-white mb-2">
                    How We Use Your Information
                  </h3>
                  <p>We use the information you provide to:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>Respond to your inquiries and consultation requests</li>
                    <li>Schedule and manage bookings and appointments</li>
                    <li>Communicate updates about your project</li>
                    <li>Improve our website and services</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-charcoal dark:text-white mb-2">
                    How We Protect Your Information
                  </h3>
                  <p>
                    We do not sell, rent, or trade your personal information to third parties. Your
                    information is stored securely and is only accessible to authorized team members
                    who need it to respond to your request or manage your project.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-charcoal dark:text-white mb-2">
                    Cookies
                  </h3>
                  <p>
                    Our website may use cookies to improve your browsing experience and understand
                    how visitors interact with our site. You can disable cookies through your browser
                    settings at any time.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-charcoal dark:text-white mb-2">
                    Your Rights
                  </h3>
                  <p>
                    You may request access to, correction of, or deletion of your personal
                    information at any time by contacting us at{' '}
                    <a
                      href="mailto:modplintinteriors@gmail.com"
                      className="text-gold hover:underline"
                    >
                      modplintinteriors@gmail.com
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>

            {/* Terms of Service */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-gold" />
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-charcoal dark:text-white">
                  Terms of Service
                </h2>
              </div>

              <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-charcoal/80 dark:text-white/70 leading-relaxed">
                <p>
                  By using this website and our services, you agree to the following terms and
                  conditions. Please read them carefully.
                </p>

                <div>
                  <h3 className="text-lg font-semibold text-charcoal dark:text-white mb-2">
                    Use of Our Website
                  </h3>
                  <p>
                    This website is provided for informational purposes to help you learn about
                    Modplint Interiors and our design services. You agree not to misuse the site,
                    attempt unauthorized access, or use it for any unlawful purpose.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-charcoal dark:text-white mb-2">
                    Consultations &amp; Bookings
                  </h3>
                  <p>
                    Booking a consultation through our website does not guarantee project
                    acceptance. Final scope, pricing, and timelines for any project will be agreed
                    upon separately in writing between you and Modplint Interiors.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-charcoal dark:text-white mb-2">
                    Intellectual Property
                  </h3>
                  <p>
                    All content on this website, including images, text, logos, and design concepts,
                    is the property of Modplint Interiors and may not be reproduced or used without
                    our written permission.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-charcoal dark:text-white mb-2">
                    Limitation of Liability
                  </h3>
                  <p>
                    While we strive to keep information on this website accurate and up to date, we
                    make no warranties about its completeness or accuracy and are not liable for any
                    losses arising from its use.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-charcoal dark:text-white mb-2">
                    Changes to These Terms
                  </h3>
                  <p>
                    We may update this Privacy Policy and these Terms of Service from time to time.
                    Any changes will be posted on this page with an updated revision date.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-charcoal dark:text-white mb-2">
                    Contact Us
                  </h3>
                  <p>
                    If you have any questions about this Privacy Policy or these Terms of Service,
                    please contact us at{' '}
                    <a
                      href="mailto:modplintinteriors@gmail.com"
                      className="text-gold hover:underline"
                    >
                      modplintinteriors@gmail.com
                    </a>{' '}
                    or call us at{' '}
                    <a href="tel:+918104648421" className="text-gold hover:underline">
                      +91-8104648421
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}