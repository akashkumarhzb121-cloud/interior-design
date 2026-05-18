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
  '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
];

const serviceTypes = [
  { value: 'residential', label: 'Residential Design' },
  { value: 'commercial', label: 'Commercial Design' },
  { value: 'renovation', label: 'Renovation' },
  { value: 'consultation', label: 'Design Consultation' }
];

export default function BookingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await bookingsApi.submit(data);
      setIsSuccess(true);
      reset();
      toast.success('Consultation booked successfully!');
    } catch (error) {
      toast.error('Failed to book consultation. Please try again.');
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
                    {...register('email', { required: 'Email is required' })}
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
                <Select
                  label="Service Type"
                  options={serviceTypes}
                  {...register('serviceType', { required: 'Please select a service' })}
                  error={errors.serviceType?.message}
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
                    options={timeSlots.map(t => ({ value: t, label: t }))}
                    {...register('time', { required: 'Time is required' })}
                    error={errors.time?.message}
                  />
                </div>
                <Textarea
                  label="Project Details"
                  rows={4}
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
