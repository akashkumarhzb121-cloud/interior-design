import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', profession: '', review: '', rating: 5 });
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      // Fetch ONLY approved testimonials for the public page
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/testimonials/approved`);
      setTestimonials(res.data.data || []);
    } catch (error) {
      console.error("Error fetching testimonials", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/testimonials`, formData);
      setSubmitMessage(res.data.message || "Review submitted! Awaiting admin approval.");
      setFormData({ name: '', profession: '', review: '', rating: 5 });
    } catch (error) {
      setSubmitMessage("Error submitting review. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-10">Client Testimonials</h1>
      
      {/* Testimonials Display Section */}
      {loading ? (
        <p className="text-center">Loading reviews...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {testimonials.map(t => (
            <div key={t._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="flex items-center mb-4">
                <img src={t.image?.url || 'https://via.placeholder.com/50'} alt={t.name} className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <h3 className="font-bold">{t.name}</h3>
                  <p className="text-sm text-gray-500">{t.profession}</p>
                </div>
              </div>
              <p className="text-gray-700 italic">"{t.review}"</p>
              <div className="mt-4 text-yellow-500">
                {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Review Form */}
      <div className="max-w-2xl mx-auto bg-gray-50 p-8 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center">Share Your Experience</h2>
        {submitMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-center">{submitMessage}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Your Name" required className="w-full p-3 border rounded"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input type="text" placeholder="Profession / Designation" required className="w-full p-3 border rounded"
              value={formData.profession} onChange={e => setFormData({...formData, profession: e.target.value})} />
          </div>
          <textarea placeholder="Write your review here..." required className="w-full p-3 border rounded h-32"
            value={formData.review} onChange={e => setFormData({...formData, review: e.target.value})}></textarea>
          <div>
            <label className="block mb-2 text-gray-700">Rating</label>
            <select className="w-full p-3 border rounded" value={formData.rating} onChange={e => setFormData({...formData, rating: Number(e.target.value)})}>
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Very Good</option>
              <option value="3">3 - Average</option>
              <option value="2">2 - Poor</option>
              <option value="1">1 - Terrible</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-black text-white p-3 rounded font-bold hover:bg-gray-800 transition">
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
};

export default TestimonialsPage;
