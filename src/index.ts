import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

// Host platforms (Railway/Render) inject the port via the PORT env var.
// Fall back to 3000 for local dev.
const PORT = Number(process.env.PORT) || 3000;

// Health check — step 1's whole job. Deploy targets also ping this.
app.get("/", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "healthy" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
