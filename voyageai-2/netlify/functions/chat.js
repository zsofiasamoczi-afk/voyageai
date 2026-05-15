exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { messages } = JSON.parse(event.body);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
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
Legyél barátságos, lelkes, adj konkrét linkeket és reális árbecsléseket!`,
        messages,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return { statusCode: 500, body: JSON.stringify({ error: data.error.message }) };
    }

    const reply = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
