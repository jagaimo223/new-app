document.addEventListener("DOMContentLoaded", function () {
    const imageInput = document.getElementById("imageInput");
    const canvas = document.getElementById("imageCanvas");
    const ctx = canvas.getContext("2d");
    const colorPicker = document.getElementById("colorPickerImage");
    const applyColorButton = document.getElementById("applyColor");
    const uploadButton = document.getElementById("uploadButton");
    const canvasImage = document.getElementById("canvasImage");
  
    let originalImage = new Image();
  
    const savedCanvasImage = sessionStorage.getItem("modifiedCanvasImage");
    if (savedCanvasImage) {
      originalImage.src = savedCanvasImage;
    } else {
      const savedImage = sessionStorage.getItem("uploadedImage");
      if (savedImage) {
        originalImage.src = savedImage;
      }
    }
  
    originalImage.onload = function () {
      canvas.width = originalImage.width / 2;
      canvas.height = originalImage.height / 2;
      ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
    };
  
    if (imageInput) {
      imageInput.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (e) {
            originalImage.src = e.target.result;
            sessionStorage.setItem("uploadedImage", e.target.result);
            sessionStorage.removeItem("modifiedCanvasImage");
          };
          reader.readAsDataURL(file);
        }
      });
    }
  
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
        data[i] = (data[i] + rgb.r) / 2;
        data[i + 1] = (data[i + 1] + rgb.g) / 2;
        data[i + 2] = (data[i + 2] + rgb.b) / 2;
      }
  
      ctx.putImageData(imageData, 0, 0);
  
      sessionStorage.setItem("modifiedCanvasImage", canvas.toDataURL());
    }
  
    function hexToRgb(hex) {
      if (!hex || hex.length !== 7) return null;
      const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
      return match
        ? { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) }
        : null;
    }
  
    if (colorPicker) {
      colorPicker.addEventListener("input", function () {
        applyColorFilter(colorPicker.value);
      });
    }
  
    if (applyColorButton) {
      applyColorButton.addEventListener("click", function () {
        applyColorFilter(colorPicker.value);
      });
    }
  
    if (uploadButton) {
      uploadButton.addEventListener("click", function () {
        canvasImage.value = canvas.toDataURL("image/png");
        uploadButton.closest("form").submit();
      });
    }
  });
  