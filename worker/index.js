// Backend dedicato al Regolamento Professori Nightfall RP.
// Da distribuire come Cloudflare Worker e configurare con i segreti
// ADMIN_PASSWORD e GITHUB_TOKEN. Nessun segreto deve entrare nel repository.
const ALLOWED_ORIGIN = "https://razor5489.github.io";
const OWNER = "Razor5489";
const REPOSITORY = "Regolamento-professori";
const FILE = "regolamento.json";
const API = `https://api.github.com/repos/${OWNER}/${REPOSITORY}/contents/${FILE}`;
const VERSION = "2022-11-28";

function headers(origin) {
  const out = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Vary": "Origin",
  };
  if (origin === ALLOWED_ORIGIN) {
    out["Access-Control-Allow-Origin"] = origin;
    out["Access-Control-Allow-Methods"] = "OPTIONS,GET,POST,PUT";
    out["Access-Control-Allow-Headers"] = "Authorization,Content-Type";
    out["Access-Control-Max-Age"] = "3600";
  }
  return out;
}

function json(value, status = 200, origin = "") {
  return new Response(JSON.stringify(value), { status, headers: headers(origin) });
}

function decodeBase64(input) {
  try {
    return Uint8Array.from(atob(input.replace(/\s/g, "")), (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

function decodeText(input) {
  const bytes = decodeBase64(input);
  if (!bytes) throw new Error("Base64 non valido");
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

function encodeText(input) {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  }
  return btoa(binary);
}

async function digest(value) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", value));
}

async function matchesPassword(request, expected) {
  const value = request.headers.get("Authorization") || "";
  if (!value.startsWith("Bearer ")) return false;
  const submittedBytes = decodeBase64(value.slice(7));
  if (!submittedBytes || submittedBytes.length > 512 || !expected) return false;
  const expectedBytes = new TextEncoder().encode(expected);
  const [givenHash, expectedHash] = await Promise.all([
    digest(submittedBytes), digest(expectedBytes)
  ]);
  let diff = 0;
  for (let i = 0; i < givenHash.length; i++) diff |= givenHash[i] ^ expectedHash[i];
  return diff === 0;
}

async function githubFetch(env, method = "GET", payload = undefined) {
  const response = await fetch(API, {
    method,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": VERSION,
      ...(payload ? { "Content-Type": "application/json" } : {})
    },
    body: payload ? JSON.stringify(payload) : undefined,
    cf: { cacheTtl: 0 }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 409 || response.status === 422) {
      return { error: "Il documento è stato modificato altrove. Ricarica la pagina prima di pubblicare.", status: 409 };
    }
    return { error: "GitHub non ha accettato l'operazione. Controlla permessi e configurazione del servizio.", status: 502 };
  }
  return { data };
}

function validDocument(doc) {
  return doc && doc.version === 1 && Array.isArray(doc.pages) &&
    ["regolamento", "linee-guida"].every((id) => doc.pages.some((page) =>
      page.id === id &&
      typeof page.title === "string" && page.title.length <= 200 &&
      Array.isArray(page.sections) && page.sections.length <= 100 &&
      page.sections.every((section) =>
        typeof section.id === "string" && section.id.length <= 120 &&
        typeof section.title === "string" && section.title.length <= 200 &&
        typeof section.intro === "string" && section.intro.length <= 3000 &&
        Array.isArray(section.points) && section.points.length <= 100 &&
        section.points.every((p) => typeof p === "string" && p.length <= 2000)
      )));
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (origin && origin !== ALLOWED_ORIGIN) return json({error: "Origine non consentita."}, 403, origin);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: headers(origin) });
    }
    const path = new URL(request.url).pathname;
    if (!["/api/login", "/api/document"].includes(path)) {
      return json({error: "Percorso non trovato."}, 404, origin);
    }
    if (!env.ADMIN_PASSWORD || !env.GITHUB_TOKEN) {
      return json({error: "Servizio non configurato: imposta ADMIN_PASSWORD e GITHUB_TOKEN nei segreti del Worker."}, 503, origin);
    }
    if (!(await matchesPassword(request, env.ADMIN_PASSWORD))) {
      return json({error: "Password errata o accesso non autorizzato."}, 401, origin);
    }

    if (path === "/api/login" && request.method === "POST") {
      return json({ok: true}, 200, origin);
    }

    if (path === "/api/document" && request.method === "GET") {
      const result = await githubFetch(env);
      if (result.error) return json({error: result.error}, result.status, origin);
      try {
        const doc = JSON.parse(decodeText(result.data.content));
        if (!validDocument(doc)) throw new Error("Formato documento non valido");
        return json({document: doc, sha: result.data.sha}, 200, origin);
      } catch {
        return json({error: "Impossibile leggere il documento dal repository."}, 502, origin);
      }
    }

    if (path === "/api/document" && request.method === "PUT") {
      if (Number(request.headers.get("Content-Length") || 0) > 180000) {
        return json({error: "Documento troppo grande."}, 413, origin);
      }
      let payload;
      try {
        const raw = await request.text();
        if (raw.length > 180000) throw new Error("size");
        payload = JSON.parse(raw);
      } catch {
        return json({error: "Dati non validi o documento troppo grande."}, 400, origin);
      }
      if (!payload || typeof payload.sha !== "string" || !/^[a-f0-9]{40}$/.test(payload.sha) || !validDocument(payload.document)) {
        return json({error: "Contenuto non valido."}, 400, origin);
      }
      const result = await githubFetch(env, "PUT", {
        message: "Aggiorna regolamento professori tramite gestione protetta",
        content: encodeText(JSON.stringify(payload.document, null, 2) + "\n"),
        sha: payload.sha,
        branch: "main"
      });
      if (result.error) return json({error: result.error}, result.status, origin);
      return json({ok: true, sha: result.data.content.sha}, 200, origin);
    }
    return json({error: "Metodo non consentito."}, 405, origin);
  }
};
