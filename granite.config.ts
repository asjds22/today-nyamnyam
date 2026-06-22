import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "today-nyamnyam",
  brand: {
    displayName: "오늘 뭐 먹지?", // 콘솔에 등록된 이름과 동일하게 입력
    primaryColor: "#F4521E", // 디자인 포인트 컬러
    icon: "https://static.toss.im/appsintoss/53075/92448f8e-4cc4-4726-a46c-8a8913079cd7.png", // 콘솔 앱 정보에 업로드한 로고 URL
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [{ name: "geolocation", access: "access" }],
  outdir: "dist",
});
