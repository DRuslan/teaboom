(() => {
  "use strict";

  // Единый источник данных по ТЗ
  const PACKAGES = {
    "100": { weight: "100 г", sku: "01306", price: 326.4, oldPrice: 349.2 },
    "500": { weight: "500 г", sku: "01307", price: 1432, oldPrice: 1646 },
    "1000": { weight: "1000 г", sku: "01308", price: 2064, oldPrice: 2592 },
    "5000": { weight: "5000 г", sku: "01309", price: 6320, oldPrice: 8710 },
  };

  const root = document.querySelector("[data-product]");
  if (!root) return;

  const tabs = [...root.querySelectorAll("[data-packaging-option]")];
  const tablist = root.querySelector('[role="tablist"]');
  const panel = root.querySelector("#product-offer");
  const skuEl = root.querySelector("[data-sku]");
  const priceEl = root.querySelector("[data-current-price]");
  const oldPriceEl = root.querySelector("[data-current-old-price]");
  const skuWrap = root.querySelector(".product-card__sku");
  const badgeEl = root.querySelector("[data-discount-badge]");
  const metaSku = root.querySelector("[data-meta-sku]");
  const metaPrice = root.querySelector("[data-meta-price]");
  const cartBtn = root.querySelector("[data-add-to-cart]");
  const cartText = root.querySelector("[data-cart-text]");

  const ACTIVE = "product-card__packaging-item--active";
  const ADDED = "product-card__cart--added";

  const formatPrice = (value) => {
    const num = Number(value);
    const hasCents = !Number.isInteger(num);

    return (
      new Intl.NumberFormat("ru-RU", {
        minimumFractionDigits: hasCents ? 2 : 0,
        maximumFractionDigits: 2,
      }).format(num) + "\u00A0₽"
    );
  };

  const calcDiscount = (price, oldPrice) => {
    if (!oldPrice || oldPrice <= price) return 0;
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  };

  const replayAnim = (el, className = "is-animating") => {
    if (!el) return;
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
  };

  const getPackage = (tab) => {
    const key = tab?.dataset.weightKey;
    return key ? PACKAGES[key] : null;
  };

  /** Один блок цены: арт + цена + старая цена по выбранной граммовке */
  const renderOffer = (pkg) => {
    if (!pkg) return;

    const discount = calcDiscount(pkg.price, pkg.oldPrice);

    if (skuEl) skuEl.textContent = pkg.sku;
    if (metaSku) metaSku.setAttribute("content", pkg.sku);
    if (metaPrice) metaPrice.setAttribute("content", String(pkg.price));

    if (priceEl) {
      priceEl.textContent = formatPrice(pkg.price);
      replayAnim(priceEl);
    }

    if (oldPriceEl) {
      if (pkg.oldPrice > pkg.price) {
        oldPriceEl.textContent = formatPrice(pkg.oldPrice);
        oldPriceEl.hidden = false;
        oldPriceEl.classList.remove("is-hidden");
        replayAnim(oldPriceEl);
      } else {
        oldPriceEl.hidden = true;
        oldPriceEl.classList.add("is-hidden");
      }
    }

    if (badgeEl) {
      if (discount > 0) {
        badgeEl.textContent = `−${discount}%`;
        badgeEl.hidden = false;
        badgeEl.classList.remove("is-hidden");
        replayAnim(badgeEl, "is-animating");
      } else {
        badgeEl.hidden = true;
        badgeEl.classList.add("is-hidden");
      }
    }

    if (skuWrap) {
      skuWrap.classList.add("is-updating");
      window.setTimeout(() => skuWrap.classList.remove("is-updating"), 280);
    }

    root.dataset.activeWeight = pkg.weight;
  };

  const activateTab = (tab, { focus = false } = {}) => {
    if (!tab) return;

    const pkg = getPackage(tab);
    if (!pkg) return;

    tabs.forEach((btn) => {
      const isActive = btn === tab;
      btn.classList.toggle(ACTIVE, isActive);
      btn.setAttribute("aria-selected", String(isActive));
      btn.tabIndex = isActive ? 0 : -1;
    });

    if (panel) {
      panel.setAttribute("aria-labelledby", tab.id);
    }

    renderOffer(pkg);

    if (focus) tab.focus();
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab));
  });

  if (tablist) {
    tablist.addEventListener("keydown", (event) => {
      const currentIndex = tabs.findIndex((t) => t.classList.contains(ACTIVE));
      let nextIndex = currentIndex;

      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          nextIndex = (currentIndex + 1) % tabs.length;
          break;
        case "ArrowLeft":
        case "ArrowUp":
          nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
          break;
        case "Home":
          nextIndex = 0;
          break;
        case "End":
          nextIndex = tabs.length - 1;
          break;
        default:
          return;
      }

      event.preventDefault();
      activateTab(tabs[nextIndex], { focus: true });
    });
  }

  let cartTimer = null;

  if (cartBtn) {
    cartBtn.addEventListener("click", () => {
      const active = tabs.find((t) => t.classList.contains(ACTIVE));
      const pkg = getPackage(active);

      cartBtn.classList.add(ADDED);
      if (cartText) cartText.textContent = "Добавлено";

      window.clearTimeout(cartTimer);
      cartTimer = window.setTimeout(() => {
        cartBtn.classList.remove(ADDED);
        if (cartText) cartText.textContent = "В корзину";
      }, 1600);

      console.info(`[Teaboom] В корзину: Ананасовый улун, ${pkg?.weight || ""}`);
    });
  }

  const initial = tabs.find((t) => t.classList.contains(ACTIVE)) || tabs[0];
  activateTab(initial);
})();
