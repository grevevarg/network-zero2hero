<!-- uses: fysiska-lagret, bit -->
## Varför kablar?

I förra avsnittet var lager 1 det som gör om bitar till signaler. Nu tittar vi närmare på vad signalerna faktiskt färdas i. Det här är det mest handfasta avsnittet. Det mesta här kan du ta i med händerna.

Att välja rätt kabel spelar roll. En billig kabel på fel ställe kan göra ett helt nät långsamt, och en dyr kabel på rätt ställe kan hålla i många år.

<!-- uses: seriell-overforing, parallell-overforing, bit -->
## Seriellt och parallellt

Bitar kan skickas på två sätt. Vid **parallell överföring** skickas flera bitar samtidigt, var och en på sin egen ledare. Det låter snabbt, men alla bitar måste komma fram exakt samtidigt och utan fel. Kablarna måste därför vara korta, och det krävs väldigt många ledningar.

Vid **seriell överföring** skickas bitarna en i taget, efter varandra. Det kan låta långsammare, men i dag är seriell överföring både snabbare och stabilare. Parallell överföring används allt mindre.

<!-- uses: simplex, halv-duplex, full-duplex -->
## Duplex: åt vilket håll?

Data kan gå åt ett eller båda hållen. Det finns tre lägen.

- **Simplex:** bara åt ett håll. Det används inte i nätverk.
- **Halv duplex:** åt båda hållen, men inte samtidigt. Det är som en komradio. Du pratar, säger "över" och väntar på svar.
- **Full duplex:** åt båda hållen samtidigt, som ett telefonsamtal. En modern nätverkskabel klarar det.

Båda ändarna måste vara överens om vilket läge som gäller. Det förhandlar de fram när de kopplas ihop.

<!-- uses: twisted-pair, emi -->
## Twisted pair

Den vanligaste nätverkskabeln heter **twisted pair**, ungefär "tvinnade par". Inuti finns åtta kopparledare. De sitter två och två i fyra par, och varje par är tvinnat runt sig självt.

Tvinnandet skyddar mot **EMI**, elektromagnetiska störningar. Det är störningar utifrån, till exempel från motorer, lysrör eller andra kablar. I varje par går signalen som plus i den ena ledaren och minus i den andra. När paret är tvinnat träffar en störning båda ledarna nästan lika mycket, och då tar störningarna ut varandra.

Ju tätare paren är tvinnade, desto mindre störningar släpps igenom. Men tätare tvinning kräver också mer koppar för samma sträcka, så kabeln blir dyrare.

<!-- uses: utp, stp, poe, twisted-pair, emi -->
## UTP, STP och PoE

Twisted pair finns med och utan skärm. **UTP** (Unshielded Twisted Pair) har ingen skärm alls. Den skyddas bara av tvinningen. **STP** (Shielded Twisted Pair) har dessutom en skärm av metall runt varje par, och en jordledare. Det finns fler varianter med skärm runt hela kabeln också, men idén är densamma: mer metall, mindre störningar.

STP är vanligt när man drar nya kablar i en byggnad, ofta med stöd för **PoE** (Power over Ethernet). Med PoE skickas ström i samma kabel som datan. Kameran i hallen behöver alltså inget eget eluttag. Den får både ström och nätverk genom en enda kabel.

<!-- uses: kategori, bithastighet, bit, byte -->
## Kategorier

Twisted pair delas in i **kategorier**, som skrivs Cat följt av en siffra. En högre kategori klarar oftast högre hastighet.

| Kategori | Hastighet | Max längd |
| --- | --- | --- |
| Cat5 | 100 Mbit/s | 100 m |
| Cat5e | 1 Gbit/s | 100 m |
| Cat6 | 1 Gbit/s | 100 m |
| Cat6a | 10 Gbit/s | 100 m |
| Cat7 | 10 Gbit/s | 100 m |
| Cat8 | 25 eller 40 Gbit/s | 30 m |

