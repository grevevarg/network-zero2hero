<!-- uses: klient, server, natverk -->
## Varför lager?

I förra avsnittet bad en klient en server om lite hårdrock. Det låter enkelt, men det är många jobb som ska göras på vägen. Datan ska delas upp, få en adress, hitta rätt väg och till slut bli signaler i en kabel.

Om ett enda program skulle sköta allt detta hade det blivit ett massivt och rörigt program. Därför delar man upp jobbet i lager. Varje lager gör sin del och litar på att de andra lagren gör sin.

Det är lite som när du skickar ett brev. Du skriver adressen på kuvertet, men du behöver inte veta hur lastbilen körs. Det är någon annans jobb.

<!-- uses: protokoll -->
## Protokoll

För att två enheter ska förstå varandra måste de följa samma regler. Sådana regler kallas ett **protokoll**. Ett protokoll bestämmer till exempel hur ett meddelande ska se ut och vad som händer när något går fel.

Tänk på ett språk. Om du bara kan svenska och din kompis bara kan japanska blir det inget samtal, hur bra ni än hör varandra. Med nätverk är det likadant.

Protokollen är standardiserade. Alla tillverkare följer samma regler, så en mobil från ett märke kan prata med en server från ett helt annat. Varje lager har sina egna protokoll.

<!-- uses: bit, byte -->
## Bitar och bytes

I slutändan är all data bara ettor och nollor. En sådan etta eller nolla kallas en **bit**. Det är den minsta delen av data som finns.

En ensam bit säger inte så mycket, så man grupperar dem. Åtta bitar kallas en **byte**. En byte räcker till exempel till en vanlig bokstav, som ett a.

Storleken på data räknas oftast i bytes. Det kommer du att se snart.

<!-- uses: osi-modellen, protokoll -->
## OSI-modellen

@diagram(text-osi)

**OSI-modellen** är en standardiserad modell som delar upp kommunikationen i ett nätverk i sju lager. Den används över hela världen. Lager 7 ligger överst, nära dig och dina program. Lager 1 ligger underst, nere vid kabeln.

Modellen hjälper på två sätt. Alla pratar om samma saker på samma sätt, oavsett tillverkare. Och felsökning blir lättare. I stället för att säga att nätet är trasigt kan du peka ut vilket lager felet sitter i.

När du skickar något går datan uppifrån och ner genom lagren. Hos mottagaren går den nerifrån och upp. På de närmaste sidorna går vi igenom lagren ett i taget, från toppen.

<!-- uses: applikationslagret, klient, server -->
## Lager 7: Applikation

**Applikationslagret** är där programmen du använder lämnar över sin data till nätet. Det kan vara en webbläsare, en chattapp eller en musiktjänst.

Kommer du ihåg hårdrocken? Frågan "Jag vill lyssna på hårdrock" skapas här, i lager 7. Sedan skickas den nedåt genom lagren, och varje lager gör sitt.

<!-- uses: presentationslagret, bit -->
## Lager 6: Presentation

**Presentationslagret** ser till att båda sidor läser datan på samma sätt. En del av jobbet är att göra om datan till ett format som mottagaren förstår. En annan del är kryptering, alltså att låsa datan så att bara rätt mottagare kan läsa den.

Ett exempel är teckenkodning. Det är regler för vilka bitar som betyder vilken bokstav, och ASCII och UTF-8 är två sådana regler. Har du sett å, ä och ö bli konstiga tecken någon gång? Då har avsändaren och mottagaren läst bitarna med olika regler.

<!-- uses: sessionslagret -->
## Lager 5: Session

**Sessionslagret** håller ordning på samtalet mellan två program. Det öppnar samtalet, håller det vid liv och stänger det när ni är klara.

Säg att du laddar ner en stor fil och nätet bryts vid 80 procent. Sessionslagret kan hålla reda på hur långt ni kom, så att nedladdningen fortsätter därifrån i stället för att börja om. Ett annat exempel är när du loggar in på en sida och förblir inloggad medan du klickar runt.

I praktiken är det här det tunnaste lagret, och det kan kännas lite luddigt. Det är helt normalt.

<!-- uses: transportlagret, segment, header, byte -->
## Lager 4: Transport

**Transportlagret** ser till att datan kommer fram ordentligt. Det delar upp datan i mindre delar som kallas **segment** och numrerar dem. Mottagaren kan då lägga ihop dem i rätt ordning och märka om något saknas.

Numret skrivs i en **header**. Det är en liten etikett med information som lagret sätter framför datan.

Varför dela upp alls? Nätet kan bara skicka runt 1500 bytes åt gången. En enda bild från mobilen kan vara flera miljoner bytes, så den måste delas upp i tusentals delar.

Transportlagret håller också isär olika program på samma dator. Det är därför du kan chatta och lyssna på musik samtidigt utan att datan blandas ihop.

<!-- uses: natverkslagret, logisk-adress, paket, header -->
## Lager 3: Nätverk

**Nätverkslagret** tar hand om **logiska adresser**. En logisk adress pekar ut slutmålet. Den gäller hela vägen, genom alla nät som datan passerar, ungefär som adressen på ett kuvert.

Nätverkslagret väljer också väg. Mellan dig och en server på andra sidan jorden finns många nät och många vägar. Det här lagret bestämmer vart datan ska härnäst.

Lager 3 sätter sin egen header med adressen framför segmentet. Nu kallas datan ett **paket**.

<!-- uses: datalankslagret, fysisk-adress, logisk-adress, trailer, frame, header -->
## Lager 2: Datalänk

