import { useState } from "react"
import axios from "axios"
import { Camera, Globe, User, QrCode,  UploadCloud } from "lucide-react"

// 🔥 usa variables de entorno (clave)
const API = import.meta.env.VITE_API_URL
const FRONTEND_URL = window.location.origin

function Dashboard() {
  const [event, setEvent] = useState(null)
  const [error, setError] = useState("")

  const create = async (mode) => {
    try {
      console.log("Enviando mode:", mode)

      const res = await axios.post(
        `${API}/event`,
        { mode },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      )

      console.log("Respuesta:", res.data)

      setEvent(res.data.id)
      setError("")
    } catch (err) {
      console.error("ERROR FRONT:", err)

      if (err.response) {
        console.error("ERROR BACK:", err.response.data)
        setError(err.response.data?.error || "Error del servidor")
      } else {
        setError("No conecta con backend")
      }
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        <Camera size={28} /> Crear Evento
      </h1>

      <div style={styles.buttons}>
        <button onClick={() => create("global")} style={styles.btn}>
          <Globe size={18} /> Evento Global
        </button>

        <button onClick={() => create("personal")} style={styles.btn}>
          <User size={18} /> Evento Personal
        </button>
      </div>

      {error && <p style={{ color: "red", marginTop: "20px" }}>⚠️ {error}</p>}

      {event && (
        <div style={styles.result}>
          <p>Evento creado:</p>
          <strong>{event}</strong>

          <p style={{ marginTop: "10px" }}>Link:</p>

          {/* 🔥 IMPORTANTE: sin localhost */}
          <a
            href={`${FRONTEND_URL}/event/${event}`}
            target="_blank"
            rel="noreferrer"
          >
            Abrir evento
          </a>

          <a
            href={`/admin?event=${event}`}
            style={{
              display: "inline-block",
              marginTop: "15px",
              marginLeft: "10px",
              padding: "10px 20px",
              background: "#3b82f6",
              color: "white",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            <UploadCloud size={28} />Subir fotos de este evento
          </a>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "white",
    padding: "20px",
    textAlign: "center",
    fontFamily: "sans-serif"
  },

  buttons: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
    gap: "20px"
  },

  btn: {
    padding: "15px 25px",
    borderRadius: "12px",
    border: "none",
    background: "#22c55e",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer"
  },

  result: {
    marginTop: "30px"
  }
}

export default Dashboard