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

<!-- uses: vlan, access-port, trunk-port, dot1q, vlan-id, inter-vlan-routing; kind: recap -->
## Kort sammanfattning

- Ett VLAN delar upp en switch i flera nät på lager 2. Varje VLAN är en egen broadcastdomän med ett eget IP-nät.
- En access-port hör till ett VLAN. Använd inte VLAN 0 och 1 till egna VLAN.
- En trunk-port bär alla VLAN, och varje frame får en 802.1Q-tagg på 4 bytes.
- VLAN ID är 12 bitar. VLAN 1 till 4094 går att använda.
- Trafik mellan VLAN måste gå via en router eller lager 3-switch.
- Dokumentera vilka uttag som hör till vilket VLAN, det syns inte utifrån.
