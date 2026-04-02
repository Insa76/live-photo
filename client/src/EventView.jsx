import { useEffect, useState } from "react"
import axios from "axios"

const API = "https://live-photo.onrender.com"
const WS = "wss://live-photo.onrender.com"

function EventView({ eventId }) {
  const [mode, setMode] = useState(null)
  const [photos, setPhotos] = useState([])
  const [qr, setQr] = useState("")
  const [flash, setFlash] = useState(false)

  const [name, setName] = useState(localStorage.getItem("name") || "")
  const [userId, setUserId] = useState(localStorage.getItem("userId") || "")
  const [input, setInput] = useState("")

  useEffect(() => {
    axios.get(`${API}/event/${eventId}`)
      .then(res => setMode(res.data?.mode))

    axios.get(`${API}/qr/${eventId}`)
      .then(res => setQr(res.data.qr))
  }, [eventId])

  // 🟢 GLOBAL
  useEffect(() => {
    if (mode !== "global") return

    axios.get(`${API}/photos`).then(res => setPhotos(res.data))

    const ws = new WebSocket(WS)

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === "new_photo") {
        setPhotos(prev => [data.url, ...prev])
        setFlash(true)
        setTimeout(() => setFlash(false), 800)
      }
    }

    return () => ws.close()
  }, [mode])

  // 🔵 PERSONAL
  useEffect(() => {
    if (mode !== "personal" || !userId) return

    axios.get(`${API}/user/${userId}/photos`)
      .then(res => setPhotos(res.data))

    const ws = new WebSocket(WS)

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === "assigned_photo" && data.userId === userId) {
        setPhotos(prev => [data.url, ...prev])
        setFlash(true)
        setTimeout(() => setFlash(false), 800)
      }
    }

    return () => ws.close()
  }, [mode, userId])

  const createUser = async () => {
    const res = await axios.post(`${API}/user`, { name: input })

    localStorage.setItem("name", input)
    localStorage.setItem("userId", res.data.id)

    setName(input)
    setUserId(res.data.id)
  }

  if (!mode) {
    return <div style={{ color: "white" }}>Cargando evento...</div>
  }

  if (mode === "personal" && !userId) {
    return (
      <div style={styles.container}>
        <h1>✨ Memoria Viva</h1>
        <input value={input} onChange={e => setInput(e.target.value)} style={styles.input} />
        <button onClick={createUser} style={styles.button}>Entrar</button>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {flash && <div style={styles.toast}>📸 Nueva foto</div>}

      <h1>✨ Evento en vivo</h1>
      {mode === "personal" && <p>Hola {name} 👋</p>}

      {qr && <img src={qr} style={styles.qr} />}

      <div style={styles.grid}>
        {photos.map((p, i) => (
          <img key={i} src={p} style={styles.image} />
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "white",
    padding: "20px",
    fontFamily: "sans-serif"
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    margin: "10px"
  },
  button: {
    padding: "10px",
    borderRadius: "8px",
    background: "#22c55e",
    color: "white",
    border: "none"
  },
  qr: {
    width: "120px",
    margin: "20px 0"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: "10px"
  },
  image: {
    width: "100%",
    borderRadius: "10px"
  },
  toast: {
    position: "fixed",
    top: 20,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#22c55e",
    padding: "10px",
    borderRadius: "20px"
  }
}

export default EventView