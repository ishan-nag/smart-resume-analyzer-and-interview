import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Upload } from './pages/Upload';
import { Dashboard } from './pages/Dashboard';
import { Interview } from './pages/Interview';
import { Results } from './pages/Results';
import { useResume } from './context/ResumeContext';

function RequireResume({ children }) {
  const { parsedResume } = useResume();
  
  if (!parsedResume) {
    return <Navigate to="/upload" replace />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/upload" replace />} />
      <Route element={<MainLayout />}>
        <Route path="/upload" element={<Upload />} />
        <Route path="/dashboard" element={<RequireResume><Dashboard /></RequireResume>} />
        <Route path="/interview" element={<RequireResume><Interview /></RequireResume>} />
        <Route path="/results" element={<RequireResume><Results /></RequireResume>} />
      </Route>
    </Routes>
  );
}

export default App;
