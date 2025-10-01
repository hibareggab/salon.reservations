# 🌸 صالون زهرة أيلول 🌸

Une application web pour gérer les réservations d'un salon avec suivi des services confirmés, spécialistes et ventes de BeautyBlender.

---

## ⚙️ Fonctionnalités

- Ajouter et gérer les réservations.
- Confirmer les services et assigner un spécialiste.
- Suivi des ventes de BeautyBlender par mois.
- Ajouter et supprimer des spécialistes.
- Interface en arabe, responsive et colorée.
- Connexion à Supabase pour sauvegarder les données en ligne.

---

## 🛠️ Technologies utilisées

- HTML / CSS / JavaScript
- [Supabase](https://supabase.com/) pour le back-end et la base de données
- Librairie Supabase JS pour les appels à la base de données

---

## ⚙️ Installation / Usage

1. Place tous les fichiers du projet (`index.html`, `scripts.js`, `styles.css`) dans un même dossier.
2. Ouvre `scripts.js` et remplace ces lignes avec tes informations Supabase :  

```javascript
const supabaseUrl = "https://bobwupsivtvjuikefmsu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvYnd1cHNpdnR2anVpa2VmbXN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjYxNjgsImV4cCI6MjA3NDgwMjE2OH0.xI03w8WIGeVicdwN09U_ai9oK3KXijGBhQcA4wH8iZo";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);
