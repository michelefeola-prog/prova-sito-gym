# Aggiornare il sito

Apri `data/config.js` con un editor di testo. È JavaScript leggibile: mantieni virgolette, virgole e parentesi. Salva una copia prima di modificare e controlla il risultato aprendo `index.html`.

## Contatti

- `phone`: numero internazionale senza spazi, per esempio il numero attuale già presente.
- `phoneLabel`: come apparirà il numero sul sito.
- `instagram`, `maps`: collegamenti ufficiali completi.
- `whatsapp`: lascia `''` finché non è confermato. Per abilitarlo inserisci il numero internazionale, con sole cifre e l’eventuale `+`.
- `email`: lascia `''` finché non è confermata.
- `address`, `city`: aggiornano i campi principali di indirizzo tramite JavaScript. Se cambia la sede, aggiorna anche i testi editoriali statici che la citano e lo strumento SEO; non basta cambiare il link Maps.

I dati sono inizialmente presenti anche nei file HTML per rendere i contatti disponibili senza JavaScript. Quando cambi recapiti o indirizzo, aggiorna anche le corrispondenti copie HTML se vuoi mantenerle coerenti nei browser con JavaScript disattivato.

## Orari della struttura

`opening.days` associa i giorni ISO alle fasce:

- 1 lunedì, 2 martedì, 3 mercoledì, 4 giovedì, 5 venerdì, 6 sabato, 7 domenica.
- `[['07:00','22:30']]`: una fascia di apertura.
- `[['09:00','13:00'],['15:00','19:00']]`: due fasce, qui solo esempio tecnico.
- `[]`: chiuso.
- `null`: da confermare. Non equivale a chiuso.

Dopo la conferma imposta `opening.confirmed: true` e sostituisci `opening.note` con un messaggio aggiornato, per esempio un’indicazione sulle festività. `confirmed` da solo cambia l’etichetta accessibile della tabella, ma **non riscrive la nota**.

`opening.exceptions` contiene giorni eccezionali:

```js
{ date: 'AAAA-MM-GG', slots: [], note: 'Chiusura straordinaria' }
```

La data deve essere reale nel formato ISO. Gli esempi con `AAAA-MM-GG` non vanno copiati come date operative. L’eccezione del giorno viene evidenziata sopra la nota degli orari. Le eccezioni della struttura e le sospensioni dei corsi sono distinte: per un’intera giornata di chiusura aggiungi la data anche in `schedule.closures`.

## Attività e corsi

Il catalogo `courses` contiene sala pesi e i sette corsi ufficiali. Per aggiungere un corso realmente disponibile usa un oggetto come questo:

```js
{
  id: 'identificativo-unico',
  name: 'Nome reale del corso',
  confirmed: false,
  kind: 'course',
  order: 2,
  description: 'Descrizione breve del corso.',
  detail: 'Spiegazione estesa dell’attività.',
  eyebrow: 'Due parole chiave',
  image: 'assets/images/courses/nome-file.webp',
  imageAlt: 'Descrizione dell’immagine illustrativa',
  tags: ['gruppo', 'resistenza', 'moderata', 'inizio'],
  focus: ['resistenza']
}
```

Questo è un **modello**, non un corso effettivo. Sostituisci nome e descrizione e imposta `confirmed: true` solo dopo conferma. `confirmed: false` esclude il corso dal catalogo, dal quiz e dal calendario. `kind: 'free'` indica attività senza un orario di lezione, come la sala; `kind: 'course'` indica corsi con appuntamenti.

Scegli i tag con lo staff, in modo coerente:

- Obiettivi/interessi: `forza`, `resistenza`, `mobilita`, `benessere`.
- Modalità: `individuale`, `gruppo`; usa entrambi solo se il servizio permette davvero entrambe.
- Esperienza: `inizio`, `esperto`.
- Intensità preferita: `moderata`, `intensa`.

Sono descrittori orientativi per il quiz, non indicazioni sanitarie. Il punteggio usa `tags`. I tag sono descrittori editoriali orientativi delle discipline, non requisiti di iscrizione o una valutazione individuale. Le descrizioni spiegano la disciplina in generale senza inventare gli esercizi di ogni lezione.

## Calendario ricorrente

Per attivare il countdown servono **tutti** questi elementi:

1. Corsi con `confirmed: true`.
2. `schedule.confirmed: true`.
3. `schedule.validFrom`: data da cui applicare il programma sul sito. `schedule.validThrough` è opzionale: `null` significa fino a variazione, senza una scadenza inventata. La data 10/10/2026 è la data di conferma dei dati, non la data di avvio originaria dei corsi.
4. Almeno una lezione in `sessions` o `additions`.

Esempio strutturale di una lezione settimanale, con valori da sostituire:

```js
{
  id: 'lezione-univoca',
  course: 'identificativo-unico',
  day: 1,
  time: '19:00',
  duration: 60
}
```

L’esempio è tecnico: **non è il calendario della palestra**. `course` deve corrispondere all’`id` del corso; `id` identifica la singola lezione ricorrente. Usa ID diversi per orari diversi dello stesso corso. `day` usa i numeri ISO 1–7. `time` usa HH:MM, ora italiana. `duration` è in minuti; se non è nota, ometti il campo. Senza durata il sito non dichiara la lezione “in corso”.

Le lezioni possono avere anche `validFrom` e `validThrough` individuali. Se viene impostata una data finale globale, resta il limite massimo. Con `validThrough: null` il calendario continua settimanalmente fino a modifica. Quando una data finale impostata scade, aggiorna il programma prima di riattivarlo.

