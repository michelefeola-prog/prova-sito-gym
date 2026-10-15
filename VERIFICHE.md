# Verifiche della consegna

Data: 10 ottobre 2026. Versione aggiornata: **60 test automatici superati** (32 motore + 13 dati ufficiali + 15 interazioni).

## Eseguite

- **32 test automatici del motore** superati: UTC+1/UTC+2, cambio di marzo e ottobre, date invalide, cambio giorno/settimana, corsi simultanei, chiusure, cancellazioni, recuperi, corsi non confermati, validità del calendario, corsi in svolgimento, fine lezione, timer non negativo, punteggi, pareggi e disponibilità incompatibili.
- Gli stessi 32 test ripetuti con fuso del processo **America/Los_Angeles**, tutti superati. La conversione non dipende dal fuso locale.
- **15 test delle interazioni DOM con jsdom** superati: avvio delle cinque pagine senza eccezioni, menu/Escape/ripristino focus, chiusura cliccando fuori, quiz completo, validazione, indietro e mantenimento della scelta, riavvio, risultato senza gruppo confermato in una configurazione di test, stato senza calendario in una configurazione di test, timer con fixture, filtri del calendario e orari ufficiali della domenica.
- **6 pagine e 181 riferimenti locali** controllati: file esistenti, link relativi compatibili con sottocartelle GitHub Pages, ancore, ID univoci, un H1 per pagina, lingua italiana, pagina corrente, descrizioni, immagini con alt e dimensioni, font locali.
- Sintassi JavaScript controllata con Node.
- I percorsi delle pagine nei test DOM usano `https://example.github.io/gym-factory/`, non la radice del dominio.
- Configuratore SEO verificato su una copia temporanea: canonical, immagine social assoluta, sitemap, URL per repository e ripetizione senza duplicati.
- Risorse presenti localmente; nessun font, script, iframe, analytics o API remota necessario al caricamento delle pagine.

## Limiti della verifica

Non era disponibile un browser di collaudo supportato in questa sessione. **Non sono stati eseguiti screenshot, rendering visuale su viewport reali o verifiche su telefoni fisici**. I test DOM non misurano impaginazione, fluidità delle animazioni o contrasto percepito. Il CSS è progettato con breakpoint 760/1000 px, flussi mobile a colonna, menu espandibile, dimensioni fluide, focus visibile e movimento ridotto, ma il controllo visivo finale resta da effettuare prima di pubblicare.

Non è stata effettuata alcuna pubblicazione sul repository o su GitHub Pages. Non è quindi stato verificato un dominio live. Il link Maps include l’identificativo trovato in una directory della stessa struttura; la scheda Google non è stata consultabile direttamente. Non sono state lette le storie Instagram. Il calendario effettivo, gli orari ufficiali e il telefono sono stati successivamente confermati dal titolare tramite screenshot. Non sono indicate durate o scadenze stagionali.

## Ripetere i test

Motore, senza installare pacchetti:

```bash
node --test tests/engine.test.cjs tests/official-data.test.cjs
```

Riferimenti statici, con Python:

```bash
python3 tests/check-site.py
```

Interazioni DOM, solo per sviluppo:

```bash
npm install --no-save jsdom
node --test tests/dom.test.cjs
```

jsdom non è richiesto dai visitatori o da GitHub Pages. Non caricare `node_modules` nel repository. I dati artificiali dei test non sono importati dalle pagine pubbliche.

## Controllo manuale prima del lancio

Aprire a 390, 768 e 1440 px; verificare leggibilità, assenza di sovrapposizioni, apertura menu, navigazione con Tab ed Escape, quiz completo, link esterni, calendario reale e preferenza “Riduci movimento”. Le immagini dei corsi sono volutamente illustrative. La foto generale della palestra può essere sostituita con materiale autentico; calendario, orari e telefono sono ora ufficiali.

## Controlli specifici sui nuovi dati

I 13 test aggiunti verificano: orari e telefono esatti; 7 corsi e 22 lezioni; corrispondenza completa degli orari con gli screenshot; nessuna durata o fine stagione inventata; countdown domenica→lunedì; Pilates serale dopo la lezione mattutina; Pole Dance alle 21:00; risultato Pilates per preferenza mobilità al mattino; nessun corso domenicale; accesso sala domenica mattina e incompatibilità serale; presenza delle 8 immagini e delle descrizioni; riepilogo di 7 giorni con 22 lezioni.

Le 8 immagini generate sono state ispezionate nei risultati della generazione prima di integrarle. Non sono stati eseguiti rendering visuali del sito in un browser.
