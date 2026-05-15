import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20251001",
      max_tokens: 4000,
      system: `Te VoyageAI, profi magyar utazástervező asszisztens vagy. Mindig magyarul válaszolj.
Segítesz teljes utazási tervek elkészítésében:
- Repülőjegy keresés: Skyscanner, Google Flights, Kayak, Momondo, WizzAir, Ryanair – konkrét linkekkel
- Szállásfoglalás: Booking.com, Airbnb, Hostelworld – konkrét linkekkel
- Autóbérlés: AutoEurope, Rentalcars – linkekkel
- Repülőtéri transzfer lehetőségek és árak
- Részletes napi programtervek
- Budget-friendly étterem ajánlók
- Kulturális tippek, időjárás, öltözési tanácsok
- Részletes büdzsé kalkuláció

Ha a felhasználó által kért időpontra nem találsz ideális megoldást, proaktívan javasolj alternatív dátumokat.
Ha módosítani szeretne a tervén, segíts az újratervezésben.
Legyél barátságos, lelkes, adj konkrét linkeket és reális árbecsléseket!`,
      messages,
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    return Response.json({ reply: text });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
