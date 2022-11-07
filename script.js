"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Constructor_instances, _Constructor_getCanvas, _Constructor_setUpResizeObserver, _Constructor_setUpEventListner;
class Constructor {
    constructor(canvasId) {
        _Constructor_instances.add(this);
        this.canvas = __classPrivateFieldGet(this, _Constructor_instances, "m", _Constructor_getCanvas).call(this, canvasId);
        this.canvas.height = document.body.clientHeight;
        this.canvas.width = document.body.clientWidth;
        const ctx = this.canvas.getContext('2d');
        if (ctx === null) {
            throw new Error("Not able to render 2DCanvas");
        }
        const canvasModel = new CanvasModel();
        const canvasView = new CanvasView(ctx, [0, 0, 1, 1], canvasModel);
        const canvasController = new CanvasController(canvasModel, canvasView, ctx);
        __classPrivateFieldGet(this, _Constructor_instances, "m", _Constructor_setUpEventListner).call(this, this.canvas, canvasController.mouseInput());
    }
}
_Constructor_instances = new WeakSet(), _Constructor_getCanvas = function _Constructor_getCanvas(canvasId) {
    const canvases = document.getElementsByTagName("canvas");
    let theCanvas = null;
    for (const canvas of canvases) {
        if (canvas.id === canvasId) {
            theCanvas = canvas;
        }
    }
    if (!theCanvas) {
        throw new Error(`No Canvas of the id: ${canvasId}`);
    }
    return theCanvas;
}, _Constructor_setUpResizeObserver = function _Constructor_setUpResizeObserver() {
    const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
            if (entry.contentBoxSize) {
                this.canvas.height = document.body.clientHeight;
                this.canvas.width = document.body.clientWidth;
            }
        }
    });
    resizeObserver.observe(document.body);
}, _Constructor_setUpEventListner = function _Constructor_setUpEventListner(canvas, callbackFn) {
    const eventHandler = (event, type) => callbackFn([event.offsetX, event.offsetY], type);
    canvas.addEventListener(('mousemove'), (event) => { eventHandler(event, 'mousemove'); });
    canvas.addEventListener(('mousedown'), (event) => { eventHandler(event, 'mousedown'); });
    canvas.addEventListener(('mouseup'), (event) => { eventHandler(event, 'mouseup'); });
    canvas.addEventListener(('mouseleave'), (event) => { eventHandler(event, 'mouseleave'); });
};
class CanvasController {
    constructor(canvasModel, canvasView, ctx) {
        this.canvasModel = canvasModel;
        this.canvasView = canvasView;
        this.renderLoop(ctx);
    }
    mouseInput() {
        let lastPosition = null;
        let currentState = "hover";
        return (position, type) => {
            if (type === "mousedown") {
                currentState = "drag";
                console.log([position[0] + this.canvasView.translation[0], position[1] + this.canvasView.translation[1]]);
            }
            else if (type === "mouseleave") {
                currentState = "hover";
            }
            else if (type === "mouseup") {
                currentState = "hover";
                //Something has been clicked :)) maybe
            }
            if (!lastPosition) {
                lastPosition = position;
                return;
            }
            if (currentState === "drag") {
                this.canvasView.translation[0] += lastPosition[0] - position[0];
                this.canvasView.translation[1] += lastPosition[1] - position[1];
            }
            lastPosition = position;
        };
    }
    renderLoop(ctx) {
        this.canvasView.drawScene(ctx);
        requestAnimationFrame((() => this.renderLoop(ctx)).bind(this));
    }
}
class CanvasModel {
    constructor() {
    }
}
class SubCanvas {
    constructor(boundingBox) {
        this.boundingBox = boundingBox;
    }
    setBoundingBox(boundingBox) {
        this.boundingBox = boundingBox;
    }
}
class CanvasView extends SubCanvas {
    constructor(ctx, boundingBox, canvasModel) {
        super(boundingBox);
        this.scale = 50;
        this.translation = [Math.floor(-ctx.canvas.width / 2), Math.floor(-ctx.canvas.height / 2)];
    }
    drawGridLines(ctx) {
        const gridLinesX = Math.floor(ctx.canvas.width / this.scale);
        const gridLinesY = Math.floor(ctx.canvas.height / this.scale);
        const gridLinesOffsetX = -(this.translation[0] % this.scale);
        const gridLinesOffsetY = -(this.translation[1] % this.scale);
        ctx.strokeStyle = 'darkgrey';
        ctx.setLineDash([5, 10]);
        ctx.lineWidth = 2;
        ctx.lineDashOffset = -gridLinesOffsetY;
        for (let i = 0; i <= gridLinesX; i++) {
            ctx.beginPath();
            ctx.moveTo(gridLinesOffsetX + this.scale * i, 0);
            ctx.lineTo(gridLinesOffsetX + this.scale * i, ctx.canvas.height);
            ctx.stroke();
        }
        ctx.lineDashOffset = -gridLinesOffsetX;
        for (let i = 0; i <= gridLinesY; i++) {
            ctx.beginPath();
            ctx.moveTo(0, gridLinesOffsetY + this.scale * i);
            ctx.lineTo(ctx.canvas.width, gridLinesOffsetY + this.scale * i);
            ctx.stroke();
        }
    }
    drawScene(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        this.drawGridLines(ctx);
    }
}
class Menu extends SubCanvas {
    constructor(ctx, boundingBox) {
        super(boundingBox);
    }
}
const controller = new Constructor("canvas");
