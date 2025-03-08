document.addEventListener("DOMContentLoaded", function () {
    const imageInput = document.getElementById("imageInput");
    const canvas = document.getElementById("imageCanvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const colorPicker = document.getElementById("colorPickerImage"); 
    const applyColorButton = document.getElementById("applyColor");
    const uploadButton = document.getElementById("uploadButton");
    const canvasImage = document.getElementById("canvasImage");
    const colorInput = document.getElementById("colorInput");
    const searchForm = document.getElementById("colorSearchForm");
    const selectedHex = document.getElementById("selectedHex");
    const selectedRgb = document.getElementById("selectedRgb");
    const searchResults = document.getElementById("searchResults");
  
    let originalImage = new Image();
  
    const savedImage = sessionStorage.getItem("uploadedImage");
    if (savedImage) {
      originalImage.src = savedImage;
    }
  
    if (imageInput) {
      imageInput.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (e) {
            originalImage.src = e.target.result;
            sessionStorage.setItem("uploadedImage", e.target.result);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  
    originalImage.onload = function () {
      canvas.width = originalImage.width / 2;
      canvas.height = originalImage.height / 2;
      ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
    };
  
    function applyColorFilter(hexColor) {
      if (!originalImage.src) {
        console.warn("画像が選択されていません");
        return;
      }
  
      ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
  
      const rgb = hexToRgb(hexColor);
      if (!rgb) return;
  
      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let data = imageData.data;
  
      for (let i = 0; i < data.length; i += 4) {
        data[i] = (data[i] + rgb.r) / 2; // Red
        data[i + 1] = (data[i + 1] + rgb.g) / 2; // Green
        data[i + 2] = (data[i + 2] + rgb.b) / 2; // Blue
      }
  
      ctx.putImageData(imageData, 0, 0);
    }
  
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
        colorInput.value = `(${rgb.r}, ${rgb.g}, ${rgb.b})`; 
      }
    }
  
    if (colorPicker) {
      colorPicker.addEventListener("input", function () {
        applyColorFilter(colorPicker.value);
        updateColorDisplay();
      });
  
      updateColorDisplay();
    }
  
    if (applyColorButton) {
      applyColorButton.addEventListener("click", function () {
        applyColorFilter(colorPicker.value);
        updateColorDisplay();
      });
    }
  
    if (uploadButton) {
      uploadButton.addEventListener("click", function () {
        canvasImage.value = canvas.toDataURL("image/png"); 
        uploadButton.closest("form").submit();
      });
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
  