import "dotenv/config";
import { createServer } from "http";
import app from "./app.js";
import { initSocket } from "./lib/socket.js";

const PORT = process.env.PORT || 3001;

const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});