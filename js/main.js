(() => {
  "use strict";

  const root = document.querySelector("[data-product]");
  if (!root) return;

  const options = [...root.querySelectorAll("[data-packaging-option]")];
  const skuEl = root.querySelector("[data-sku]");
  const priceEl = root.querySelector("[data-price]");
  const oldPriceEl = root.querySelector("[data-old-price]");
  const pricesWrap = root.querySelector("[data-prices]");
  const skuWrap = root.querySelector(".product-card__sku");
  const badgeEl = root.querySelector("[data-discount-badge]");
  const metaSku = root.querySelector("[data-meta-sku]");
  const metaPrice = root.querySelector("[data-meta-price]");
  const packagingList = root.querySelector(".product-card__packaging-list");
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
    // force reflow
    void el.offsetWidth;
    el.classList.add(className);
  };

  const selectOption = (option) => {
    if (!option || option.classList.contains(ACTIVE)) return;

    const { sku, price, oldPrice } = option.dataset;
    const priceNum = Number(price);
    const oldPriceNum = oldPrice ? Number(oldPrice) : null;
    const discount = calcDiscount(priceNum, oldPriceNum);

    options.forEach((btn) => {
      const isActive = btn === option;
      btn.classList.toggle(ACTIVE, isActive);
      btn.setAttribute("aria-selected", String(isActive));
    });

    if (packagingList) {
      packagingList.setAttribute("aria-activedescendant", option.id);
    }

    if (skuEl) skuEl.textContent = sku;
    if (metaSku) metaSku.setAttribute("content", sku);
    if (metaPrice) metaPrice.setAttribute("content", String(priceNum));

    if (priceEl) {
      priceEl.textContent = formatPrice(priceNum);
      replayAnim(priceEl);
    }

    if (oldPriceEl) {
      if (oldPriceNum && oldPriceNum > priceNum) {
        oldPriceEl.textContent = formatPrice(oldPriceNum);
        oldPriceEl.classList.remove("is-hidden");
        replayAnim(oldPriceEl);
      } else {
        oldPriceEl.classList.add("is-hidden");
      }
    }

    if (badgeEl) {
      if (discount > 0) {
        badgeEl.textContent = `−${discount}%`;
        badgeEl.classList.remove("is-hidden");
        replayAnim(badgeEl, "is-animating");
      } else {
        badgeEl.classList.add("is-hidden");
      }
    }

    if (skuWrap) {
      skuWrap.classList.add("is-updating");
      window.setTimeout(() => skuWrap.classList.remove("is-updating"), 280);
    }

    if (pricesWrap) {
      pricesWrap.dataset.weight = option.dataset.weight || "";
    }
  };

  options.forEach((option) => {
    option.addEventListener("click", () => selectOption(option));
  });

  // Keyboard for listbox
  if (packagingList) {
    packagingList.addEventListener("keydown", (event) => {
      const currentIndex = options.findIndex((o) => o.classList.contains(ACTIVE));
      let nextIndex = currentIndex;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = (currentIndex + 1) % options.length;
        event.preventDefault();
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex = (currentIndex - 1 + options.length) % options.length;
        event.preventDefault();
      } else if (event.key === "Home") {
        nextIndex = 0;
        event.preventDefault();
      } else if (event.key === "End") {
        nextIndex = options.length - 1;
        event.preventDefault();
      } else {
        return;
      }

      options[nextIndex].focus();
      selectOption(options[nextIndex]);
    });
  }

  // Fake add-to-cart feedback
  let cartTimer = null;

  if (cartBtn) {
    cartBtn.addEventListener("click", () => {
      const active = options.find((o) => o.classList.contains(ACTIVE));
      const weight = active?.dataset.weight || "";

      cartBtn.classList.add(ADDED);
      if (cartText) cartText.textContent = "Добавлено";

      window.clearTimeout(cartTimer);
      cartTimer = window.setTimeout(() => {
        cartBtn.classList.remove(ADDED);
        if (cartText) cartText.textContent = "В корзину";
      }, 1600);

      // subtle console for demo / QA
      console.info(`[Teaboom] В корзину: Ананасовый улун, ${weight}`);
    });
  }
})();
