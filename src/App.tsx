import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { ApplicationDetailPage } from './pages/ApplicationDetailPage';
import { ApplicationFormPage } from './pages/ApplicationFormPage';
import { FonctionnaliteFormPage } from './pages/FonctionnaliteFormPage';
import { SanityChecksPage } from './pages/SanityChecksPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/applications/:id" element={<ApplicationDetailPage />} />
          <Route path="/applications/:id/edit" element={<ApplicationFormPage />} />
          <Route path="/applications/new" element={<ApplicationFormPage />} />
          <Route path="/applications/:applicationId/fonctionnalites/new" element={<FonctionnaliteFormPage />} />
          <Route path="/fonctionnalites/:id/edit" element={<FonctionnaliteFormPage />} />
          <Route path="/sanity-checks" element={<SanityChecksPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;