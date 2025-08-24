import fs from "fs"
import path from "path"

const dbFile = path.join(process.cwd(), "api", "db.json")

function readDB() {
  return JSON.parse(fs.readFileSync(dbFile, "utf-8"))
}
function writeDB(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2))
}

export default function handler(req, res) {
  const { id } = req.query
  const data = readDB()
  const article = data.find(n => n.id === parseInt(id))

  if (!article) {
    return res.status(404).json({ error: "News not found" })
  }

  if (req.method === "POST") {
    if (req.body.vote === "real") article.votes.real++
    else if (req.body.vote === "fake") article.votes.fake++

    writeDB(data)
    res.status(200).json(article.votes)
  } else {
    res.setHeader("Allow", ["POST"])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
