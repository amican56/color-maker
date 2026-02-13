// グリッド設定
let gridWidth = 20;
let gridHeight = 20;
let cellSize = 25;
let currentColor = '#fef4f4'; // 桜色
let paintMode = 'cell'; // 'cell' または 'round'（段モード）
let hasBorder = true; // 縁取りの有無
let borderWidth = 1.5; // 縁取りの幅（通常の1.5倍）

// グリッドデータ（各セルの色を保存）
let gridData = [];

// 段ごとの色を保存
let roundColors = {};

// Canvas要素
const canvas = document.getElementById('knittingGrid');
const ctx = canvas.getContext('2d');

// カラーパレット（日本の伝統色）
const colors = [
    { color: '#ffffff', name: '白' },
    { color: '#2b2b2b', name: '黒' },
    { color: '#fef4f4', name: '桜色' },
    { color: '#f09199', name: '桃色' },
    { color: '#d7003a', name: '紅' },
    { color: '#b7282e', name: '茜色' },
    { color: '#ee7800', name: '橙色' },
    { color: '#f39800', name: '金茶' },
    { color: '#f8b500', name: '山吹色' },
    { color: '#ffd900', name: '黄色' },
    { color: '#e6b422', name: '黄金' },
    { color: '#c3d825', name: '若草色' },
    { color: '#3eb370', name: '緑' },
    { color: '#00a381', name: '花緑青' },
    { color: '#38b48b', name: '翡翠色' },
    { color: '#00a497', name: '青緑' },
    { color: '#00a3af', name: '浅葱色' },
    { color: '#2ca9e1', name: '天色' },
    { color: '#0095d9', name: '青' },
    { color: '#165e83', name: '藍色' },
    { color: '#19448e', name: '瑠璃紺' },
    { color: '#4d5aaf', name: '花色' },
    { color: '#674196', name: '菖蒲色' },
    { color: '#884898', name: '紫' },
    { color: '#9d5b8b', name: '京紫' },
    { color: '#895b8a', name: '古代紫' },
    { color: '#cd8c5c', name: '江戸茶' },
    { color: '#965042', name: '茶色' },
    { color: '#a6a5c4', name: '藤鼠' },
    { color: '#949495', name: '鼠色' },
    { color: '#c8c2c6', name: '霞色' },
    { color: '#d3cbc6', name: '枯野色' },
];

// 初期化
function init() {
    createColorPalette();
    initGrid();
    drawGrid();
    setupEventListeners();
}

// カラーパレットを生成
function createColorPalette() {
    const paletteContainer = document.getElementById('colorPalette');
    paletteContainer.innerHTML = '';
    
    colors.forEach((item, index) => {
        const colorDiv = document.createElement('div');
        colorDiv.className = 'color-option';
        colorDiv.style.backgroundColor = item.color;
        colorDiv.dataset.color = item.color;
        
        // 色名とカラーコードを表示
        const nameSpan = document.createElement('span');
        nameSpan.className = 'color-name';
        nameSpan.textContent = item.name;
        
        const codeSpan = document.createElement('span');
        codeSpan.className = 'color-code';
        codeSpan.textContent = item.color;
        
        colorDiv.appendChild(nameSpan);
        colorDiv.appendChild(codeSpan);
        
        // 背景色の明るさに応じて文字色を調整
        const brightness = getBrightness(item.color);
        if (brightness > 128) {
            colorDiv.style.color = '#333';
        } else {
            colorDiv.style.color = '#fff';
        }
        
        if (index === 2) { // デフォルトで桜色を選択
            colorDiv.classList.add('selected');
            currentColor = item.color;
        }
        
        colorDiv.addEventListener('click', () => selectColor(item.color, colorDiv));
        paletteContainer.appendChild(colorDiv);
    });
    
    updateCurrentColorDisplay();
}

// 色の明るさを計算（0-255）
function getBrightness(hexColor) {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
}

// セルがどの段に属するかを計算
function getRoundNumber(x, y) {
    const centerX = Math.floor(gridWidth / 2);
    const centerY = Math.floor(gridHeight / 2);
    return Math.max(Math.abs(x - centerX), Math.abs(y - centerY));
}

