import { useEffect, useState } from "react"
import axios from "axios"

const API = "http://localhost:3001"

function Admin() {
  const [photos, setPhotos] = useState([])
  const [users, setUsers] = useState({})

  useEffect(() => {
    load()

    const interval = setInterval(load, 2000)
    return () => clearInterval(interval)
  }, [])

  const load = async () => {
    const p = await axios.get(`${API}/photos`)
    const u = await axios.get(`${API}/users`)

    setPhotos(p.data)
    setUsers(u.data)
  }

  const assign = async (photo, userId) => {
    await axios.post(`${API}/assign`, {
      userId,
      photo
    })
  }

  return (
    <div style={styles.container}>
      <h1>📸 Panel Fotógrafo</h1>

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
        {photos.map((p, i) => (
          <div key={i} style={styles.card}>
            <img src={p} style={styles.image} />

            <div style={styles.actions}>
              {Object.entries(users).map(([id, u]) => (
                <button
                  key={id}
                  onClick={() => assign(p, id)}
                  style={styles.btn}
                >
                  {u.name}
                </button>
              ))}
            </div>
          </div>
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