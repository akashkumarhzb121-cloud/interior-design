import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Linkedin,
  ArrowRight,
} from 'lucide-react'

const footerLinks = {
  company: [
    { href: '/about',        label: 'About Us' },
    { href: '/projects',     label: 'Our Projects' },
    { href: '/services',     label: 'Services' },
    { href: '/testimonials', label: 'Testimonials' },
  ],
  services: [
    { href: '/services', label: 'Residential Design' },
    { href: '/services', label: 'Commercial Spaces' },
    { href: '/services', label: 'Renovation' },
    { href: '/services', label: 'Consultation' },
  ],
  legal: [
    { href: '#', label: 'Privacy Policy' },
    { href: '#', label: 'Terms of Service' },
  ],
}

const socialLinks = [
  { href: '#', icon: Instagram, label: 'Instagram' },
  { href: '#', icon: Facebook,  label: 'Facebook' },
  { href: '#', icon: Linkedin,  label: 'LinkedIn' },
]

export default function Footer() {
  return (
    // FIX: replaced all `text-primary-foreground` with `text-white`.
    // The footer always has a dark charcoal background. In dark mode,
    // --primary-foreground resolves to oklch(0.12) which is near-black —
    // making every line of footer text completely invisible against the
    // dark background. Since the footer is always dark, text-white is
    // the correct colour in both light and dark mode.
    <footer className="bg-charcoal text-white">
      {/* CTA Section */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row items-center justify-between gap-8"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">
                Ready to Transform Your Space?
              </h2>
              <p className="mt-2 text-white/70">
                {"Let's create something extraordinary together."}
              </p>
            </div>
            <Link
              to="/booking"
              className="flex items-center gap-2 px-8 py-4 bg-gold text-charcoal rounded-full font-medium hover:bg-gold-light transition-colors group"
            >
              Book Free Consultation
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand — FIX: logo stacked so "Interiors" sits below "Modplint"
              starting from the "p", matching the design reference image */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block">
              <span className="block text-2xl font-serif font-bold text-gold leading-tight">
                Modplint
              </span>
              {/*
                ml-[0.2rem] nudges "Interiors" right so its left edge
                aligns with the "p" in "Modplint" (after the "Mod" prefix).
                Adjust this value if your font renders slightly differently.
              */}
              <span className="block text-2xl font-serif font-light text-white leading-tight ml-[0.2rem]">
                Interiors
              </span>
            </Link>
            <p className="mt-4 text-white/70 text-sm leading-relaxed">
              Transforming spaces into extraordinary experiences. Premium interior
              design services in Mumbai since 2024.
            </p>
            <div className="flex items-center gap-4 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-charcoal transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-gold transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold mb-4">
              Services
            </h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-gold transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold mb-4">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <span className="text-white/70 text-sm">
                  Oshiwara, Andheri West,
                  <br />
                  Mumbai, Maharashtra 400102
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold flex-shrink-0" />
                <a
                  href="tel:+918741072815"
                  className="text-white/70 hover:text-gold transition-colors text-sm"
                >
                  +91 8741072815
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold flex-shrink-0" />
                <a
                  href="mailto:modplintinteriors@gmail.com"
                  className="text-white/70 hover:text-gold transition-colors text-sm"
                >
                  modplintinteriors@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/50 text-sm">
              © {new Date().getFullYear()} Modplint Interiors. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {footerLinks.legal.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-white/50 hover:text-gold transition-colors text-sm"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