// 段全体を塗る
function paintRound(roundNum, color) {
    const centerX = Math.floor(gridWidth / 2);
    const centerY = Math.floor(gridHeight / 2);
    
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            if (getRoundNumber(x, y) === roundNum) {
                gridData[y][x] = color;
            }
        }
    }
    
    roundColors[roundNum] = color;
}

// 色を選択
function selectColor(color, element) {
    currentColor = color;
    
    // 選択状態を更新
    document.querySelectorAll('.color-option').forEach(el => {
        el.classList.remove('selected');
    });
    element.classList.add('selected');
    
    updateCurrentColorDisplay();
}

// 現在の色を表示
function updateCurrentColorDisplay() {
    const display = document.getElementById('currentColor');
    display.style.backgroundColor = currentColor;
    
    // 選択中の色名を表示
    const selectedColor = colors.find(item => item.color === currentColor);
    if (selectedColor) {
        display.innerHTML = `
            <div style="padding: 6px; text-align: center;">
                <div style="font-weight: bold; margin-bottom: 3px; font-size: 0.9em; ${getBrightness(currentColor) > 128 ? 'color: #333' : 'color: #fff'}">${selectedColor.name}</div>
                <div style="font-family: 'Courier New', monospace; font-size: 0.8em; ${getBrightness(currentColor) > 128 ? 'color: #555' : 'color: #eee'}">${selectedColor.color}</div>
            </div>
        `;
    }
}

// グリッドデータを初期化
function initGrid() {
    gridData = [];
    for (let y = 0; y < gridHeight; y++) {
        gridData[y] = [];
        for (let x = 0; x < gridWidth; x++) {
            gridData[y][x] = '#ffffff'; // 初期は白
        }
    }
}

// グリッドを描画
function drawGrid() {
    // 中心座標
    const centerX = Math.floor(gridWidth / 2);
    const centerY = Math.floor(gridHeight / 2);
    const maxRound = Math.max(centerX, centerY);
    
    // 縁取りを含めたサイズを計算
    const borderSize = hasBorder ? cellSize * borderWidth : 0;
    const totalBorder = borderSize * 2;
    
    canvas.width = gridWidth * cellSize + totalBorder;
    canvas.height = gridHeight * cellSize + totalBorder;
    
    // 背景（縁取り）を描画
    if (hasBorder) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 最外周の段の色を縁取りの色として使う
        const outerRoundColor = roundColors[maxRound] || '#ffffff';
        ctx.fillStyle = outerRoundColor;
        
        // 角丸の四角形で縁取りを描画
        const cornerRadius = cellSize;
        roundRect(ctx, 0, 0, canvas.width, canvas.height, cornerRadius, true, false);
        
        // 内側の白い部分（角丸）
        ctx.fillStyle = '#ffffff';
        const innerMargin = borderSize;
        const innerWidth = canvas.width - innerMargin * 2;
        const innerHeight = canvas.height - innerMargin * 2;
        roundRect(ctx, innerMargin, innerMargin, innerWidth, innerHeight, cornerRadius * 0.7, true, false);
    }
    
    // 各セルを描画
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const posX = x * cellSize + borderSize;
            const posY = y * cellSize + borderSize;
            
            // セルの色を塗る（少し角丸に）
            ctx.fillStyle = gridData[y][x];
            roundRect(ctx, posX + 1, posY + 1, cellSize - 2, cellSize - 2, 4, true, false);
            
            // 薄いグリッド線
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(posX, posY, cellSize, cellSize);
        }
    }
    
    // 段の境界線を描画（太線）
    drawRoundBorders(centerX, centerY, borderSize);
}

// 角丸四角形を描画
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}

