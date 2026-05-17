import nacl from 'tweetnacl';
import util from 'tweetnacl-util';

// Extraction de la clé depuis l'environnement
const keyB64 = import.meta.env.VITE_SECRETBOX_KEY_B64;
if (!keyB64) {
    throw new Error("La clé VITE_SECRETBOX_KEY_B64 est manquante !");
}

const key = util.decodeBase64(keyB64);

export function encryptJson(data: any): string {
    const jsonStr = JSON.stringify(data);
    const message = util.decodeUTF8(jsonStr);
    
    // SecretBox requiert un nonce de 24 octets aléatoires
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    
    // Chiffrement (Message + Nonce + Clé)
    const box = nacl.secretbox(message, nonce, key);
    
    // PyNaCl attend le Nonce suivi du message chiffré (Nonce + Ciphertext)
    const fullMessage = new Uint8Array(nonce.length + box.length);
    fullMessage.set(nonce);
    fullMessage.set(box, nonce.length);
    
    // On convertit en Base64 pour l'envoi en HTTP
    return util.encodeBase64(fullMessage);
}

export function decryptJson(token: string): any {
    const fullMessage = util.decodeBase64(token);
    
    // Extraction du nonce (les 24 premiers octets)
    const nonce = fullMessage.slice(0, nacl.secretbox.nonceLength);
    // Le reste est le message chiffré
    const message = fullMessage.slice(nacl.secretbox.nonceLength);
    
    // Déchiffrement
    const decrypted = nacl.secretbox.open(message, nonce, key);
    
    if (!decrypted) {
        throw new Error("Déchiffrement échoué : Clé incorrecte ou données corrompues.");
    }
    
    const jsonStr = util.encodeUTF8(decrypted);
    return JSON.parse(jsonStr);
}
