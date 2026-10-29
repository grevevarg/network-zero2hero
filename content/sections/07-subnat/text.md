<!-- uses: broadcastdoman, broadcast, privat-adress, prefix -->
## Varför dela upp nät?

Ett stort nät där alla sitter i samma broadcastdomän blir stökigt. Alla hör allas broadcast, och det är svårt att hålla ordning. Därför delar man ofta upp ett nät i flera mindre. Det kallas **subnätting**.

Det låter krångligt, men det bygger bara på det du redan kan: binärt, masker och prefix. Det här avsnittet är matematiskt. Ta det lugnt och räkna med på exemplen. Allt räknas en oktett i taget, och du behöver aldrig skriva ut alla 32 bitar.

<!-- uses: host, natverksadress, broadcastadress, natdel-vardel -->
## Nätverksadress och broadcastadress

En enhet som har en IP-adress i nätet kallas en **host**. Men alla adresser i ett nät kan inte ges till hosts. Två är reserverade.

- Den lägsta adressen är **nätverksadressen**. Den är namnet på hela nätet, och alla bitar i värddelen är noll.
- Den högsta adressen är **broadcastadressen**. Det som skickas dit går till alla i nätet, och alla bitar i värddelen är ett.

I 192.168.10.0/24 är nätverksadressen 192.168.10.0 och broadcastadressen 192.168.10.255. Hostarna får allt däremellan, från .1 till .254.

<!-- uses: antal-hosts, host, prefix, bit -->
## Hur många hosts?

Antalet bitar i värddelen är 32 minus prefixet. Varje bit dubblar antalet adresser. Sedan drar du bort två, för nätverksadressen och broadcastadressen.

| Prefix | Adresser | Hosts |
| --- | --- | --- |
| /24 | 256 | 254 |
| /25 | 128 | 126 |
| /26 | 64 | 62 |
| /27 | 32 | 30 |
| /28 | 16 | 14 |
| /29 | 8 | 6 |
| /30 | 4 | 2 |

Formeln är alltså 2 upphöjt till antalet värdbitar, minus 2. Det vanligaste felet är att glömma minus två. Ett /27 har 32 adresser men bara 30 hosts.

<!-- uses: subnatting, subnatmask, prefix, natverksadress, broadcastadress -->
## Låna en bit

Säg att du har 192.168.10.0/24 och vill dela det på mitten. Då lånar du en bit från värddelen och ger den till nätdelen. Masken går från 24 ettor till 25.

`11111111.11111111.11111111.00000000` blir `11111111.11111111.11111111.10000000`

Den sista oktetten i masken blir 128, så masken är 255.255.255.128, eller /25. Nu finns det två nät:

- 192.168.10.0 till 192.168.10.127
- 192.168.10.128 till 192.168.10.255

Samma regler gäller i varje nät. Båda har en egen nätverksadress och en egen broadcastadress.

<!-- uses: blockstorlek, subnatmask, subnatting -->
## Blockstorlek

@diagram(text-block)

Varje subnät är lika stort, och storleken kallas **blockstorlek**. Du räknar ut den med 256 minus maskens värde i den oktett där masken slutar.

För /26 är masken 255.255.255.192. 256 minus 192 är 64. Ett /24 delat i /26 blir alltså fyra block med 64 adresser i varje: 0 till 63, 64 till 127, 128 till 191 och 192 till 255.

Ett snabbt knep när du vill ha ett visst antal lika stora nät av ett /24: dela 256 med antalet nät för att få blockstorleken, och ta 256 minus den för att få masken. Fyra nät ger 256 / 4 = 64, och 256 − 64 = 192. Det fungerar bara när antalet nät är 2, 4, 8 och så vidare.

<!-- uses: blockstorlek, natverksadress, broadcastadress, host, oktett -->
## Hitta nätet för en adress

Med blockstorleken kan du hitta nätet för vilken adress som helst. Ta 192.168.1.130/26.

1. Hitta oktetten där masken slutar. Här är det den fjärde.
2. Räkna ut blockstorleken: 256 − 192 = 64.
3. Ta den största multipeln av 64 som inte är större än 130. Multiplerna är 0, 64, 128 och 192, så det blir 128. Nätverksadressen är 192.168.1.128.
4. Broadcastadressen är nästa nät minus ett: 192 − 1 = 191, alltså 192.168.1.191.
5. Hostarna är allt däremellan: .129 till .190.

