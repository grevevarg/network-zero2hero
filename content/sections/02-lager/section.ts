import type { SectionInput } from "../../../src/build/schema.ts";
import { questions } from "./questions.ts";

const section: SectionInput = {
  meta: {
    id: "lager",
    number: 2,
    title: "Lager på lager",
    slug: "02-lager",
    introduces: [
      "protokoll", "bit", "byte", "osi-modellen",
      "applikationslagret", "presentationslagret", "sessionslagret", "transportlagret",
      "natverkslagret", "datalankslagret", "fysiska-lagret",
      "header", "logisk-adress", "fysisk-adress", "trailer", "inkapsling",
      "pdu", "segment", "paket", "frame", "tcp-ip-modellen",
    ],
    requires: ["natverk", "klient", "server"],
    diagrams: {
      // Scenes live in diagrams/02-lager/ (layouts in scripts/diagram-specs.ts).
      "text-osi": {
        scene: "02-lager/text-osi",
        alt: "Sju lådor staplade på varandra. Uppifrån: 7 Applikation, 6 Presentation, 5 Session, 4 Transport, 3 Nätverk, 2 Datalänk, 1 Fysiskt.",
      },
      "text-inkapsling": {
        scene: "02-lager/text-inkapsling",
        alt: "Fem rader. Överst en låda med Data. På nästa rad står en låda märkt 4 framför, och raden heter Segment. Sedan kommer en låda märkt 3 framför, och raden heter Paket. Sedan kommer en låda märkt 2 framför och en till låda märkt 2 efter, och raden heter Frame. Sista raden är bara ettor och nollor och heter Bitar.",
      },
      "text-tcpip": {
        scene: "02-lager/text-tcpip",
        alt: "Två kolumner. Till vänster OSI-modellens sju lager. Till höger TCP/IP-modellens fyra: Applikation bredvid OSI-lagren applikation, presentation och session, Transport bredvid transport, Internet bredvid nätverk och Network Access bredvid datalänk och fysiskt.",
      },
    },
  },
  questions,
};

export default section;
