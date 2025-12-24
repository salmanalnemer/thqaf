(function () {
      const svg = (label) =>
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">
            <rect width="100%" height="100%" fill="#F3F6FA"/>
            <rect x="24" y="24" width="592" height="312" rx="18" fill="#ffffff" stroke="#E6EAF0"/>
            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
              font-family="Tahoma, Arial" font-size="24" fill="#64748B">${label}</text>
          </svg>`
        );

      const placeholders = {
        logo: svg("THQAF Logo"),
        illu: svg("Image Not Found"),
      };

      document.querySelectorAll("img[data-fallback]").forEach((img) => {
        img.addEventListener("error", () => {
          const kind = img.getAttribute("data-fallback") || "illu";
          img.src = placeholders[kind] || placeholders.illu;
        }, { once: true });
      });
    })();