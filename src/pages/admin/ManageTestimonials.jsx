import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTestimonials = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/testimonials`, {
        withCredentials: true 
      });
      setTestimonials(res.data.data || []);
    } catch (error) {
      console.error("Error fetching testimonials", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/testimonials/${id}/status`, { status: newStatus }, {
        withCredentials: true
      });
      fetchTestimonials(); // Refresh list after update
    } catch (error) {
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/testimonials/${id}`, {
        withCredentials: true
      });
      fetchTestimonials();
    } catch (error) {
      alert("Failed to delete testimonial.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Testimonials</h2>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {testimonials.map((t) => (
              <tr key={t._id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{t.name}</div>
                  <div className="text-sm text-gray-500">{t.profession}</div>
                  <div className="text-xs text-yellow-500 mt-1">{'★'.repeat(t.rating)}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">{t.review}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${t.status === 'approved' ? 'bg-green-100 text-green-800' : 
                      t.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {t.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium space-x-2">
                  {t.status !== 'approved' && (
                    <button onClick={() => handleStatusChange(t._id, 'approved')} className="text-green-600 hover:text-green-900">Approve</button>
                  )}
                  {t.status !== 'rejected' && (
                    <button onClick={() => handleStatusChange(t._id, 'rejected')} className="text-orange-600 hover:text-orange-900">Reject</button>
                  )}
                  <button onClick={() => handleDelete(t._id)} className="text-red-600 hover:text-red-900 ml-4">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageTestimonials;
