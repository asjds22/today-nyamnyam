import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "today-nyamnyam",

  brand: {
    // 디자인 포인트 컬러
    primaryColor: "#F4521E"
  },

  permissions: [{ name: "geolocation", access: "access" }],
  webBundleDir: "dist"
});
