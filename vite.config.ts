import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const serverPort = 3030;

// https://vitejs.dev/config/
export default defineConfig({
  // server: {
  //   proxy: {
  //     "/api": {
  //       target: `http://localhost:${serverPort}`,
  //       // changeOrigin: true,
  //       // secure: false,
  //     },
  //     "/ws": {
  //       target: `ws://localhost:${serverPort}`,
  //       ws: true,
  //     },
  //   },
  // },
  plugins: [react()],
});
