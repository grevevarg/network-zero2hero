<!-- uses: wlan, ieee-80211 -->
## Nät utan kabel

Allt hittills har gått i kablar. Men i dag kopplar många företag inte in datorerna med kabel alls. Allt går trådlöst, med elektromagnetiska vågor genom luften som görs om till ettor och nollor.

Ett trådlöst nät kallas **WLAN** (Wireless LAN). Wifi är bara ett annat namn för samma sak. Standarderna för WLAN kommer från IEEE och börjar alltid med **802.11**. Wifi använder frekvenserna 2,4 GHz, 5 GHz och 6 GHz. Bluetooth använder också 2,4 GHz, men med svaga signaler och kort räckvidd.

<!-- uses: wlan, emi, full-duplex, halv-duplex -->
## För- och nackdelar

Den stora fördelen är att du slipper dra kablar. Det är smidigt, och du kan röra dig fritt.

Nackdelarna är flera.

- **Störningar:** frekvenserna är fria att använda, så mycket annat kan störa. Stora maskiner i en industri kan till exempel skapa elektromagnetiska fält.
- **Säkerhet:** nästan ingen säkerhet är inbyggd i grundstandarden. Någon kan koppla upp sig utan att ens vara inne i byggnaden. Därför behövs inloggning och kryptering.
- **Prestanda:** wifi kan inte mäta sig med kabel. Det klarar inte full duplex, bara halv, och alla som är uppkopplade delar på samma bandbredd.

<!-- uses: ieee-80211, bithastighet -->
## 802.11-standarderna

Wifi har blivit snabbare för varje ny standard. Från och med 802.11n fick standarderna också enklare namn, som Wi-Fi 4.

| Standard | Namn | År | Frekvens | Max hastighet |
| --- | --- | --- | --- | --- |
| 802.11b | | 1999 | 2,4 GHz | 11 Mbit/s |
| 802.11a | | 1999 | 5 GHz | 54 Mbit/s |
| 802.11g | | 2003 | 2,4 GHz | 54 Mbit/s |
| 802.11n | Wi-Fi 4 | 2009 | 2,4 och 5 GHz | 600 Mbit/s |
| 802.11ac | Wi-Fi 5 | 2013 | 5 GHz | 6,9 Gbit/s |
| 802.11ax | Wi-Fi 6 | 2019 | 2,4 och 5 GHz, 6 GHz i Wi-Fi 6E | 9,6 Gbit/s |
| 802.11be | Wi-Fi 7 | 2024 | 2,4, 5 och 6 GHz | 23 Gbit/s |

Hastigheterna är vad standarden klarar i teorin. I verkligheten blir det mindre, och räckvidden har snarare minskat med åren.

<!-- uses: accesspunkt, tradlos-brygga, antenn, datalankslagret, switch -->
## Delarna i ett WLAN

- **Trådlös klient:** allt som har ett trådlöst nätverkskort, som mobiler och datorer.
- **Accesspunkt** (AP): kopplar ihop de trådlösa klienterna med det trådbundna nätet. Den jobbar på lager 2, och du kan tänka på den som en trådlös switch.
- **Trådlös brygga:** en fast länk genom luften mellan två byggnader. En lantbrukare kan till exempel få nät till kameror i ladan utan att gräva ner en kabel.
- **Antenner:** en **rundstrålande** antenn sänder åt alla håll. En **riktad** antenn sänder åt ett håll men längre, och passar till bryggor. Yagi är en sorts riktad antenn.

<!-- uses: accesspunkt, antenn, wlan -->
## Var ska accesspunkten sitta?

En rundstrålande antenn sänder ut signalen ungefär som en munk, med accesspunkten i hålet. Det betyder att signalen faktiskt är sämre rakt under accesspunkten än en bit bort.

Väggar dämpar också signalen. Metall stoppar mest, och betong stoppar mycket, särskilt med armeringsjärn i. Gips, trä och glas släpper igenom ganska bra. Ju hårdare och tjockare, desto sämre.

Tänk också på våningarna, eftersom munkarna når både uppåt och nedåt. Det bästa sättet att veta om det fungerar är att testa. Sätt upp en accesspunkt, gå runt och mät. Det kallas att göra en **survey**, och det finns program som ritar en karta över signalstyrkan.

