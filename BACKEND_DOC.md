# Documentation Backend - ElderSafe

Ce document décrit l'architecture, le fonctionnement et les API du backend du projet ElderSafe.

## 📁 Architecture du Backend

Le backend est situé dans le dossier `/server` et est construit avec les technologies suivantes :
- **Framework Web** : [FastAPI](https://fastapi.tiangolo.com/) (pour des performances élevées et une génération automatique de la documentation Swagger).
- **Base de données** : SQLite (fichier local `database.db` dans `/server`) via l'ORM [SQLAlchemy](https://www.sqlalchemy.org/).
- **Validation des données** : Pydantic.

## 🗄️ Modèles de Base de Données

Le système repose sur 3 tables principales (`server/main.py`) :

1. **User (`users`)** : Représente les patients ou les clients finaux.
   - `id` : Identifiant unique (Int)
   - `email` : Adresse email (String)
   - `name` : Nom complet (String)

2. **LocalServer (`local_servers`)** : Représente les capteurs matériels ou serveurs locaux installés chez les patients.
   - `id` : Identifiant unique dans la DB (Int)
   - `local_server_id` : Identifiant matériel/logiciel (ex: `SIMULATEUR_101`) (String)
   - `client_id` : Clé étrangère pointant vers un `User` (Int)
   - `status` : État de connexion (`ACTIVE`, `INACTIVE`, `ERROR`, `MAINTENANCE`)

3. **Alerte (`alertes`)** : Historique des événements de chute détectés par les `LocalServers`.
   - `id` : Identifiant unique (Int)
   - `local_server_id` : Clé étrangère pointant vers `LocalServer` (Int)
   - `client_id` : Clé étrangère pointant vers `User` (Int)
   - `etat_de_la_chute` : Nature de l'incident (ex: `CHUTE_DETECTEE`) (String)
   - `temps_au_sol` : Durée passée au sol avant détection (String)
   - `niveau_urgence` : Priorité de l'alerte (ex: `HAUTE`, `NORMALE`) (String)
   - `timestamp` : Date et heure de l'incident (String)
   - `is_resolved` : Indique si l'alerte a été acquittée par l'administrateur (Boolean)

## 🌐 Routes de l'API (Endpoints)

FastAPI génère automatiquement un Swagger interactif. Vous pouvez le consulter et le tester à l'adresse suivante lorsque le serveur tourne :
👉 **http://127.0.0.1:8000/docs**

### API Administrateur (Dashboard)
- `GET /users` : Récupère la liste de tous les patients.
- `POST /users` : Crée un nouveau patient.
- `GET /servers` : Récupère la liste de tous les serveurs locaux.
- `POST /servers` : Enregistre un nouveau serveur local.
- `DELETE /servers/{server_id}` : Supprime un serveur local.
- `GET /alertes` : Récupère l'historique complet des alertes.
- `PUT /alertes/{alerte_id}/resolve` : Marque une alerte comme "traitée/acquittée".

### API Capteurs IoT (Serveurs Locaux)
- `POST /serveur-local/statut` : Permet au capteur d'indiquer qu'il est en ligne (`etat_connexion: "connecte"`).
- `POST /serveur-local/alertes` : Permet au capteur de transmettre une urgence (chute).

## 🚀 Démarrage et Tests

### 1. Lancer le Serveur
Pour lancer le backend en environnement de développement, exécutez le script depuis le dossier `server/` :
```bash
./lauch.sh
```
*Si la base de données SQLite n'existe pas, elle sera créée automatiquement et remplie avec des fausses données (seed).*

### 2. Simuler un Capteur
Pour tester le système sans posséder le matériel physique, un script de simulation est fourni. Il enregistre un capteur virtuel, envoie un signal "en ligne", puis déclenche une alerte de chute :
```bash
cd server
python3 simulate_device.py
```
*Le résultat apparaîtra instantanément sur le Dashboard grâce au système de Short Polling mis en place côté frontend.*
