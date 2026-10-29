<!-- uses: dynamisk-routing, statisk-route, routingtabell, router -->
## Routrar som pratar med varandra

I förra avsnittet skrev du in routes för hand. Det fungerar i ett litet nät, men tänk dig hundra routrar. Varje gång ett nät läggs till eller en kabel går sönder måste någon ändra överallt.

Med **dynamisk routing** berättar routrarna själva för varandra vilka nät de känner till. Router A berättar för B, som lägger till det i sin tabell och berättar vidare för C, och så vidare. Reglerna för hur de pratar kallas ett **routingprotokoll**.

<!-- uses: metric, routingtabell, hop -->
## Metric: vilken väg är bäst?

Ofta finns det flera vägar till samma nät. Routern måste välja en, och den väljer den med lägst **metric**. Metric är ett mått på hur bra en väg är, där lägre är bättre.

Olika routingprotokoll mäter på olika sätt. Vissa räknar bara antalet hopp. Andra räknar med hur snabba länkarna är. Därför kan två protokoll välja olika vägar i exakt samma nät.

<!-- uses: rip, distance-vector, metric, hop -->
## RIP

**RIP** (Routing Information Protocol) var det första routingprotokollet för dynamisk routing, och det stöds av nästan allt. Det är ett **distance-vector**-protokoll. Det betyder ungefär att routrarna skickar sina routingtabeller till grannarna, och att varje router bara vet avståndet och riktningen till varje nät.

RIP:s metric är antalet hopp. Den väg som har minst antal routrar vinner, hur långsamma länkarna än är. En väg får vara högst 15 hopp lång. Längre bort än så räknas nätet som omöjligt att nå.

<!-- uses: rip, multicast, broadcast, prefix -->
## RIP version 1 och 2

Det finns två versioner av RIP, och skillnaderna är viktiga att kunna.

| | RIP v1 | RIP v2 |
| --- | --- | --- |
| Skickar till | Broadcast | Multicast |
| Uppdateringar | Hela tabellen var 30:e sekund | Skickar även direkt när något ändras |
| Masker | Bara klasserna, inga prefix | Klarar prefix och olika masker |
| Lösenord mellan routrar | Nej | Ja |

Utan lösenord kan vem som helst låtsas vara en router och lura de andra att skicka trafik fel. Det är ett skäl till att RIP v1 inte används längre.

<!-- uses: konvergens, rip -->
## Konvergens

När något ändras i nätet tar det en stund innan alla routrar vet om det. Tiden det tar innan alla är överens kallas **konvergens**.

RIP konvergerar långsamt. Ändringen sprids bara ett steg i taget, och ju längre bort en router är, desto längre tid tar det. RIP v2 är lite snabbare än v1, eftersom den kan skicka direkt vid en ändring, men den är fortfarande långsam.

<!-- uses: routingloop, split-horizon, poison-reverse, hold-down, rip -->
## Routingloopar

Medan routrarna inte är överens kan det bli fel. En **routingloop** är när paket skickas runt, runt mellan routrar i stället för att komma fram. RIP har flera skydd mot det.

- **Max antal hopp:** en väg på mer än 15 hopp räknas som omöjlig, så ett paket kan inte gå runt i all oändlighet.
- **Split horizon:** en router berättar aldrig om en route för grannen som den lärde sig routen av.
- **Poison reverse:** när en route slutar fungera berättar routern det, åt det håll den lärde sig routen.
- **Hold-down timer:** när en länk har gått ner väntar routern en stund innan den litar på nya besked om den. Det hindrar en länk som slår av och på från att röra till allt.

<!-- uses: ospf, link-state, metric, ospf-cost, bithastighet -->
## OSPF

**OSPF** (Open Shortest Path First) är en öppen standard och passar bäst i större nät. Det är ett **link state**-protokoll. I stället för att bara lita på grannarnas tabeller bygger varje router en egen karta över nätet.

OSPF:s metric heter **cost**, kostnad. Varje interface får en kostnad utifrån länkens hastighet: 100 000 000 delat med hastigheten i bitar per sekund. 10 Mbit/s ger kostnaden 10 och 100 Mbit/s ger 1. Kostnaden kan inte bli lägre än 1, så allt som är snabbare än 100 Mbit/s får också 1.

Kostnaden för en väg är summan av kostnaderna för alla länkar på vägen. Två snabba länkar kan alltså vara billigare än en enda långsam.

<!-- uses: area, autonomt-system, ospf -->
## Areor och autonoma system

Ett stort OSPF-nät delas in i **areor**. Inom en area vet routrarna allt om varandras vägar. Till routrar utanför arean skickas bara en sammanfattning. Det håller routingtabellerna lagom stora.

Ett **autonomt system** (AS) är ett nät som sköts av en och samma organisation, till exempel ett företag eller en internetleverantör. Ett AS kan innehålla många areor, och mellan olika AS skickas bara sammanfattad information.

<!-- uses: bgp, autonomt-system, internet -->
## BGP

**BGP** (Border Gateway Protocol) är gjort för väldigt stora nät. Det är det protokoll som binder ihop internet, och det används till exempel mellan internetleverantörer, alltså mellan olika autonoma system.

Du kommer knappast att ställa in BGP i början. Men det är bra att veta att det finns, och att det är det som håller ihop internet.

<!-- uses: dynamisk-routing, metric, rip, konvergens, routingloop, split-horizon, ospf, ospf-cost, area, bgp; kind: recap -->
## Kort sammanfattning

- Med dynamisk routing berättar routrarna själva för varandra om nät. Den väg som har lägst metric vinner.
- RIP räknar hopp och tillåter högst 15. RIP v2 använder multicast, klarar prefix och har lösenord.
- Konvergens är tiden tills alla routrar är överens. RIP är långsamt.
- Mot routingloopar finns max antal hopp, split horizon, poison reverse och hold-down timer.
- OSPF räknar cost utifrån hastigheten och passar större nät. Stora OSPF-nät delas i areor.
- BGP binder ihop internet, mellan olika autonoma system.