<!-- uses: ssid, wlan, broadcastdoman, frame, datalankslagret -->
## SSID

Nätets namn kallas **SSID** (Service Set Identifier). Det är högst 32 tecken, och det spelar roll om det är stora eller små bokstäver. SSID skickas med i alla frames i nätet och talar om för enheterna vilket WLAN de hör till.

SSID har inget med IP att göra, det finns bara på lager 2. Enheter med samma SSID hör till samma broadcastdomän.

<!-- uses: accesspunkt, ssid, wlan -->
## Fler accesspunkter

Hur många kan vara uppkopplade mot samma accesspunkt? Det beror på hur mycket de skickar. Vid lätt användning kanske över 100, men om alla strömmar video kanske bara runt 20.

Det enda sättet att få plats med fler är att sätta upp fler accesspunkter, med samma SSID. Det är klienten själv som väljer vilken accesspunkt den ansluter till, inte nätet. För att klienterna ska kunna gå mellan accesspunkterna utan att tappa anslutningen bör deras områden överlappa lite.

<!-- uses: kanal, accesspunkt -->
## Kanaler

@diagram(text-kanaler)

Varje frekvensband är indelat i **kanaler**. Två accesspunkter som står nära varandra måste sända på olika kanaler. Annars delar de på samma bandbredd och stör varandra.

På 2,4 GHz överlappar kanalerna varandra, så bara 1, 6 och 11 är helt fria från varandra. Därför växlar man mellan 1, 6 och 11 så att grannar aldrig har samma kanal. På 5 GHz finns det många fler kanaler, så där är det lättare.

Ställ också in rätt land på accesspunkten. Vilka kanaler och hur stark signal som är tillåten skiljer sig mellan länder.

<!-- uses: csma-ca, csma-cd, halv-duplex, ack, kollision -->
## CSMA/CA

I trådbundna nät med hubbar lyssnade enheterna efter krockar med CSMA/CD. Det fungerar inte i luften, eftersom en radio inte kan höra krockar medan den själv sänder.

Wifi försöker därför undvika krockarna i stället. Metoden heter **CSMA/CA**, där CA står för collision avoidance. En enhet lyssnar först och väntar en slumpad stund om någon annan sänder. Mottagaren bekräftar varje frame med en ACK. Kommer ingen ACK antar avsändaren att något gick fel och skickar igen.

<!-- uses: wpa, eap, ssid, mac-adress -->
## Säkerhet

Krypteringen i wifi har kommit i flera versioner. **WEP** är helt knäckt och ska aldrig användas. **WPA2** är det minsta du bör använda, men den kan knäckas om någon fångar inloggningen och provar lösenord i lugn och ro. **WPA3** är bäst, om alla enheter klarar den.

Två vanliga knep ger nästan inget skydd. Ett MAC-filter släpper bara in vissa MAC-adresser, men en MAC-adress går att förfalska. Ett dolt SSID är lätt att få fram ändå.

Ett gemensamt lösenord för alla sprids lätt. Större nät använder i stället **EAP**, där varje användare loggar in med eget namn och lösenord mot en server, ofta en så kallad RADIUS-server. Då kan en enskild användare stängas av utan att alla andra behöver ett nytt lösenord.

<!-- uses: wlan, ieee-80211, accesspunkt, antenn, ssid, kanal, csma-ca, wpa, eap; kind: recap -->
## Kort sammanfattning

- WLAN är wifi, och standarderna heter 802.11. Det är smidigt men störningskänsligt, delar bandbredd och klarar bara halv duplex.
- En accesspunkt jobbar på lager 2. En riktad antenn passar till en brygga mellan byggnader.
- Signalen är som en munk runt accesspunkten, och betong och metall stoppar mycket. Testa med en survey.
- Samma SSID betyder samma nät och broadcastdomän. Fler användare kräver fler accesspunkter.
- Grannar ska ha olika kanaler, på 2,4 GHz 1, 6 och 11.
- Wifi undviker krockar med CSMA/CA. Använd minst WPA2, helst WPA3, och EAP i större nät.
