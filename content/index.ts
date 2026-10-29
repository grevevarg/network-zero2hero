import { concepts } from "./concepts.ts";
import natverk from "./sections/01-natverk/section.ts";
import lager from "./sections/02-lager/section.ts";
import kablar from "./sections/03-kablar/section.ts";
import markning from "./sections/04-markning/section.ts";
import switchar from "./sections/05-switchar/section.ts";
import ipv4 from "./sections/06-ipv4/section.ts";
import subnat from "./sections/07-subnat/section.ts";
import routing from "./sections/08-routing/section.ts";
import routingprotokoll from "./sections/09-routingprotokoll/section.ts";
import transport from "./sections/10-transport/section.ts";
import dhcpdns from "./sections/11-dhcpdns/section.ts";

export const title = "Från noll till nätverk";
export { concepts };
export const sections = [natverk, lager, kablar, markning, switchar, ipv4, subnat, routing, routingprotokoll, transport, dhcpdns];
