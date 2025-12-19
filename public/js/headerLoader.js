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


    window.dispatchEvent(
      new CustomEvent("languageChange", { detail: { lang } })
    );
  }

  window.getCurrentLang = getCurrentLang;
  window.setLang = setLang;

  document.addEventListener("DOMContentLoaded", async () => {
    const headerHost = document.getElementById("site-header");

    if (headerHost) {
      try {
        const res = await fetch("/header.html");
        const html = await res.text();
        headerHost.innerHTML = html;
      } catch (e) {
        console.error("Không load được header:", e);
      }
    }

    const path = window.location.pathname;
    document
      .querySelectorAll("#site-header .topbar-link")
      .forEach((link) => {
        const page = link.getAttribute("data-page");
        if (page === "leaderboard" && path.startsWith("/leaderboard")) {
          link.classList.add("active");
        }
        if (page === "guide" && path.startsWith("/guide")) {
          link.classList.add("active");
        }
        if (page === "buykey" && path.startsWith("/buykey")) {
          link.classList.add("active");
        }


      });
      const backBtn  = document.querySelector("#site-header #back-to-guide");
      const guideBtn = document.querySelector("#site-header #nav-guide");
      let p = window.location.pathname || "/";
      if (p.length > 1) p = p.replace(/\/+$/, "");
      // bài viết: /guide/<slug>
      const isGuideArticle = p.startsWith("/guide/");
      // trang list guide: /guide
      const isGuideList = (p === "/guide");
      if (backBtn)  backBtn.style.display  = isGuideArticle ? "inline-flex" : "none";
      if (guideBtn) guideBtn.style.display = isGuideArticle ? "none" : "inline-flex";

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
    setLang(current);
  });
})();
