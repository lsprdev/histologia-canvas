document.getElementById('upload').addEventListener('change', handleImage, false);
document.getElementById('canvas').addEventListener('mousedown', startDrawing, false);
document.getElementById('canvas').addEventListener('mousemove', draw, false);
document.getElementById('canvas').addEventListener('mouseup', endDrawing, false);
document.getElementById('download').addEventListener('click', downloadImage, false);

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let isDrawing = false, image, label = '';
let labeledAreas = [];

function handleImage(e) {
    const reader = new FileReader();
    reader.onload = function (event) {
        image = new Image();
        image.onload = function () {
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0);
        }
        image.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
}

function startDrawing(e) {
    isDrawing = true;
    labeledAreas.push({ path: [], label: '', visible: true });
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
}

function draw(e) {
    if (!isDrawing) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    labeledAreas[labeledAreas.length - 1].path.push({ x: e.offsetX, y: e.offsetY });
    console.log(labeledAreas);
}

function endDrawing(e) {
    if (!isDrawing) return;
    isDrawing = false;
    ctx.closePath();
    label = document.getElementById('label').value;
    if (label) {
        labeledAreas[labeledAreas.length - 1].label = label;
        updateLabels();
        redrawCanvas();
    }
}

function updateLabels() {
    const labelsDiv = document.getElementById('labels');
    labelsDiv.innerHTML = '';
    labeledAreas.forEach((area, index) => {
        const labelCheckbox = document.createElement('input');
        labelCheckbox.type = 'checkbox';
        labelCheckbox.checked = area.visible;
        labelCheckbox.id = `label-${index}`;
        labelCheckbox.addEventListener('change', () => toggleLabel(index));

        const labelSpan = document.createElement('span');
        labelSpan.textContent = area.label;

        const labelContainer = document.createElement('div');
        labelContainer.appendChild(labelCheckbox);
        labelContainer.appendChild(labelSpan);

        labelsDiv.appendChild(labelContainer);
    });
}

function toggleLabel(index) {
    labeledAreas[index].visible = !labeledAreas[index].visible;
    redrawCanvas();
}

function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
    labeledAreas.forEach(area => {
        if (area.visible) {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.beginPath();
            area.path.forEach((point, index) => {
                if (index === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            });
            ctx.stroke();
            ctx.closePath();
            if (area.label) {
                ctx.fillStyle = 'red';
                ctx.font = '20px Arial';
                const { x, y } = area.path[Math.floor(area.path.length / 2)];
                ctx.fillText(area.label, x, y - 10);
            }
        }
    });
}

function downloadImage() {
    redrawCanvas();
    const link = document.createElement('a');
    link.download = 'labeled-image.png';
    link.href = canvas.toDataURL();
    link.click();
}
