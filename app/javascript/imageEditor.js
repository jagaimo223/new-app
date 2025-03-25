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
    let isDrawing = false;
    let selectionPath = [];
    let selectionPaths = [];
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
        isDrawing = true;
        selectionPath = []; 
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        let x = (e.clientX - rect.left) * scaleX;
        let y = (e.clientY - rect.top) * scaleY;

        tempImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    });

    canvas.addEventListener('mousemove', function (e) {
        if (!isDrawing) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        let x = (e.clientX - rect.left) * scaleX;
        let y = (e.clientY - rect.top) * scaleY;
        selectionPath.push({ x, y });


        ctx.putImageData(tempImageData, 0, 0);
        ctx.beginPath();
        ctx.moveTo(selectionPath[0].x, selectionPath[0].y);

        for (let i = 1; i < selectionPath.length; i++) {
            ctx.lineTo(selectionPath[i].x, selectionPath[i].y);
        }

        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"; 
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
    });

    document.addEventListener('mouseup', function () {
        if (isDrawing && selectionPath.length > 0) {
            selectionPaths.push([...selectionPath]);
        }
        isDrawing = false;
        ctx.setLineDash([]);
    });


    applyColorButton.addEventListener("click", function () {
        if (selectionPath.length === 0) { 
            console.warn("適用する範囲が選択されていません");
            return;
        }
        applyColorFilter(colorPicker.value);
    });

    document.addEventListener("DOMContentLoaded", function () {
        const clearSelectionButton = document.getElementById("clearSelectionButton");
        if (clearSelectionButton) {
            clearSelectionButton.addEventListener("click", function () {
                selectionPaths = [];
                ctx.putImageData(tempImageData, 0, 0); // 画像を復元
            });
        }
    });
    

    function applyColorFilter(hexColor) {
        if (!originalImage.src) {
            console.warn("画像が選択されていません");
            return;
        }
    
        const rgb = hexToRgb(hexColor);
        if (!rgb) return;
    
        ctx.putImageData(tempImageData, 0, 0);
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let data = imageData.data;
    
        selectionPaths.forEach(path => {
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            path.forEach(point => ctx.lineTo(point.x, point.y));
            ctx.closePath();
    
            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    if (ctx.isPointInPath(x, y)) {
                        let index = (y * canvas.width + x) * 4;
                        data[index] = (data[index] + rgb.r) / 2; // Red
                        data[index + 1] = (data[index + 1] + rgb.g) / 2; // Green
                        data[index + 2] = (data[index + 2] + rgb.b) / 2; // Blue
                    }
                }
            }
        });
    
        ctx.putImageData(imageData, 0, 0);
        canvasImage.value = canvas.toDataURL('image/png');
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

