// JPSMRC admin — small progressive enhancements.
(function () {
  "use strict";

  // Warn before leaving a dirty form.
  document.querySelectorAll("form").forEach(function (form) {
    let dirty = false;
    form.addEventListener("input", function () {
      dirty = true;
    });
    form.addEventListener("submit", function () {
      dirty = false;
    });
    window.addEventListener("beforeunload", function (event) {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    });
  });

  // Show selected file names.
  document.querySelectorAll('input[type="file"]').forEach(function (input) {
    input.addEventListener("change", function () {
      const names = Array.prototype.map
        .call(input.files || [], function (file) {
          return file.name;
        })
        .join(", ");
      const hint = input.parentElement && input.parentElement.querySelector("small");
      if (hint && names) hint.textContent = names;
    });
  });

  // Keep date fields sane.
  const arrival = document.querySelector('input[name="arrival_date"]');
  if (arrival) arrival.min = new Date().toISOString().slice(0, 10);
})();
