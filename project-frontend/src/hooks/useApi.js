import { useState } from 'react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, options);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || data.error || 'An error occurred while making the request.');
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadResume = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/api/upload', {
      method: 'POST',
      body: formData, // fetch sets correct content type for form data
    });
  };

  const getRoles = async () => {
    return request('/api/roles', { method: 'GET' });
  };

  const analyzeResume = async (parsedResume, roleIds) => {
    return request('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parsed_resume: parsedResume, role_ids: roleIds }),
    });
  };

  const generateInterview = async (parsedResume, roleId, types = ['behavioural', 'technical', 'domain-specific']) => {
    return request('/api/interview/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parsed_resume: parsedResume, role_id: roleId, interview_types: types }),
    });
  };

  const evaluateInterview = async (roleId, submittedAnswers) => {
    return request('/api/interview/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role_id: roleId, submitted_answers: submittedAnswers }),
    });
  };

  return {
    loading,
    error,
    setError,
    uploadResume,
    getRoles,
    analyzeResume,
    generateInterview,
    evaluateInterview
  };
}
