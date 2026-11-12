# NIGHTFALL RP · Regolamento Professori

Il regolamento e le linee guida del Corpo Docenti di Hogwarts (1890).

**Sito pubblico:** https://razor5489.github.io/Regolamento-professori/

## Cosa offre il sito

- 8 capitoli di regolamento, 10 capitoli di linee guida.
- Indice, ricerca e stampa/PDF.
- Pulsante **Gestisci regolamento** con accesso tramite **password**.
- Editor per modificare, aggiungere, cancellare e riordinare capitoli.
- Bozze, backup JSON e pubblicazione nel repository GitHub.

## Attivare la gestione con password

Il sito pubblico è ospitato su GitHub Pages. GitHub Pages non può conservare in modo sicuro una password o aggiornare da solo un repository: per la gestione protetta serve un piccolo backend. Il codice è già pronto, ma va pubblicato su un servizio di hosting.

### Percorso consigliato: Vercel

Il codice del backend è nei file `api/login.js`, `api/document.js` e `api/_shared.cjs`.

1. Collega Vercel e importa il repository `Razor5489/Regolamento-professori` come progetto.
2. Configura **due variabili segrete**, nelle impostazioni del progetto Vercel:
   - `ADMIN_PASSWORD`: una password forte scelta da te. Se vuoi la stessa della Biblioteca Nightfall, impostala uguale **privatamente nelle impostazioni**, senza comunicarla in chat.
   - `GITHUB_TOKEN`: un token **fine-grained** del tuo account GitHub, con accesso **solo** a `Regolamento-professori` e permesso **Contents: Read and write**.
3. Pubblica il progetto Vercel, ricava il suo URL HTTPS reale.
4. In GitHub apri `config.json` e imposta `apiUrl` con quell'URL (senza slash finale):

```json
{"apiUrl":"https://nome-reale-progetto.vercel.app"}
```

5. Pubblica la modifica. Dopo l'aggiornamento di GitHub Pages, il tasto **Gestisci regolamento** userà la password.

Il token resta **solo sul server**, in una variabile segreta Vercel. Il browser trasmette la password al server su HTTPS per l'autenticazione; la password non è scritta nell'HTML o salvata in localStorage.

### Come creare il token GitHub

GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token. Seleziona **Only select repositories → Regolamento-professori** e **Repository permissions → Contents: Read and write**. Conserva il token soltanto nelle variabili segrete del backend e revocalo se viene esposto.

### Alternativa: Cloudflare Workers

È disponibile anche una versione del backend in `worker/index.js`, con il file `worker/wrangler.toml`. Puoi distribuirla su Cloudflare Workers e configurare lì gli stessi segreti `ADMIN_PASSWORD` e `GITHUB_TOKEN`, quindi impostare il suo URL in `config.json`.

## File importanti

- `index.html`: sito pubblico ed editor.
- `regolamento.json`: testi del regolamento e delle linee guida.
- `config.json`: solo l'URL pubblico del servizio backend, **nessuna password**.
- `api/`: backend Vercel.
- `worker/`: backend Cloudflare alternativo.
- `.nojekyll`: compatibilità GitHub Pages.

**Stato:** il modulo password e il backend sono pronti nel codice. L'accesso funzionerà soltanto dopo che sarà stato attivato un servizio backend e configurato l'URL in `config.json`.

*Creato per NightFall da Razor.*
