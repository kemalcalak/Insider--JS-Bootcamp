$(function () {
  let start = 0;
  const limit = 5;
  let loading = false;

  function loadPosts() {
    loading = true;
    $("#loader").show().text("Yükleniyor…");
    $.get(
      `https://jsonplaceholder.typicode.com/posts?_start=${start}&_limit=${limit}`
    )
      .done(function (data) {
        if (data.length) {
          data.forEach((post) => {
            $("#postContainer").append(`
              <div class="post">
                <h3>${post.title}</h3>
                <p>${post.body}</p>
              </div>
            `);
          });
          start += limit;
          $("#loader").hide();
        } else {
          $("#loader").text("Tüm gönderiler yüklendi.");
          $(window).off("scroll");
        }
      })
      .fail(function () {
        $("#loader").text("Gönderiler yüklenemedi. Lütfen yeniden deneyin.");
      })
      .always(function () {
        loading = false;
      });
  }

  loadPosts();

  $(window).on("scroll", function () {
    if (loading) return;
    if (
      $(window).scrollTop() + $(window).height() >
      $(document).height() - 100
    ) {
      loadPosts();
    }
  });
});
