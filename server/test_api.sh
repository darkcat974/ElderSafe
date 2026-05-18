#!/bin/bash

# Port par défaut de FastAPI
BASE_URL="http://127.0.0.1:8000"

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=9
START_TIME=$(date +%s)

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    🧪 TEST DE L'API FastAPI ElderSafe   ${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Fonction utilitaire pour le formatage du JSON
format_json() {
    python3 -m json.tool 2>/dev/null || cat
}

check_success() {
    if [ "$1" == "true" ]; then
        echo -e "${GREEN}✅ Test Réussi${NC}\n"
        TESTS_PASSED=$((TESTS_PASSED+1))
    else
        echo -e "${RED}❌ Test Échoué${NC}\n"
        TESTS_FAILED=$((TESTS_FAILED+1))
    fi
}

echo -e "${BLUE}1️⃣ Création d'un utilisateur...${NC}"
USER_EMAIL="test_curl_$(date +%s)@mail.com"
USER_RES=$(curl -s -X POST "$BASE_URL/users" -H "Content-Type: application/json" -d '{"email": "'$USER_EMAIL'", "name": "Test Curl"}' 2>/dev/null)
echo "$USER_RES" | format_json
USER_ID=$(echo "$USER_RES" | grep -o '"id": *[0-9]*' | head -1 | awk -F':' '{print $2}' | tr -d ' ')

if [ -n "$USER_ID" ]; then check_success "true"; else check_success "false"; echo -e "${RED}Arrêt du script : Impossible de créer l'utilisateur.${NC}"; exit 1; fi

echo -e "${BLUE}2️⃣ Récupération des utilisateurs (Limité aux premiers résultats)...${NC}"
USERS_RES=$(curl -s -X GET "$BASE_URL/users" 2>/dev/null)
echo "$USERS_RES" | format_json | head -n 25
echo -e "${BLUE}... (tronqué)${NC}"
if [[ "$USERS_RES" == *"test_curl_"* ]]; then check_success "true"; else check_success "false"; fi

echo -e "${BLUE}3️⃣ Création d'un serveur local (lié à l'utilisateur précédent)...${NC}"
LOCAL_SERVER_STR="server_curl_$(date +%s)"
SERVER_RES=$(curl -s -X POST "$BASE_URL/servers" -H "Content-Type: application/json" -d '{
  "local_server_id": "'$LOCAL_SERVER_STR'",
  "client_id": '$USER_ID',
  "forfait": "pro",
  "username": "user_curl",
  "status": "ACTIVE"
}' 2>/dev/null)
echo "$SERVER_RES" | format_json
SERVER_ID_DB=$(echo "$SERVER_RES" | grep -o '"id": *[0-9]*' | head -1 | awk -F':' '{print $2}' | tr -d ' ')
LOCAL_SERVER_ID=$(echo "$SERVER_RES" | grep -o '"local_server_id": *"[^"]*"' | awk -F'"' '{print $4}')

if [ -n "$SERVER_ID_DB" ]; then check_success "true"; else check_success "false"; fi

echo -e "${BLUE}4️⃣ Récupération des serveurs...${NC}"
SERVERS_GET_RES=$(curl -s -X GET "$BASE_URL/servers" 2>/dev/null)
echo "$SERVERS_GET_RES" | format_json | head -n 25
echo -e "${BLUE}... (tronqué)${NC}"
if [[ "$SERVERS_GET_RES" == *"$LOCAL_SERVER_STR"* ]]; then check_success "true"; else check_success "false"; fi

echo -e "${BLUE}5️⃣ Mise à jour du statut du serveur local (Simule une connexion IoT)...${NC}"
STATUT_RES=$(curl -s -X POST "$BASE_URL/api/v1/serveur-local/statut" -H "Content-Type: application/json" -d '{
  "id_local": "'$LOCAL_SERVER_ID'",
  "etat_connexion": "connecte"
}' 2>/dev/null)
echo "$STATUT_RES" | format_json
if [[ "$STATUT_RES" == *"Statut mis"* ]]; then check_success "true"; else check_success "false"; fi

echo -e "${BLUE}6️⃣ Envoi d'une alerte (Simule une chute détectée)...${NC}"
ALERTE_RES=$(curl -s -X POST "$BASE_URL/api/v1/serveur-local/alertes" -H "Content-Type: application/json" -d '{
  "id_local": "'$LOCAL_SERVER_ID'",
  "id_client": "'$USER_ID'",
  "etat_connexion": "connecte",
  "donnees_capteur": {
    "etat_de_la_chute": "chute detectee",
    "temps_au_sol": "2 minutes",
    "niveau_urgence": "critique",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
  }
}' 2>/dev/null)
echo "$ALERTE_RES" | format_json
ALERTE_ID=$(echo "$ALERTE_RES" | grep -o '"alerte_id": *[0-9]*' | head -1 | awk -F':' '{print $2}' | tr -d ' ')

if [ -n "$ALERTE_ID" ]; then check_success "true"; else check_success "false"; fi

echo -e "${BLUE}7️⃣ Récupération des alertes...${NC}"
ALERTES_GET_RES=$(curl -s -X GET "$BASE_URL/alertes" 2>/dev/null)
echo "$ALERTES_GET_RES" | format_json | tail -n 25
if [[ "$ALERTES_GET_RES" == *"chute detectee"* ]]; then check_success "true"; else check_success "false"; fi

echo -e "${BLUE}8️⃣ Résolution de l'alerte (Via le dashboard de l'admin)...${NC}"
if [ -n "$ALERTE_ID" ]; then
    RESOLVE_RES=$(curl -s -X PUT "$BASE_URL/api/v1/alertes/$ALERTE_ID/resolve" 2>/dev/null)
    echo "$RESOLVE_RES" | format_json
    if [[ "$RESOLVE_RES" == *"traitée"* || "$RESOLVE_RES" == *"traitee"* || "$RESOLVE_RES" == *"trait\u00e9e"* ]]; then check_success "true"; else check_success "false"; fi
else
    echo -e "${RED}Impossible de résoudre, pas d'alerte créée.${NC}"
    check_success "false"
fi

echo -e "${BLUE}9️⃣ Nettoyage : Suppression du serveur de test...${NC}"
DEL_RES=$(curl -s -X DELETE "$BASE_URL/servers/$SERVER_ID_DB" 2>/dev/null)
echo "$DEL_RES" | format_json
if [[ "$DEL_RES" == *"success"* ]]; then check_success "true"; else check_success "false"; fi

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}          📊 RAPPORT DE TESTS           ${NC}"
echo -e "${YELLOW}========================================${NC}"
echo -e "⏱️  Temps d'exécution : ${DURATION} secondes"
echo -e "✅ Tests passés     : ${GREEN}${TESTS_PASSED} / ${TOTAL_TESTS}${NC}"
echo -e "❌ Tests échoués    : ${RED}${TESTS_FAILED} / ${TOTAL_TESTS}${NC}"

if [ "$TESTS_PASSED" -eq "$TOTAL_TESTS" ]; then
    echo -e "\n${GREEN}🎉 SUCCÈS TOTAL : L'API est pleinement opérationnelle et toutes les routes critiques fonctionnent !${NC}"
else
    echo -e "\n${RED}⚠️ ATTENTION : Certains tests ont échoué. Veuillez vérifier les logs ci-dessus.${NC}"
fi
echo -e "${YELLOW}========================================${NC}\n"
