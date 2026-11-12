# Nightfall RP — Regolamento Professori

Sito ufficiale del **Regolamento e delle Linee guida del Corpo Docenti di Hogwarts (1890)**.

- Sito pubblico: https://razor5489.github.io/Regolamento-professori/
- Repository: https://github.com/Razor5489/Regolamento-professori

## Funzioni

- Regolamento completo e dieci capitoli di linee guida.
- Ricerca, indice dei capitoli, stampa e salvataggio in PDF.
- **Gestisci regolamento**: accesso con password, modifica dei titoli, delle regole e della premessa, creazione/eliminazione/riordino di capitoli.
- Bozza e backup, più pubblicazione online sul ramo `main`.

## Alternativa semplificata: pubblicazione tramite Vercel

Il repository contiene ora anche la versione del servizio dedicata a **Vercel** (`api/login.js`, `api/document.js`). Vercel può ospitare il sito e le due funzioni di autenticazione, mentre l'indirizzo GitHub Pages resta quello visibile agli utenti.

1. Collega l'app **Vercel** in ChatGPT e autorizzala a gestire il repository `Razor5489/Regolamento-professori`.
2. Importa o distribuisci questo repository come progetto Vercel, senza modificare la cartella root.
3. Nelle variabili d'ambiente protette del progetto configura `ADMIN_PASSWORD` (password personale da te scelta) e `GITHUB_TOKEN` (token fine-grained limitato al repository, permesso **Contents: Read and write**). **Non inserire mai queste credenziali in un file pubblico o in chat.**
4. Collega l'URL HTTPS assegnato da Vercel nel file `config.json`, campo `apiUrl`. Per esempio: `{"apiUrl":"https://nome-progetto.vercel.app"}` (solo esempio, occorre l'URL effettivo).

Il sistema userà direttamente la password, come la Biblioteca. Gli utenti vedranno il sito pubblico da GitHub Pages, mentre la modifica passerà dal backend Vercel.

La password attuale della Biblioteca non è leggibile dal suo repository. Per usare la **stessa password**, dovrai impostare tu lo stesso valore segreto nel nuovo servizio. Questa procedura non richiede di comunicare la password all'assistente.

---

### Importante: attivazione dell'accesso con password

Il pulsante ora richiede una **password**, non più un Personal Access Token GitHub. Per evitare che la password sia visibile a chiunque (il repository è pubblico), l'autenticazione deve essere eseguita da un backend protetto.

Il backend è già preparato in `worker/index.js`, ma **non si attiva da solo con il caricamento su GitHub**. Occorre distribuirlo una volta su Cloudflare Workers e aggiungere due segreti.

### 1. Creare un Worker Cloudflare

1. Accedi al tuo account su https://dash.cloudflare.com/ (puoi crearne uno se necessario).
2. Apri **Workers & Pages**, scegli **Create** e crea un Worker (ad esempio `nightfall-professori-api`).
3. Nell'editor del Worker sostituisci il codice con **tutto il contenuto del file** `worker/index.js` presente in questo repository.
4. Pubblica il Worker. Ottieni un URL HTTPS simile a `https://nightfall-professori-api.<tuo-sottodominio>.workers.dev`. L'URL vero ti verrà mostrato da Cloudflare; non usare l'esempio letterale.

In alternativa, chi usa Wrangler può eseguire dalla cartella `worker/` il comando `npx wrangler deploy`.

### 2. Impostare la password e il token GitHub come segreti

Apri le impostazioni del Worker, quindi **Settings → Variables and Secrets** (la denominazione può variare) e aggiungi due valori di tipo **Secret**:

- `ADMIN_PASSWORD` = la password di accesso al pannello, scelta da te (può essere la stessa della Biblioteca, senza comunicarla ad altri).
- `GITHUB_TOKEN` = un token GitHub fine-grained, autorizzato a modificare soltanto il repository `Regolamento-professori`.

Per creare il token:
1. Vai su GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens**.
2. Seleziona **Only select repositories** e spunta **Regolamento-professori**.
3. In **Repository permissions**, imposta **Contents → Read and write**. La lettura dei metadata è concessa automaticamente.
4. Crea il token e incollalo **soltanto nel segreto `GITHUB_TOKEN` del Worker**, mai nel repository, nella pagina web o nella chat.

Utilizza una password lunga e unica. Per ulteriore sicurezza, configura in Cloudflare una regola di limitazione dei tentativi di accesso al percorso `/api/login`.

### 3. Collegare il Worker al sito

1. Apri il file `config.json` nel repository su GitHub e scegli **Edit**.
2. Sostituisci il valore vuoto di `apiUrl` con **l'URL HTTPS reale del Worker**:

```json
{
  "apiUrl": "https://IL-TUO-WORKER.workers.dev"
}
```

3. Salva con **Commit changes** e aspetta l'aggiornamento di GitHub Pages.
4. Apri il sito e scegli **Gestisci regolamento**. Inserisci `ADMIN_PASSWORD` (non il token GitHub), apporta una modifica e premi **Pubblica online**.

La password è verificata dal Worker e resta soltanto nella memoria della pagina finché è aperta. **Non è contenuta nell'HTML, nel JavaScript pubblico, in `config.json` o nel repository**. Il token GitHub non viene mai inviato al browser.

### 4. Attivare GitHub Pages (se non è già attivo)

1. Apri **Settings → Pages** nel repository.
2. In **Build and deployment**, scegli **Deploy from a branch**.
3. Seleziona **main** e **/(root)**, quindi salva.

### Struttura dei file

- `index.html`: sito pubblico e pannello di modifica.
- `regolamento.json`: contenuti del regolamento e delle linee guida.
- `config.json`: URL pubblico del backend, **non** la password.
- `worker/index.js`: backend Cloudflare Worker, verifica della password e pubblicazione su GitHub.
- `worker/wrangler.toml`: configurazione Wrangler opzionale.
- `.nojekyll`: compatibilità con GitHub Pages.

**Nota:** senza distribuire il Worker e compilare `config.json`, il sito pubblico resta consultabile e il pannello mostra un messaggio che spiega che il servizio password non è ancora configurato. Questo evita una falsa protezione basata su password scritte nel codice pubblico.

*Creato per NightFall da Razor.*
