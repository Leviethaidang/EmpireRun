// ===== ngôn ngữ =====
const BUYKEY_I18N = {
  en: {
    // page text
    title: "Buy License Key",
    emailLabel: "Email",
    emailPlaceholder: "example@gmail.com",
    orderBtn: "Order",
    orderCodeLabel: "Order Code",
    amountLabel: "Amount",
    bankInfoLabel: "Bank Info:",
    bankNameLabel: "Bank",
    bankAccLabel: "Account No",
    bankOwnerLabel: "Account name",
    warnLine1: "Please transfer exactly",
    warnLine1b: "and use this content:",
    warnLine2: "Transfers with wrong amount/content will NOT be processed.",
    warnLine3: "After your payment is successfully confirmed, your license key will be sent to your email ",
    warnTime: " within 3 hours",
    warnLine4: " If you do not receive it after 3 hours, please contact customer support",



    // messages
    msgMissingEmail: "Please enter your email.",
    msgCreating: "Creating order...",
    msgSuccess: "Order created! Please transfer following the instructions below.",
    msgFail: "Order failed. Please try again.",
  },
  vi: {
    // page text
    title: "Mua Key Bản Quyền",
    emailLabel: "Email",
    emailPlaceholder: "example@gmail.com",
    orderBtn: "Đặt Mua",
    orderCodeLabel: "Mã đơn",
    amountLabel: "Số tiền",
    bankInfoLabel: "Thông tin chuyển khoản:",
    bankNameLabel: "Ngân hàng",
    bankAccLabel: "STK",
    bankOwnerLabel: "Chủ TK",
    warnLine1: "Vui lòng chuyển khoản đúng",
    warnLine1b: "và ghi đúng nội dung:",
    warnLine2: "Không xử lý chuyển khoản thiếu / sai nội dung.",
    warnLine3: "Sau khi giao dịch được xác nhận thành công, key của bạn sẽ được gửi về email trong vòng",
    warnTime: " tối đa 3 giờ",
    warnLine4: " Nếu sau 3 giờ vẫn chưa nhận được, vui lòng liên hệ chăm sóc khách hàng.",



    // messages
    msgMissingEmail: "Vui lòng nhập email.",
    msgCreating: "Đang tạo order...",
    msgSuccess: "Tạo order thành công! Vui lòng chuyển khoản theo hướng dẫn bên dưới.",
    msgFail: "Tạo order thất bại. Vui lòng thử lại.",
  }
};

let buykeyLang = (document.documentElement.getAttribute("data-lang") || "en");
let buykeyT = BUYKEY_I18N[buykeyLang] || BUYKEY_I18N.en;

function buykeyApplyLang(lang) {
  buykeyLang = lang || "en";
  buykeyT = BUYKEY_I18N[buykeyLang] || BUYKEY_I18N.en;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (buykeyT[key] != null) el.textContent = buykeyT[key];
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (buykeyT[key] != null) el.setAttribute("placeholder", buykeyT[key]);
  });

  document.documentElement.lang = buykeyLang;

  const msgEl = document.getElementById("msg");
  if (msgEl && msgEl.dataset && msgEl.dataset.msgKey) {
    const key = msgEl.dataset.msgKey;
    const isError = msgEl.dataset.msgError === "1";
    msgEl.textContent = (buykeyT[key] != null) ? buykeyT[key] : msgEl.textContent;
    msgEl.style.color = isError ? "#b22222" : "#2b1306";
    msgEl.style.fontWeight = isError ? "900" : "700";
  }

}

window.addEventListener("languageChange", (e) => {
  const lang =
    (e.detail && e.detail.lang)
      ? e.detail.lang
      : (document.documentElement.getAttribute("data-lang") || "en");
  buykeyApplyLang(lang);
});

document.addEventListener("DOMContentLoaded", () => {
  buykeyApplyLang(document.documentElement.getAttribute("data-lang") || "en");
});



const btn = document.getElementById("btn-order");
const emailEl = document.getElementById("email");
const msg = document.getElementById("msg");
const paybox = document.getElementById("paybox");
const orderCodeEl = document.getElementById("orderCode");
const orderCode2El = document.getElementById("orderCode2");
const qrBox = document.getElementById("qrBox");

// ===== COOLDOWN (client only) =====
const ORDER_COOLDOWN_MS = 5 * 60 * 1000;
let cooldownTimer = null;

function normalizeEmailKey(email) {
  return String(email || "").trim().toLowerCase();
}

function getCooldownKey(email) {
  const e = normalizeEmailKey(email);
  // cooldown theo email
  return `empireRun_buykey_cooldown_until_${e || "unknown"}`;
}

function getCooldownUntil(email) {
  const v = Number(localStorage.getItem(getCooldownKey(email)) || "0");
  return Number.isFinite(v) ? v : 0;
}

function setCooldownUntil(email, untilMs) {
  localStorage.setItem(getCooldownKey(email), String(untilMs));
}

function clearCooldownTick() {
  if (cooldownTimer) clearInterval(cooldownTimer);
  cooldownTimer = null;
}

function formatMs(ms) {
  ms = Math.max(0, ms);
  const totalSec = Math.ceil(ms / 1000);
  const m = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function startCooldownUI(email) {
  clearCooldownTick();

  function tick() {
    const until = getCooldownUntil(email);
    const remain = until - Date.now();

    if (remain > 0) {
      btn.disabled = true;
      const t = formatMs(remain);

      // Hiện thông báo đếm ngược
      setMsg(
        buykeyLang === "vi"
          ? `Order thất bại. Vui lòng thử lại sau ${t}.`
          : `Order failed. Please try again after ${t}.`,
        true,
        false
      );
    } else {
      btn.disabled = false;
      clearCooldownTick();
    }
  }

  tick();
  cooldownTimer = setInterval(tick, 1000);
}

function isInCooldown(email) {
  return Date.now() < getCooldownUntil(email);
}


function setMsg(keyOrText, isError = false, isKey = false) {
  const text = isKey ? (buykeyT[keyOrText] || "") : keyOrText;

  msg.textContent = text;
  msg.style.color = isError ? "#b22222" : "#2b1306";
  msg.style.fontWeight = isError ? "900" : "700";

  if (isKey) {
    msg.dataset.msgKey = keyOrText;
    msg.dataset.msgError = isError ? "1" : "0";
  } else {
    delete msg.dataset.msgKey;
    delete msg.dataset.msgError;
  }
}


btn.addEventListener("click", async () => {
  const email = (emailEl.value || "").trim();
  if (!email) {
    setMsg("msgMissingEmail", true, true);
    return;
  }
  if (isInCooldown(email)) {
    startCooldownUI(email);
    return;
  }
  btn.disabled = true;
  setMsg("msgCreating", false, true);
  qrBox.classList.add("hidden");

  try {
    const res = await fetch("/api/license/order/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "order_failed");
    }

    setMsg("msgSuccess", false, true);
    paybox.classList.remove("hidden");
    qrBox.classList.remove("hidden");
    orderCodeEl.textContent = data.orderCode;
    orderCode2El.textContent = data.orderCode;

    const until = Date.now() + ORDER_COOLDOWN_MS;
    setCooldownUntil(email, until);
  } catch (err) {
    console.error(err);
    setMsg("msgFail", true, true);
  } finally {
    btn.disabled = false;
  }
});


emailEl.addEventListener("input", () => {
  const email = (emailEl.value || "").trim();
  if (!email) return;
  if (isInCooldown(email)) startCooldownUI(email);
  else {
    btn.disabled = false;
  }
});