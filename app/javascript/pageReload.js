window.addEventListener("pageshow", function (event) {
    if (event.persisted && window.location.pathname === "/dashboard") {
      location.reload();
    }
  });
  
  document.addEventListener("turbo:load", function () {
    if (window.location.pathname === "/dashboard") {
      if (sessionStorage.getItem("reloadDashboard")) {
        sessionStorage.removeItem("reloadDashboard");
        location.reload();
      }
    } else {
      sessionStorage.setItem("reloadDashboard", "true");
    }
  });
  