Hastigheten mäts i **bitar per sekund**. Mbit/s betyder miljoner bitar per sekund och Gbit/s miljarder. Observera att det är bitar, inte bytes.

Lägg märke till den sista raden. Cat8 är snabbast men räcker bara 30 meter. Alla andra klarar 100 meter. Behöver du längre än så får du byta till fiber, som kommer några sidor längre fram.

<!-- uses: rj45, t568b, twisted-pair -->
## RJ45 och T568B

@diagram(text-t568b)

Kontakten i änden på en nätverkskabel heter **RJ45**. Den har åtta stift av mässing, ett för varje ledare. Den kallas ibland också 8P8C, som betyder åtta platser och åtta kontakter. Vissa Cat7-kablar använder andra kontakter, men RJ45 är det du ser nästan överallt.

Ledarna har olika färger, och de ska sitta i en bestämd ordning i kontakten. Det finns två standarder för ordningen, **T568A och T568B**. I Sverige använder vi **T568B**. Följer alla samma standard vet alla vilken färg som ska sitta var.

<!-- uses: koax, emi -->
## Koax

**Koaxialkabel**, eller bara koax, är en äldre sorts kabel. I mitten sitter en enda kopparledare. Runt den finns isolering, sedan en skärm av metall och ytterst ett skal av plast.

Metallskärmen är till för att minska störningar. Koax är på väg bort från vanliga nätverk, men den används fortfarande till antenner, till exempel för wifi.

<!-- uses: fiber, dampning, emi -->
## Fiber

En **fiberkabel** är byggd ungefär som ett sugrör av glas som man skickar ljus genom. Ljuset blinkar av och på, och det blir ettor och nollor.

Fiber har låg **dämpning**. Dämpning betyder att signalen blir svagare ju längre den färdas. Låg dämpning gör att fiber räcker flera mil, långt mer än 100 meter. Eftersom det är ljus och inte el påverkas fiber inte heller av elektromagnetiska störningar.

Nackdelarna är att fiber är dyrare, svårare att installera och svårare att felsöka. Den tål inte heller skarpa böjar. Böjer du kabeln för mycket läcker ljuset ut, och signalen blir sämre eller försvinner.

Undervattenskablarna mellan kontinenterna är fiber. De är tjocka knippen av många fibrer, med förstärkare ungefär var fjärde mil. Strömmen till förstärkarna skickas i samma kabel.

<!-- uses: singlemode, multimode, fiber -->
## Singlemode och multimode

Fiber finns i två sorter. **Singlemode** (SMF) har en väldigt tunn kärna av glas. Ljuset kommer från en laser och går i en enda bana genom kärnan. Därför räcker singlemode väldigt långt. Det är den sorten som används mest i dag.

**Multimode** (MMF) har en tjockare kärna, och ljuset kommer ofta från en lysdiod. Ljuset studsar fram i många olika banor samtidigt. Det gör att signalen blir otydligare med avståndet, så multimode räcker kortare, några hundra meter. Den är på väg bort.

<!-- uses: parallell-overforing, seriell-overforing, simplex, halv-duplex, full-duplex, twisted-pair, emi, utp, stp, poe, kategori, rj45, t568b, koax, fiber, dampning, singlemode, multimode; kind: recap -->
## Kort sammanfattning

- Seriell överföring skickar en bit i taget och har tagit över från parallell.
- Halv duplex är en i taget, full duplex är båda hållen samtidigt.
- Twisted pair har fyra tvinnade par mot störningar (EMI). UTP saknar skärm, STP har skärm. PoE skickar ström i samma kabel.
- Cat5e och Cat6 klarar 1 Gbit/s, Cat6a 10 Gbit/s. Alla klarar 100 meter utom Cat8, som bara klarar 30.
- Kontakten heter RJ45, och i Sverige kopplar vi enligt T568B.
- Koax används mest till antenner i dag.
- Fiber använder ljus, har låg dämpning och påverkas inte av störningar. Singlemode räcker längst.
