//server.js tại web chính 
if (!process.env.RENDER) {
  require("dotenv").config();
}

// ====== IMPORT ======
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");

// ====== INIT ======
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
//goi trang index.html trong thu muc public de hien thi giao dien
app.use(express.static("public"));


const MAIN_WEB_API_KEY = process.env.MAIN_WEB_API_KEY || "123";
const DEFAULT_ADMIN_LOCAL = "http://localhost:4000";
const ADMIN_API_BASE = getAdminBase();

// ====== DATABASE ======
const db = new sqlite3.Database("./leaderboard.db");

//tao bang database neu chua co
db.run(`
CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT,
    elapsed_seconds INTEGER NOT NULL,
    submitted_at TEXT DEFAULT CURRENT_TIMESTAMP
)
`);

// ====== API ======

//API gui diem tu trong game
app.post("/api/score", (req, res) => {
    const username = (req.body.username || "").trim();
    const email = (req.body.email || "").trim();
    const elapsedSeconds = req.body.elapsedSeconds;

    if (!username || typeof elapsedSeconds !== "number") {
        return res.status(400).json({ error: "Thiếu username hoặc elapsedSeconds" });
    }

    const stmt = db.prepare(`
        INSERT INTO scores (username, email, elapsed_seconds)
        VALUES (?, ?, ?)
    `);
    stmt.run(username, email, elapsedSeconds, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
    });
    stmt.finalize();
});

// Xem bang xep hang
app.get("/api/leaderboard", (req, res) => {
    db.all(
        "SELECT id, username, email, elapsed_seconds, submitted_at FROM scores ORDER BY elapsed_seconds ASC LIMIT 50",
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});
// ====== LICENSE ORDER API ======
app.post("/api/license/order/start", async (req, res) => {
  const email = normalizeEmail(req.body.email);
  if (!email) {
    return res.status(400).json({ success: false, error: "missing_email" });
  }

  const orderCode = generateOrderCode10();

  try {
   
    const resp = await fetch(`${ADMIN_API_BASE}/api/license/order/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": MAIN_WEB_API_KEY,
      },
      body: JSON.stringify({
        email,
        orderCode,
        amount: 0,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      console.error("Admin create order failed:", resp.status, text);
      return res.status(502).json({ success: false, error: "admin_api_failed" });
    }

    return res.json({ success: true, email, orderCode });
  } catch (err) {
    console.error("Order start error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});


//helper
function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

// orderCode 10 ký tự, bỏ O/0/I/1
function generateOrderCode10() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 10; i++) {
    const idx = crypto.randomInt(0, chars.length);
    s += chars[idx];
  }
  return s;
}
function getAdminBase() {
  const envBase = String(process.env.ADMIN_API_BASE || "").trim().replace(/\/+$/, "");
  if (!envBase) return DEFAULT_ADMIN_LOCAL;
  const isRunningLocal = !process.env.RENDER && process.env.NODE_ENV !== "production";
  if (!isRunningLocal) return envBase;

  return DEFAULT_ADMIN_LOCAL;
}

// ====== ROUTES TRANG GIAO DIỆN ======

//Trang Home
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "home.html"));
});

//Trang bảng xếp hạng
app.get("/leaderboard", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "leaderboard.html"));
});
//Trang Mua key
app.get("/buykey", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "buykey.html"));
});

//Trang Guide (danh sách)
app.get("/guide", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "guide.html"));
});

//Trang bài viết Guide
app.get("/guide/:slug", (req, res) => {
  const slug = (req.params.slug || "").toLowerCase();

  const allowed = new Set([
    "labor",
    "factory",
    "planning",
    "logistic",
    "income",
    "victory"
  ]);

  if (!allowed.has(slug)) {
    return res.status(404).send("Guide not found");
  }

  res.sendFile(
    path.join(__dirname, "public", "guides", `${slug}.html`)
  );
});

//nút tải game
app.get("/download", (req, res) => {
    const downloadUrl = "https://drive.google.com/uc?export=download&id=1kFn-D542lzSdlmbp5I7SSMrkrTSrJaZC";
    res.redirect(downloadUrl);
});

app.listen(PORT, () => {
    console.log(`Main Web running at http://localhost:${PORT}`);
});

