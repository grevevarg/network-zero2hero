<!-- uses: natverk -->
## Varför börja här?

Du använder nätverk hela dagen. När du skickar ett meddelande, kollar en video eller spelar online skickas data mellan olika enheter. Det här avsnittet ger dig orden du behöver för resten av sidan. Inga siffror än. Bara bilder i huvudet.

## Vad är ett nätverk?

Ett **nätverk** är två eller fler enheter som är kopplade så att de kan skicka data till varandra. En enhet kan vara en dator, en mobil, en skrivare eller en smart kamera. Kopplingen kan vara en kabel. Den kan också vara radiovågor, som när du kör wifi.

Två datorer med en kabel emellan är alltså redan ett nätverk. Litet, men det räknas.

<!-- uses: natverk, tjanst, server, klient -->
## Klient och server

En **server** är en enhet som erbjuder en **tjänst**. Tjänsten kan vara en webbsida, en fil eller bilden från en kamera. Varje tjänst kräver ett eget program. Ett program visar webbsidor, ett annat sköter något helt annat. En server kan ta hand om många på en gång.

En **klient** är den som använder tjänsten. Din mobil och din dator är typiska klienter. Klienten frågar, servern svarar.

<!-- uses: tjanst, server, klient; kind: example -->
### Exempel: kameran i hallen

Tänk dig en kamera i hallen som du kan kolla på från mobilen. Kameran har ett litet serverprogram inbyggt. Den erbjuder bilden som en tjänst. Mobilen är klienten. Den ber om bilden och visar den för dig.

Data skickas åt båda hållen, men det ändrar inte rollerna. Det är fortfarande kameran som erbjuder tjänsten. En server behöver alltså inte vara en stor låda i ett serverrum. Det är rollen som räknas, inte storleken.

<!-- uses: peer-to-peer, klient, server, redundans -->
## Peer-to-peer

Ibland finns det ingen central server alls. I ett **peer-to-peer**-nät, ofta förkortat P2P, är alla jämlikar. Det är precis vad *peer* betyder: jämlike. Varje dator är både klient och server på samma gång.

Säg att du laddar ner en stor fil via P2P. Du får bitar av filen från många datorer samtidigt. Medan du laddar ner delar du själv ut de bitar du redan har till andra.

Eftersom filen finns på många ställen gör det inte så mycket om en dator försvinner. Det kallas **redundans**. Det finns reserver, så allt fortsätter att fungera fast en del går sönder.

<!-- uses: lan, wan, internet, natverk -->
## LAN, WAN och internet

Ett **LAN** (Local Area Network) är ett lokalt nätverk. Det kan vara nätet hemma eller på ett kontor. Enheterna finns nära varandra, och samma ägare sköter nätet.

Ett **WAN** (Wide Area Network) binder ihop nätverk som ligger långt ifrån varandra, till exempel i olika städer eller länder. Ett företag med kontor i Malmö och Luleå kan koppla ihop sina två LAN med ett WAN.

**Internet** är världens största nätverk. Det är egentligen massor av nätverk som är ihopkopplade, ett nätverk av nätverk. Ditt hemmanät är ett av dem.

<!-- uses: topologi, fysisk-topologi, logisk-topologi -->
## Topologi: hur nätet är byggt

**Topologi** betyder hur ett nätverk är uppbyggt, alltså vad som är kopplat till vad. Man pratar om två sorter.

Den **fysiska topologin** visar var allt faktiskt finns. Var står datorerna och servrarna? Var går kablarna, och vilket uttag sitter i vilket rum? Den fungerar som en ritning och som dokumentation. Går något sönder vill du snabbt kunna se vilken kabel det gäller.

Den **logiska topologin** visar hur nätet är uppdelat och vem som kan prata med vem. Den beskriver nätet utifrån enheterna: vad de heter och vilka tjänster de kör. Två datorer kan stå bredvid varandra i samma rum men ändå höra till olika delar av den logiska topologin.

<!-- uses: topologi, stjarna -->
## Vanliga former

Nätverk brukar ritas i några vanliga former. Formen säger mycket om vad som händer när något går sönder.

### Stjärna

@diagram(text-star)

I en **stjärna** har varje enhet en egen kabel till en gemensam enhet i mitten. Det är den vanligaste formen i dag. Varje enhet får en egen väg, och det gör nätet snabbt. Nackdelen är att det går åt väldigt mycket kabel. Prestandan gör det ändå värt det.

<!-- uses: buss -->
### Buss

@diagram(text-bus)

I en **buss** sitter alla enheter på en och samma kabel, som pärlor på ett snöre. Går den kabeln av slutar hela nätet att fungera. I dag drar man inte nät så här längre. Idén med en gemensam ledning lever däremot kvar inne i viss nätverksutrustning.

<!-- uses: ring -->
### Ring

@diagram(text-ring)

I en **ring** är varje enhet kopplad till sina två grannar, så att kablarna bildar en cirkel. Trafiken går bara åt ett håll runt ringen. Det blev väldigt långsamt, så ring är ovanligt i dag.

<!-- uses: trad, stjarna -->
### Träd

@diagram(text-tree)

Ett **träd** är ett sätt att bygga ut ett stjärnnät. Flera små stjärnor hänger under en gemensam punkt, ungefär som grenar på ett träd. Det är praktiskt när ett nät ska växa, till exempel när ett kontor får en våning till.

<!-- uses: mesh, redundans -->
### Mesh

@diagram(text-mesh)

I ett **mesh** har enheterna flera kopplingar till varandra, så det finns mer än en väg. Har varje enhet en direkt koppling till alla andra kallas det **full mesh** (på engelska även *fully connected*). Det ger massor av redundans men kräver väldigt många kopplingar. Därför används full mesh bara i extremfall.

Ordet mesh används också om wifi hemma. Då har en enhet kabel, och de andra pratar trådlöst med den och med varandra. På så vis når wifi längre.

<!-- uses: server, klient, peer-to-peer, lan, wan, fysisk-topologi, logisk-topologi, stjarna, buss, ring, trad, mesh; kind: recap -->
## Kort sammanfattning

- En server erbjuder en tjänst, en klient använder den. Rollen räknas, inte storleken.
- I peer-to-peer är alla både klient och server.
- Ett LAN är lokalt. Ett WAN binder ihop nät som ligger långt ifrån varandra.
- Fysisk topologi visar var saker finns. Logisk topologi visar vem som kan prata med vem.
- Stjärna är vanligast. Buss och ring är ovanliga i dag. Träd bygger ut en stjärna, och full mesh kopplar alla till alla.
