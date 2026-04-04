import { useEffect, useState } from "react"
import axios from "axios"
import { UploadCloud } from "lucide-react"

const API = import.meta.env.VITE_API_URL
const WS = import.meta.env.VITE_WS_URL

function Admin() {
  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)

  // 🔥 obtener eventId UNA SOLA VEZ
  const params = new URLSearchParams(window.location.search)
  const eventId = params.get("event")

  // 🚀 CARGA INICIAL
  useEffect(() => {
    if (!eventId) return

    axios.get(`${API}/photos/${eventId}`)
      .then(res => setPhotos(res.data))
      .catch(() => setPhotos([]))
  }, [eventId])

  // 🚀 TIEMPO REAL (WebSocket)
  useEffect(() => {
    if (!eventId) return

    const ws = new WebSocket(WS)

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === "new_photo" && data.eventId === eventId) {
        setPhotos(prev => [data.url, ...prev])
      }
    }

    return () => ws.close()
  }, [eventId])

  // 📸 DRAG & DROP
  const handleDrop = async (e) => {
    e.preventDefault()

    const files = e.dataTransfer.files
    const formData = new FormData()

    for (let i = 0; i < files.length; i++) {
      formData.append("photos", files[i])
    }

    formData.append("eventId", eventId)

    setUploading(true)

    try {
      console.log("SUBIENDO A EVENTO:", eventId)

      await axios.post(`${API}/upload`, formData)
    } catch (err) {
      console.error(err)
    }

    setUploading(false)
  }

  return (
    <div
      style={styles.container}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <h1>
        <UploadCloud size={28} /> Subir Fotos
      </h1>

      <p style={{ opacity: 0.7 }}>
        Evento: {eventId || "No definido"}
      </p>

      {/* 🔥 ZONA DE SUBIDA */}
      <div style={styles.uploadBox}>
        {uploading
          ? "Subiendo fotos..."
          : "Arrastrá fotos acá"}
      </div>

      <h2>Fotos del evento</h2>

      <div style={styles.grid}>
        {photos.length === 0 && (
          <p style={{ opacity: 0.6 }}>
            Todavía no hay fotos 📸
          </p>
        )}

        {photos.map((p, i) => (
          <img
            key={i}
            src={p}
            style={styles.image}
            onError={() => console.log("ERROR IMG:", p)}
          />
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: "20px",
    background: "#0f172a",
    color: "white",
    minHeight: "100vh",
    fontFamily: "sans-serif"
  },

  uploadBox: {
    marginBottom: "20px",
    padding: "40px",
    border: "2px dashed #22c55e",
    borderRadius: "15px",
    textAlign: "center",
    fontSize: "18px"
  },

  grid: {
    marginTop: "20px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: "12px"
  },

  image: {
    width: "100%",
    borderRadius: "10px",
    objectFit: "cover"
  }
}

export default Admin