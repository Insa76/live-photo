import { useEffect, useState } from "react"
import axios from "axios"

const API = import.meta.env.VITE_API_URL

function Admin() {
  const [photos, setPhotos] = useState([])
  const [users, setUsers] = useState({})
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    load()

    const interval = setInterval(load, 2000)
    return () => clearInterval(interval)
  }, [])

  const load = async () => {
    try {
      const p = await axios.get(`${API}/photos`)
      //const u = await axios.get(`${API}/users`)

      setPhotos(p.data)
      //setUsers(u.data)
    } catch (err) {
      console.error(err)
    }
  }

  const assign = async (photo, userId) => {
    await axios.post(`${API}/assign`, {
      userId,
      photo
    })
  }

  // 🔥 DRAG & DROP
  const handleDrop = async (e) => {
    e.preventDefault()

    const files = e.dataTransfer.files
    const formData = new FormData()

    for (let i = 0; i < files.length; i++) {
      formData.append("photos", files[i])
    }

    setUploading(true)

    try {
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
      <h1>📸 Panel Fotógrafo</h1>

      {/* 🔥 ZONA DE SUBIDA */}
      <div style={styles.uploadBox}>
        {uploading
          ? "Subiendo fotos..."
          : "Arrastrá fotos acá"}
      </div>

      <h2>Usuarios</h2>
      <div style={styles.users}>
        {Object.entries(users).map(([id, u]) => (
          <div key={id} style={styles.user}>
            {u.name}
          </div>
        ))}
      </div>

      <h2>Fotos</h2>

      <div style={styles.grid}>
        {photos.length === 0 && (
  <p style={{ color: "white" }}>NO HAY FOTOS</p>
)}

{photos.map((p, i) => {
  console.log("RENDER IMG:", p)

  return (
    <img
      key={i}
      src={p}
      style={{
        width: "200px",
        border: "2px solid red",
        margin: "10px"
      }}
      onError={() => console.log("ERROR IMG:", p)}
    />
  )
})}
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

  users: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap"
  },

  user: {
    background: "#1e293b",
    padding: "8px 12px",
    borderRadius: "8px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: "12px"
  },

  card: {
    position: "relative"
  },

  image: {
    width: "100%",
    borderRadius: "10px"
  },

  actions: {
    position: "absolute",
    bottom: "5px",
    left: "5px",
    right: "5px",
    display: "flex",
    flexWrap: "wrap",
    gap: "5px"
  },

  btn: {
    background: "#22c55e",
    border: "none",
    padding: "5px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px"
  }
}

export default Admin