import express from 'express';
import cors from "cors";
import {google} from "googleapis";
import creds from "./adept-storm-461506-i2-b92c1f6b45be.json" assert {type: "json"};


import "dotenv/config";     


const spreadsheetId = "1-CPm_6TQpvaOZgrnyBVhnNlyf6it2WUjNO7ay2c3w_o"; // 📌 your sheet ID


const auth = new google.auth.JWT(
  creds.client_email,
  null,
  creds.private_key,
  ["https://www.googleapis.com/auth/spreadsheets"]
);
const sheets = google.sheets({ version: "v4", auth });

async function fetchRows() {
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Furniture!A2:H",   // open‑ended so new rows auto‑load
  });

  const fields = [
    "RowID",        // helper column (absolute sheet row)
    "Title",
    "Price",
    "Description",
    "Availability",
    "Original",
    "Price Change",
    "Images",
  ];
  return (data.values || []).map(r =>
    Object.fromEntries(fields.map((f, i) => [f, r[i] || ""]))
  );
}


const app = express();
app.use(cors());
app.use(express.json());


app.get("/items", async (_req, res) => {
  try {
    res.json(await fetchRows());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


function requireAdmin(req, res, next) {
  const key = req.get("x-admin-key");
  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "admin key missing or wrong" });
  }
  next();
}


app.put("/items/:row", requireAdmin, async (req, res) => {
  try {
    const row = Number(req.params.row); // absolute sheet row
    const bodyValues = Object.values(req.body);

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Furniture!A${row}:H${row}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [bodyValues] },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log("API listening on http://localhost:3001"));