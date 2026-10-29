<!-- uses: stjarna, datalankslagret, fysiska-lagret -->
## Vad sitter i mitten?

I en stjärna har alla enheter en kabel till något i mitten. Men vad är det för låda? Det finns flera sorter, från helt dumma till ganska smarta. I det här avsnittet går vi från den enklaste till den du hittar i nästan alla nät i dag, switchen.

Vägen går från lager 1 upp till lager 2. Ju högre upp en låda jobbar, desto mer förstår den av det som passerar.

<!-- uses: repeater, mediakonverter, fysiska-lagret, dampning, fiber -->
## Repeater och mediakonverter

En **repeater** är den enklaste lådan. Den tar emot en signal, förstärker den och skickar ut den igen. Det hjälper mot dämpning när en kabel blir för lång. En repeater behöver ström, så den måste sitta där det finns el.

En **mediakonverter** fungerar nästan likadant. Den kopplar ihop två olika sorters kablar, till exempel koppar och fiber, och gör om signalen mellan dem.

Båda jobbar bara på lager 1. De bryr sig inte om vad signalen betyder. De är vad man brukar kalla dumma enheter.

<!-- uses: hub, fysiska-lagret -->
## Hubb

En **hubb** kopplar ihop flera enheter. Allt den tar emot på en port skickar den ut på alla andra portar. Den har ingen aning om vem datan är till, för den jobbar bara på lager 1.

Det ger dålig prestanda, eftersom alla får all trafik och delar på samma kapacitet. Det ger också dålig säkerhet, eftersom vem som helst som sitter i hubben kan se allt som skickas.

<!-- uses: kollision, kollisionsdoman, csma-cd, hub, halv-duplex -->
## Kollisioner

Om två enheter i en hubb skickar exakt samtidigt krockar signalerna. Det kallas en **kollision**, och då måste båda skicka om. Ett område där det kan hända kallas en **kollisionsdomän**. Allt som sitter i samma hubb är en enda kollisionsdomän.

För att undvika krockar lyssnar enheterna först. Är det tyst skickar de. Är det inte tyst väntar de. Krockar det ändå väntar båda en stund och försöker igen. Metoden heter **CSMA/CD**. Den behövs när en ledning bara kan användas åt ett håll åt gången, alltså vid halv duplex.

<!-- uses: switch, datalankslagret, frame -->
## Switch

En **switch** ser ut som en hubb men är mycket smartare. Den har en egen processor och mjukvara, och den jobbar på lager 2. Den läser varje frame som kommer in och tittar på vem den är till.

Sedan skickar den bara ut framen på den port där mottagaren sitter. De andra får inte ens se den. Det ger både bättre prestanda och bättre säkerhet än en hubb.

Med en switch blir varje port sin egen kollisionsdomän. När kabeln dessutom kör full duplex kan det inte bli några kollisioner alls.

<!-- uses: hex, bit, byte -->
## Hexadecimalt

Innan vi tittar på adresserna som switchen läser behöver du ett nytt sätt att skriva tal. Det **hexadecimala** talsystemet har sexton siffror i stället för tio: 0 till 9 och sedan A till F. A betyder 10, B betyder 11 och så vidare upp till F, som betyder 15.

Det smarta är att en hexsiffra motsvarar exakt fyra bitar. Två hexsiffror blir alltså en byte. FF är det största värdet en byte kan ha, alla åtta bitar satta till ett.

Det används överallt i nätverk, eftersom långa rader av ettor och nollor blir mycket kortare och lättare att läsa i hex.

<!-- uses: mac-adress, oui, fysisk-adress, hex, bit -->
## MAC-adressen

@diagram(text-mac)

Den fysiska adressen från lager 2 heter **MAC-adress**. Den bränns in i nätverkskortet av tillverkaren. Den är 48 bitar lång och skrivs som tolv hexsiffror, ofta i par med kolon emellan.

Den första halvan, 24 bitar, berättar vem som tillverkat kortet. Den delen kallas **OUI** (Organizationally Unique Identifier). Den andra halvan är unik för just det kortet inom tillverkarens serie. Det finns sidor på nätet där du kan slå upp tillverkaren utifrån den första halvan.

<!-- uses: mac-tabell, flooding, switch, mac-adress -->
## MAC-tabellen

