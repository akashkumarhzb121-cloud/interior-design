import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { contactApi } from '@/api/services'

const STATUS_COLORS = {
  new:      'bg-yellow-100 text-yellow-800',
  read:     'bg-blue-100 text-blue-800',
  replied:  'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-600',
}

export default function ContactInquiries() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [updating, setUpdating] = useState(null)
  const [expanded, setExpanded] = useState(null)

  const loadContacts = async () => {
    setLoading(true)
    try {
      const response = await contactApi.getAll()
      setContacts(response.data?.data || response.data || [])
    } catch (error) {
      console.error('[Contacts] Load error:', error)
      toast.error('Unable to load inquiries.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadContacts() }, [])

  const handleStatusUpdate = async (id, status) => {
    setUpdating(id)
    try {
      await contactApi.updateStatus(id, { status })
      toast.success(`Marked as ${status}.`)
      await loadContacts()
    } catch (error) {
      console.error('[Contacts] Status update error:', error)
      toast.error('Failed to update status.')
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inquiry permanently?')) return
    setDeleting(id)
    try {
      await contactApi.delete(id)
      toast.success('Inquiry deleted.')
      await loadContacts()
    } catch (error) {
      console.error('[Contacts] Delete error:', error)
      toast.error('Failed to delete inquiry.')
    } finally {
      setDeleting(null)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    try { return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }
    catch { return dateStr }
  }

  return (
    <Section className="bg-background min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Contact Inquiries" description="Review and manage incoming messages from your website." />

        <div className="mt-8 overflow-x-auto rounded-3xl border border-border bg-card">
          <div className="p-6 border-b border-border">
            <div className="text-sm text-muted-foreground">{contacts.length} inquir{contacts.length !== 1 ? 'ies' : 'y'}</div>
          </div>
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background/80 text-left text-sm uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Message</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-10 text-center text-muted-foreground">Loading inquiries...</td></tr>
              ) : contacts.length > 0 ? (
                contacts.map((contact) => (
                  <tr key={contact._id} className={contact.status === 'new' ? 'bg-yellow-50/30' : ''}>
                    <td className="px-6 py-4 text-foreground font-medium">{contact.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div>{contact.email}</div>
                      {contact.phone && <div className="text-xs">{contact.phone}</div>}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{contact.subject || 'General'}</td>
                    <td className="px-6 py-4 text-muted-foreground max-w-xs">
                      {expanded === contact._id ? (
                        <div>
                          <p className="whitespace-pre-wrap">{contact.message}</p>
                          <button onClick={() => setExpanded(null)} className="text-xs text-primary mt-1">Show less</button>
                        </div>
                      ) : (
                        <div>
                          <p className="truncate max-w-[200px]">{contact.message}</p>
                          {contact.message?.length > 60 && (
                            <button onClick={() => setExpanded(contact._id)} className="text-xs text-primary mt-1">Read more</button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">{formatDate(contact.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[contact.status] || 'bg-gray-100 text-gray-800'}`}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {contact.status === 'new' && (
                          <Button size="sm" onClick={() => handleStatusUpdate(contact._id, 'read')} disabled={updating === contact._id}>Mark Read</Button>
                        )}
                        {(contact.status === 'read' || contact.status === 'new') && (
                          <Button size="sm" variant="gold" onClick={() => handleStatusUpdate(contact._id, 'replied')} disabled={updating === contact._id}>Mark Replied</Button>
                        )}
                        {contact.status !== 'archived' && (
                          <Button size="sm" onClick={() => handleStatusUpdate(contact._id, 'archived')} disabled={updating === contact._id}>Archive</Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(contact._id)} disabled={deleting === contact._id}>
                          {deleting === contact._id ? '...' : 'Delete'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="px-6 py-10 text-center text-muted-foreground">No inquiries yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  )
}