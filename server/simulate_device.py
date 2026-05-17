import requests
import time
import json
from datetime import datetime, timezone
from crypto import encrypt_json, decrypt_json

BASE_URL = "http://127.0.0.1:8000"

def req_enc(method, url, payload=None):
    headers = {"x-encrypted": "true"}
    if payload:
        data = encrypt_json(payload)
        headers["Content-Type"] = "text/plain"
        res = requests.request(method, url, data=data, headers=headers)
    else:
        res = requests.request(method, url, headers=headers)
    
    if res.text:
        try:
            return decrypt_json(res.text)
        except Exception:
            try:
                return res.json()
            except:
                return res.text
    return None

def run_simulation():
    print("🚀 Démarrage du simulateur de Serveur Local IoT...")

    # 1. Vérifier si l'API répond
    try:
        users = req_enc("GET", f"{BASE_URL}/users")
        if not users or not isinstance(users, list):
            print("❌ Aucun utilisateur trouvé. Créez-en un dans le Dashboard d'abord.")
            return
        user_id = users[0]["id"]
        print(f"✅ Connecté à l'API. Utilisation du client ID: {user_id}")
    except Exception as e:
        print(f"❌ Impossible de joindre l'API : {e}")
        return

    # 2. Simuler l'enregistrement du serveur local
    server_data = {
        "local_server_id": "SIMULATEUR_101",
        "client_id": user_id,
        "forfait": "Premium",
        "username": "auto",
        "status": "INACTIVE"
    }
    
    # On essaie de le créer
    req_enc("POST", f"{BASE_URL}/servers", payload=server_data)
    print("✅ Serveur local SIMULATEUR_101 enregistré.")

    # 3. Envoyer un ping de Statut
    print("📡 Envoi du statut 'connecté'...")
    statut_payload = {
        "id_local": "SIMULATEUR_101",
        "etat_connexion": "connecte"
    }
    res = req_enc("POST", f"{BASE_URL}/api/v1/serveur-local/statut", payload=statut_payload)
    print(f"   -> Réponse: {res}")

    print("⏳ Attente de 3 secondes (Regardez votre Dashboard !)...")
    time.sleep(3)

    # 4. Déclencher une Alerte de chute
    print("🚨 DÉCLENCHEMENT D'UNE ALERTE DE CHUTE...")
    alerte_payload = {
        "id_local": "SIMULATEUR_101",
        "id_client": f"CLIENT_{user_id}",
        "etat_connexion": "connecte",
        "donnees_capteur": {
            "etat_de_la_chute": "CHUTE_DETECTEE_VIOLENTE",
            "temps_au_sol": "00:00:45",
            "niveau_urgence": "HAUTE",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    }
    res = req_enc("POST", f"{BASE_URL}/api/v1/serveur-local/alertes", payload=alerte_payload)
    print(f"   -> Réponse: {res}")

    print("\n🎉 Simulation terminée. Allez vérifier l'historique sur votre Dashboard React !")

if __name__ == "__main__":
    run_simulation()
