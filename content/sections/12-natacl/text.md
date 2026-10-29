<!-- uses: nat, privat-adress, publik-adress, router, internet -->
## Varför NAT?

I avsnitt 6 såg du att IPv4-adresserna har tagit slut och att privata adresser inte får användas på internet. Hur kan då din dator med adressen 192.168.1.10 surfa alls?

Svaret är **NAT** (Network Address Translation). Routern mellan ditt nät och internet översätter de privata adresserna till en publik adress på vägen ut, och tillbaka igen på vägen in. NAT är en stor anledning till att internet inte har fått slut på adresser för länge sedan.

<!-- uses: nat, publik-adress, privat-adress -->
## En till en

Den enklaste sortens NAT ger varje privat adress en egen publik adress. Det kallas **en-till-en-NAT**. Routern byter bara ut adressen i varje paket.

Den används nästan aldrig, eftersom den kräver lika många publika adresser som det finns datorer. Och det var ju just publika adresser det var brist på.

<!-- uses: pat, nat, port, kallport-malport, publik-adress -->
## PAT: många delar på en adress

@diagram(text-nat)

Den sorts NAT som används nästan överallt heter **PAT** (Port Address Translation). Den kallas också NAPT eller IP masquerading. Med PAT delar alla datorer i nätet på en enda publik adress.

Tricket är källporten. När din dator skickar något byter routern ut både din adress och din källport, och skriver upp bytet i en tabell.

| Innanför | Utanför |
| --- | --- |
| 192.168.1.10:50336 | 203.0.113.5:40001 |
| 192.168.1.11:50336 | 203.0.113.5:40002 |

När svaret kommer tillbaka till port 40002 vet routern att det ska till 192.168.1.11. Har routern väldigt många anslutningar samtidigt kan portarna faktiskt ta slut.

Vill du veta vilken publik adress ditt nät har? Det finns webbsidor som visar adressen som dina paket kommer ifrån.

<!-- uses: port-forwarding, pat, port, server -->
## Port forwarding

PAT fungerar bra så länge det är du som börjar prata. Men om någon på internet vill nå en server hemma hos dig vet routern inte vart trafiken ska, eftersom det inte finns någon rad i tabellen.

Lösningen är **port forwarding**. Du ställer in routern så att allt som kommer in på en viss port skickas vidare till en viss dator innanför. Allt som kommer till port 443 kan till exempel skickas till 192.168.1.50.

Det gäller en port i taget, och varje port kan bara skickas till en dator. Två webbservrar kan alltså inte båda ta emot på port 443 på samma publika adress. Flyttar du en tjänst till en annan port måste den som ska nå den också veta vilken port det är.

<!-- uses: nat, router, port -->
## NAT och felsökning

NAT kan ligga i flera lager. Ditt hemmanät kan sitta bakom NAT, och din internetleverantör kan i sin tur ha NAT framför många kunder.

Den som styr routern som gör NAT kan se all trafik som går igenom den. Det är bra att komma ihåg.

Och när något med portar inte fungerar är routern som gör NAT ett av de första ställena att titta. Kanske saknas en port forwarding, eller så pekar den på fel dator.

<!-- uses: acl, implicit-deny, router, interface -->
## ACL

En **ACL** (Access Control List) är en lista med regler på en router som bestämmer vilken trafik som släpps igenom. Varje regel säger antingen tillåt eller neka. Ibland kallas reglerna brandväggsregler.

Routern läser listan uppifrån och ner, och den första regeln som passar gäller. Resten läses inte. Därför spelar ordningen stor roll.

Allra sist i varje lista finns en osynlig regel som nekar allt. Den kallas **implicit deny**. Trafik som inte passar någon regel stoppas alltså. En ACL sätts på ett interface, för trafik in eller ut.

<!-- uses: standard-extended-acl, acl, port, tcp, udp -->
## Standard och extended

Det finns två sorters ACL.

- En **standard-ACL** kan bara titta på avsändarens IP-adress. Den kan till exempel stoppa allt från ett visst nät.
- En **extended-ACL** kan titta på både avsändare och mottagare, på protokoll som TCP och UDP, och på portar. Den kan till exempel stoppa bara webbtrafik från ett visst nät och släppa allt annat.

<!-- uses: wildcard-mask, acl, subnatmask, prefix -->
## Wildcard-mask

I en ACL skrivs nät inte med subnet mask utan med en **wildcard-mask**. Den är masken vänd ut och in. Där masken har ettor har wildcard-masken nollor, och tvärtom.

En nolla betyder att den biten måste stämma. En etta betyder att den biten inte spelar någon roll. För /24 är masken 255.255.255.0, så wildcard-masken blir 0.0.0.255.

Ett snabbt sätt att räkna: ta 255 minus masken i varje oktett. Masken 255.255.255.192 blir wildcard-masken 0.0.0.63.

<!-- uses: nat, pat, port-forwarding, acl, implicit-deny, standard-extended-acl, wildcard-mask; kind: recap -->
## Kort sammanfattning

- NAT översätter privata adresser till publika. En-till-en-NAT används nästan aldrig.
- PAT låter många datorer dela en publik adress genom att byta källporten och skriva upp bytet i en tabell.
- Port forwarding skickar trafik som kommer in på en viss port till en viss dator innanför.
- En ACL läses uppifrån, den första regeln som passar gäller, och sist finns implicit deny.
- Standard-ACL tittar bara på avsändaren. Extended-ACL kan också titta på mottagare, protokoll och portar.
- En wildcard-mask är masken vänd ut och in: 255 minus masken i varje oktett.
