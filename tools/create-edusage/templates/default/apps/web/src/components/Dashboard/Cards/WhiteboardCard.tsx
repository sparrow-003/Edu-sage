import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RuntimeErrorHandler } from '@runtime/runtime-error';

interface WhiteboardCardProps {
    sketch: string;
    title: string;
}

export const WhiteboardCard: React.FC<WhiteboardCardProps> = ({ sketch, title }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const errorHandler = RuntimeErrorHandler.getInstance();

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        try {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Set drawing style
            ctx.strokeStyle = '#06B6D4';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Draw based on sketch type
            switch (sketch) {
                case 'python-flow-control':
                    drawPythonFlowControl(ctx, canvas.width, canvas.height);
                    break;
                case 'data-structures':
                    drawDataStructures(ctx, canvas.width, canvas.height);
                    break;
                default:
                    drawDefaultSketch(ctx, canvas.width, canvas.height);
            }
        } catch (error) {
            errorHandler.captureException(error as Error, {
                component: 'WhiteboardCard',
                action: 'drawSketch',
                metadata: { sketch }
            });
        }
    }, [sketch]);

    // Draw Python flow control diagram
    const drawPythonFlowControl = (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number
    ) => {
        // Start point
        ctx.beginPath();
        ctx.fillStyle = '#06B6D4';
        ctx.arc(width / 2, 30, 10, 0, Math.PI * 2);
        ctx.fill();

        // Draw "if" condition
        drawBox(ctx, width / 2, 80, 100, 40, 'if condition');

        // Draw arrows from if
        drawArrow(ctx, width / 2, 100, width / 4, 150);
        drawArrow(ctx, width / 2, 100, (width / 4) * 3, 150);

        // Draw "True" and "False" labels
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('True', width / 3, 130);
        ctx.fillText('False', (width / 3) * 2, 130);

        // Draw action boxes
        drawBox(ctx, width / 4, 180, 80, 40, 'Action 1');
        drawBox(ctx, (width / 4) * 3, 180, 80, 40, 'Action 2');

        // Draw arrows to end
        drawArrow(ctx, width / 4, 200, width / 2, 250);
        drawArrow(ctx, (width / 4) * 3, 200, width / 2, 250);

        // Draw end point
        ctx.beginPath();
        ctx.fillStyle = '#06B6D4';
        ctx.arc(width / 2, 270, 10, 0, Math.PI * 2);
        ctx.fill();

        // Animate drawing
        animateDrawing(ctx);
    };

    // Draw data structures diagram
    const drawDataStructures = (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number
    ) => {
        // Draw list
        drawBox(ctx, width / 4, 50, 120, 40, 'List');

        // Draw list elements
        const listX = width / 4 - 60;
        for (let i = 0; i < 5; i++) {
            ctx.strokeRect(listX + i * 24, 80, 24, 24);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(i.toString(), listX + i * 24 + 12, 96);
        }

        // Draw dictionary
        drawBox(ctx, (width / 4) * 3, 50, 120, 40, 'Dictionary');

        // Draw dictionary elements
        const dictX = (width / 4) * 3 - 60;
        for (let i = 0; i < 3; i++) {
            ctx.strokeRect(dictX, 80 + i * 30, 40, 24);
            ctx.strokeRect(dictX + 40, 80 + i * 30, 80, 24);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`key${i}`, dictX + 20, 96 + i * 30);
            ctx.fillText(`value${i}`, dictX + 80, 96 + i * 30);
        }

        // Animate drawing
        animateDrawing(ctx);
    };

    // Draw default sketch
    const drawDefaultSketch = (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number
    ) => {
        // Draw a simple flowchart
        drawBox(ctx, width / 2, 50, 120, 40, 'Start');
        drawArrow(ctx, width / 2, 70, width / 2, 120);
        drawBox(ctx, width / 2, 150, 120, 40, 'Process');
        drawArrow(ctx, width / 2, 170, width / 2, 220);
        drawBox(ctx, width / 2, 250, 120, 40, 'End');

        // Animate drawing
        animateDrawing(ctx);
    };

    // Helper function to draw a box with text
    const drawBox = (
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        text: string
    ) => {
        ctx.strokeRect(x - width / 2, y - height / 2, width, height);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);
    };

    // Helper function to draw an arrow
    const drawArrow = (
        ctx: CanvasRenderingContext2D,
        fromX: number,
        fromY: number,
        toX: number,
        toY: number
    ) => {
        const headLength = 10;
        const angle = Math.atan2(toY - fromY, toX - fromX);

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    };

    // Animate the drawing
    const animateDrawing = (ctx: CanvasRenderingContext2D) => {
        // In a real implementation, we would use GSAP or Framer Motion to animate the drawing
        // For simplicity, we're just showing the final result
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden bg-gray-800 rounded-lg shadow-lg"
        >
            <div className="p-3 border-b border-gray-700">
                <h3 className="text-sm font-medium text-white">{title}</h3>
            </div>

            <div className="p-4">
                <canvas
                    ref={canvasRef}
                    width={300}
                    height={300}
                    className="w-full h-auto bg-gray-900 rounded-md"
                />
            </div>

            <div className="flex justify-end p-2 border-t border-gray-700">
                <button className="px-3 py-1 text-xs text-white bg-cyan-600 rounded-md hover:bg-cyan-500">
                    Edit
                </button>
            </div>
        </motion.div>
    );
};