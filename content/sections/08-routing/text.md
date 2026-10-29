<!-- uses: router, natverkslagret, broadcastdoman, switch, mac-adress -->
## Router

Allt du har byggt hittills stannar inom en broadcastdomän. MAC-adresser når aldrig längre än så. För att ta sig till ett annat nät behövs en **router**.

En router jobbar på lager 3 och läser IP-adresser. En switch behöver hitta enskilda enheter, men en router bryr sig bara om nät. Den frågar sig aldrig var en viss dator står, bara vilket nät den hör till och åt vilket håll det nätet ligger.

En router delar också nätet i broadcastdomäner. En broadcast stannar vid routern och går aldrig igenom den.

<!-- uses: interface, router, natverksadress, ip-plan -->
## Ett nät per port

@diagram(text-tva-nat)

En router har flera portar, som kallas **interface**. Varje interface sitter i ett eget nät och har en egen IP-adress där. På bilden har routern en adress i 192.168.1.0/24 och en annan i 192.168.2.0/24.

Kopplar du ihop två routrar blir länken mellan dem också ett eget nät, med egna adresser. Det är därför små nät som /30, med plats för precis två hosts, är vanliga mellan routrar. Glöm inte länkarna i IP-planen.

<!-- uses: natdel-vardel, subnatmask, arp, default-gateway, host -->
## Samma nät eller inte?

När en dator ska skicka något jämför den först mottagarens adress med sin egen, med hjälp av subnet masken. Har de samma nätdel ligger mottagaren i samma nät. Då tar datorn reda på mottagarens MAC-adress med ARP och skickar direkt.

Har de olika nätdel ligger mottagaren i ett annat nät. Då kan datorn inte nå den själv. Den skickar i stället allt till sin **default gateway**, som tar det vidare.

<!-- uses: default-gateway, router, interface, broadcastdoman -->
## Default gateway

**Default gateway** är adressen till routern i ditt eget nät, routerns interface på din sida. Det är dit din dator skickar allt som ska till andra nät.

Gatewayen måste ligga i samma nät som datorn, alltså i samma broadcastdomän. Annars kan datorn inte nå den. Har datorn ingen gateway alls kan den bara prata med sitt eget nät.

I Windows ser du din default gateway med kommandot `ipconfig`. Det är oftast den första adressen i nätet, till exempel 192.168.1.1. Det är därför man brukar spara de första adresserna i IP-planen.

<!-- uses: default-gateway, mac-adress, logisk-adress, fysisk-adress, frame, paket -->
## Vilka adresser står på paketet?

Säg att din dator skickar till en server i ett annat nät. IP-adresserna i paketet är din adress och serverns adress. De är desamma hela vägen fram.

Men framen som lämnar din dator har gatewayens MAC-adress som mottagare, inte serverns. Din dator kan inte ens ta reda på serverns MAC-adress, för ARP fungerar bara i det egna nätet. Varje router packar upp framen, tittar på IP-adressen och bygger en ny frame till nästa hopp. MAC-adresserna byts alltså på varje sträcka, medan IP-adresserna ligger kvar.

<!-- uses: routingtabell, router, natverksadress, prefix -->
## Routingtabellen

Hur vet routern vart ett paket ska? Den letar i sin **routingtabell**. Det är en lista över nät och åt vilket håll vart och ett ligger.

| Nät | Skicka till |
| --- | --- |
| 192.168.1.0/24 | Direkt, interface 1 |
| 192.168.2.0/24 | Direkt, interface 2 |
| 10.0.0.0/8 | Router 192.168.2.254 |

Från början känner routern bara till de nät som sitter direkt på dess egna interface. Allt annat måste den få veta. Finns det ingen rad som passar mottagaren slängs paketet.

Glöm inte att svaret också måste hitta hem. Det räcker att en router på vägen tillbaka saknar en rad för att svaret ska försvinna, fast paketet kom fram.

<!-- uses: statisk-route, routingtabell, router -->
## Statiska routes

Det enklaste sättet att lära en router om ett nytt nät är att skriva in det för hand. Det kallas en **statisk route**. Du anger nätverksadressen, masken och vilken router paketen ska skickas till.

Lägg märke till att det är nätverksadressen du skriver, till exempel 192.168.50.0, inte en adress till en host i nätet. Och nästa router måste gå att nå direkt, alltså ligga i ett nät som routern själv sitter i.

Statiska routes fungerar bra i små nät. I stora nät blir det för mycket att hålla koll på för hand. Då kan routrarna i stället berätta för varandra vilka nät de känner till. Det är nästa avsnitt.

<!-- uses: default-route, routingtabell, default-gateway, internet -->
## Default route

Det finns en speciell rad som passar alla mottagare: **0.0.0.0/0**. Den heter **default route** och betyder ungefär "allt annat". Routern använder den bara när ingen annan rad passar.

Default route används typiskt för vägen ut mot internet. Ingen router kan ha en rad för varje nät i världen, så den skickar allt okänt vidare åt ett och samma håll. På så sätt har en router också en sorts default gateway.

På en Windows-dator kan du se den lokala routingtabellen med `route print`. Där hittar du 0.0.0.0 med din default gateway.

<!-- uses: hop, ttl, router, paket -->
## Hopp och TTL

@diagram(text-ttl)

Varje gång ett paket passerar en router kallas det ett **hopp** (på engelska *hop*). Ett paket till andra sidan jorden kan göra femton eller tjugo hopp.

I IP-headern finns ett fält som heter **TTL** (Time To Live). Det är ett tal som minskar med ett för varje router som paketet passerar. Når det noll slängs paketet. På så sätt kan ett paket som har hamnat fel aldrig snurra runt i nätet för evigt.

<!-- uses: router, interface, default-gateway, routingtabell, statisk-route, default-route, hop, ttl; kind: recap -->
## Kort sammanfattning

- En router jobbar på lager 3, kopplar ihop nät och delar broadcastdomäner. Varje interface sitter i ett eget nät.
- En dator som ska till ett annat nät skickar till sin default gateway, som måste ligga i samma nät som datorn.
- IP-adresserna är desamma hela vägen. MAC-adresserna byts på varje sträcka.
- Routingtabellen säger åt vilket håll varje nät ligger. Utan passande rad slängs paketet.
- En statisk route skrivs in för hand. Default route, 0.0.0.0/0, används när inget annat passar.
- TTL minskar med ett per hopp, och vid noll slängs paketet.
