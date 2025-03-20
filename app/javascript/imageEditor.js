document.addEventListener("DOMContentLoaded", function () {
    const imageInput = document.getElementById("imageInput");
    const canvas = document.getElementById("imageCanvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const colorPicker = document.getElementById("colorPickerImage"); 
    const applyColorButton = document.getElementById("applyColorButton");
    const uploadButton = document.getElementById("uploadButton");
    const canvasImage = document.getElementById("canvasImage");
    const colorInput = document.getElementById("colorInput");
    const searchForm = document.getElementById("colorSearchForm");
    const selectedHex = document.getElementById("selectedHex");
    const selectedRgb = document.getElementById("selectedRgb");
    const searchResults = document.getElementById("searchResults");
  
    let originalImage = new Image();
    let isDragging = false;
    let selectionActive = false;
    let startX, startY, endX, endY;
    let tempImageData = null;
    

  
    const userImageUrl = document.getElementById("userImageUrl");
    if (userImageUrl && userImageUrl.value) {
        originalImage.src = userImageUrl.value;
    }

    if (imageInput) {
        imageInput.addEventListener("change", function (event) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
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

    canvas.addEventListener('mousedown', function (e) {
        isDragging = true;
        selectionActive = false; 
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        startX = (e.clientX - rect.left) * scaleX;
        startY = (e.clientY - rect.top) * scaleY;

        tempImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    });

    canvas.addEventListener('mousemove', function (e) {
        if (!isDragging) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        endX = (e.clientX - rect.left) * scaleX;
        endY = (e.clientY - rect.top) * scaleY;


        ctx.putImageData(tempImageData, 0, 0);
        ctx.strokeStyle = "rgba(255, 255, 255, 1)";
        ctx.lineWidth = 1;
        ctx.strokeRect(startX, startY, endX - startX, endY - startY);
    });

    document.addEventListener('mouseup', function () {
        if (isDragging ){
        isDragging = false;
        selectionActive = true; 
        }

        if (Math.abs(endX - startX) < 2 || Math.abs(endY - startY) < 2) {
            console.warn("選択範囲が小さすぎます");
            selectionActive = false;
        }
    });

    canvas.addEventListener('mouseleave', function () {
        if (isDragging){
            isDragging =false;
            selectionActive =false;
        }
    });


    applyColorButton.addEventListener("click", function () {
        if (!selectionActive) {
            console.warn("適用する範囲が選択されていません");
            return;
        }
        applyColorFilter(colorPicker.value, startX, startY, endX, endY);
        selectionActive = false;

    });

    function applyColorFilter(hexColor, x1, y1, x2, y2) {
        if (!originalImage.src) {
            console.warn("画像が選択されていません");
            return;
        }

        const rgb = hexToRgb(hexColor);
        if (!rgb) return;


        let left = Math.min(x1, x2);
        let top = Math.min(y1, y2);
        let width = Math.abs(x2 - x1);
        let height = Math.abs(y2 - y1);

        if (isNaN(left) || isNaN(top) || isNaN(width) || isNaN(height)) {
            console.error("無効な選択範囲:", { left, top, width, height });
            return;
        }

        if (width === 0 || height === 0) {
            console.warn("選択範囲が無効 (幅または高さが0)");
            return;
        }

        try {
            let imageData = ctx.getImageData(left, top, width, height);
            let data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                data[i] = (data[i] + rgb.r) / 2;
                data[i + 1] = (data[i + 1] + rgb.g) / 2;
                data[i + 2] = (data[i + 2] + rgb.b) / 2;
            }

            ctx.putImageData(imageData, left, top);
            tempImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            canvasImage.value = canvas.toDataURL('image/png');
        } catch (error) {
            console.error("getImageData の実行中にエラーが発生:", error);
        }
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

