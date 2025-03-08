document.addEventListener("DOMContentLoaded", function () {
    const colorPicker = document.getElementById("colorPickerImage");
    const colorInput = document.getElementById("colorInput");
    const searchForm = document.getElementById("colorSearchForm");
    const selectedHex = document.getElementById("selectedHex");
    const selectedRgb = document.getElementById("selectedRgb");
    const searchResults = document.getElementById("searchResults");
  
    function hexToRgb(hex) {
      if (!hex || hex.length !== 7) return null;
      const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
      return match
        ? { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) }
        : null;
    }
  
    function updateColorDisplay() {
      if (!colorPicker) return;
  
      const hex = colorPicker.value;
      const rgb = hexToRgb(hex);
  
      if (rgb) {
        selectedHex.textContent = hex;
        selectedRgb.textContent = `(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        colorInput.value = hex;
      }
    }
  
    if (colorPicker) {
      colorPicker.addEventListener("input", updateColorDisplay);
      updateColorDisplay();
    }
  
    if (searchForm) {
      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
  
        const formData = new FormData(searchForm);
        const colorValue = formData.get("color");
  
        fetch(`/dashboard/search_paints?color=${encodeURIComponent(colorValue)}`)
          .then(response => response.json())
          .then(data => {
            searchResults.innerHTML = "";
            if (data.error) {
              searchResults.innerHTML = `<p class="text-danger">${data.error}</p>`;
              return;
            }
            if (data.length === 0) {
              searchResults.innerHTML = "<p>該当する色はありません。</p>";
              return;
            }
  
            let tableHtml = `
              <div class="mt-4">
                <h3>検索結果</h3>
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>塗料名</th>
                      <th>RGB</th>
                      <th>色</th>
                      <th>メーカー</th>
                    </tr>
                  </thead>
                  <tbody>
            `;
  
            data.forEach(paint => {
              tableHtml += `
                <tr>
                  <td>${paint.name}</td>
                  <td>${paint.rgb_value}</td>
                  <td>
                    <div style="background-color: ${paint.hex_code}; width: 50px; height: 20px; border: 1px solid #000;"></div>
                  </td>
                  <td>${paint.maker}</td>
                </tr>
              `;
            });
            tableHtml += "</tbody></table></div>";
            searchResults.innerHTML = tableHtml;
          })
          .catch(error => {
            console.error("エラー:", error);
            searchResults.innerHTML = "<p class='text-danger'>エラーが発生しました。</p>";
          });
      });
    }
  });
  