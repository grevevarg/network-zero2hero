<!-- uses: ipv4, publik-adress, nat, internet -->
## Varför IPv6?

IPv4 räcker inte till. Den organisation som delar ut adresser i världen gav bort de sista publika IPv4-adresserna till de regionala organisationerna 2011. RIPE NCC i Europa delade ut sina sista 2019. Nu står alla i kö.

Det som har räddat oss hittills är NAT, ibland i flera lager. Men antalet enheter på internet växer hela tiden, inte minst alla småprylar som kopplas upp. Lösningen är **IPv6**. Den första specifikationen kom redan 1995, men övergången går långsamt. Mobiloperatörer använder ofta IPv6, medan många andra nät fortfarande mest kör IPv4.

<!-- uses: ipv6, hex, bit, byte -->
## Adressen

I grunden fungerar IPv6 som IPv4. Adresserna är bara längre och skrivs på ett annat sätt.

En IPv6-adress är 128 bitar lång, jämfört med IPv4:s 32. Det är så många adresser att de aldrig kommer att ta slut.

Att skriva 128 bitar som vanliga tal vore opraktiskt, så IPv6 skrivs hexadecimalt. Adressen delas in i åtta grupper med fyra hexsiffror i varje. Varje grupp är alltså 16 bitar, två bytes. Grupperna skiljs åt med kolon:

`2001:0db8:0000:0000:eeee:0000:0000:ffff`

<!-- uses: ipv6-forkortning, ipv6, hex -->
## Förkorta adressen

En så lång adress går att korta enligt två regler.

1. **Nollor först i en grupp får strykas.** 0db8 blir db8 och 0000 blir 0.
2. **En följd av grupper som bara är nollor kan bytas mot ::** Det får bara göras en gång per adress, annars går det inte att veta hur många nollor som försvann. Byt den längsta följden.

Adressen ovan blir då `2001:db8::eeee:0:0:ffff`. Den första följden med två nollgrupper byttes mot ::, och den andra fick stå kvar som 0:0.

Vill du veta hur många nollgrupper :: gömmer? En adress har alltid åtta grupper. Räkna grupperna du ser och dra bort det från åtta. `2001:db8::eeee:0:0:ffff` har sex synliga grupper, så :: gömmer två.

Ska du skriva en port efter en IPv6-adress sätter du adressen inom hakparenteser, till exempel `[2001:db8::1]:443`. Annars blandas portens kolon ihop med adressens.

<!-- uses: ipv6-prefix, prefix, ipv6, natdel-vardel, subnatmask -->
## Prefix

IPv6 använder prefix precis som IPv4, men någon subnet mask finns inte. Du skriver alltid prefixet. Det vanligaste är **/64**. Då är de första 64 bitarna, fyra grupper, nätdelen. De sista 64 bitarna är enhetens del, som här kallas **interface-ID**.

@diagram(text-64)

Ett enda /64-nät har plats för fler enheter än hela IPv4 tillsammans. Att dela upp nät behövs därför sällan för att spara adresser. Men routrarna behöver fortfarande veta både nätdel och prefix för att kunna routa. Ändrar du prefixet med 16 flyttas gränsen exakt en grupp.

<!-- uses: anycast, unicast, multicast, broadcast, ipv6 -->
## Unicast, multicast och anycast

IPv6 har tre sorters adresser.

- **Unicast:** till en enda enhet, som vanligt.
- **Multicast:** till en grupp. Alla som hör till gruppen tar emot paketet.
- **Anycast:** samma adress finns på flera enheter, och paketet går till den som ligger närmast.

Broadcast finns inte i IPv6. Det som broadcast gjorde i IPv4 sköts i stället med multicast, så att bara de enheter som berörs får trafiken.

<!-- uses: global-unicast, link-local, unique-local, ipv6, privat-adress, publik-adress, loopback -->
## Vilken sorts adress är det?

Du kan se vilken sorts adress det är på den första gruppen.

| Sort | Börjar med | Motsvarar i IPv4 |
| --- | --- | --- |
| Global unicast | 2 eller 3 (2000::/3) | Publik adress |
| Link-local | fe80 | APIPA, ungefär |
| Unique local | fc eller fd (oftast fd) | Privat adress |
| Multicast | ff | Multicast |
| Loopback | ::1 | 127.0.0.1 |

**Global unicast** går ut på internet. **Unique local** är för internt bruk, precis som privata adresser. **Link-local** fungerar bara på den egna länken och kommer aldrig förbi en router. Adressen :: med bara nollor betyder ingen adress alls.

Unique local-adresser sätter du själv. Ska du ut på internet behöver du global unicast, och vilka sådana adresser du får bestämmer oftast din internetleverantör.

Till exempel och övningar finns ett eget område, 2001:db8::/32. Det används aldrig på riktigt.

<!-- uses: link-local, global-unicast, unique-local, nat, interface -->
## Flera adresser per interface

I IPv6 är det normalt att ett interface har flera adresser samtidigt. Det har alltid en link-local-adress. Ofta har det också en unique local för internt bruk och en global unicast för internet.

Det finns ingen NAT i IPv6. Varje enhet får en egen publik adress och routas ut på internet direkt. Tänk därför inte "min dator har den här adressen", utan "det här interfacet har de här adresserna".

<!-- uses: slaac, ndp, link-local, arp, router, apipa -->
## SLAAC och grannar

