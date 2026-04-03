import dotenv from "dotenv"
import express from "express"
import cors from "cors"
import chokidar from "chokidar"
import path from "path"
import QRCode from "qrcode"
import { WebSocketServer } from "ws"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3001

let photos = []
let users = {}
let events = {}

console.log("🔥Hola ESTE ES EL BACKEND CORRECTO")

// Servir imágenes
app.use("/uploads", express.static(path.resolve("../fotos")))

// API REST
app.get("/photos", (req, res) => {
  res.json(photos)
})

app.get("/qr", async (req, res) => {
  const url = "http://TU-IP:5174"
  const qr = await QRCode.toDataURL(url)
  res.json({ qr })
})

// WebSocket
const server = app.listen(PORT, () => {
  console.log(`🚀 Server en http://localhost:${PORT}`)
})

const wss = new WebSocketServer({ server })

const broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data))
    }
  })
}

// Watcher (AUTOMÁTICO)
chokidar.watch("../fotos").on("add", (filePath) => {
  const fileName = path.basename(filePath)
  const url = `http://localhost:${PORT}/uploads/${fileName}`

  photos.unshift(url)

  console.log("📸 Nueva foto:", fileName)

  broadcast({
    type: "new_photo",
    url
  })
})

const groupByMoment = (photos) => {
  const groups = {}

  photos.forEach((url) => {
    const time = "Momento actual" // simplificado (luego mejoramos)

    if (!groups[time]) groups[time] = []
    groups[time].push(url)
  })

  return groups
}

app.get("/moments", (req, res) => {
  res.json(groupByMoment(photos))
})

app.post("/user", (req, res) => {
  const { name } = req.body
  const id = Date.now().toString()

  users[id] = {
    name,
    photos: []
  }

  res.json({ id })
})

app.get("/user/:id/photos", (req, res) => {
  const user = users[req.params.id]
  res.json(user?.photos || [])
})

app.post("/assign", (req, res) => {
  const { userId, photo } = req.body

  if (users[userId]) {
    users[userId].photos.unshift(photo)

    broadcast({
      type: "assigned_photo",
      userId,
      url: photo
    })
  }

  res.sendStatus(200)
})

app.post("/event", (req, res) => {
  console.log("🧠 EVENTS ACTUALES:", events)
  try {
    console.log("BODY:", req.body)

    const mode = req.body?.mode

    if (!mode) {
      return res.status(400).json({ error: "mode requerido" })
    }

    const id = Date.now().toString()

    events[id] = { mode }

    res.json({ id })
  } catch (err) {
    console.error("ERROR /event:", err)
    res.status(500).json({ error: err.message })
  }
})

app.get("/event/:id", (req, res) => {
  console.log("🧠 EVENTS ACTUALES:", events)
  res.json(events[req.params.id])
})

app.get("/qr/:eventId", async (req, res) => {
  const eventId = req.params.eventId

  const url = `${process.env.FRONTEND_URL}/event/${eventId}`

  const qr = await QRCode.toDataURL(url)

  res.json({ qr })
})