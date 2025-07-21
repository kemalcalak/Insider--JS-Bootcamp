$(document).ready(function () {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let allProducts = [];
  let currentCategory = "all";
  let searchTimeout;
  let isCartVisible = true;

  $.fn.customFadeIn = function (duration = 400) {
    return this.each(function () {
      $(this).css("opacity", 0).show().animate({ opacity: 1 }, duration);
    });
  };

  $.fn.pulseEffect = function () {
    return this.each(function () {
      $(this).addClass("pulse");
      setTimeout(() => $(this).removeClass("pulse"), 600);
    });
  };

  $.fn.cartPlugin = function (options) {
    const settings = $.extend(
      {
        addText: "Sepete Ekle",
        removeText: "Sil",
        animation: true,
      },
      options
    );

    return this.each(function () {
      const $element = $(this);

      $element.on("click", ".add-cart", function () {
        if (settings.animation) {
          $(this).pulseEffect();
        }
      });
    });
  };

  function throttle(func, delay) {
    let lastCall = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func.apply(this, args);
      }
    };
  }

  function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  function createCarousel() {
    const carouselImages = [
      "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
      "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",
      "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg",
      "https://fakestoreapi.com/img/71kWymZ+c+L._AC_SX679_.jpg",
      "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg",
    ];

    let carouselHtml = "";
    carouselImages.forEach((url, index) => {
      carouselHtml += `<a data-fancybox="gallery" href="${url}">
        <img src="${url}" alt="Carousel ${index + 1}" />
      </a>`;
    });

    $("#carousel").html(carouselHtml);

    $("#carousel img").each(function (index) {
      $(this)
        .delay(index * 100)
        .customFadeIn();
    });
  }

  function createCategoryFilters() {
    $.get("https://fakestoreapi.com/products/categories")
      .done(function (categories) {
        let filterHtml =
          '<button class="category-btn active" data-category="all">Tümü</button>';

        const categoryNames = {
          "men's clothing": "Erkek Giyim",
          "women's clothing": "Kadın Giyim",
          jewelery: "Mücevher",
          electronics: "Elektronik",
        };

        categories.forEach((category) => {
          const displayName = categoryNames[category] || category;
          filterHtml += `<button class="category-btn" data-category="${category}">
            ${displayName}
          </button>`;
        });

        $("#categoryFilters").html(filterHtml).hide().slideDown(300);
      })
      .fail(function () {
        $("#categoryFilters").html("<em>Kategoriler yüklenemedi.</em>");
      });
  }

  function convertToTL(usdPrice) {
    const exchangeRate = 32.5;
    return Math.round(usdPrice * exchangeRate);
  }

  function fetchProducts(queryId = null, category = "all") {
    $("#loading").show();

    let url = "https://fakestoreapi.com/products";
    if (queryId) {
      url += "/" + queryId;
    } else if (category !== "all") {
      url += "/category/" + encodeURIComponent(category);
    }

    return $.ajax({
      url: url,
      method: "GET",
      timeout: 10000,
    })
      .done(function (data) {
        allProducts = Array.isArray(data) ? data : [data];
        renderProducts(allProducts);
      })
      .fail(function (xhr, status, error) {
        $(
          "#productList"
        ).html(`<div style="text-align:center;color:#dc3545;padding:40px;">
        <h3>Ürünler yüklenemedi</h3>
        <p>Hata: ${error || "Bilinmeyen hata"}</p>
        <button onclick="location.reload()" style="margin-top:15px;padding:10px 20px;background:#667eea;color:white;border:none;border-radius:5px;cursor:pointer;">Yeniden Dene</button>
      </div>`);
      })
      .always(function () {
        $("#loading").hide();
      });
  }

  function createProductCard(product) {
    const priceTL = convertToTL(product.price);
    return `<div class="product-card fade-in-up" data-id="${
      product.id
    }" data-category="${product.category}" style="display:none;">
      <a data-fancybox="gallery" href="${product.image}">
        <img src="${product.image}" alt="${product.title}" />
      </a>
      <div>
        <h3>${product.title}</h3>
        <p>${product.description.substring(0, 100)}...</p>
        <span class="price">${priceTL} TL</span>
        <div class="buttons">
          <button class="addToCartBtn">Sepete Ekle</button>
          <button class="showDetailBtn">Detay Göster</button>
        </div>
      </div>
    </div>`;
  }

  function renderProducts(products) {
    $("#productList").empty();

    if (!products || products.length === 0) {
      $("#productList").html(
        '<div style="text-align:center;padding:40px;color:#666;"><h3>Ürün bulunamadı</h3></div>'
      );
      return;
    }

    const $template = $("<div>").html(createProductCard(products[0]));

    products.forEach((product, index) => {
      const $card = $template.clone().html(createProductCard(product));
      $("#productList").append($card);

      setTimeout(() => {
        $card.find(".product-card").show().customFadeIn(400);
      }, index * 100);
    });
  }

  function updateCartCount() {
    $("#cartCount").text(cart.length).pulseEffect();
  }

  function calculateCartTotal() {
    const total = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);
    $("#cartTotal").html(`<strong>Toplam: ${Math.round(total)} TL</strong>`);
    return total;
  }

  function renderCart() {
    const $cartContent = $("#cart");
    $cartContent.empty();

    if (cart.length === 0) {
      $cartContent.html(
        '<div style="text-align:center;padding:40px;color:#666;"><h3>Sepet Boş</h3><p>Ürün eklemek için yukarıdaki listeden seçim yapın.</p></div>'
      );
      $("#cartTotal").empty();
      return;
    }

    cart.forEach((item, index) => {
      const $cartItem = $(`<div class="cart-item" style="display:none;">
        <img src="${item.image}" alt="${item.title}" />
        <div class="info">
          <div class="title">${item.title}</div>
          <div class="price">${item.price} TL</div>
        </div>
        <button class="removeFromCartBtn" data-id="${item.id}">Sil</button>
      </div>`);

      $cartContent.append($cartItem);

      setTimeout(() => {
        $cartItem.slideDown(200);
      }, index * 50);
    });

    calculateCartTotal();
  }

  function addToCart(product) {
    if (cart.find((x) => x.id === product.id)) {
      alert("Bu ürün zaten sepetinizde!");
      return;
    }

    const priceTL = convertToTL(product.price);
    cart.push({
      id: product.id,
      title: product.title,
      price: priceTL,
      image: product.image,
    });

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    renderCart();

    $("body").append(
      '<div id="addToCartSuccess" style="position:fixed;top:20px;right:20px;background:#28a745;color:white;padding:15px;border-radius:5px;z-index:9999;display:none;">Ürün sepete eklendi!</div>'
    );
    $("#addToCartSuccess")
      .slideDown(200)
      .delay(2000)
      .slideUp(200, function () {
        $(this).remove();
      });
  }

  function removeFromCart(id) {
    cart = cart.filter((x) => x.id != id);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    renderCart();
  }

  function clearCart() {
    if (cart.length === 0) return;

    if (confirm("Sepeti tamamen temizlemek istediğiniz emin misiniz?")) {
      cart = [];
      localStorage.removeItem("cart");
      $("#cart")
        .children()
        .fadeOut(200, function () {
          updateCartCount();
          renderCart();
        });
    }
  }

  $("#categoryFilters").on("click", ".category-btn", function () {
    const category = $(this).data("category");
    currentCategory = category;

    $(".category-btn").removeClass("active");
    $(this).addClass("active");

    fetchProducts(null, category);
  });

  $("#productList").on("click", ".addToCartBtn", function () {
    const $card = $(this).closest(".product-card");
    const id = $card.data("id");

    $(this).pulseEffect().prop("disabled", true).text("Ekleniyor...");

    fetchProducts(id).done(function (product) {
      addToCart(product);

      setTimeout(() => {
        $card.find(".addToCartBtn").prop("disabled", false).text("Sepete Ekle");
        $card
          .animate(
            {
              backgroundColor: "#e8f5e8",
            },
            300
          )
          .animate(
            {
              backgroundColor: "transparent",
            },
            300
          );
      }, 500);
    });
  });

  $("#productList").on("click", ".showDetailBtn", function () {
    const $card = $(this).closest(".product-card");
    const id = $card.data("id");

    fetchProducts(id).done(function (product) {
      const priceTL = convertToTL(product.price);
      $.fancybox.open({
        src: `<div style='padding:30px;max-width:500px;text-align:center;'>
          <img src='${product.image}' style='width:100%;max-height:300px;object-fit:contain;margin-bottom:20px;border-radius:10px;'>
          <h2 style='color:#667eea;margin-bottom:15px;'>${product.title}</h2>
          <div style='background:#f8f9fa;padding:15px;border-radius:8px;margin-bottom:15px;text-align:left;'>
            <strong>Açıklama:</strong><br>
            ${product.description}
          </div>
          <div style='background:#f8f9fa;padding:15px;border-radius:8px;margin-bottom:20px;'>
            <strong>Kategori:</strong> ${product.category}<br>
            <strong>Puan:</strong> ${product.rating.rate}/5 (${product.rating.count} değerlendirme)
          </div>
          <div style='font-size:24px;color:#28a745;font-weight:bold;margin-bottom:20px;'>
            ${priceTL} TL
          </div>
          <button onclick="$.fancybox.close()" style='padding:12px 24px;background:#667eea;color:white;border:none;border-radius:5px;cursor:pointer;font-weight:bold;'>Kapat</button>
        </div>`,
        type: "html",
        animationEffect: "zoom",
        transitionEffect: "slide",
      });
    });
  });

  $("#productList").on(
    "mouseenter",
    ".product-card",
    throttle(function () {
      $(this).stop().animate(
        {
          transform: "translateY(-5px)",
          boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
        },
        200
      );
    }, 100)
  );

  $("#productList").on(
    "mouseleave",
    ".product-card",
    throttle(function () {
      $(this).stop().animate(
        {
          transform: "translateY(0)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        },
        200
      );
    }, 100)
  );

  $("#cart").on("click", ".removeFromCartBtn", function () {
    const id = $(this).data("id");
    const $item = $(this).closest(".cart-item");

    $item.fadeOut(200, function () {
      removeFromCart(id);
    });
  });

  $("#clearCartBtn").on("click", clearCart);

  $("#toggleCart").on("click", function () {
    const $cartContent = $(".cart-content");
    const $cartTotal = $("#cartTotal");

    if (isCartVisible) {
      $cartContent.slideUp(300);
      $cartTotal.slideUp(300);
      $(this).text("Sepeti Göster");
    } else {
      $cartContent.slideDown(300);
      $cartTotal.slideDown(300);
      $(this).text("Sepeti Gizle");
    }

    isCartVisible = !isCartVisible;
  });

  $("#resetSearch").on("click", function () {
    $("#searchInput").val("");
    fetchProducts(null, currentCategory);
  });

  const debouncedSearch = debounce(function (value) {
    if (!value) {
      fetchProducts(null, currentCategory);
      return;
    }

    fetchProducts(value).fail(function () {
      $(
        "#productList"
      ).html(`<div style="text-align:center;padding:40px;color:#dc3545;">
        <h3>Ürün bulunamadı</h3>
        <p>ID: ${value} için ürün bulunamadı.</p>
        <button id="backToList" style="margin-top:15px;padding:10px 20px;background:#667eea;color:white;border:none;border-radius:5px;cursor:pointer;">Listeye Dön</button>
      </div>`);

      $("#productList").on("click", "#backToList", function () {
        $("#searchInput").val("");
        fetchProducts(null, currentCategory);
      });
    });
  }, 500);

  $("#searchForm").on("submit", function (e) {
    e.preventDefault();
    const value = $("#searchInput").val().trim();
    debouncedSearch(value);
  });

  const throttledSearch = throttle(function () {
    const value = $("#searchInput").val().trim();
    if (value.length >= 1) {
      debouncedSearch(value);
    }
  }, 800);

  $("#searchInput").on("input", throttledSearch);

  function init() {
    console.log("Mini E-Ticaret Uygulaması Başlatılıyor...");

    createCarousel();

    createCategoryFilters();

    fetchProducts();

    updateCartCount();
    renderCart();

    $("#productList").cartPlugin();

    console.log("Uygulama başarıyla yüklendi!");
  }

  init();

  $(window).scroll(
    throttle(function () {
      const scrollTop = $(window).scrollTop();

      if (scrollTop > 200) {
        if (!$("#backToTop").length) {
          $("body").append(`
          <button id="backToTop" style="position:fixed;bottom:20px;right:20px;background:#667eea;color:white;border:none;border-radius:50%;width:50px;height:50px;cursor:pointer;z-index:9999;display:none;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
            ↑
          </button>
        `);

          $("#backToTop")
            .fadeIn(200)
            .on("click", function () {
              $("html, body").animate({ scrollTop: 0 }, 500);
            });
        }
      } else {
        $("#backToTop").fadeOut(200);
      }
    }, 200)
  );

  $(window).on("beforeunload", function () {
    localStorage.setItem("cart", JSON.stringify(cart));
  });
});