// 段の境界線を描画
function drawRoundBorders(centerX, centerY, borderSize) {
    const maxRounds = Math.max(centerX, centerY, gridWidth - centerX, gridHeight - centerY);
    
    ctx.strokeStyle = '#999999';
    ctx.lineWidth = 2;
    
    for (let round = 1; round <= maxRounds; round++) {
        // 段の境界を正方形で描画
        const x1 = (centerX - round) * cellSize + borderSize;
        const y1 = (centerY - round) * cellSize + borderSize;
        const size = (round * 2 + 1) * cellSize;
        
        if (x1 >= borderSize && y1 >= borderSize) {
            ctx.strokeRect(x1, y1, size, size);
        }
    }
}

// イベントリスナーを設定
function setupEventListeners() {
    // 塗りモードの切り替え
    document.querySelectorAll('input[name="paintMode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            paintMode = e.target.value;
        });
    });
    
    // 縁取りの切り替え
    document.getElementById('hasBorder').addEventListener('change', (e) => {
        hasBorder = e.target.checked;
        drawGrid();
    });
    
    // グリッドのクリック
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const borderSize = hasBorder ? cellSize * borderWidth : 0;
        const x = Math.floor((e.clientX - rect.left - borderSize) / cellSize);
        const y = Math.floor((e.clientY - rect.top - borderSize) / cellSize);
        
        if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
            if (paintMode === 'round') {
                // 段モード：段全体を塗る
                const roundNum = getRoundNumber(x, y);
                paintRound(roundNum, currentColor);
            } else {
                // 通常モード：1マスだけ塗る
                gridData[y][x] = currentColor;
            }
            drawGrid();
        }
    });
    
    // グリッドの右クリック（色を消す）
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        
        const rect = canvas.getBoundingClientRect();
        const borderSize = hasBorder ? cellSize * borderWidth : 0;
        const x = Math.floor((e.clientX - rect.left - borderSize) / cellSize);
        const y = Math.floor((e.clientY - rect.top - borderSize) / cellSize);
        
        if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
            gridData[y][x] = '#ffffff'; // 白に戻す
            drawGrid();
        }
    });
    
    // ドラッグで連続塗り
    let isDrawing = false;
    let lastPaintedRound = -1;
    
    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        lastPaintedRound = -1;
    });
    
    canvas.addEventListener('mouseup', () => {
        isDrawing = false;
        lastPaintedRound = -1;
    });
    
    canvas.addEventListener('mouseleave', () => {
        isDrawing = false;
        lastPaintedRound = -1;
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        
        const rect = canvas.getBoundingClientRect();
        const borderSize = hasBorder ? cellSize * borderWidth : 0;
        const x = Math.floor((e.clientX - rect.left - borderSize) / cellSize);
        const y = Math.floor((e.clientY - rect.top - borderSize) / cellSize);
        
        if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
            if (paintMode === 'round') {
                // 段モード：同じ段を重複して塗らない
                const roundNum = getRoundNumber(x, y);
                if (roundNum !== lastPaintedRound) {
                    paintRound(roundNum, currentColor);
                    lastPaintedRound = roundNum;
                    drawGrid();
                }
            } else {
                // 通常モード
                gridData[y][x] = currentColor;
                drawGrid();
            }
        }
    });
    
    // クリアボタン
    document.getElementById('clearBtn').addEventListener('click', () => {
        if (confirm('グリッドをクリアしますか？')) {
            initGrid();
            roundColors = {};
            drawGrid();
        }
    });
    
    // 保存ボタン
    document.getElementById('saveBtn').addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'knitting-design.png';
        link.href = canvas.toDataURL();
        link.click();
    });
    
    // グリッドサイズ変更
    document.getElementById('resizeBtn').addEventListener('click', () => {
        const newWidth = parseInt(document.getElementById('gridWidth').value);
        const newHeight = parseInt(document.getElementById('gridHeight').value);
        
        if (newWidth >= 5 && newWidth <= 50 && newHeight >= 5 && newHeight <= 50) {
            gridWidth = newWidth;
            gridHeight = newHeight;
            initGrid();
            roundColors = {};
            drawGrid();
        } else {
            alert('グリッドサイズは5〜50の範囲で指定してください');
        }
    });
}

// ページ読み込み時に初期化
window.addEventListener('load', init);