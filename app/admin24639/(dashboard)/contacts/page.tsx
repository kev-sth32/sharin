import fs from "fs";
import path from "path";
import ContactsClient from "./ContactsClient";

export const dynamic = "force-dynamic";

function read(name: string) {
  try {
    const fp = path.join(process.cwd(), ".data", name);
    if (!fs.existsSync(fp)) return [];
    return JSON.parse(fs.readFileSync(fp, "utf-8")).reverse();
  } catch { return []; }
}

export default function ContactsAdmin() {
  const contacts = read("contacts.json");
  const refunds = read("refunds.json");
  const newsletters = read("newsletter.json");

  return (
    <ContactsClient 
      initialContacts={contacts}
      initialRefunds={refunds}
      initialNewsletters={newsletters}
    />
  );
}