**Datalänkslagret** skickar datan till nästa enhet, den som sitter direkt ihop med din. Här används en **fysisk adress**. Den sitter fast i enhetens nätverkskort och pekar bara ut grannen, inte slutmålet.

Den här skillnaden är lätt att blanda ihop. Den logiska adressen säger vart datan ska till slut. Den fysiska adressen säger bara vem som ska ta emot den på nästa sträcka. Den fysiska adressen byts ut på varje sträcka, men den logiska är densamma hela vägen.

Lager 2 sätter en header framför paketet och lägger dessutom en **trailer** i slutet. Trailern innehåller en kontrollsumma. Mottagaren räknar ut samma summa och jämför. Stämmer den inte har något gått sönder på vägen. Nu kallas datan en **frame**.

<!-- uses: fysiska-lagret, bit, header -->
## Lager 1: Fysiskt

**Det fysiska lagret** gör om bitarna till signaler och skickar ut dem. Det kan vara el i en kabel, ljus i en glasfiber eller radiovågor genom luften, som med wifi.

Lager 1 sätter ingen header. Det bryr sig inte om adresser eller vad datan betyder, det skickar bara ettor och nollor. Därför kallas datan här helt enkelt **bitar**.

<!-- uses: inkapsling, header, trailer -->
## Inkapsling

@diagram(text-inkapsling)

Nu har du sett hela vägen ner. Varje lager tar emot det som kommer uppifrån och sätter sin egen header framför. Det kallas **inkapsling** (på engelska *encapsulation*). Det liknar att lägga ett brev i ett kuvert, och sedan det kuvertet i ett större kuvert.

Lagren 7, 6 och 5 kan också lägga till information, men för lagren under räknas allt det bara som data. Lager 4, 3 och 2 sätter var sin header framför, och lager 2 lägger dessutom trailern i slutet. Sedan är paketeringen klar, och lager 1 skickar ut alltihop som bitar.

Hos mottagaren går det baklänges. Lager 2 läser och tar bort sin header och trailer, sedan gör lager 3 likadant med sin header, och så vidare uppåt. Till slut ligger bara datan kvar, och programmet får den.

<!-- uses: pdu, segment, datagram, paket, frame, bit -->
## Datan byter namn

Datan har olika namn beroende på vilket lager den är i. Ett samlingsnamn för dem är **PDU**, som står för Protocol Data Unit.

| Lager | PDU |
| --- | --- |
| 7, 6 och 5 | Data |
| 4 | Segment eller datagram |
| 3 | Paket |
| 2 | Frame |
| 1 | Bitar |

Lager 4 kan skicka data på två olika sätt. Det ena kallar sin PDU för segment, det andra för **datagram**. Skillnaden kommer i ett senare avsnitt. Ordet datagram används ibland även om andra lager, så läs det utifrån sammanhanget.

När du skickar går kedjan alltså data, segment, paket, frame, bitar. Hos mottagaren går den åt andra hållet.

<!-- uses: osi-modellen, segment, logisk-adress -->
## Hela vägen med en bokhylla

Här är hela modellen som en platt bokhylla som ska skickas från en butik till en kund i en annan stad.

- **7:** Bokhyllan själv, det som kunden faktiskt vill ha.
- **6:** Instruktionerna, så att kunden förstår hur den ska byggas.
- **5:** Köpet. Butiken och kunden har en affär igång.
- **4:** Hyllan ryms inte i en kartong, så den packas i flera numrerade kartonger.
- **3:** Kartongerna får kundens adress, och transporten bokas.
- **2:** Kartongerna lämnas över till åkeriet som kör första sträckan.
- **1:** Lastbilen kör iväg.

Hos kunden går det åt andra hållet. Kartongerna packas upp, och till slut står bokhyllan där.

<!-- uses: tcp-ip-modellen, osi-modellen, protokoll, applikationslagret, presentationslagret, sessionslagret, transportlagret, natverkslagret, datalankslagret, fysiska-lagret -->
## TCP/IP-modellen

@diagram(text-tcpip)

OSI är inte den enda modellen. **TCP/IP-modellen** har bara fyra lager. Namnet kommer från två protokoll som du kommer att möta längre fram.

TCP/IP slår ihop några av OSI-lagren. Applikation, presentation och session blir ett enda lager, som heter Applikation. Datalänk och fysiskt blir Network Access. Transport är kvar som det är, och nätverkslagret heter Internet.

Folk som jobbar med nätverk pratar ändå oftast i OSI-lager. Säger någon att det är ett lager 1-problem vet alla att det är kabeln som ska kollas. De fyra lägsta lagren är de viktigaste när man bygger nät, och det är dem resten av avsnitten handlar mest om.

<!-- uses: protokoll, bit, byte, osi-modellen, logisk-adress, fysisk-adress, inkapsling, header, trailer, pdu, datagram, tcp-ip-modellen; kind: recap -->
## Kort sammanfattning

- Ett protokoll är regler för hur enheter pratar med varandra.
- En bit är en etta eller en nolla. En byte är åtta bitar.
- OSI-modellen har sju lager: applikation, presentation, session, transport, nätverk, datalänk och fysiskt.
- Lager 3 har den logiska adressen till slutmålet. Lager 2 har den fysiska adressen till grannen.
- Vid inkapsling sätter varje lager sin header framför datan, och lager 2 lägger också en trailer i slutet. Mottagaren packar upp baklänges.
- Datan heter data, segment (eller datagram), paket, frame och bitar på vägen ner.
- TCP/IP-modellen har fyra lager: Applikation, Transport, Internet och Network Access.
