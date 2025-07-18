$(function () {
  function fetchUsers(count) {
    $.ajax({
      url: "https://randomuser.me/api/",
      data: { results: count, nat: "us,gb,fr,de,tr" },
      dataType: "json",
      success: function (res) {
        $("#profile-container, #slider-container").empty();

        if ($("#slider-container").hasClass("slick-initialized")) {
          $("#slider-container").slick("unslick");
        }

        res.results.forEach(function (user, idx) {
          var card = $(`
            <div class="profile-card">
              <a href="#modal-${idx}" data-fancybox>
                <img src="${user.picture.large}" alt="Profil">
                <h3>${user.name.first} ${user.name.last}</h3>
                <p>${user.email}</p>
                <p>${user.location.country}</p>
              </a>
              <div style="display:none" id="modal-${idx}">
                <h2>${user.name.title} ${user.name.first} ${user.name.last}</h2>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Şehir:</strong> ${user.location.city}</p>
                <p><strong>Telefon:</strong> ${user.phone}</p>
              </div>
            </div>
          `);

          $("#profile-container").append(card);
          card.delay(idx * 100).animate({ opacity: 1, top: 0 }, 600, "swing");

          card.hover(
            () => card.addClass("hover"),
            () => card.removeClass("hover")
          );

          card.on("click", function () {
            card.addClass("shake");
            setTimeout(() => card.removeClass("shake"), 500);
          });

          var sliderCard = card.clone();
          sliderCard.find("a").removeAttr("data-fancybox").removeAttr("href");
          sliderCard.css({ opacity: 1, top: 0 });

          $("#slider-container").append(sliderCard);
        });

        $("[data-fancybox]").fancybox({ buttons: ["close"] });

        setTimeout(function () {
          $("#slider-container").slick({
            slidesToShow: 3,
            slidesToScroll: 1,
            infinite: true,
            dots: true,
            arrows: false,
            adaptiveHeight: false,
            autoplay: false,
            responsive: [
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 2,
                  slidesToScroll: 1,
                },
              },
              {
                breakpoint: 600,
                settings: {
                  slidesToShow: 1,
                  slidesToScroll: 1,
                },
              },
            ],
          });
        }, 100);
      },
      error: function () {
        alert("Kullanıcılar yüklenirken hata oluştu.");
      },
    });
  }

  fetchUsers(10);
  $("#load-users").on("click", () => fetchUsers(10));
});
