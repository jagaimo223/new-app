import "@hotwired/turbo-rails";
import "controllers";
import Rails from "@rails/ujs";

Rails.start();

document.addEventListener("DOMContentLoaded", function () {
  const imageInput = document.getElementById("imageInput");
  const canvas = document.getElementById("imageCanvas");
  const ctx = canvas.getContext("2d");
  const colorPicker = document.getElementById("colorPickerImage"); 
  const applyColorButton = document.getElementById("applyColor");
  const uploadButton = document.getElementById("uploadButton");
  const canvasImage = document.getElementById("canvasImage");
  const colorInput = document.getElementById("colorInput"); // 二重定義を削除
  const searchForm = document.getElementById("colorSearchForm");
  const selectedHex = document.getElementById("selectedHex");
  const selectedRgb = document.getElementById("selectedRgb");

  let originalImage = new Image();

  if (imageInput) {
    imageInput.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          originalImage.src = e.target.result;
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
      colorInput.value = `(${rgb.r}, ${rgb.g}, ${rgb.b})`; // 検索用のhidden inputにもセット
    }
  }

  if (colorPicker) {
    colorPicker.addEventListener("input", function () {
      applyColorFilter(colorPicker.value);
      updateColorDisplay(); // HEXとRGB表示も更新
    });

    updateColorDisplay(); // 初期値を表示
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
      updateColorDisplay(); // 送信直前に最新の値をセット
      if (!colorInput.value || colorInput.value === "()") {
        event.preventDefault();
        alert("カラーピッカーで色を選択してください。");
      }
    });
  }
});
