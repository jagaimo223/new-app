# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"
pin "@rails/ujs", to: "@rails--ujs.js" # @7.1.3
pin "application"
pin "imageEditor", to: "imageEditor.js", preload: true
pin "pageReload", to: "pageReload.js", preload: true
pin "paintSearch", to: "paintSearch.js", preload: true
