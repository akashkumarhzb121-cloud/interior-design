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

// Inline reply modal — shown when admin clicks "Mark Replied"
function ReplyModal({ contact, onClose, onSent }) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!message.trim()) { toast.error('Please write a reply message.'); return }
    setSending(true)
    try {
      await contactApi.updateStatus(contact._id, { status: 'replied', adminNotes: message.trim() })
      toast.success('Reply sent successfully.')
      onSent()
    } catch (error) {
      console.error('[Contacts] Reply error:', error)
      toast.error('Failed to send reply.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--card, #fff)', borderRadius: '1rem', padding: '1.5rem',
        width: '100%', maxWidth: '500px', border: '1px solid var(--border)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--foreground)' }}>
          Reply to {contact.name}
        </h2>
        <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
          {contact.email}
        </p>

        {/* Original message for reference */}
        <div style={{
          background: 'var(--secondary, #f5f5f5)', borderRadius: '0.5rem',
          padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8rem',
          color: 'var(--muted-foreground)', maxHeight: '100px', overflowY: 'auto',
        }}>
          <strong>Their message:</strong><br />
          {contact.message}
        </div>

        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.4rem', color: 'var(--foreground)' }}>
          Your reply *
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your reply here... This will be emailed to the customer."
          rows={5}
          style={{
            width: '100%', padding: '0.65rem 0.75rem', borderRadius: '0.5rem',
            border: '1px solid var(--border)', background: 'var(--background)',
            color: 'var(--foreground)', fontSize: '0.9rem', resize: 'vertical',
            boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none',
          }}
        />

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.6rem 1.2rem', borderRadius: '0.5rem',
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--foreground)', cursor: 'pointer', fontSize: '0.875rem',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            style={{
              padding: '0.6rem 1.4rem', borderRadius: '0.5rem',
              background: '#D4AF37', border: 'none',
              color: '#1a1a1a', cursor: sending ? 'not-allowed' : 'pointer',
              fontWeight: 600, fontSize: '0.875rem', opacity: sending ? 0.7 : 1,
            }}
          >
            {sending ? 'Sending...' : 'Send Reply'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ContactInquiries() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [updating, setUpdating] = useState(null)
  const [expanded, setExpanded] = useState(null)
  // FIX: track which contact's reply modal is open
  const [replyContact, setReplyContact] = useState(null)

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

        {/* FIX: Reply modal rendered here */}
        {replyContact && (
          <ReplyModal
            contact={replyContact}
            onClose={() => setReplyContact(null)}
            onSent={() => { setReplyContact(null); loadContacts() }}
          />
        )}

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
                        {/* FIX: "Mark Replied" now opens the reply modal instead of directly changing status */}
                        {(contact.status === 'read' || contact.status === 'new') && (
                          <Button size="sm" variant="gold" onClick={() => setReplyContact(contact)} disabled={updating === contact._id}>
                            Reply
                          </Button>
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
