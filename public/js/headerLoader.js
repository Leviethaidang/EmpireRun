(function () {
  const LANG_KEY = "empireRun_lang";

  function getCurrentLang() {
    return (
      document.documentElement.getAttribute("data-lang") ||
      localStorage.getItem(LANG_KEY) ||
      "en"
    );
  }

  function setLang(lang) {
    if (!lang) lang = "en";
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.setAttribute("data-lang", lang);

    // Thông báo cho mọi trang
    window.dispatchEvent(
      new CustomEvent("languageChange", { detail: { lang } })
    );
  }

  // Cho các trang khác xài lại
  window.getCurrentLang = getCurrentLang;
  window.setLang = setLang;

  document.addEventListener("DOMContentLoaded", async () => {
    const headerHost = document.getElementById("site-header");

    // 1) Load header.html (nếu trang có header)
    if (headerHost) {
      try {
        const res = await fetch("/header.html");
        const html = await res.text();
        headerHost.innerHTML = html;
      } catch (e) {
        console.error("Không load được header:", e);
      }
    }

    // 2) Set active menu
    const path = window.location.pathname;
    document
      .querySelectorAll("#site-header .topbar-link")
      .forEach((link) => {
        const page = link.getAttribute("data-page");
        if (page === "leaderboard" && path.startsWith("/leaderboard")) {
          link.classList.add("active");
        }
        // sau này thêm page khác thì if thêm vào đây
      });

    // 3) Khởi tạo ngôn ngữ + dropdown
    const select = document.querySelector("#site-header #lang-select");
    const current = getCurrentLang();

    document.documentElement.setAttribute("data-lang", current);

    if (select) {
      select.value = current;

      select.addEventListener("change", function () {
        setLang(this.value || "en");
      });
    }

    // 4) Bắn event lần đầu để các trang cập nhật text
    setLang(current);
  });
})();
