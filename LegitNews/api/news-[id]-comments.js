import fs from "fs"
import path from "path"

const dbFile = path.join(process.cwd(), "db.json")
function readDB() { return JSON.parse(fs.readFileSync(dbFile, "utf-8")) }
function writeDB(data) { fs.writeFileSync(dbFile, JSON.stringify(data, null, 2)) }

export default function handler(req, res) {
  const { id } = req.query
  if (req.method === "POST") {
    const data = readDB()
    const article = data.find(n => n.id === parseInt(id))
    if (!article) return res.status(404).json({ error: "News not found" })

    const comment = {
      id: article.comments.length + 1,
      text: req.body.text,
      user: req.body.user || "Guest",
      date: new Date().toLocaleString()
    }

    article.comments.push(comment)
    writeDB(data)
    return res.status(201).json(comment)
  }

  res.setHeader("Allow", ["POST"])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
