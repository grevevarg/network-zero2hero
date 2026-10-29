<!-- uses: logisk-adress, fysisk-adress, mac-adress, broadcastdoman -->
## Varför en till adress?

Du har redan en MAC-adress. Varför behövs en till? För att MAC-adressen bara fungerar inom en broadcastdomän. Den som inte hör dig när du ropar kan inte heller svara.

Tänk på en mobil. Telefonen har ett eget serienummer som sitter fast i den, ungefär som en MAC-adress. Men det är simkortet som ger dig ett nummer som andra kan ringa, var du än är. På samma sätt behöver nätverk en logisk adress som fungerar över många nät. Den heter **IP-adress**, och den vanligaste sorten är **IPv4**.

<!-- uses: ipv4, oktett, bit, byte -->
## IPv4-adressen

En IPv4-adress är alltid 32 bitar lång. Den delas in i fyra delar med åtta bitar i varje. En sådan del kallas en **oktett**.

För att det ska bli lättare att läsa skriver man varje oktett som ett vanligt tal och sätter punkter emellan, till exempel 192.168.1.10. Punkterna är bara till för ögat. Datorn ser bara 32 ettor och nollor.

Åtta bitar kan bli tal från 0 till 255. Därför kan ingen oktett vara större än 255.

<!-- uses: binart, oktett, bit -->
## Binärt

@diagram(text-binar)

För att förstå IP-adresser behöver du kunna växla mellan vanliga tal och **binära** tal. Varje bit i en oktett har ett värde. Från vänster är värdena 128, 64, 32, 16, 8, 4, 2 och 1. Varje värde är hälften av det före.

Från binärt till vanligt tal: lägg ihop värdena där det står en etta. 11000000 har ettor på 128 och 64, och 128 + 64 = 192.

Från vanligt tal till binärt: gå från vänster och fråga om värdet ryms. Ta 10. 128, 64, 32 och 16 är för stora, så de blir nollor. 8 ryms, så det blir en etta, och 2 är kvar. 4 ryms inte, men 2 gör det. Svaret blir 00001010.

<!-- uses: natdel-vardel, ipv4 -->
## Nätdel och värddel

@diagram(text-delar)

En IP-adress består av två delar. **Nätdelen** säger vilket nät enheten finns i. **Värddelen** säger vilken enhet i nätet det är. På engelska heter de network portion och host portion.

Det är som ett telefonnummer med riktnummer. Riktnumret säger vilken ort det gäller, och resten säger vilken telefon på orten. Alla enheter i samma nät har samma nätdel, men olika värddelar.

<!-- uses: subnatmask, prefix, natdel-vardel, bit -->
## Subnätmasken

Hur vet en dator var nätdelen slutar? Det berättar **subnätmasken**. Den är också 32 bitar lång och skrivs som en IP-adress. Där masken har ettor är det nätdel, och där den har nollor är det värddel.

Masken är alltid en rad ettor följda av en rad nollor, aldrig blandat. Den vanligaste masken i ett litet nät är 255.255.255.0. Då är de tre första oktetterna nätdel och den sista värddel.

Ett kortare sätt att skriva masken är att räkna ettorna. 255.255.255.0 har 24 ettor och skrivs **/24**. Det kallas prefix, och adressen blir då 192.168.1.10/24.

<!-- uses: adressklass, multicast, prefix -->
## Klasser

Förr delades IPv4-adresser in i **klasser**. Klassen syns på den första oktetten.

| Klass | Första oktetten | Mask |
| --- | --- | --- |
| A | 1 till 126 | /8 |
| B | 128 till 191 | /16 |
| C | 192 till 223 | /24 |
| D | 224 till 239 | Multicast |
| E | 240 till 255 | Forskning |

Klasserna används inte så mycket längre, eftersom de är för grova. Ett nät i klass A har plats för över 16 miljoner enheter. Men du kommer att höra orden, så det är bra att känna igen dem.

<!-- uses: privat-adress, publik-adress, ipv4, internet -->
## Privata och publika adresser

**Publika adresser** används på internet. De måste vara unika i hela världen. IPv4-adresserna har faktiskt tagit slut, och företag får ansöka om adresser och ibland stå i kö. I Europa delas de ut av en organisation som heter RIPE NCC.

**Privata adresser** är till för lokala nät. De får inte användas ute på internet, och samma privata adresser används i miljontals hem och kontor. Det finns tre privata intervall:

- 10.0.0.0 till 10.255.255.255
- 172.16.0.0 till 172.31.255.255
- 192.168.0.0 till 192.168.255.255

Hemma har du nästan säkert en adress som börjar på 192.168. När du surfar översätter något i ditt nät den till en publik adress. Hur det går till kommer längre fram.

<!-- uses: loopback, apipa, ipv4 -->
## Loopback och APIPA

Några adresser har speciella jobb.

**Loopback** är hela intervallet 127.0.0.0 till 127.255.255.255, oftast 127.0.0.1. Den betyder "mig själv". Skickar du något dit når det aldrig nätet, det vänder i din egen dator. Den används för att testa att IP fungerar i datorn.

**APIPA** är intervallet 169.254.0.0 till 169.254.255.255. När en dator ska få en adress automatiskt men ingen svarar, hittar den på en egen adress i det intervallet. Ser du en adress som börjar på 169.254 är det alltså ett tecken på att något är fel.

<!-- uses: arp, mac-adress, broadcast, unicast, broadcastdoman, ipv4 -->
## ARP

Din dator vill skicka till 192.168.1.20 i samma nät. Den vet IP-adressen men inte MAC-adressen, och utan MAC-adress kan den inte bygga en frame. Här kommer **ARP** (Address Resolution Protocol) in.

Datorn skickar en broadcast: "Vem har 192.168.1.20?" Alla i broadcastdomänen hör frågan, men bara den med den adressen svarar, med unicast och sin MAC-adress. Svaret sparas i en ARP-tabell, så datorn slipper fråga nästa gång.

ARP fungerar bara inom den egna broadcastdomänen, eftersom det bygger på broadcast. I Windows kan du se din ARP-tabell med kommandot `arp -a`. Rader som är "dynamic" försvinner efter ett tag, rader som är "static" ligger kvar.

<!-- uses: ipv4, oktett, binart, natdel-vardel, subnatmask, prefix, adressklass, privat-adress, publik-adress, loopback, apipa, arp; kind: recap -->
## Kort sammanfattning

- En IPv4-adress är 32 bitar i fyra oktetter, skrivna som tal mellan 0 och 255 med punkter emellan.
- Bitvärdena i en oktett är 128, 64, 32, 16, 8, 4, 2 och 1.
- Adressen har en nätdel och en värddel. Subnätmasken visar var gränsen går, och /24 betyder 24 ettor i masken.
- Klass A, B och C har masken /8, /16 och /24. Klasserna används inte så mycket i dag.
- Privata adresser: 10.x.x.x, 172.16 till 172.31 och 192.168. De används inte på internet.
- 127.0.0.1 är loopback. En adress på 169.254 (APIPA) betyder att datorn inte fick någon adress.
- ARP tar reda på MAC-adressen till en IP-adress i samma broadcastdomän.
