// vite.config.ts
import path from "path";
import { defineConfig } from "file:///C:/Repos/altinn-access-management-frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Repos/altinn-access-management-frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
import svgr from "file:///C:/Repos/altinn-access-management-frontend/node_modules/vite-plugin-svgr/dist/index.js";
var __vite_injected_original_dirname = "C:\\Repos\\altinn-access-management-frontend";
var vite_config_default = defineConfig({
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__vite_injected_original_dirname, "src") }]
  },
  plugins: [svgr(), react()],
  build: {
    target: "es2020",
    manifest: true,
    rollupOptions: {
      // overwrite default .html entry
      input: "./entrypoint.js",
      output: {
        entryFileNames: "assets/accessmanagement.js",
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name.split(".")[1];
          if (/css/i.test(extType)) {
            return `assets/accessmanagement.css`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxSZXBvc1xcXFxhbHRpbm4tYWNjZXNzLW1hbmFnZW1lbnQtZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFJlcG9zXFxcXGFsdGlubi1hY2Nlc3MtbWFuYWdlbWVudC1mcm9udGVuZFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovUmVwb3MvYWx0aW5uLWFjY2Vzcy1tYW5hZ2VtZW50LWZyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC90cmlwbGUtc2xhc2gtcmVmZXJlbmNlXHJcbi8vLyA8cmVmZXJlbmNlIHR5cGVzPVwidml0ZS1wbHVnaW4tc3Znci9jbGllbnRcIiAvPlxyXG5cclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcblxyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcclxuaW1wb3J0IHN2Z3IgZnJvbSAndml0ZS1wbHVnaW4tc3Zncic7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiBbeyBmaW5kOiAnQCcsIHJlcGxhY2VtZW50OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjJykgfV0sXHJcbiAgfSxcclxuICBwbHVnaW5zOiBbc3ZncigpLCByZWFjdCgpXSxcclxuICBidWlsZDoge1xyXG4gICAgdGFyZ2V0OiAnZXMyMDIwJyxcclxuICAgIG1hbmlmZXN0OiB0cnVlLFxyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAvLyBvdmVyd3JpdGUgZGVmYXVsdCAuaHRtbCBlbnRyeVxyXG4gICAgICBpbnB1dDogJy4vZW50cnlwb2ludC5qcycsXHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnYXNzZXRzL2FjY2Vzc21hbmFnZW1lbnQuanMnLFxyXG4gICAgICAgIGFzc2V0RmlsZU5hbWVzOiAoYXNzZXRJbmZvKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBleHRUeXBlID0gYXNzZXRJbmZvLm5hbWUuc3BsaXQoJy4nKVsxXTtcclxuICAgICAgICAgIGlmICgvY3NzL2kudGVzdChleHRUeXBlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gYGFzc2V0cy9hY2Nlc3NtYW5hZ2VtZW50LmNzc2A7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gYGFzc2V0cy9bbmFtZV0tW2hhc2hdW2V4dG5hbWVdYDtcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUdBLE9BQU8sVUFBVTtBQUVqQixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBUGpCLElBQU0sbUNBQW1DO0FBVXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE9BQU8sQ0FBQyxFQUFFLE1BQU0sS0FBSyxhQUFhLEtBQUssUUFBUSxrQ0FBVyxLQUFLLEVBQUUsQ0FBQztBQUFBLEVBQ3BFO0FBQUEsRUFDQSxTQUFTLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQztBQUFBLEVBQ3pCLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLFVBQVU7QUFBQSxJQUNWLGVBQWU7QUFBQTtBQUFBLE1BRWIsT0FBTztBQUFBLE1BQ1AsUUFBUTtBQUFBLFFBQ04sZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCLENBQUMsY0FBYztBQUM3QixnQkFBTSxVQUFVLFVBQVUsS0FBSyxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQzNDLGNBQUksT0FBTyxLQUFLLE9BQU8sR0FBRztBQUN4QixtQkFBTztBQUFBLFVBQ1Q7QUFDQSxpQkFBTztBQUFBLFFBQ1Q7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
