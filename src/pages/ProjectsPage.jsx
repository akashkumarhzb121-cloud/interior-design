import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/projects`);
        // Backend wraps data in { success: true, data: [...] }
        setProjects(res.data.data || []); 
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) return <div className="text-center py-20">Loading projects...</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-10">Our Portfolio</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <div key={project._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* FIXED: Ensure we access the URL string from the image object */}
            <img 
              src={project.images && project.images.length > 0 ? project.images[0].url : 'https://via.placeholder.com/400x300'} 
              alt={project.title} 
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">{project.title}</h2>
              <p className="text-gray-600 mb-4">{project.description}</p>
              <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                {project.category || 'General'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
