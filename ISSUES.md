# Open issues

Things to revisit later. Content items need checking against the notes before they're closed.

## UI copy

- [ ] **Reset copy is clunky.** "Nollställ mina framsteg" and "Framstegen sparas bara i den här webbläsaren" read stiffly. Find more natural wording.

## Section 1: Vad är ett nätverk?

- [ ] **Wording not taken from the notes.** I wrote these myself because the notes use the terms without defining them. Review:
  - the definition of a network
  - LAN, WAN and internet
  - the bus description ("alla på samma kabel", "går den av slutar allt fungera")
  - the "kontoret får en våning till" example for tree
- [ ] **Which meaning of "host"?** The notes say "server (host)", but later topics (host part of an address, number of hosts) use host for any device with an address. Section 1 avoids the word for now.
- [ ] **Mesh.** The notes list "mesh" (wifi mesh) and "fully connected" separately; the text merges them as mesh / full mesh. Hybrid (textbook only) and line (on a slide, never explained) are left out.
- [ ] **Tor as a P2P example** was dropped as a shaky example.
- [ ] **Star: single point of failure** was added on request and is not from the notes. That includes the hint about building around it ("två enheter i mitten och kabel till båda"). Check the wording.

## Section 2: Lager på lager

- [ ] **Wording not taken from the notes.** Review:
  - why layers at all (the opening card and its letter analogy)
  - the definition of protokoll and the language analogy
  - bit = 0/1 and byte = 8 bitar as definitions
  - "där programmen lämnar över sin data till nätet" for layer 7
  - why å, ä and ö turn into odd characters (layer 6)
  - "the physical address is replaced on every hop" (layer 2)
  - TCP/IP layer names and how they map to OSI. Only "Network Access Layer" appears in the notes.
- [ ] **Errors in the notes left out.** ASCII is 7 bits (128 characters, not 127), extended ASCII is 8 bits (256 in total), and UTF-8 is variable length, not 16 bits. The text names ASCII and UTF-8 without any numbers.
- [ ] **Compression at layer 6** is a classic textbook fact but is missing from the lecture notes, so it is left out. Add it?
- [ ] **"Datagram"** is now on the PDU card as layer 4's other name, without naming UDP (that comes later). "Används ibland även om andra lager" is from the OSI note; check the wording.
- [ ] **LLC/MAC sublayers and the IEEE 802 groups** are not covered. The notes have them, but the plan doesn't place them anywhere. Section 5, maybe?
- [ ] **Bookshelf analogy:** the brand and the city are removed (the city is on the local forbidden list).
