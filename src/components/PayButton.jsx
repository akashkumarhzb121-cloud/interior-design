import { useState } from 'react';
import toast from 'react-hot-toast';
import { paymentApi } from '../api/services';
import { Button } from './ui/Button';

export default function PayButton({ serviceName, amount, customerInfo }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1. Ask backend to create a Razorpay Order
      const { data } = await paymentApi.createOrder({ amount, serviceName });
      const order = data.order;

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Add this to your frontend .env
        amount: order.amount,
        currency: order.currency,
        name: "Modplint Design",
        description: `Payment for ${serviceName}`,
        order_id: order.id,
        handler: async function (response) {
          // 3. On success, verify payment on backend
          try {
            await paymentApi.verifyPayment({
              ...response,
              serviceName,
              amount,
              customerName: customerInfo.name,
              customerEmail: customerInfo.email,
            });
            toast.success('Payment successful! We will contact you shortly.');
          } catch (err) {
            toast.error('Payment verification failed.');
          }
        },
        prefill: {
          name: customerInfo.name || '',
          email: customerInfo.email || '',
          contact: customerInfo.phone || '',
        },
        theme: {
          color: "#D4AF37" // Matches your gold theme
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        toast.error(`Payment Failed: ${response.error.description}`);
      });

      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error('Could not initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handlePayment} disabled={loading} variant="gold">
      {loading ? 'Processing...' : `Pay ₹${amount}`}
    </Button>
  );
}