## Cancellazioni, chiusure, recuperi

- `closures`: elenco di date ISO senza corsi. Chiude tutte le lezioni di quel giorno, inclusi i recuperi.
- `cancellations`: oggetti `{date: 'data-reale', session: 'id-lezione'}`. Annullano solo quella specifica lezione in quella data.
- `additions`: lezioni straordinarie con `id`, `course`, `date`, `time`, eventuale `duration`. La data sostituisce il giorno settimanale.
- Per spostare una lezione, annulla la vecchia con `cancellations` e inserisci la nuova con `additions` e un nuovo ID.
- Non lasciare anche la lezione originale se il recupero la sostituisce: apparirebbero due eventi.

La pagina Corsi mostra un riepilogo settimanale permanente e gli appuntamenti dei prossimi sette giorni. Il motore del countdown e il quiz esplorano i prossimi 35 giorni (e l’eventuale corso ancora in svolgimento iniziato il giorno prima, solo se la durata è nota). Non fa prenotazioni, non verifica posti disponibili e non si aggiorna automaticamente da Instagram: la configurazione va mantenuta dal gestore.

## Countdown e fuso orario

La logica usa Europe/Rome e non il fuso del visitatore. Gestisce ora solare, ora legale, cambio settimana, eventi simultanei e scadenza del calendario. Durante il cambio di marzo un orario locale inesistente viene ignorato; in ottobre un orario ripetuto seleziona la prima occorrenza. Eventi contemporanei sono mostrati insieme. L’ora del dispositivo resta la base temporale: un orologio del visitatore impostato male può alterare il timer.

## Punteggio del quiz

Sei domande: obiettivo, esperienza, intensità, modalità, interesse e disponibilità (giorni + fasce).

Pesi: obiettivo 4, esperienza 1, intensità 2, modalità 4, interesse 3. L’obiettivo e l’interesse possono coincidere e contribuire entrambi. La scelta esplicita individuale/gruppo esclude le attività della modalità opposta. Gli appuntamenti compatibili usano l’inizio del corso: mattina prima delle 12, pomeriggio dalle 12 alle 17:59, sera dalle 18.

In caso di pari punteggio, precede l’attività con appuntamenti compatibili; poi il numero `order` minore; infine l’ID alfabetico. Se mancano appuntamenti compatibili il risultato lo dichiara. Per la sala vengono mostrate le intersezioni tra le preferenze e gli orari ufficiali dei prossimi sette giorni: sono fasce di accesso, non prenotazioni. La domenica resta esclusa dalla copertura continuativa dello staff. Se mancano attività della modalità richiesta, il quiz restituisce le preferenze e invita a parlare con lo staff.

Le risposte sono soltanto in memoria e vengono cancellate ricaricando la pagina o ricominciando. Nessuna trasmissione, account o salvataggio locale.

## Fotografie e logo

Sostituisci la foto provvisoria in `gallery[0]`:

```js
{src: 'assets/images/sala-reale.jpg', alt: 'Descrizione della sala Gym Factory', caption: 'Gym Factory · Caserta', demo: false}
```

Inserisci fisicamente la nuova immagine nella cartella. `caption` è la didascalia visibile: svuotarla la nasconde, quindi fallo solo dopo la sostituzione con foto reali. Il flag `demo` serve come informazione redazionale; la didascalia va aggiornata esplicitamente. La foto principale viene usata nella Home e nella pagina La palestra. Per fotografie diverse nelle due sezioni, sostituisci i relativi elementi HTML e togli `data-gallery` / `data-gallery-caption` dalle sezioni che non devono seguire il primo elemento.

Preferisci JPG/WebP ben ottimizzati, almeno 1600 px orizzontali, idealmente meno di 400 KB per immagine. Scrivi sempre testi alternativi aderenti alla foto. Aggiorna anche i riferimenti HTML per mantenere la versione senza JavaScript.

`logo.svg` conserva i pixel del logo originale tramite un’immagine incorporata: non migliora la risoluzione originaria. Per sostituirlo, usa un SVG autentico o un PNG di qualità e aggiorna i percorsi HTML. `brand-original.png` è l’originale anche per le anteprime social; `favicon.svg` usa solo il simbolo originale.

## Stile

Le variabili all’inizio di `assets/css/style.css` controllano viola, neutri e font. Le animazioni rispettano `prefers-reduced-motion`. Non cancellare gli stili di focus, il link “Vai al contenuto” o il fallback `noscript` del menu.

## Controllo dopo ogni modifica al calendario

Apri Home, Corsi e Quiz. Verifica la prima lezione rispetto al calendario reale. Per un controllo automatico della logica, con Node installato: `node --test tests/engine.test.cjs`. Il file usa dati fittizi isolati e non carica esempi nel sito.

## Schede illustrate e riepilogo

Le schede usano `image`, `imageAlt`, `eyebrow`, `description` e `detail` di ogni attività. Gli orari delle schede sono ricavati dalle lezioni in `schedule.sessions`, mentre la sala usa `opening.days`: non occorre riscriverli nelle descrizioni. Le immagini dei corsi sono in `assets/images/courses/`; la galleria `gallery` riguarda invece la foto generale della palestra.

`assets/js/catalog.js` rende le schede e il riepilogo. I contenuti sono presenti anche nell’HTML statico per la lettura senza JavaScript. Se modifichi un corso, sincronizza anche la copia HTML per utenti senza JavaScript e motori di ricerca. Nessun PDF o screenshot Instagram è richiesto al funzionamento.
