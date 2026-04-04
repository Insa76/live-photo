import dotenv from "dotenv"
import express from "express"
import cors from "cors"
import path from "path"
import QRCode from "qrcode"
import multer from "multer"
import { fileURLToPath } from "url"
import { WebSocketServer } from "ws"
import fs from "fs"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"

dotenv.config()

// 🔥 FIX IMPORTANTE (antes de usar __dirname)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const PORT = process.env.PORT || 3001

let photosByEvent = {}
let users = {}
let events = {}

// 📂 PATH ABSOLUTO
const uploadsPath = path.join(__dirname, "uploads")

console.log("DIRNAME:", __dirname)
console.log("UPLOADS PATH:", uploadsPath)

// 🔥 MULTER BIEN CONFIGURADO
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "event-photos",
    allowed_formats: ["jpg", "png", "jpeg"]
  }
})

const upload = multer({ storage })

// 🔥 SERVIR IMÁGENES (CLAVE)
app.use("/uploads", express.static(uploadsPath))

// 🧪 TEST OPCIONAL
app.get("/test-img", (req, res) => {
  const files = fs.readdirSync(uploadsPath)
  if (files.length === 0) return res.send("No hay imágenes")

  res.sendFile(path.join(uploadsPath, files[0]))
})

// API
app.get("/photos/:eventId", (req, res) => {
  const { eventId } = req.params

  res.json(photosByEvent[eventId] || [])
})

app.get("/qr", async (req, res) => {
  const url = process.env.FRONTEND_URL || "http://localhost:5175"
  const qr = await QRCode.toDataURL(url)
  res.json({ qr })
})

// SERVER + WS
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

// ⚠️ DESACTIVADO POR AHORA (evita conflictos)
/*
chokidar.watch("../fotos").on("add", (filePath) => {
  const fileName = path.basename(filePath)
  const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`

  const url = `${BASE_URL}/uploads/${fileName}`

  photos.unshift(url)

  broadcast({
    type: "new_photo",
    url
  })
})
*/

app.post("/user", (req, res) => {
  const { name } = req.body
  const id = Date.now().toString()

  users[id] = { name, photos: [] }

  res.json({ id })
})

app.get("/user/:id/photos", (req, res) => {
  res.json(users[req.params.id]?.photos || [])
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
  const mode = req.body?.mode

  if (!mode) {
    return res.status(400).json({ error: "mode requerido" })
  }

  const id = Date.now().toString()
  events[id] = { mode }

   // 👇 inicializar fotos del evento
  photosByEvent[id] = []

  res.json({ id })
})

app.get("/event/:id", (req, res) => {
  res.json(events[req.params.id])
})

app.get("/qr/:eventId", async (req, res) => {
  const eventId = req.params.eventId
  const url = `${process.env.FRONTEND_URL}/event/${eventId}`
  const qr = await QRCode.toDataURL(url)

  res.json({ qr })
})

// 📸 UPLOAD (CLAVE)
app.post("/upload", upload.array("photos"), (req, res) => {
  const { eventId } = req.body

  if (!photosByEvent[eventId]) {
    photosByEvent[eventId] = []
  }

  req.files.forEach(file => {
    const url = file.path // cloudinary

    photosByEvent[eventId].unshift(url)

    broadcast({
      type: "new_photo",
      eventId,
      url
    })
  })

  res.json({ ok: true })
})

app.get("/uploads/:file", (req, res) => {
  const filePath = path.join(uploadsPath, req.params.file)

  console.log("BUSCANDO:", filePath)

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("No existe")
  }

  res.sendFile(filePath)
})