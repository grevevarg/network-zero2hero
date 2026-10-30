# Open issues

Things to revisit later. Content items need checking against the notes before they're closed.

## UI copy

- [ ] **Reset copy is clunky.** "Nollställ mina framsteg" and "Framstegen sparas bara i den här webbläsaren" read stiffly. Find more natural wording.

## Feature requests

- [ ] **Drag and drop for ordering questions** (the OSI layers, the T568B wire order). Drag an item to its place instead of pressing ↑/↓ many times. Keep the arrow buttons for keyboard users and as a fallback on phones.
- [ ] **Draw lines for text-only matching questions** (four or five descriptions to pair with as many terms). Drag a line from an item on the left to one on the right, the way you join devices in a topology drawing. This is only for matching where both sides are text. Matching with pictures, like the topology question in section 1, keeps its dropdowns. It still needs a keyboard way to pair items.

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

## Section 3: Kablar och kontakter

- [ ] **Not in the notes, left out:** crossover and rollover cables, fiber connectors (ST/SC/LC), transceivers (SFP/QSFP) and crosstalk vs EMI. They only appear in the graded-quiz notes, which I don't use as a source. They were in the approved outline, so add them from another source if they should be covered.
- [ ] **Errors in the notes, corrected from the lecture slide:**
  - The note says SMF uses "LED/Laser"; it uses lasers. LEDs are for MMF.
  - The note says MMF needs "equipment for different colours". Multimode means many light paths, not colours.
- [ ] **Fiber distance:** the note says "upp till 40 km" and the slide says 100+ km for SMF. The text says "flera mil", which covers both.
- [ ] **Left out:** "ljus är snabbare än el" (shaky as a claim), and the ±2.5 V = 1/0 signalling picture (simplified to the point of being misleading for gigabit). Add them back if you want them.
- [ ] **Speed table** is from the lecture slide. Cat6 is 1 Gbit/s there (the 10 Gbit/s at 55 m detail is not in the notes).
- [ ] **Patch cable** is moved to section 4, together with the patch panel.

## Section 4: Märkning av uttag

- [ ] **Floor letter conflict.** The documentation note says the first letter of a ställ is the floor (AC = floor 1, third room), but the book's example calls AC "plan 3". The text follows the first rule. Confirm.
- [ ] **Row starts.** The edition 5 summary lists cells as "01, 21, 31…" and skips 11. The text follows the book figure (01, 11, 21 … 91).
- [ ] **Not from the notes:** the definitions of rack and patch panel (the note only uses the words), and the explanation of why several panels can share a cell (a cell is tall).
- [ ] **Left out on purpose:** edition 6 designations (+D1S1M25:12X), the panelkort columns in detail, the procurement flow (förfrågningsunderlag, EL-AMA) and the example building. Say if any of these should go in.
- [ ] **No clickable rack puzzle.** The rack grid is drawn as a diagram on two multiple-choice questions. A real click-the-cell puzzle could come later.

## Section 5: Switchar och MAC-adresser

- [ ] **Errors in the notes left out or corrected:**
  - "Unicast börjar på 00" isn't true in general. Unicast is any address whose lowest bit in the first byte is 0.
  - "Första 12 värden = tillverkare": it is the first 6 hex digits (24 bits), as the 0925 note says.
  - The frame field order puts SRC before DST; the real order is destination first.
  - The frame size "max 1528/1522" is written as about 1500 bytes of data plus headers.
- [ ] **Not from the notes:**
  - the name CSMA/CD and "wait and try again"
  - each switch port being its own collision domain, and no collisions with full duplex
  - hexadecimal as a whole (the notes use hex but never explain it)
  - the terms OUI and flooding
- [ ] **Left out:**
  - bridges (only in a book quote)
  - anycast (the note's description is unclear; IPv6 may need it)
  - LLC/MAC sublayers and the 802 groups
  - the switch CLI
  - the wifi collision handling (it belongs to the wireless section)
- [ ] **Hubs and collisions** are explained with CSMA/CD at a basic level only.

## Section 6: IPv4-adresser

- [ ] **New question type: fill-in.** Answers are typed, and each field is checked on its own. Harmless differences are ignored: case, spaces, and leading zeros in numbers, octets and bits. After a wrong check a "Visa lösningen" button shows the explanation. The answers are computed with `src/lib/net.ts`, which has property tests, so a numeric answer can't drift from the maths. Check that the UI copy ("Rätt"/"Fel", "Visa lösningen") reads well.
- [ ] **Prefix notation (/24) comes in section 6**, not 7 as planned, because the 0930 note introduces it together with the mask.
- [ ] **Not from the notes:** the binary conversion method (subtract from the left), "class A has room for over 16 million devices", and that the private ranges are given as full address ranges (the note lists them as networks).
- [ ] **Left out:** the remark that you never use 0 or 255 (it's unclear in the note; network and broadcast addresses come in section 7), and the multicast RTP URL example.
- [ ] **Example names:** a place name in the note's class example is on the forbidden list, so that example isn't used.

## Section 7: Subnetting

- [ ] **"Host" is defined here** as any device with an IP address. That answers the open question from section 1 for later sections. Section 1 still avoids the word.
- [ ] **Method and examples come from the subnetting cheat sheet** (Misc), which is your own summary of the 1005 and 1007 notes. The VLSM example is marked there as made-up numbers. Check that you're happy using it.
- [ ] **Note error not copied:** the IP plan in the 1005 note gives broadcast "100.32" for 192.168.100.0/27. The right answer is .31, as the cheat sheet points out.
- [ ] **Left out:** supernetting, /31 and /32, and the class A/B subnetting examples from the 1007 note. They could be extra practice questions later.
- [ ] **No generated practice.** Every subnetting question is written by hand, with answers computed by `net.ts`. A seeded "new exercise" generator (a bit-grid puzzle) was in the plan and is still open.
- [ ] **LIX is 21.9**, well under the 30–40 target. The sentences are short and full of numbers, which is probably fine for this section.
