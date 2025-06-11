/*
  # Création du schéma pour l'application de suivi de sanity check

  1. Nouvelles Tables
    - `applications`
      - `id` (uuid, clé primaire)
      - `nom` (text, requis)
      - `description` (text, optionnel)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `fonctionnalites`
      - `id` (uuid, clé primaire)
      - `nom` (text, requis)
      - `description` (text, optionnel)
      - `application_id` (uuid, clé étrangère vers applications)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `sanity_checks`
      - `id` (uuid, clé primaire)
      - `fonctionnalite_id` (uuid, clé étrangère vers fonctionnalites)
      - `statut` (enum: 'OK', 'NOT_OK')
      - `commentaire` (text, optionnel)
      - `date_verification` (timestamp, requis)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Sécurité
    - Activation RLS sur toutes les tables
    - Politiques pour permettre toutes les opérations aux utilisateurs authentifiés
*/

-- Créer le type enum pour le statut
CREATE TYPE statut_sanity_check AS ENUM ('OK', 'NOT_OK');

-- Table Applications
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table Fonctionnalités
CREATE TABLE IF NOT EXISTS fonctionnalites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  description text,
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table Sanity Checks
CREATE TABLE IF NOT EXISTS sanity_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fonctionnalite_id uuid REFERENCES fonctionnalites(id) ON DELETE CASCADE,
  statut statut_sanity_check NOT NULL,
  commentaire text,
  date_verification timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE fonctionnalites ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanity_checks ENABLE ROW LEVEL SECURITY;

-- Politiques RLS (permettre toutes les opérations pour les utilisateurs authentifiés)
CREATE POLICY "Applications: toutes opérations pour utilisateurs authentifiés"
  ON applications
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Fonctionnalités: toutes opérations pour utilisateurs authentifiés"
  ON fonctionnalites
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Sanity Checks: toutes opérations pour utilisateurs authentifiés"
  ON sanity_checks
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fonctionnalites_updated_at BEFORE UPDATE ON fonctionnalites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sanity_checks_updated_at BEFORE UPDATE ON sanity_checks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_fonctionnalites_application_id ON fonctionnalites(application_id);
CREATE INDEX IF NOT EXISTS idx_sanity_checks_fonctionnalite_id ON sanity_checks(fonctionnalite_id);
CREATE INDEX IF NOT EXISTS idx_sanity_checks_date_verification ON sanity_checks(date_verification DESC);