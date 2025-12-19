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
    warnLine1b: "and use this content",
    warnLine2: "Transfers with wrong amount/content will NOT be processed.",
    warnLine3: "Your key will be sent to your email within",
    warnTime: "2 minutes – 3 hours",

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
    warnLine1b: "và ghi đúng nội dung",
    warnLine2: "Không xử lý chuyển khoản thiếu / sai nội dung.",
    warnLine3: "Key sẽ được gửi về email trong",
    warnTime: "2 phút – 3 giờ",

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

  } catch (err) {
    console.error(err);
    setMsg("msgFail", true, true);
  } finally {
    btn.disabled = false;
  }
});