IPv6 kan ställa in sig själv. Det kallas **SLAAC** (Stateless Address Autoconfiguration) och liknar lite APIPA i IPv4. Först ger enheten sig själv en link-local-adress, så att den kan prata på länken alls. Sedan hittar den routern, som talar om vilket nät som gäller, och enheten bygger sin adress utifrån det.

Det finns ingen ARP i IPv6. I stället används **Neighbor Discovery**, som bygger på ICMPv6. Med det hittar enheterna sina grannar, och routrarna talar om att de finns med så kallade router advertisements.

<!-- uses: eui-64, mac-adress, link-local, hex, bit -->
## EUI-64

@diagram(text-eui64)

Var kommer interface-ID:t ifrån? Ett vanligt sätt är **EUI-64**, som bygger det av MAC-adressen. MAC-adressen är 48 bitar, men interface-ID:t ska vara 64. Så här går det till:

1. Dela MAC-adressen på mitten.
2. Lägg in FF:FE i mitten. Nu är det 64 bitar.
3. Vänd på den sjunde biten i den första byten. 00 blir då 02.

MAC-adressen 00:50:79:66:68:01 ger interface-ID:t 250:79ff:fe66:6801, och link-local-adressen fe80::250:79ff:fe66:6801. Det är därför MAC-adressen och link-local-adressen ibland ser så lika ut.

<!-- uses: routingtabell, statisk-route, dynamisk-routing, rip, router, interface, link-local, multicast, ipv6-prefix -->
## Routing med IPv6

Routing fungerar som i IPv4. Routern har en routingtabell, och raderna kommer antingen från statiska routes eller från ett routingprotokoll. RIP finns till exempel i en version för IPv6, som heter RIPng.

Routern behöver ett eget nät på varje interface för att kunna routa alls. Link-local räcker inte. Alla link-local-adresser ligger ju i samma fe80-nät, så routern kan inte skilja näten åt med dem.

En routingtabell för IPv6 kan se ut så här:

| Typ | Nät | Betyder |
| --- | --- | --- |
| C | 2001:db8:1::/64 | Nätet på interface 1 |
| L | 2001:db8:1::1/128 | Routerns egen adress på interface 1 |
| C | 2001:db8:2::/64 | Nätet på interface 2 |
| L | 2001:db8:2::1/128 | Routerns egen adress på interface 2 |
| L | ff00::/8 | Multicast, som routern lyssnar på |

C står för connected, ett nät som sitter direkt på ett av routerns interface. L står för local, routerns egen adress. Prefixet /128 omfattar hela adressen, så raden gäller bara den enda adressen.

<!-- uses: default-route, default-gateway, routingtabell, router, ndp, ipv6 -->
## Default route och default gateway

Default route skrivs **::/0** i IPv6, på samma sätt som 0.0.0.0/0 i IPv4. Den passar alla adresser och används när ingen annan rad passar.

Blanda inte ihop den med default gateway. Default route är en rad i routerns routingtabell. Default gateway är en inställning i datorn: adressen till den router som datorn skickar allt till som ska ut ur det egna nätet.

I IPv6 behöver du ofta inte ens ställa in någon default gateway. Finns det bara en router hittar datorerna den själva, genom routerns router advertisements. Först när det finns flera routrar behöver du bestämma vilken som gäller.

<!-- uses: aaaa, dns, resource-record, ipv6 -->
## IPv6 och DNS

DNS fungerar som vanligt, men IPv6-adresser har en egen sorts post, **AAAA**. Fyra A, eftersom adressen är fyra gånger så lång som en IPv4-adress. En A-post ger alltså IPv4-adressen och en AAAA-post IPv6-adressen.

Nästan alla operativsystem har klarat IPv6 i många år. Problemet är sällan datorerna, utan att hela vägen måste klara IPv6 för att det ska fungera.

<!-- uses: dual-stack, ipv4, ipv6 -->
## Dual stack

Övergången till IPv6 går långsamt, så många nät kör IPv4 och IPv6 samtidigt. Det kallas **dual stack**. Varje enhet har då både en IPv4-adress och IPv6-adresser.

Baksidan är att allt måste ställas in två gånger, en gång för varje protokoll. Adresser, routes och regler finns i två uppsättningar som båda måste stämma.

<!-- uses: ipv6, ipv6-forkortning, ipv6-prefix, anycast, global-unicast, link-local, unique-local, slaac, ndp, eui-64, aaaa, dual-stack, default-route, routingtabell; kind: recap -->
## Kort sammanfattning

- En IPv6-adress är 128 bitar, åtta grupper med fyra hexsiffror.
- Stryk nollor först i grupperna, och byt den längsta följden av nollgrupper mot ::, bara en gång. :: gömmer åtta minus antalet grupper du ser.
- Standardprefixet är /64: halva adressen är nät, halva är interface-ID.
- Det finns unicast, multicast och anycast, men ingen broadcast.
- 2000::/3 är global unicast, fe80 är link-local, fd är unique local och ff är multicast. ::1 är loopback.
- Ingen NAT och ingen ARP. SLAAC ställer in adressen, och Neighbor Discovery hittar grannarna.
- EUI-64 bygger interface-ID av MAC-adressen med FF:FE i mitten. AAAA är DNS-posten för IPv6.
- Routing fungerar som i IPv4, men varje interface behöver ett eget nät. Default route är ::/0.
- Dual stack kör IPv4 och IPv6 samtidigt, och allt ställs in två gånger.
