import { useState } from 'react';
import toast from 'react-hot-toast';
import { paymentApi } from '../api/services';
import { Button } from './ui/Button';

// Simple modal overlay to collect customer info before payment
function CustomerInfoModal({ planTitle, price, onConfirm, onCancel }) {
  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim())                          e.name  = 'Name is required';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) e.email = 'Valid email is required';
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) e.phone = 'Valid 10-digit phone required';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onConfirm({ name: name.trim(), email: email.trim(), phone: phone.trim() });
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{
        background: '#1a1a1a', borderRadius: '1rem', padding: '2rem',
        width: '100%', maxWidth: '420px', border: '1px solid #D4AF37',
        color: '#fff', fontFamily: 'Inter, sans-serif',
      }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#D4AF37', margin: '0 0 0.25rem' }}>
          Complete Your Booking
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', margin: '0 0 1.5rem' }}>
          {planTitle} — <strong style={{ color: '#D4AF37' }}>{price}</strong>
        </p>

        {[
          { id: 'name',  label: 'Full Name',     type: 'text',  val: name,  set: setName,  placeholder: 'Your full name' },
          { id: 'email', label: 'Email Address', type: 'email', val: email, set: setEmail, placeholder: 'you@example.com' },
          { id: 'phone', label: 'Phone Number',  type: 'tel',   val: phone, set: setPhone, placeholder: '9876543210' },
        ].map(({ id, label, type, val, set, placeholder }) => (
          <div key={id} style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.35rem' }}>
              {label} <span style={{ color: '#D4AF37' }}>*</span>
            </label>
            <input
              type={type}
              value={val}
              onChange={(e) => { set(e.target.value); setErrors((prev) => ({ ...prev, [id]: '' })); }}
              placeholder={placeholder}
              style={{
                width: '100%', padding: '0.6rem 0.75rem', borderRadius: '0.5rem',
                background: '#2a2a2a', border: `1px solid ${errors[id] ? '#ef4444' : 'rgba(255,255,255,0.15)'}`,
                color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none',
              }}
            />
            {errors[id] && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>{errors[id]}</p>}
          </div>
        ))}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '0.75rem', borderRadius: '0.5rem',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff', cursor: 'pointer', fontSize: '0.9rem',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              flex: 2, padding: '0.75rem', borderRadius: '0.5rem',
              background: '#D4AF37', border: 'none',
              color: '#1a1a1a', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
            }}
          >
            Proceed to Pay
          </button>
        </div>
      </div>
    </div>
  );
}

// Extracts the numeric amount from strings like "₹1,000", "₹600", "₹15,000"
function parseAmount(priceString) {
  return Number(priceString.replace(/[^\d]/g, ''));
}

export default function PayButton({ serviceName, amount, priceDisplay, variant = 'gold' }) {
  const [loading,     setLoading]     = useState(false);
  const [showModal,   setShowModal]   = useState(false);

  // amount can be a number or a formatted string like "₹1,000"
  const numericAmount = typeof amount === 'number' ? amount : parseAmount(String(amount));

  const initiatePayment = async (customerInfo) => {
    setShowModal(false);
    setLoading(true);
    try {
      // 1. Create Razorpay order on backend
      const { data } = await paymentApi.createOrder({ amount: numericAmount, serviceName });
      const order = data.order;

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Modplint Interiors',
        description: `Payment for ${serviceName}`,
        order_id: order.id,
        handler: async function (response) {
          // 3. Verify on backend
          try {
            await paymentApi.verifyPayment({
              ...response,
              serviceName,
              amount: numericAmount,
              customerName:  customerInfo.name,
              customerEmail: customerInfo.email,
            });
            toast.success('🎉 Payment successful! We will contact you shortly.', { duration: 5000 });
          } catch {
            toast.error('Payment verification failed. Please contact us.');
          }
        },
        prefill: {
          name:    customerInfo.name  || '',
          email:   customerInfo.email || '',
          contact: customerInfo.phone || '',
        },
        theme: { color: '#D4AF37' },
        modal: {
          ondismiss: () => { setLoading(false); },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (error) {
      console.error('Payment init error:', error);
      toast.error('Could not initialize payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      {showModal && (
        <CustomerInfoModal
          planTitle={serviceName}
          price={priceDisplay || `₹${numericAmount}`}
          onConfirm={initiatePayment}
          onCancel={() => setShowModal(false)}
        />
      )}
      <Button
        onClick={() => setShowModal(true)}
        disabled={loading}
        variant={variant}
        className="w-full"
      >
        {loading ? 'Processing…' : `Get Started`}
      </Button>
    </>
  );
}
