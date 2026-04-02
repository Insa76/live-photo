import Dashboard from "./Dashboard"
import Admin from "./Admin"
import EventView from "./EventView"

function App() {
  const path = window.location.pathname

  // 🟢 HOME
  if (path === "/") return <Dashboard />

  // 🔵 ADMIN
  if (path === "/admin") return <Admin />

  // 🟣 EVENTO
  if (path.startsWith("/event/")) {
    const parts = path.split("/").filter(Boolean)
    const eventId = parts[1]

    return <EventView eventId={eventId} />
  }

  return <Dashboard />
}

export default App