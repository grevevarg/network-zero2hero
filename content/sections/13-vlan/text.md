<!-- uses: vlan, switch, managed-switch, broadcastdoman -->
## Varför VLAN?

Säg att ett företag har tre avdelningar: ekonomi, ledning och produktion. Av säkerhetsskäl ska de ha var sitt nät och inte höra varandras broadcast. Den dyra lösningen är tre separata switchar. Den billigare är en enda managed switch med många portar, som delas upp i tre.

Det är vad **VLAN** (Virtual Local Area Network) gör. Nästan alla större företag använder det i dag.

<!-- uses: vlan, broadcastdoman, datalankslagret, managed-switch, subnatting -->
## Ett nät i switchen

@diagram(text-portar)

Ett VLAN är en logisk uppdelning på lager 2. Du bestämmer vilka portar på switchen som hör till vilket VLAN. Varje VLAN blir en egen broadcastdomän, precis som om det vore en egen switch, och får ett eget IP-nät.

Det fina är att placeringen inte spelar någon roll. Två datorer kan sitta på olika våningar men ändå höra till samma VLAN. Byter ett rum avdelning ändrar du bara inställningen i switchen, utan att dra om en enda kabel. Det kräver en managed switch, eftersom den måste gå att ställa in.

<!-- uses: access-port, vlan, frame -->
## Access-port

En **access-port** hör till ett enda VLAN. Det är en sådan port du kopplar en dator eller skrivare till. Framen som går ut till datorn ser helt vanlig ut, och datorn vet inte ens om att den sitter i ett VLAN.

På många switchar hör alla portar till VLAN 1 från början. Därför ska du inte använda VLAN 1, eller VLAN 0, till dina egna VLAN. Annars kan det bli knas, till exempel när du kopplar in ny utrustning som också står på standardinställningen.

<!-- uses: trunk-port, vlan, fiber -->
## Trunk-port

Ska flera VLAN gå mellan två switchar vore det slöseri med en kabel per VLAN. I stället använder du en **trunk-port**. Den bär trafik från alla VLAN i samma kabel.

För att mottagaren ska veta vilket VLAN varje frame hör till får framen en tagg på vägen över trunken. En trunk får ofta mycket trafik, eftersom alla VLAN delar på den. Därför används ofta fiber för trunkar.

<!-- uses: dot1q, vlan-id, frame, byte, bit -->
## 802.1Q-taggen

Taggen följer standarden **802.1Q**. Den är 4 bytes och stoppas in i framen när den går ut på en trunk. Den viktigaste delen av taggen är **VLAN ID**, talet som säger vilket VLAN framen hör till.

VLAN ID är 12 bitar långt. Det ger 4096 olika värden, från 0 till 4095. Den första och den sista är reserverade, så du kan använda VLAN 1 till 4094.

<!-- uses: inter-vlan-routing, vlan, router, l3-switch, trunk-port, natverksadress -->
## Routing mellan VLAN

Eftersom varje VLAN är en egen broadcastdomän kan datorer i olika VLAN inte prata med varandra direkt, fast de sitter i samma switch. Det är ju hela poängen.

Ska de ändå kunna prata behövs något på lager 3, en router eller en lager 3-switch. Routern kopplas till en trunk-port, så att den når alla VLAN genom samma kabel. Samma regler gäller som vanligt: varje VLAN har ett eget nät, och näten får inte överlappa.

<!-- uses: vlan, vlan-id, dokumentation, fysisk-topologi, logisk-topologi -->
## Dokumentera VLAN

Du kan inte se på en kabel eller ett uttag vilket VLAN det hör till. Du måste logga in i switchen för att ta reda på det. Därför är dokumentationen extra viktig.

Gör VLAN ID till det gemensamma språket. Skriv ner vilka områden och vilka uttag som ska höra till vilket VLAN, och bygg sedan efter det. Med VLAN börjar den fysiska och den logiska topologin verkligen skilja sig åt. Två datorer bredvid varandra kan höra till helt olika nät.

<!-- uses: loop, broadcast-storm, spanning-tree, stp, redundans, switch, broadcast, flooding, ttl, natverkslagret, frame, vlan -->
## Loopar och STP

Redundans är bra. Går en kabel sönder finns det en annan väg. Men kopplar du ihop switchar så att det finns två vägar mellan dem, har du byggt en **loop**.

Kom ihåg att en switch skickar en broadcast ut på alla portar utom den den kom in på. I en loop kommer broadcasten då tillbaka och skickas ut igen, varv efter varv. Ett paket på lager 3 har TTL och slängs till slut, men en frame på lager 2 har inget sådant. Den snurrar för evigt. Det kallas en **broadcast-storm**, och till slut orkar nätet inte med något annat. Stormen håller sig inom det VLAN där den började, men där slår den ut allt.

