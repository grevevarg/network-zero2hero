<!-- uses: dokumentation, fysisk-topologi -->
## Varför märka allt?

I första avsnittet såg du att den fysiska topologin fungerar som en ritning. Går något sönder vill du snabbt hitta rätt kabel. Det fungerar bara om allt är märkt, och om alla märker på samma sätt.

Därför finns det **dokumentation** av nätet. Den används när något krånglar och när nätet ska byggas om. Den som kan systemet ska kunna gå in och ändra utan att först leta i en timme.

I Sverige finns standarder för det här. SS-EN 50173 handlar om hur kablaget ska installeras. SS 455 12 00-38 handlar om hur dokumentationen ska göras, och SS 455 12 01 om vilka beteckningar som används. Här följer vi beteckningarna i SS 455 12 01, utgåva 5.

<!-- uses: rack, patchpanel, patchkabel, uttag, twisted-pair -->
## Rack och patchpanel

Nätverksutrustning sitter ofta i ett **rack**, ett stativ eller skåp där allt skruvas fast på höjden. Ett vanligt rack är 19 tum brett, ungefär 48 centimeter.

Kablarna från **uttagen** i väggarna dras genom huset och slutar i en **patchpanel** i racket. En patchpanel är en rad med uttag, ett för varje kabel ute i huset.

Från patchpanelen kopplar du sedan vidare med en **patchkabel**. Det är en helt vanlig nätverkskabel. Den heter bara patchkabel för att den sitter i patchpanelen.

<!-- uses: stall, falt, panel, uttag -->
## Kedjan: ställ, fält, panel, uttag

Varje uttag får en beteckning som berättar exakt var dess kabel slutar. Beteckningen byggs av fyra delar, från störst till minst.

| Del | Vad det är | Exempel |
| --- | --- | --- |
| Ställ | Rummet eller skåpet där racken står | AC |
| Fält | Racket | 03 |
| Panel | Var i racket panelen sitter | 11A |
| Uttag | Uttagets nummer i panelen | 10 |

Tillsammans blir det AC0311A10. Det ser kryptiskt ut, men nu vet du att det betyder: ställ AC, rack 03, panel 11A, uttag 10.

<!-- uses: stall -->
## Ställ

**Stället** är utrymmet där racken står, till exempel ett litet rum eller ett skåp. Det betecknas med två bokstäver.

Den första bokstaven anger höjdled, alltså vilken våning. Den andra anger sidled, alltså vilket utrymme på våningen. AA är första utrymmet på våning 1. BA är första utrymmet på våning 2. AC är tredje utrymmet på våning 1.

<!-- uses: falt, rack, stall -->
## Fält

**Fältet** är racket. Det betecknas med två siffror och numreras från 01 och uppåt, från vänster till höger i rummet.

Står det tre rack i ställ AC heter de alltså AC01, AC02 och AC03, räknat från vänster.

<!-- uses: faltuppdelning, falt, panel -->
## Fältuppdelning

@diagram(text-rack)

Ett rack sett framifrån delas in i ett rutnät med 10 gånger 10 rutor. Rutorna numreras från 01 till 100. Första raden är 01 till 10, andra raden 11 till 20, och så vidare ner till 91 till 100. Det kallas **fältuppdelning**.

En panel får numret på den ruta där dess övre vänstra hörn sitter. En panel som börjar längst upp till vänster får 01. En som börjar i början av sjätte raden får 51.

En ruta är rätt hög, så ibland får flera paneler plats i samma ruta. Då skiljs de åt med en bokstav: 51A, 51B och så vidare.

<!-- uses: uttag, panel, stall, falt -->
## Uttaget

**Uttaget** får panelens beteckning plus sitt eget nummer i panelen. Uttag nummer 10 på panel AC0311A blir alltså AC0311A10.

Samma beteckning står i båda ändarna av kabeln, både vid uttaget ute i rummet och vid porten i patchpanelen. Ser du AC0311A10 på väggen i rum 308 vet du precis vilken port i vilket rack kabeln går till.

<!-- uses: stallforteckning, monteringsritning, panelkort, stall, falt, panel, uttag, dokumentation -->
## Dokumenten

Tre dokument är viktigast när nätet är klart.

- **Ställförteckning:** en lista över alla ställ.
- **Monteringsritning:** ett fält framifrån. Den visar var utrustningen sitter i racket och fakta om den. Kablarna ritas inte här.
- **Panelkort:** ett kort per panel som visar varje uttag i panelen. Där står vilken kabel som går dit, hur lång den är och vart den går, till exempel "uttag rum 308".

Det finns fler dokument, som installationsritningar med symboler för ställ och uttag på en planritning, kabellistor och nätscheman. Men de tre ovan är de du har mest nytta av när något ska felsökas.

<!-- uses: rack, patchpanel, patchkabel, stall, falt, faltuppdelning, panel, uttag, panelkort, monteringsritning, stallforteckning; kind: recap -->
## Kort sammanfattning

- Kablarna från uttagen slutar i en patchpanel i ett rack. En patchkabel är en vanlig nätverkskabel.
- En beteckning byggs som ställ, fält, panel, uttag, till exempel AC0311A10.
- Stället har två bokstäver: första är våningen, andra är utrymmet på våningen.
- Fältet är racket, numrerat från 01 från vänster.
- Racket delas i 10 gånger 10 rutor. En panel får numret på rutan där dess övre vänstra hörn sitter. Flera paneler i samma ruta får A, B och så vidare.
- Uttaget har samma beteckning i båda ändarna av kabeln.
- Panelkortet visar varje uttag i en panel. Monteringsritningen visar racket framifrån.
