<!-- uses: transportlagret, segment, datagram, tcp, udp -->
## Tillbaka till lager 4

I avsnitt 2 såg du att transportlagret delar upp datan och ser till att den kommer fram. Nu är det dags att titta närmare på hur. Lager 4 har två protokoll som nästan allt bygger på: **TCP** och **UDP**.

TCP är noggrant och kontrollerar att allt kommer fram. Det skickar segment. UDP är snabbt och struntar i kontrollen. Det skickar datagram. Men innan vi tittar på dem behöver du förstå portar, som båda använder.

<!-- uses: port, kallport-malport, tjanst, segment -->
## Portar

En IP-adress pekar ut en dator. Men på datorn kör kanske en webbläsare, en chatt och en musiktjänst samtidigt. Hur vet datorn vilket program som ska ha det som kommer in? Det är vad **portar** är till för.

En port är ett nummer som följer med varje segment. Varje meddelande har två portar:

- **Destinationsport:** porten det är på väg till. Den säger vilken tjänst som efterfrågas på servern, till exempel en webbsida.
- **Källport:** porten det kommer från. Den slumpas fram av datorn. Har du fem flikar öppna mot samma sida får varje flik en egen källport, så att svaren hamnar rätt.

Adress och port skrivs ofta ihop med kolon, till exempel 192.168.1.10:50336.

<!-- uses: portintervall, port, bit -->
## Portintervall

Ett portnummer är 16 bitar, så det finns portar från 0 till 65 535. De delas in i tre intervall.

| Intervall | Portar | Används till |
| --- | --- | --- |
| Well-known | 0–1023 | Standardiserade tjänster, som webb och e-post |
| Registered | 1024–49151 | Reserverade av företag och projekt |
| Dynamiska | 49152–65535 | Slumpade källportar |

Vilka portar som hör till vad bestäms av en organisation som heter ICANN.

<!-- uses: port, tcp, udp -->
## Vanliga portar

Du behöver inte kunna alla 1024 well-known-portar. Men de här är bra att kunna utantill.

| Tjänst | Används till | Protokoll | Port |
| --- | --- | --- | --- |
| HTTP | Okrypterad webb | TCP | 80 |
| HTTPS | Krypterad webb | TCP | 443 |
| DNS | Namnuppslagning | UDP och TCP | 53 |
| FTP | Filöverföring | TCP | 20 och 21 |
| DHCP | Delar ut IP-adresser | UDP | 67 och 68 |
| SMTP | Skicka e-post | TCP | 25 |
| POP3 | Hämta e-post | TCP | 110 |
| IMAP | Hämta e-post | TCP | 143 |
| SSH | Krypterad fjärrinloggning | TCP | 22 |
| Telnet | Okrypterad fjärrinloggning | TCP | 23 |
| SNMP | Övervaka nätverk | UDP | 161 |

Port 80 är kanske världens mest kända port. FTP använder två portar, 21 för att styra och 20 för själva filerna.

<!-- uses: tcp, ack, segment, sessionslagret -->
## TCP

**TCP** (Transmission Control Protocol) används i nästan alla fall där det är viktigt att allt kommer fram, som webbsidor, e-post och filer.

TCP numrerar varje segment. Mottagaren skickar tillbaka en bekräftelse, en **ACK** (acknowledge), för det den har fått. Saknas en ACK skickas segmentet igen. Saknas många ACK i rad ger TCP upp och stänger anslutningen.

Innan någon data skickas måste de två sidorna komma överens om att prata. TCP inleder alltid med en handskakning.

<!-- uses: three-way-handshake, tcp, ack -->
## Three-way handshake

@diagram(text-handskakning)

Handskakningen har tre steg, och därför heter den **three-way handshake**.

1. Klienten skickar **SYN** (synchronize): "Jag vill prata."
2. Servern svarar med **SYN + ACK**: "Okej, jag hörde dig, och jag vill också prata."
3. Klienten svarar med **ACK**: "Bra, jag hörde dig också."

Efter det är anslutningen uppe och data kan börja skickas. Båda sidor vet nu vilken adress och port de andra har.

<!-- uses: udp, ack -->
## UDP

**UDP** (User Datagram Protocol) är det enklare protokollet. Det skickar bara iväg datan. Ingen handskakning, inga ACK och ingen omsändning. Det är som att skicka ett vanligt brev: du vet inte om det kommer fram, men oftast gör det det.

Eftersom UDP slipper allt extra är det snabbare. Det används när det gör mer skada att vänta än att tappa lite data, som i röstsamtal, videomöten och spel online. Ett ord som försvann för en sekund sedan vill du ändå inte höra i efterhand.

Några tjänster i det lokala nätet använder också UDP, till exempel DNS för namnuppslagning och DHCP som delar ut IP-adresser. De skickar många korta frågor, och då blir TCP:s handskakning onödigt mycket jobb. Båda kommer i nästa avsnitt.

<!-- uses: checksumma, tcp, udp, trailer, hop -->
## Kontroll på två ställen

Du har redan sett att lager 2 har en kontrollsumma i trailern. Den kontrolleras på varje sträcka och byggs om av varje router.

TCP och UDP har också en **checksumma**, i sin egen header. Den kontrolleras bara av mottagaren, längst bort. Den kan alltså hitta fel som har uppstått inne i någon router på vägen, som lager 2 inte märker. UDP slänger tyst ett datagram som har fel checksumma.

<!-- uses: netstat, port, tcp -->
## Se dina anslutningar med netstat

I Windows kan du se dina anslutningar med `netstat -n`. Varje rad visar protokoll, din adress och port, den andra sidans adress och port, och status.

```
TCP    192.168.200.32:50336   199.232.173.91:443     ESTABLISHED
```

Här har datorn en anslutning från källport 50336 till port 443, alltså HTTPS. ESTABLISHED betyder att anslutningen är uppe. TIME_WAIT betyder att den snart stängs. Med `netstat -n -a` ser du också vilka portar datorn själv lyssnar på.

<!-- uses: telnet, port, tcp -->
## Telnet som porttest

**Telnet** är ett gammalt program för okrypterad fjärrinloggning. I dag används SSH till det. Men telnet är fortfarande användbart vid felsökning.

Ping visar att en dator svarar, men inte om en viss port är öppen. Med `telnet` och en port kan du testa just det. Får du kontakt med port 443 på en server vet du att webbservern lyssnar. Visas sidan ändå inte ligger felet hos servern, inte i nätet. Vissa servrar svarar inte ens på ping, men de måste svara på sina öppna portar.

UDP går inte att testa så, eftersom det inte finns någon handskakning. Där måste du använda själva programmet som pratar med tjänsten.

<!-- uses: tcp, udp, port, kallport-malport, portintervall, three-way-handshake, ack, checksumma, netstat, telnet; kind: recap -->
## Kort sammanfattning

- Portar talar om vilket program datan ska till. Destinationsporten pekar ut tjänsten, källporten slumpas fram.
- Well-known-portar är 0–1023. HTTP 80, HTTPS 443, DNS 53, SSH 22, SMTP 25.
- TCP inleder med SYN, SYN + ACK och ACK, numrerar segmenten och skickar om det som saknas.
- UDP skickar bara iväg datan. Det är snabbare och används för röst, video, spel, DNS och DHCP.
- TCP och UDP kontrollerar checksumman hela vägen, lager 2 bara sträcka för sträcka.
- `netstat -n` visar dina anslutningar, och telnet kan testa om en TCP-port är öppen.
