"use strict"

const { readFile } = require("node:fs/promises")
const path = require("node:path")
let logoPromise

// @vercel/og accepts an element tree; JSX/React aren't needed in the frontend.
const element = (type, props, ...children) => ({
  type,
  props: { ...props, children: children.length === 1 ? children[0] : children },
})

async function renderCard(card) {
  const { ImageResponse } = await import("@vercel/og")
  logoPromise ||= readFile(path.join(process.cwd(), "favicon.svg"))
  const logo = `data:image/svg+xml;base64,${(await logoPromise).toString("base64")}`
  const ink = "#16283f"
  const red = "#a82f26"
  const tree = element("div", { style: {
    width: "100%", height: "100%", display: "flex", flexDirection: "column",
    padding: "44px 64px", backgroundColor: "#f7f6f1", color: ink,
    fontFamily: "sans-serif",
    backgroundImage: "linear-gradient(90deg, #dbe5eb 1px, transparent 1px), linear-gradient(#dbe5eb 1px, transparent 1px)",
    backgroundSize: "28px 28px",
  } },
    element("div", { style: { display: "flex", alignItems: "center", gap: 18, fontSize: 30, fontWeight: 700 } },
      element("img", { src: logo, width: 64, height: 64 }), "Miaulendário"),
    element("div", { style: { display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "center" } },
      ...(card.isFriday ? [element("div", { style: { fontSize: 96, color: red, fontWeight: 700, marginBottom: 22 } }, card.title)] : [
        element("div", { style: { fontSize: 32 } }, card.prefix),
        element("div", { style: { display: "flex", alignItems: "baseline", gap: 22, color: red } },
          element("span", { style: { fontSize: 112, fontWeight: 700 } }, card.number),
          element("span", { style: { fontSize: 48 } }, card.unit)),
        element("div", { style: { fontSize: 36, marginBottom: 18 } }, card.words.until),
      ]),
      element("div", { style: { fontSize: card.isFriday ? 40 : 28, lineHeight: 1.3, maxWidth: 1040 } }, card.description)),
    element("div", { style: { display: "flex", flexDirection: "column", color: "#5c7691", fontSize: 19, gap: 8 } },
      element("div", {}, `${card.words.snapshot} · ${card.when} · ${card.tz}`),
      element("div", {}, "www.miaulendario.online")),
  )
  const image = new ImageResponse(tree, { width: 1200, height: 630 })
  return Buffer.from(await image.arrayBuffer())
}

module.exports = { renderCard }