Hur vet switchen var mottagaren sitter? Den lär sig. Varje gång en frame kommer in tittar switchen på avsändarens MAC-adress och skriver upp vilken port den kom från. Listan kallas **MAC-tabellen**.

När en frame ska skickas letar switchen upp mottagaren i tabellen. Finns den där skickas framen bara ut på den porten. Finns den inte där skickar switchen ut framen på alla portar utom den den kom in på. Det kallas **flooding**. När mottagaren sedan svarar lär sig switchen var den sitter.

<!-- uses: ethernet, frame, mac-adress, trailer, byte -->
## Ethernet-framen

@diagram(text-ram)

Nästan alla trådbundna nät följer standarden **Ethernet**, som också heter IEEE 802.3. Den bestämmer hur en frame ser ut, hur stor den får vara och hur den ska skickas.

En Ethernet-frame börjar med några fält som talar om att en frame kommer. Sedan kommer mottagarens och avsändarens MAC-adress, ett fält för typ och till sist datan. Allra sist ligger trailern med kontrollsumman, som heter **FCS** (Frame Check Sequence).

En frame är minst 64 bytes. En vanlig frame är som mest omkring 1500 bytes plus headers och trailer.

<!-- uses: unicast, broadcast, multicast, mac-adress, hex -->
## Unicast, broadcast och multicast

Data kan skickas till en, till alla eller till några.

- **Unicast:** från en enhet till en annan. Det är så nästan all trafik går.
- **Broadcast:** till alla i samma nät, och alla måste lyssna. Mottagaradressen är då FF:FF:FF:FF:FF:FF, alltså alla bitar satta till ett.
- **Multicast:** en ström som skickas till alla som valt att lyssna, ungefär som en tv-sändning. Multicast-adresser börjar ofta med 01.

En broadcast kan till exempel vara en fråga som "vem av er heter Pelle?". Alla hör frågan, men bara Pelle svarar.

<!-- uses: broadcastdoman, broadcast, switch, hub, natverkslagret -->
## Broadcastdomän

En **broadcastdomän** är alla enheter som hör samma broadcast. Allt som hänger ihop med hubbar och switchar på lager 2 är en och samma broadcastdomän, hur många switchar det än är. Först en enhet som jobbar på lager 3 delar nätet i flera broadcastdomäner. Den kommer i ett senare avsnitt.

Det har betydelse för hur stort ett nät kan bli. Fler enheter betyder mer broadcast, och till slut går mycket kapacitet åt till att alla lyssnar på allas frågor. En tumregel är att hålla en broadcastdomän under ungefär 100 till 200 enheter. Skrivare och andra prylar räknas också.

En annan tumregel är att inte koppla fler än tre switchar efter varandra. Det fungerar ofta ändå, men risken för problem ökar.

<!-- uses: managed-switch, l3-switch, poe, switch, natverkslagret -->
## Olika sorters switchar

Switchar finns i några varianter.

- **Unmanaged:** kopplas in och fungerar. Den går inte att ställa in.
- **Managed:** går att ställa in, till exempel via en konsolkabel från en dator. Det är den vanligaste sorten i företag i dag.
- **Lager 3-switch:** jobbar också med logiska adresser och kan göra en del av det som enheter på lager 3 gör.
- **PoE-switch:** kan skicka ström i kabeln. Det är egentligen en egenskap som kan finnas på de andra sorterna.

<!-- uses: repeater, mediakonverter, hub, kollisionsdoman, csma-cd, switch, hex, mac-adress, oui, mac-tabell, flooding, ethernet, unicast, broadcast, multicast, broadcastdoman; kind: recap -->
## Kort sammanfattning

- Repeater, mediakonverter och hubb jobbar på lager 1 och förstår inte datan. En hubb skickar allt till alla.
- Allt i en hubb är en kollisionsdomän. CSMA/CD lyssnar först och försöker igen efter en krock.
- En switch jobbar på lager 2. Den lär sig MAC-adresser i sin MAC-tabell och skickar bara till rätt port. Okänd mottagare ger flooding.
- En hexsiffra är fyra bitar. En MAC-adress är 48 bitar, tolv hexsiffror. Första halvan (OUI) är tillverkaren.
- Broadcast går till FF:FF:FF:FF:FF:FF och når hela broadcastdomänen. Allt på lager 2 är samma broadcastdomän.
