<!-- uses: felsokningsmetod, osi-modellen -->
## Varför en metod?

När nätet krånglar är det lätt att börja gissa och ändra lite här och där. Det tar lång tid och gör ofta saken värre. Med en metod letar du i stället på ett ställe i taget, och du vet vad du redan har uteslutit.

Här kommer OSI-modellen till nytta igen. Den gör att du kan peka ut i vilket lager felet sitter. Metoden i det här avsnittet bygger på att börja längst ner och arbeta dig uppåt.

<!-- uses: felsokningsmetod, fysiska-lagret, switch, ipconfig, default-gateway, subnatmask, apipa -->
## Börja längst ner

1. **Lager 1 på datorn du felsöker från.** Sitter kabeln i? Lyser lampan vid nätverksporten?
2. **Lager 2.** Är switchen påslagen och lyser porten?
3. **Lager 3 på datorn.** Kör `ipconfig` och kontrollera IP-adress, subnet mask och default gateway.

Det låter självklart, men en urdragen kabel är ett vanligare fel än man tror. Och `ipconfig` avslöjar mycket. Står det en adress som börjar på 169.254 har datorn inte fått någon adress från DHCP. Är masken eller gatewayen fel kan datorn inte nå andra nät.

<!-- uses: ping, loopback, default-gateway, felsokningsmetod -->
## Pinga i rätt ordning

@diagram(text-ping)

När inställningarna ser rätt ut testar du med ping, från dig själv och utåt.

1. `ping 127.0.0.1`, loopback. Svarar den fungerar IP i själva datorn.
2. Pinga din egen IP-adress. Svarar den fungerar nätverkskortet.
3. Pinga din default gateway. Svarar den fungerar ditt lokala nät hela vägen till routern.
4. Pinga något utanför ditt nät.

Det första steget som inte svarar visar var du ska leta. Svarar loopback men inte gatewayen ligger felet någonstans mellan datorn och routern.

<!-- uses: ping, router, default-gateway, arp, felsokningsmetod -->
## Gå vidare utåt

Svarar gatewayen men inte något längre bort fortsätter felsökningen vid gatewayen. Den är den yttersta punkt du har nått. Där gör du samma sak igen: kontrollera lager 1 på routern, och pinga sedan routerns egen default gateway.

Lita inte blint på ping. Ping blockeras ofta, och vissa routrar och servrar svarar aldrig på ping fast de fungerar. Kontrollera då på annat sätt, till exempel om enheten syns i ARP-tabellen.

<!-- uses: ping-svar, ping, routingtabell, router -->
## Vad säger felet?

Ping kan misslyckas på två sätt, och de betyder olika saker.

- **Destination Unreachable:** en router på vägen vet att den inte kan nå målet, till exempel för att det saknas en rad i routingtabellen. Felet är känt.
- **Request Timed Out:** inget svar kom alls, och ingen vet varför. Kanske kom paketet aldrig fram. Men det kan också ha kommit fram, och svaret försvann på vägen tillbaka, för att en router där saknar vägen hem.

Det är lätt att tro att paketet aldrig nådde målet, men vägen tillbaka är lika viktig som vägen dit.

<!-- uses: tracert, ttl, hop, router -->
## tracert

Med `tracert` i Windows ser du varje router som ett paket passerar på vägen. Det bygger på TTL. Först skickas ett paket med TTL 1, som slängs av den första routern. Routern skickar då tillbaka ett meddelande om det, och nu vet du vem den första routern är. Sedan skickas TTL 2, och så vidare.

Stannar listan efter några hopp vet du ungefär var på vägen det tar stopp.

<!-- uses: nslookup, dns, dns-cache -->
## nslookup

Fungerar det att pinga en adress men inte att surfa till ett namn? Då är DNS en het kandidat. Med `nslookup` och ett namn frågar du DNS-servern direkt och ser vilken adress den svarar med.

Får du inget svar, eller fel adress, ligger felet i DNS. Kom ihåg att din dator också har en DNS-cache. Ett gammalt svar kan ligga kvar en stund efter att något har ändrats.

<!-- uses: netstat, telnet, port, nat, port-forwarding -->
## När det gäller portar

Fungerar nätet men inte en viss tjänst handlar det ofta om portar.

- `netstat -n` visar vilka anslutningar din dator har, och `netstat -n -a` vilka portar den lyssnar på.
- `telnet` med en adress och en port visar om servern lyssnar på den porten.
- Finns det NAT på vägen, titta på routern som gör NAT. Saknas en port forwarding, eller pekar den på fel dator?

<!-- uses: felsokningsmetod, transportlagret, applikationslagret -->
## Var slutar jobbet?

Den som jobbar med nätverk brukar säga att ansvaret slutar vid lager 4. Fungerar allt upp till och med transportlagret är det programmet som krånglar, och då är det någon annans tur.

Det är en skön tanke. I praktiken, särskilt på mindre företag, blir det ofta du som får lösa det ändå. Men metoden hjälper då också: du kan visa att nätet fungerar och peka ut var felet faktiskt sitter.

<!-- uses: felsokningsmetod, ipconfig, ping, ping-svar, tracert, nslookup; kind: recap -->
## Kort sammanfattning

- Börja längst ner: kabel och lampor, switchen, och sedan `ipconfig`.
- Pinga i ordning: 127.0.0.1, din egen adress, default gateway och sedan något utanför.
- Fortsätt från den yttersta punkt som svarar. Lita inte blint på ping, den blockeras ofta.
- Destination Unreachable är ett känt fel. Request Timed Out kan betyda att svaret försvann på vägen tillbaka.
- `tracert` visar routrarna på vägen, `nslookup` testar DNS, och `netstat` och `telnet` hjälper med portar.
