import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { contactApi } from '@/api/services'

export default function ContactInquiries() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)

  const loadContacts = async () => {
    setLoading(true)
    try {
      const response = await contactApi.getAll()
      setContacts(response.data || [])
    } catch (error) {
      console.error('[v0] Error loading inquiries:', error)
      toast.error('Unable to load inquiries.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContacts()
  }, [])

  return (
    <Section className="bg-background min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Contact Inquiries" description="Review incoming inquiry messages from your website." />

        <div className="mt-8 overflow-x-auto rounded-3xl border border-border bg-card">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background/80 text-left text-sm uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-muted-foreground">Loading inquiries...</td>
                </tr>
              ) : contacts.length > 0 ? (
                contacts.map((contact) => (
                  <tr key={contact._id || contact.email || contact.name}>
                    <td className="px-6 py-4 text-foreground font-medium">{contact.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{contact.email}</td>
                    <td className="px-6 py-4 text-muted-foreground">{contact.phone || '—'}</td>
                    <td className="px-6 py-4 text-muted-foreground">{contact.subject || 'General'}</td>
                    <td className="px-6 py-4 text-muted-foreground max-w-xl truncate">{contact.message}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-muted-foreground">No inquiries found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  )
}
