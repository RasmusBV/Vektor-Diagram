class Constructor {
    canvas: HTMLCanvasElement
    constructor(canvasId: string) {
        this.canvas = this.#getCanvas(canvasId)
        this.canvas.height = document.body.clientHeight
        this.canvas.width = document.body.clientWidth
        const ctx = this.canvas.getContext('2d')
        if(ctx === null) {throw new Error("Not able to render 2DCanvas")}
        const canvasModel = new CanvasModel()
        const canvasView = new CanvasView(ctx, [0,0,1,1], canvasModel);
        const canvasController = new CanvasController(canvasModel, canvasView, ctx);
        this.#setUpEventListner(this.canvas, canvasController.mouseInput())
    }
    #getCanvas(canvasId: string): HTMLCanvasElement {
        const canvases = document.getElementsByTagName("canvas")
        let theCanvas: HTMLCanvasElement | null = null;
        for(const canvas of canvases) {
            if(canvas.id === canvasId) {
                theCanvas = canvas
            }
        }
        if(!theCanvas) {throw new Error(`No Canvas of the id: ${canvasId}`)}
        return theCanvas
    }
    #setUpResizeObserver() {
        const resizeObserver = new ResizeObserver((entries) => {
            for(const entry of entries) {
                if(entry.contentBoxSize) {
                    this.canvas.height = document.body.clientHeight
                    this.canvas.width = document.body.clientWidth
                }
            }
        })
        resizeObserver.observe(document.body)
    }
    #setUpEventListner(canvas: HTMLCanvasElement, callbackFn: (position: [number, number], type: "mousemove" | "mousedown" | "mouseup" | "mouseleave") => void) {
        const eventHandler = (event: MouseEvent, type: "mousemove" | "mousedown" | "mouseup" | "mouseleave") => callbackFn([event.offsetX, event.offsetY], type)
        canvas.addEventListener(('mousemove'), (event) => {eventHandler(event, 'mousemove')})
        canvas.addEventListener(('mousedown'), (event) => {eventHandler(event, 'mousedown')})
        canvas.addEventListener(('mouseup'), (event) => {eventHandler(event, 'mouseup')})
        canvas.addEventListener(('mouseleave'), (event) => {eventHandler(event, 'mouseleave')})
    }
}

class CanvasController {
    canvasModel: CanvasModel
    canvasView: CanvasView
    constructor(canvasModel: CanvasModel, canvasView: CanvasView, ctx: CanvasRenderingContext2D) {
        this.canvasModel = canvasModel
        this.canvasView = canvasView
        this.renderLoop(ctx)
    }
    mouseInput(): (position: [number, number], type: "mousemove" | "mousedown" | "mouseup" | "mouseleave") => void {
        let lastPosition: [number, number] | null = null
        let currentState: "hover" | "drag" = "hover"
        return (position: [number, number], type: "mousemove" | "mousedown" | "mouseup" | "mouseleave") => {
            if(type === "mousedown") {
                currentState = "drag"
                console.log([position[0]+this.canvasView.translation[0],position[1]+this.canvasView.translation[1]])
            } else if (type === "mouseleave") {
                currentState = "hover"
            } else if (type === "mouseup") {
                currentState = "hover"
                //Something has been clicked :)) maybe
            }
            if(!lastPosition) {
                lastPosition = position
                return
            }
            if(currentState === "drag") {
                this.canvasView.translation[0] += lastPosition[0]-position[0]
                this.canvasView.translation[1] += lastPosition[1]-position[1]
            }
            
            lastPosition = position
        }
    }

    renderLoop(ctx: CanvasRenderingContext2D) {
        this.canvasView.drawScene(ctx)
        requestAnimationFrame((() => this.renderLoop(ctx)).bind(this))
    }
}

class CanvasModel {
    constructor() {
        
    }
}

abstract class SubCanvas {
    boundingBox: [number, number, number, number]
    constructor(boundingBox: [number, number, number, number]) {
        this.boundingBox = boundingBox
    }
    setBoundingBox(boundingBox: [number, number, number, number]) {
        this.boundingBox = boundingBox
    }
}

class CanvasView extends SubCanvas {
    scale: number = 50
    translation: [number, number]
    constructor(ctx: CanvasRenderingContext2D, boundingBox: [number, number, number, number], canvasModel: CanvasModel) {
        super(boundingBox)
        this.translation = [Math.floor(-ctx.canvas.width/2), Math.floor(-ctx.canvas.height/2)]
    }
    drawGridLines(ctx: CanvasRenderingContext2D) {
        const gridLinesX = Math.floor(ctx.canvas.width/this.scale)
        const gridLinesY = Math.floor(ctx.canvas.height/this.scale)
        const gridLinesOffsetX = -(this.translation[0]%this.scale)
        const gridLinesOffsetY = -(this.translation[1]%this.scale)
        ctx.strokeStyle = 'darkgrey';
        ctx.setLineDash([5, 10])
        ctx.lineWidth = 2
        ctx.lineDashOffset = -gridLinesOffsetY
        for(let i = 0; i <= gridLinesX; i++) {
            ctx.beginPath()
            ctx.moveTo(gridLinesOffsetX+this.scale*i, 0)
            ctx.lineTo(gridLinesOffsetX+this.scale*i, ctx.canvas.height)
            ctx.stroke()
        }
        ctx.lineDashOffset = -gridLinesOffsetX
        for(let i = 0; i <= gridLinesY; i++) {
            ctx.beginPath()
            ctx.moveTo(0, gridLinesOffsetY+this.scale*i)
            ctx.lineTo(ctx.canvas.width, gridLinesOffsetY+this.scale*i)
            ctx.stroke()
        }
    }
    drawScene(ctx: CanvasRenderingContext2D) {
        ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height)
        this.drawGridLines(ctx)
    }
}

class Menu extends SubCanvas {
    constructor(ctx: CanvasRenderingContext2D, boundingBox: [number, number, number, number]) {
        super(boundingBox)
    }
}

const controller = new Constructor("canvas")