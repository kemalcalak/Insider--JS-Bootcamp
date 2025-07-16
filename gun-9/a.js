var studentData = [
  { name: "Ali", class: "10A" },
  { name: "Kemal", class: "11B" },
  { name: "Çalak", class: "12C" },
];

function renderTable() {
  var $tbody = $("#studentTable tbody");
  $tbody.empty();
  $.each(studentData, function (index, student) {
    var $tr = $("<tr>");
    $tr.append($("<td>").text(student.name));
    $tr.append($("<td>").text(student.class));
    var $deleteBtn = $("<button>")
      .addClass("delete-btn")
      .text("Sil")
      .data("index", index);
    $tr.append($("<td>").append($deleteBtn));
    $tbody.append($tr);
  });
}

$(document).ready(function () {
  renderTable();

  $("#addStudentForm").on("submit", function (e) {
    e.preventDefault();
    var name = $("#nameInput").val().trim();
    var cls = $("#classInput").val().trim();
    if (name && cls) {
      studentData.push({ name: name, class: cls });
      renderTable();
      $("#nameInput, #classInput").val("");
    }
  });

  $("#studentTable").on("click", ".delete-btn", function (e) {
    e.stopPropagation();
    var idx = $(this).data("index");
    if (confirm("Bu öğrenciyi silmek istediğinize emin misiniz?")) {
      studentData.splice(idx, 1);
      renderTable();
    }
  });

  $("#studentTable").on("click", "tbody tr", function () {
    $(this).toggleClass("selected");
  });
});
