'use client'
import React, { useEffect, useRef } from 'react'

export default function Cmatrix() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
            const ctx = canvas.getContext('2d')
        if (!ctx) return

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        window.addEventListener('resize', resize)
        resize()

        const fontSize = 13
        const columns = Math.floor(canvas.width / fontSize)
        const drops = Array(columns).fill(canvas.height)
        const characters = ['+', '/', '%', '@', '#', 'Q', 'D', 'B', 'W', '8', 'X', '[', '!']

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // ctx.fillStyle = '#FFF'
            ctx.fillStyle = '#c5f5a5'
            ctx.font = `${fontSize}px monospace`

            for (let i = 0; i < drops.length; i++) {
                const text = characters[Math.floor(random(0, characters.length))]
                const x = i * fontSize
                const y = drops[i] * fontSize

                ctx.fillText(text, x, y)

                if (y > canvas.height && Math.random() > 0.975)
                    drops[i] = 0
                drops[i]++
            }
        }

        const interval = setInterval(draw, 30) // speed animation
        return () => {
            clearInterval(interval)
            window.removeEventListener('resize', resize)
        }
    }, [])

    function random(min: number, max: number) {
        return Math.random() * (max - min) + min
    }

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -1,
                background: '#000'
        }}
        />
    )
}