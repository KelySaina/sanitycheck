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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/applications" element={<ApplicationsPage />} />
                  <Route
                    path="/applications/:id"
                    element={<ApplicationDetailPage />}
                  />
                  <Route
                    path="/applications/:id/edit"
                    element={<ApplicationFormPage />}
                  />
                  <Route
                    path="/applications/new"
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
                </Routes>
              </Layout>
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
