<!-- uses: dhcp, udp, tjanst, default-gateway, subnatmask -->
## Varför DHCP?

Varje enhet behöver en IP-adress, en subnet mask och en default gateway. Att skriva in det för hand på varje dator går i ett litet nät. Men tänk dig ett kontor med hundratals datorer, eller din mobil som byter nät flera gånger om dagen.

Därför finns **DHCP** (Dynamic Host Configuration Protocol). Det är en tjänst som delar ut IP-inställningar automatiskt. Den används nästan överallt, och den skickar sina meddelanden med UDP.

<!-- uses: dhcp, scope, server, klient -->
## Server, klient och scope

DHCP består av tre delar. **DHCP-servern** håller koll på vilka adresser som finns och delar ut dem. **DHCP-klienten** är datorn som får inställningarna. Och **DHCP-protokollet** är reglerna för hur de pratar.

Adresserna som servern får dela ut kallas en pool eller ett **scope**, till exempel 192.168.1.100 till 192.168.1.200. Utöver adressen skickar servern med subnet mask, default gateway och vilken DNS-server datorn ska använda. Det går att skicka med hundratals andra inställningar också.

<!-- uses: dora, dhcp, broadcast, mac-adress -->
## DORA

@diagram(text-dora)

Hur frågar en dator efter en adress när den inte har någon adress? Den skickar en broadcast, till MAC-adressen FF:FF:FF:FF:FF:FF. Den kommer fram till alla i broadcastdomänen, och DHCP-servern svarar. Hela utbytet har fyra steg, som brukar kallas **DORA** efter de första bokstäverna.

1. **Discover:** klienten ropar ut att den letar efter en DHCP-server.
2. **Offer:** servern erbjuder en adress och inställningar.
3. **Request:** klienten ber att få just den adressen.
4. **Ack:** servern bekräftar, och nu får klienten använda adressen.

<!-- uses: lease, dhcp, scope -->
## Lease

Klienten får inte adressen för alltid. Den lånar den, och lånet kallas en **lease**. Innan lånetiden tar slut måste klienten förnya lånet. Gör den inte det går adressen tillbaka till poolen och kan ges till någon annan. När klienten slutar använda adressen kan den också lämna tillbaka den direkt.

Hur lång lånetiden ska vara beror på var nätet finns. Ett litet kontor där samma datorer sitter varje dag kan ha tolv timmar. Ett hotell, där gäster kommer och går hela tiden, kanske behöver trettio minuter. Annars tar adresserna i poolen slut.

<!-- uses: dhcp-relay, dhcp, broadcastdoman, router -->
## DHCP relay

Eftersom klienten hittar servern med broadcast måste servern finnas i samma broadcastdomän. En broadcast går ju aldrig igenom en router. Ska varje nät då ha en egen DHCP-server?

Nej. En router kan vara **DHCP relay**. Den fångar upp klientens broadcast och skickar frågan vidare till en central DHCP-server i ett annat nät. Ett företag kan alltså ha en enda DHCP-server på huvudkontoret och en relay på varje mindre kontor.

Koppla däremot aldrig in två DHCP-servrar i samma nät. Då kan båda dela ut samma adress, och det blir krockar.

<!-- uses: hostname, fqdn -->
## Datornamn

Det är lättare för människor att komma ihåg namn än adresser. Därför har varje dator ett namn, ett **hostname**. Det får innehålla bokstäver, siffror och bindestreck, och vara långt, men håll det kort. Det är opraktiskt med långa namn.

Om datorn hör till en domän blir hela namnet datorns namn plus domänen. Det kallas **FQDN** (Fully Qualified Domain Name). Datorn webb1 i domänen exempel.local får FQDN webb1.exempel.local. Delarna mellan punkterna får vara högst 63 tecken var.

Skriv in namnen på servrar och andra viktiga enheter i IP-planen också.

<!-- uses: dns, hostname, server, klient, udp -->
## DNS

**DNS** (Domain Name System) översätter namn till IP-adresser. När du skriver coolabilar.se i webbläsaren frågar datorn en DNS-server: "Vilken IP-adress har coolabilar.se?" Servern svarar till exempel "11.12.13.1", och först då kan webbläsaren ansluta.

Nästan alla tjänster börjar med en fråga till DNS. Därför slutar allt att fungera när DNS krånglar, även om nätet i sig är helt friskt. Bland dem som jobbar med nätverk finns ett skämt om just det: "It's always DNS."

<!-- uses: dns-hierarki, dns, internet -->
## DNS-hierarkin

@diagram(text-hierarki)

Ingen enskild server kan känna till alla namn på internet. Därför är DNS uppbyggt som ett träd.

- Högst upp finns **rotservrarna**, 13 stycken. De vet var servrarna för varje toppdomän finns.
- Under dem finns **toppdomänerna**, som .se och .com. Internetstiftelsen sköter .se.
- Under dem finns domäner som coolabilar.se, och sedan namn under dem, som www.coolabilar.se.

Ett namn läses alltså bakifrån: först toppdomänen, sedan domänen, och sist själva datorn.

<!-- uses: dns-hierarki, dns, dns-cache -->
## En uppslagning steg för steg

Säg att din dator vill nå www.coolabilar.se och att ingen har frågat efter det namnet nyligen.

1. Datorn frågar sin egen DNS-server.
2. DNS-servern vet inte svaret, så den frågar en rotserver. Rotservern svarar med var servern för .se finns.
3. DNS-servern frågar servern för .se, som svarar med var servern för coolabilar.se finns.
4. DNS-servern frågar servern för coolabilar.se, som till slut svarar med IP-adressen.
5. DNS-servern skickar svaret till din dator.

Det låter som mycket, men det går fort. Och svaret sparas, så att nästa fråga om samma namn går mycket snabbare.

<!-- uses: resource-record, dns, ipv4 -->
## Poster i DNS

En DNS-server sparar olika sorters uppgifter, så kallade **poster** (records). De vanligaste är:

- **A:** namn till IPv4-adress. Det är den vanligaste frågan.
- **CNAME:** ett namn som pekar på ett annat namn, ett alias. Flera namn kan då dela samma adress.
- **MX:** vilken server som tar emot e-post för domänen.

Det finns fler sorters poster. En av dem kommer i avsnittet om nästa version av IP.

<!-- uses: dns-cache, dns -->
## DNS-cache

Varje uppslagning som din dator gör sparas lokalt en stund, i en **DNS-cache**. Nästa gång du besöker samma sida behöver datorn inte fråga alls.

I cachen hamnar också innehållet i en fil som heter hosts. I Windows ligger den i mappen C:\Windows\System32\drivers\etc. Där kan du skriva in namn och adresser för hand, och de gäller före DNS.

<!-- uses: dhcp, scope, dora, lease, dhcp-relay, hostname, fqdn, dns, dns-hierarki, resource-record, dns-cache; kind: recap -->
## Kort sammanfattning

- DHCP delar ut IP-adress, mask, default gateway och DNS-server från ett scope.
- DORA: Discover, Offer, Request, Ack. Discover är en broadcast, eftersom klienten inte har någon adress.
- Adressen lånas ut med en lease som måste förnyas. En DHCP relay skickar frågor vidare till en server i ett annat nät.
- DNS översätter namn till IP-adresser. Hierarkin går från rotservrarna via toppdomäner som .se ner till enskilda namn.
- A-posten ger IPv4-adressen, CNAME är ett alias och MX pekar ut e-postservern.
- Svar sparas i en DNS-cache, och hosts-filen gäller före DNS.
