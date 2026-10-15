# Gym Factory — sito multipagina

Sito statico in italiano, realizzato il 10 ottobre 2026. HTML, CSS e JavaScript senza framework, backend, compilazione o dipendenze runtime esterne. Il viola del brand è **#662778**, misurato sull’immagine fornita. Il logo visualizza la porzione originale dell’immagine tramite SVG: non è stato ridisegnato.

## Versione aggiornata con dati ufficiali

Questa versione integra gli screenshot confermati dal titolare il 10 ottobre 2026:

- Sala pesi: lun–ven **07:00–22:00**, sabato **09:00–18:00**, domenica **10:00–13:00**.
- Telefono: **+39 379 141 2293**.
- **7 corsi, 22 appuntamenti settimanali**, countdown attivo e quiz collegato alle attività reali.
- **8 nuove immagini illustrative generate**, una per la sala e una per ciascun corso, salvate localmente in WebP.
- Spiegazioni per ogni attività, riepilogo settimanale e lista filtrabile dei prossimi sette giorni.

Il programma è ricorrente fino a variazione: non è stata inventata una data di fine stagione. Le durate delle lezioni non sono indicate negli screenshot e non sono state aggiunte. Di conseguenza il sito mostra il prossimo inizio, senza dichiarare che un corso è ancora in svolgimento quando non ne conosce la durata. Eventuali chiusure festive vanno inserite nella configurazione.

La presenza continuativa di personale di sala qualificato resta indicata dal lunedì al sabato, domenica esclusa. La domenica è correttamente indicata come aperta.

## Prima della pubblicazione

Il sito è completo di codice, corsi e orari. La fotografia generale presente in Home e La palestra resta illustrativa e ha la relativa didascalia: si può sostituire con una foto reale della struttura. Le nuove immagini dei corsi sono intenzionalmente illustrative e non vengono presentate come scatti di ambienti o persone della palestra.

Una volta noto l’URL finale, configura metadati social e SEO con la procedura qui sotto. Rimane da fare un controllo visivo in un browser reale; i limiti e i 60 test superati sono riportati in `docs/VERIFICHE.md`.

Fonti: `docs/FONTI-E-DATI.md`. Aggiornamenti: `docs/AGGIORNAMENTI.md`. Prompt e percorsi delle immagini: `docs/IMMAGINI-GENERATE.md`.

## Le pagine

- `index.html`: Home, identità, presenza dello staff, prossimo appuntamento, invito al quiz.
- `palestra.html`: presentazione, supporto in sala, domande frequenti.
- `corsi.html`: otto schede illustrate, programma settimanale, calendario filtrabile e countdown.
- `quiz.html`: 6 domande, risultato, alternative quando disponibili, ripresa e riavvio.
- `contatti.html`: telefono, Instagram, Maps, orari e informazioni sul funzionamento del quiz.
- `404.html`: pagina di errore.

## Aprirlo sul computer

Estrai tutto lo ZIP in una cartella. Apri `index.html` con Chrome, Edge, Firefox o Safari. Gli script sono file classici, non moduli: il sito funziona anche senza un server locale. I collegamenti esterni richiedono Internet. Per sviluppo si può usare un comune server statico, ma non è necessario per caricarlo su GitHub.

## Caricarlo su GitHub Pages

1. Accedi a GitHub e crea un repository, per esempio `gym-factory`. Scegli un repository pubblico se usi GitHub Free per questo sito pubblico; per un repository privato verifica le condizioni del tuo piano.
2. Apri il repository e scegli **Add file → Upload files**.
3. Carica **il contenuto estratto** dello ZIP: `index.html`, le altre pagine, `assets`, `data` e gli altri file. `index.html` deve trovarsi direttamente nella radice del repository, non dentro un’ulteriore cartella `gym-factory`.
4. Conferma il caricamento con **Commit changes**. Se l’interfaccia non accetta tutte le cartelle insieme, caricale in più passaggi o usa GitHub Desktop mantenendo la stessa struttura.
5. Vai a **Settings → Pages → Build and deployment**.
6. In **Source**, scegli **Deploy from a branch**.
7. Seleziona il branch **main**, cartella **/(root)** e premi **Save**.
8. Attendi il completamento della pubblicazione. GitHub mostrerà l’indirizzo del sito nella stessa sezione. Verifica anche la scheda Actions se la pubblicazione segnala un problema.
9. Apri il sito e controlla menu, immagini, contatti, quiz e le cinque pagine. L’indirizzo sarà simile a `https://nomeutente.github.io/gym-factory/`.

Non caricare solo lo ZIP: GitHub Pages deve ricevere i file estratti. Non servono password, token, API key o un servizio di hosting aggiuntivo. Per gli aggiornamenti, sostituisci il file interessato e fai un nuovo commit.

Documentazione ufficiale consultata il 10/10/2026:
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## URL definitivo e anteprime social

I titoli, le descrizioni e le favicon sono già presenti. L’immagine social è il materiale originale del brand. Per avere URL assoluti nelle anteprime, link canonici, sitemap, robots.txt e dati strutturati, esegui facoltativamente dal progetto, con Node.js installato:

```bash
node tools/configure-seo.cjs https://nomeutente.github.io/gym-factory/
```

Sostituisci l’indirizzo con quello **reale**. Poi carica i file HTML aggiornati, `sitemap.xml` e `robots.txt`. Non è una compilazione e non serve per far funzionare il sito: completa i metadati una volta noto il dominio. Puoi anche chiedere di preparare questi file fornendo l’URL finale, senza installare Node. Ripeti questo passaggio se cambia il dominio.

## Nessun modulo finto

I pulsanti contattano la palestra o aprono i servizi indicati. Nessun invio di form viene simulato. WhatsApp ed email sono disabilitati finché non si inseriscono recapiti confermati nel file di configurazione. Non sono presenti tracciatori, cookie applicativi, localStorage, analytics o mappe incorporate.

## File tecnici

- `data/config.js`: unica configurazione per contatti, orari, catalogo, calendario e foto.
- `assets/js/engine.js`: conversione Europe/Rome, calendario, countdown e punteggi.
- `assets/js/app.js`: interazioni, menu, rendering e quiz.
- `assets/js/catalog.js`: schede illustrate e riepilogo settimanale condivisi.
- `assets/css/style.css`: layout, responsive e animazioni, con movimento ridotto.
- `assets/fonts`: font locali e licenze OFL.
- `tests`: controlli riproducibili, non caricati dal sito.

I contenuti essenziali restano leggibili senza JavaScript; menu e link sono utilizzabili. Quiz e countdown richiedono JavaScript. Il sito non è stato pubblicato su alcun account.
