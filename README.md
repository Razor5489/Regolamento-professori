# Nightfall RP — Regolamento Professori

Sito ufficiale del **Regolamento e delle Linee guida del Corpo Docenti di Hogwarts (1890)**.

## Pubblicazione con GitHub Pages
1. Apri **Settings → Pages** in questo repository.
2. In **Build and deployment**, seleziona **Deploy from a branch**.
3. Imposta **main** e la cartella **/(root)**, poi salva.
4. Il sito sarà disponibile all'indirizzo https://razor5489.github.io/Regolamento-professori/

## Modificare il regolamento dal sito
Il pulsante **Gestisci regolamento** apre l'editor. Puoi aggiungere, cambiare ordine, modificare ed eliminare le sezioni, sia nel Regolamento sia nelle Linee guida.

Per pubblicare le modifiche serve un **Personal Access Token (fine-grained)** GitHub appartenente a un account autorizzato:
- GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.
- **Repository access:** Only select repositories → `Regolamento-professori`.
- **Repository permissions:** Contents → Read and write. L'accesso Metadata in lettura è implicito.
- Inserisci il token nel modulo di gestione del sito; premi **Pubblica online**.

Il token resta **solo nella memoria della pagina**, non viene inserito nel repository né salvato in localStorage. È inviato esclusivamente alle API ufficiali `api.github.com` per leggere e aggiornare `regolamento.json`. Non condividere il token e revocalo se viene esposto. Chiunque non abbia i permessi GitHub può leggere il regolamento ma non modificarlo.

Le modifiche creano un commit sul ramo `main` e diventano pubbliche dopo l'aggiornamento di GitHub Pages. Se due persone modificano contemporaneamente, l'editor blocca la pubblicazione per evitare sovrascritture.

## Struttura
- `index.html`: sito pubblico ed editor integrato.
- `regolamento.json`: contenuti modificabili.
- `.nojekyll`: compatibilità con GitHub Pages.

Il sito non usa script di terze parti, non contiene password o token, e non richiede un server applicativo.

*Creato per NightFall da Razor.*
