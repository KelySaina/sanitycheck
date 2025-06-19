import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { ApplicationsPage } from "./pages/ApplicationsPage";
import { ApplicationDetailPage } from "./pages/ApplicationDetailPage";
import { ApplicationFormPage } from "./pages/ApplicationFormPage";
import { FonctionnaliteFormPage } from "./pages/FonctionnaliteFormPage";
import { SanityChecksPage } from "./pages/SanityChecksPage";
import { LoginPage } from "./pages/LoginPage";
import { RequireAuth } from "./components/RequireAuth";
import { Outlet } from "react-router-dom";

function ProtectedLayout() {
  return (
    <RequireAuth>
      <Layout>
        <Outlet />
      </Layout>
    </RequireAuth>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/applications/new" element={<ApplicationFormPage />} />
          <Route path="/applications/:id" element={<ApplicationDetailPage />} />
          <Route
            path="/applications/:id/edit"
            element={<ApplicationFormPage />}
          />
          <Route
            path="/applications/:applicationId/fonctionnalites/new"
            element={<FonctionnaliteFormPage />}
          />
          <Route
            path="/fonctionnalites/:applicationId/:id/edit"
            element={<FonctionnaliteFormPage />}
          />
          <Route path="/sanity-checks" element={<SanityChecksPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
