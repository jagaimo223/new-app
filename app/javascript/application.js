import "@hotwired/turbo-rails";
import "controllers";
import Rails from "@rails/ujs";

Rails.start();

document.addEventListener("DOMContentLoaded", function () {
  const imageInput = document.getElementById("imageInput");
  const canvas = document.getElementById("imageCanvas");
  const ctx = canvas.getContext("2d");
  const colorPicker = document.getElementById("colorPicker");
  const applyColorButton = document.getElementById("applyColor");
  const uploadButton = document.getElementById("uploadButton");
  const canvasImage = document.getElementById("canvasImage");

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
    canvas.width = originalImage.width / 2; // 適宜サイズ調整
    canvas.height = originalImage.height / 2;
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
  };

  function applyColorFilter(hexColor) {
    if (!originalImage.src) {
      console.warn("画像が選択されていません");
      return;
    }

    // 画像を再描画
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

    // HEX → RGB 変換
    const rgb = hexToRgb(hexColor);
    if (!rgb) return;

    // 画像データを取得
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    // ピクセルごとにカラーを変更
    for (let i = 0; i < data.length; i += 4) {
      data[i] = (data[i] + rgb.r) / 2; // Red
      data[i + 1] = (data[i + 1] + rgb.g) / 2; // Green
      data[i + 2] = (data[i + 2] + rgb.b) / 2; // Blue
    }

    // 新しい画像を適用
    ctx.putImageData(imageData, 0, 0);
  }

  if (colorPicker && applyColorButton) {
    colorPicker.addEventListener("input", function () {
      applyColorFilter(colorPicker.value);
    });

    applyColorButton.addEventListener("click", function () {
      applyColorFilter(colorPicker.value);
    });
  }

  if (uploadButton) {
    uploadButton.addEventListener("click", function () {
      canvasImage.value = canvas.toDataURL("image/png"); // Canvasの画像データを送信
      uploadButton.closest("form").submit();
    });
  }

  function hexToRgb(hex) {
    const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    return match
      ? { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) }
      : null;
  }
});
