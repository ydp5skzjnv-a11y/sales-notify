# Sales Demo v2 — aggiornamento GitHub / Netlify

Per installare, **sostituisci i file del repository con quelli di questo ZIP**, mantenendo la struttura a partire dalla cartella `sales-notify-v2/`. Non caricare il file ZIP come unico file nel repository.

Variabili ambiente di Netlify: `APP_PIN`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (le chiavi private NON vanno nel repository).

## Push automatiche che non arrivano
- Il pulsante test usa la funzione `control` e **non** prova che il cron funzioni.
- Apri Netlify > Functions: `scheduled-push` deve avere il badge **Scheduled**. Deve essere un deploy **Published**.
- Usa **Controlla timer automatico**, poi **Forza invio dal sistema automatico**. Se l'invio forzato va ma i messaggi non partono nei minuti successivi, controlla le esecuzioni e i log di `scheduled-push` su Netlify.
- Il cron viene eseguito al minuto; non garantisce un intervallo esatto e non può inviare ogni 10 secondi. Controlla i limiti di consumo del piano.

## Frequenze veloci
La modalità rapida (1, 5, 10, 20, 30 secondi) crea notifiche locali mentre l'app è in primo piano. Si interrompe o rallenta quando iOS manda l'app in background o blocca il telefono. Per push ogni 10 secondi persistenti ad app chiusa serve un backend sempre attivo, e iOS può raggruppare/ritardare notifiche numerose.

## Logo e audio
Carica un logo dalla dashboard (max 350 KB): salvato in Netlify Blobs, usato nell'anteprima e come URL `icon` delle notifiche. Su iPhone iOS può mostrare l'icona PWA anziché l'icona della singola notifica; per cambiarla serve aggiornare i file statici e reinstallare la PWA. Audio personale riproducibile solo in modalità rapida e con app attiva: il Web Push su iOS non offre impostazioni per usare un file audio custom nella notifica di blocco schermo. Non è incluso alcun suono o logo Shopify.

L'app è per simulazioni chiaramente contrassegnate **DEMO**.