Lösningen heter **STP** (Spanning Tree Protocol). Det har inget med den skärmade kabeln STP att göra, det är bara samma förkortning. STP förhindrar loopar på lager 2 genom att stänga precis så många portar att det bara finns en väg kvar. Går den vägen sönder kan STP öppna en stängd port igen, så reserven finns kvar. STP har stor betydelse i dag, när switcharna är fulla av VLAN.

<!-- uses: root-bridge, bridge-id, spanning-tree, mac-adress, switch -->
## Root bridge

STP börjar med att välja en switch som blir mittpunkten, **root bridge**. Switcharna pratar ihop sig genom att skicka små meddelanden till varandra, som heter BPDU. Namnet behöver du inte komma ihåg.

Varje switch har ett **Bridge ID**. Det är en prioritet följd av switchens MAC-adress. Den switch som har lägst Bridge ID blir root bridge. Först jämförs prioriteten, och bara om den är lika avgör MAC-adressen.

På många switchar är prioriteten 32768 från början. Ändrar ingen den är det alltså den lägsta MAC-adressen som vinner. Det har en baksida. Tillverkarna delar ut MAC-adresser i stigande ordning, så den äldsta switchen har ofta lägst MAC-adress. Den blir root bridge, fast den ofta är långsammast. Därför brukar man sänka prioriteten på den switch man vill ha som root bridge.

<!-- uses: root-port, stp-kostnad, root-bridge, bithastighet -->
## Root port och kostnad

Sedan letar varje annan switch upp sin kortaste väg till root bridge. Porten som leder dit kallas switchens **root port**.

Kortast betyder här snabbast. Varje länk har en **kostnad** som beror på hastigheten:

| Hastighet | Kostnad |
| --- | --- |
| 10 Mbit/s | 100 |
| 100 Mbit/s | 19 |
| 1 Gbit/s | 4 |
| 2 Gbit/s | 3 |
| 10 Gbit/s | 2 |

Switchen lägger ihop kostnaderna längs varje väg till root bridge. Vägen med lägst summa vinner.

<!-- uses: root-port, stp-kostnad, root-bridge; kind: example -->
### Exempel

@diagram(text-stp)

SW1 är root bridge. SW2 har två vägar dit. Den direkta länken är 100 Mbit/s och kostar 19. Vägen via SW3 går över två länkar på 1 Gbit/s, och de kostar 4 + 4 = 8. Den längre vägen är alltså billigare, och SW2:s root port blir porten mot SW3.

<!-- uses: alternate-port, root-port, bridge-id, loop, spanning-tree -->
## Vilken port stängs?

Nu vet varje switch vilken väg den ska använda till root bridge. Kvar är de länkar som skulle göra en loop. På en sådan länk stänger STP en port, som kallas **alternate port** eller non-designated port. Den skickar inga frames, men den finns kvar som reserv.

Kostar två vägar lika mycket avgör Bridge ID igen. Den switch som har lägst Bridge ID vinner, och porten stängs på den andra.

I exemplet ovan används inte den direkta länken mellan SW2 och SW1. Där stänger STP en port, och loopen är bruten.

<!-- uses: stp-portlagen, mac-tabell, spanning-tree, frame -->
## Portens fyra lägen

En port som STP styr börjar inte skicka data direkt när du kopplar in en kabel. Den går igenom fyra lägen, i den här ordningen:

1. **Blocking:** porten skickar inga frames.
2. **Listening:** porten lyssnar på de andra switcharna för att se om den behövs.
3. **Learning:** porten lär sig topologin och fyller MAC-tabellen, men skickar fortfarande ingen data.
4. **Forwarding:** porten fungerar som vanligt.

Därför kan det ta en stund innan en nyss inkopplad switch kommer igång.

<!-- uses: vlan, access-port, trunk-port, dot1q, vlan-id, inter-vlan-routing, loop, broadcast-storm, spanning-tree, bridge-id, root-bridge, root-port, stp-kostnad, alternate-port, stp-portlagen; kind: recap -->
## Kort sammanfattning

- Ett VLAN delar upp en switch i flera nät på lager 2. Varje VLAN är en egen broadcastdomän med ett eget IP-nät.
- En access-port hör till ett VLAN. Använd inte VLAN 0 och 1 till egna VLAN.
- En trunk-port bär alla VLAN, och varje frame får en 802.1Q-tagg på 4 bytes.
- VLAN ID är 12 bitar. VLAN 1 till 4094 går att använda.
- Trafik mellan VLAN måste gå via en router eller lager 3-switch.
- Dokumentera vilka uttag som hör till vilket VLAN, det syns inte utifrån.
- Två vägar mellan switchar ger en loop, och broadcasts snurrar runt i en broadcast-storm. STP stänger portar så att bara en väg finns kvar.
- Root bridge blir switchen med lägst Bridge ID. Prioriteten jämförs först, sedan MAC-adressen.
- Varje annan switch väljer sin billigaste väg till root bridge som root port. 1 Gbit/s kostar 4 och 100 Mbit/s kostar 19.
- En port går igenom blocking, listening, learning och forwarding.
