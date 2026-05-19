import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Calendar, Clock, User, Mail, Phone, MessageSquare, CheckCircle } from 'lucide-react';
import { Section, SectionHeader } from '../components/ui/Section';
import { Button } from '../components/ui/Button';
import { Input, Textarea, Select } from '../components/ui/Input';
import { FadeIn, StaggerContainer, StaggerItem } from '../components/animations/PageTransition';
import { bookingsApi } from '../api/services';

const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
];

// ✅ FIX 1: Values match the backend enum exactly (Title Case)
//    and field is named 'projectType' to match backend expectation
const projectTypes = [
  { value: 'Residential',  label: 'Residential Design' },
  { value: 'Commercial',   label: 'Commercial Design' },
  { value: 'Office',       label: 'Office Design' },
  { value: 'Hospitality',  label: 'Hospitality Design' },
  { value: 'Retail',       label: 'Retail Design' },
  { value: 'Other',        label: 'Other' },
];

// ✅ FIX 2: Budget options added (accepted by backend)
const budgetOptions = [
  { value: 'Under $10k',   label: 'Under $10k' },
  { value: '$10k–$25k',    label: '$10k – $25k' },
  { value: '$25k–$50k',    label: '$25k – $50k' },
  { value: '$50k–$100k',   label: '$50k – $100k' },
  { value: '$100k+',       label: '$100k+' },
  { value: 'Not sure',     label: 'Not sure' },
];

export default function BookingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: { budget: 'Not sure' },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await bookingsApi.submit(data);
      setIsSuccess(true);
      reset();
      toast.success('Consultation booked successfully!');
    } catch (error) {
      // ✅ FIX 3: Show actual server error message to help debug
      const msg =
        error?.response?.data?.message ||
        'Failed to book consultation. Please try again.';
      toast.error(msg);
      console.error('[BookingPage] Booking error:', error?.response?.data || error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Section className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-serif text-foreground mb-4">Booking Confirmed!</h2>
          <p className="text-muted-foreground mb-8">
            Thank you for scheduling a consultation with us. We will contact you shortly to confirm your appointment.
          </p>
          <Button onClick={() => setIsSuccess(false)}>Book Another Consultation</Button>
        </motion.div>
      </Section>
    );
  }

  return (
    <>
      <Section className="pt-32 pb-16 bg-secondary/30">
        <FadeIn>
          <SectionHeader
            title="Book a Consultation"
            description="Schedule a personalized design consultation with our expert team"
          />
        </FadeIn>
      </Section>

      <Section>
        <div className="grid lg:grid-cols-2 gap-12">
          <FadeIn>
            <div className="bg-card rounded-2xl p-8 border border-border">
              <h3 className="text-2xl font-serif text-foreground mb-6">Schedule Your Visit</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    icon={User}
                    {...register('name', { required: 'Name is required' })}
                    error={errors.name?.message}
                  />
                  <Input
                    label="Email"
                    type="email"
                    icon={Mail}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Please enter a valid email',
                      },
                    })}
                    error={errors.email?.message}
                  />
                </div>

                <Input
                  label="Phone"
                  type="tel"
                  icon={Phone}
                  {...register('phone', { required: 'Phone is required' })}
                  error={errors.phone?.message}
                />

                {/* ✅ FIX 1: renamed from 'serviceType' → 'projectType', values are Title Case */}
                <Select
                  label="Project Type"
                  options={projectTypes}
                  {...register('projectType', { required: 'Please select a project type' })}
                  error={errors.projectType?.message}
                />

                {/* ✅ FIX 2: Budget field added */}
                <Select
                  label="Budget Range"
                  options={budgetOptions}
                  {...register('budget')}
                  error={errors.budget?.message}
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Preferred Date"
                    type="date"
                    icon={Calendar}
                    {...register('date', { required: 'Date is required' })}
                    error={errors.date?.message}
                  />
                  <Select
                    label="Preferred Time"
                    options={timeSlots.map((t) => ({ value: t, label: t }))}
                    {...register('time', { required: 'Time is required' })}
                    error={errors.time?.message}
                  />
                </div>

                <Textarea
                  label="Project Details"
                  rows={4}
                  icon={MessageSquare}
                  {...register('message')}
                  placeholder="Tell us about your project..."
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Booking...' : 'Book Consultation'}
                </Button>
              </form>
            </div>
          </FadeIn>

          <StaggerContainer className="space-y-6">
            <StaggerItem>
              <div className="bg-primary/10 rounded-2xl p-8">
                <h3 className="text-xl font-serif text-foreground mb-4">What to Expect</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                    <span>60-minute personalized consultation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                    <span>Discussion of your vision and requirements</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                    <span>Preliminary design concepts and ideas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                    <span>Budget estimation and timeline overview</span>
                  </li>
                </ul>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="bg-card rounded-2xl p-8 border border-border">
                <h3 className="text-xl font-serif text-foreground mb-4">Contact Information</h3>
                <div className="space-y-4 text-muted-foreground">
                  <p className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    +1 (555) 123-4567
                  </p>
                  <p className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    hello@luxeinteriors.com
                  </p>
                  <p className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    Mon - Fri: 9:00 AM - 6:00 PM
                  </p>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </Section>
    </>
  );
}
