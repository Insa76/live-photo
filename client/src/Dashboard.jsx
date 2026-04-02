import { useState } from "react"
import axios from "axios"

const API = "http://localhost:3001"

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
      <h1>🎛️ Crear Evento</h1>

      <p>Elegí el tipo de experiencia</p>

      <div style={styles.buttons}>
        <button onClick={() => create("global")} style={styles.btn}>
          🌍 Evento Global
        </button>

        <button onClick={() => create("personal")} style={styles.btn}>
          👤 Evento Personal
        </button>
      </div>

      {error && (
        <p style={{ color: "red", marginTop: "20px" }}>
          ⚠️ {error}
        </p>
      )}

      {event && (
        <div style={styles.result}>
          <p>Evento creado:</p>
          <strong>{event}</strong>

          <p style={{ marginTop: "10px" }}>Link:</p>

          <a
            href={`http://localhost:5174/event/${event}`}
            target="_blank"
          >
            Abrir evento
          </a>
        </div>
      )}
    </div>
  )
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