<!-- uses: blockstorlek, natverksadress, broadcastadress, oktett -->
## När masken slutar tidigare

Metoden fungerar likadant när masken slutar i en annan oktett. Ta 172.16.45.200/20.

/20 är fyra bitar in i den tredje oktetten, så masken är 255.255.240.0 och blockstorleken 256 − 240 = 16, i den tredje oktetten. Multiplerna av 16 är 0, 16, 32 och 48. 45 hamnar i blocket som börjar på 32.

Nätverksadressen blir 172.16.32.0 och broadcastadressen 172.16.47.255. Lägg märke till den fjärde oktetten. Den hör helt till värddelen, så den blir 0 i nätverksadressen och 255 i broadcastadressen.

<!-- uses: antal-hosts, blockstorlek, prefix -->
## Hur stor mask behöver jag?

Ofta är frågan den omvända: du vet hur många hosts ett nät ska ha och vill veta masken. Lägg till två, för nätverksadressen och broadcastadressen. Ta sedan det minsta av talen 4, 8, 16, 32, 64, 128 och 256 som räcker. Det är blockstorleken.

- 50 hosts: 52 adresser behövs, och 64 räcker. Det blir /26.
- 30 hosts: 32 adresser behövs, och 32 räcker precis. Det blir /27.
- 31 hosts: 33 adresser behövs. 32 räcker inte, så det blir 64 och /26.

<!-- uses: vlsm, blockstorlek, antal-hosts, natverksadress -->
## VLSM

Alla delar av ett nät behöver inte vara lika stora. Med **VLSM** (Variable Length Subnet Masking) får varje subnät den mask som passar just det. Så slösar du inte adresser.

Säg att du ska dela 192.168.10.0/24 i tre LAN med 100, 50 och 20 hosts, plus en länk mellan två enheter som bara behöver två adresser.

1. Sortera från störst till minst. Det är det viktigaste steget.
2. Välj mask för varje nät, som på förra kortet.
3. Ge varje nät nästa lediga adress som är en multipel av dess blockstorlek.

| Nät | Hosts | Mask | Nätverksadress | Broadcast |
| --- | --- | --- | --- | --- |
| LAN A | 100 | /25 | 192.168.10.0 | .127 |
| LAN B | 50 | /26 | 192.168.10.128 | .191 |
| LAN C | 20 | /27 | 192.168.10.192 | .223 |
| Länk | 2 | /30 | 192.168.10.224 | .227 |

Börjar du med de små näten kan det sluta med att det stora inte får plats på en jämn multipel.

<!-- uses: ip-plan, natverksadress, broadcastadress, subnatmask, host -->
## IP-plan

När du delar upp nät är det viktigt att skriva ner allt i en **IP-plan**, till exempel i ett kalkylark. För varje nät skriver du namn, nätverksadress, mask, vilka adresser hostarna får och broadcastadressen. Varje enhet med fast adress får också en rad.

Det är vanligt att spara de första adresserna i varje nät till gemensamma saker, som den enhet som leder ut ur nätet och skrivare. Datorerna får börja en bit upp, till exempel på .10.

Masken måste också vara rätt på alla enheter i nätet. Har en enhet fel mask tror den att nätet är större eller mindre än det är, och då kan den inte nå de andra som den ska.

<!-- uses: natverksadress, broadcastadress, antal-hosts, subnatting, blockstorlek, vlsm, ip-plan; kind: recap -->
## Kort sammanfattning

- Lägsta adressen är nätverksadressen och högsta är broadcastadressen. Ingen av dem ges till en host.
- Antal hosts är 2 upphöjt till antalet värdbitar, minus 2.
- Att låna en bit från värddelen delar nätet i två.
- Blockstorlek är 256 minus maskens värde i den oktett där masken slutar.
- Nätverksadressen är den största multipeln av blockstorleken som inte är större än adressen. Broadcast är nästa nät minus ett.
- Med VLSM får varje nät sin egen mask. Sortera från störst till minst.
- Skriv allt i en IP-plan.
