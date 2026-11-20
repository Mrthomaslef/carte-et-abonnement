# 🦒 Pass Zoo de Vincennes & MNHN — Portefeuille Mobile

Application web Progressive (PWA) hors-ligne permettant d'accéder instantanément aux **2 Pass Annuels SOLO** du **Parc Zoologique de Paris (Zoo de Vincennes)** et du **Muséum national d'Histoire naturelle (MNHN)** .

## ✨ Fonctionnalités
- **Accès hors-ligne 100% autonome** : QR codes, cartes mobiles et PDF sont **chiffrés** (AES-GCM 256, PBKDF2 600 000 it.) dans `assets/vault/` ; déverrouillage une seule fois par appareil (même mot de passe que Voyages-Voyages).
- **Mode Tourniquet Plein Écran** : Affichage grand format sur fond blanc pur pour un passage immédiat aux bornes optiques, avec bascule rapide entre le **Pass SOLO #1** et le **Pass SOLO #2**.
- **PDF officiels** (e-tickets, cartes mobiles, récapitulatif) déchiffrés à la demande.
- **6 sites inclus en accès illimité** jusqu'au **14 novembre 2027** :
  1. Parc Zoologique de Paris (Zoo de Vincennes)
  2. Ménagerie, le zoo du Jardin des Plantes
  3. Grande Galerie de l'Évolution
  4. Galeries du Jardin des Plantes (Paléontologie, Minéralogie, Botanique, Grandes Serres)
  5. Musée de l'Homme (Trocadéro)
  6. Arboretum de Versailles-Chèvreloup

## 🔐 Données
Les originaux restent dans `private/` (non versionné). Reconstruire le coffre : `node scripts/build_vault.mjs`.
