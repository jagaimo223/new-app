export function initializeEditor() {
    console.log("画像エディターが初期化されました");
}

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

        const mat = cv.imread(canvas);
        mat.delete();
    };

    function detectEdgesInSelection() {
        const sx = Math.min(edgeStartX, edgeEndX);
        const sy = Math.min(edgeStartY, edgeEndY);
        const w = Math.abs(edgeEndX - edgeStartX);
        const h = Math.abs(edgeEndY - edgeStartY);
    
        if (w === 0 || h === 0) return;
    
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tempCtx = tempCanvas.getContext("2d");
        const selectedImageData = ctx.getImageData(sx, sy, w, h);
        tempCtx.putImageData(selectedImageData, 0, 0);
    
        const src = cv.imread(tempCanvas);
        const gray = new cv.Mat();
        const blurred = new cv.Mat();
        const thresh = new cv.Mat();
        const rgba = new cv.Mat();
    

        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
        cv.adaptiveThreshold(
            gray, thresh,
            255,
            cv.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv.THRESH_BINARY,
            13, 4
          );
        cv.cvtColor(thresh, rgba, cv.COLOR_GRAY2RGBA);
        const resultImageData = new ImageData(new Uint8ClampedArray(rgba.data), rgba.cols, rgba.rows);
        ctx.putImageData(resultImageData, sx, sy);
    
        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();
        cv.findContours(thresh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    
        for (let i = 0; i < contours.size(); i++) {
            const contour = contours.get(i);
            const area = cv.contourArea(contour);
            if (area > 500 && area < canvas.width * canvas.height * 0.9) {
                contour.delete();
                continue;
            }

            const mask = [];
            for (let j = 0; j < contour.data32S.length; j += 2) {
                const x = contour.data32S[j];
                const y = contour.data32S[j + 1];
                mask.push({ x: x + sx, y: y + sy });
            }
    
            if (mask.length > 2) {
                selectionPaths.push(mask);
    
                mask.forEach(point => {
                    ctx.fillStyle = "rgba(228, 12, 12, 0.5)";
                    ctx.fillRect(point.x, point.y, 1, 1);
                });
            }
    
            contour.delete();
        }
    
        contours.delete();
        hierarchy.delete();
        src.delete();
        gray.delete();
        blurred.delete();
        thresh.delete();
        rgba.delete();
    }
    

    function toggleModeButtons(activeMode) {
        const manualBtn = document.getElementById("manualModeBtn");
        const autoBtn = document.getElementById("autoEdgeModeBtn");
    
        if (!manualBtn || !autoBtn) return;
    
        manualBtn.classList.toggle("active", activeMode === "manual");
        autoBtn.classList.toggle("active", activeMode === "auto");
    }
    

    let maskMode = "manual";
    let edgeSelecting = false;
    let edgeStartX, edgeStartY, edgeEndX, edgeEndY;

    document.getElementById("manualModeBtn").addEventListener("click",() => {
        maskMode = "manual";
        toggleModeButtons("manual");
    });

    document.getElementById("autoEdgeModeBtn").addEventListener("click", () => {
        maskMode ="auto";
        toggleModeButtons("auto");
    });

    canvas.addEventListener('mousedown', function (e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
    
        let x = (e.clientX - rect.left) * scaleX;
        let y = (e.clientY - rect.top) * scaleY;
    
        if (maskMode === "manual") {
            isDrawing = true;
            selectionPath = [{ x, y }];
            tempImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        } else if (maskMode === "auto") {
            edgeSelecting = true;
            edgeStartX = x;
            edgeStartY = y;
            tempImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
    });

    canvas.addEventListener('mousemove', function (e) {
        if (maskMode !== "manual" || !isDrawing) return;

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

    canvas.addEventListener('mouseup', function (e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
    
        let x = (e.clientX - rect.left) * scaleX;
        let y = (e.clientY - rect.top) * scaleY;
    
        if (maskMode === "manual" && isDrawing) {
            isDrawing = false;
            selectionPaths.push([...selectionPath]);
            ctx.setLineDash([]);
        } else if (maskMode === "auto" && edgeSelecting) {
            edgeSelecting = false;
            edgeEndX = x;
            edgeEndY = y;
    
            detectEdgesInSelection(); 
        }
    });
    


    applyColorButton.addEventListener("click", function () {
        if (!selectionPaths || selectionPaths.length === 0) {
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
                ctx.putImageData(tempImageData, 0, 0);
            });
        }
    });
    
    function applyColorFilter(hexColor) {
        if (!originalImage.src) {
            console.warn("画像が選択されていません");
            return;
        }
    
        const rgb = hexToRgb(hexColor);
        if (!rgb || selectionPaths.length === 0) return;
    
        ctx.putImageData(tempImageData, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
    
        selectionPaths.forEach(path => {
            if (path.length > 2) {
                const path2D = new Path2D();
                path2D.moveTo(path[0].x, path[0].y);
                path.forEach(p => path2D.lineTo(p.x, p.y));
                path2D.closePath();
    
                const minX = Math.floor(Math.min(...path.map(p => p.x)));
                const maxX = Math.ceil(Math.max(...path.map(p => p.x)));
                const minY = Math.floor(Math.min(...path.map(p => p.y)));
                const maxY = Math.ceil(Math.max(...path.map(p => p.y)));
    
                for (let y = minY; y <= maxY; y++) {
                    for (let x = minX; x <= maxX; x++) {
                        if (ctx.isPointInPath(path2D, x, y)) {
                            const index = (y * canvas.width + x) * 4;
                            if (index >= 0 && index + 2 < data.length) {
                                data[index] = (data[index] + rgb.r) / 2;
                                data[index + 1] = (data[index + 1] + rgb.g) / 2;
                                data[index + 2] = (data[index + 2] + rgb.b) / 2;
                            }
                        }
                    }
                }
            }
        });
    
        ctx.putImageData(imageData, 0, 0);
        canvasImage.value = canvas.toDataURL("image/png");
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

