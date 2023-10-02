import type { PrismaClient as ImportedPrismaClient } from '@prisma/client';
import { createRequire } from 'module';
const require = createRequire(import.meta.url ?? __filename);
const { PrismaClient: RequiredPrismaClient } = require('@prisma/client');
const _PrismaClient: typeof ImportedPrismaClient = RequiredPrismaClient;
export class PrismaClient extends _PrismaClient {}

import express from "express";

const prisma = new PrismaClient();

const app = express();
const port = Bun.env.API_PORT || 3000;
const host = Bun.env.API_HOST || "0.0.0.0";

app.use(express.json());
app.use(express.raw({ type: "application/vnd.custom-type" }));
app.use(express.text({ type: "text/html" }));

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { Score: true },
  });
  res.json(users);
});

app.get("/users/:id/scores", async (req, res) => {
  const id = req.params.id;
  const scores = await prisma.score.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
  });
  res.json(scores);
});

app.post("/users/:id/scores", async (req, res) => {
  try {
    const score = await prisma.score.create({
      data: {
        value: req.body.value,
        userId: req.params.id,
        createdAt: new Date(),
      },
    });
    return res.json(score);
  } catch (error) {
    console.log(error);
    return res.json(error);
  }
});

app.post("/users", async (req, res) => {
  try {
    const user = await prisma.user.create({
      data: {
        username: req.body.username,
        createdAt: new Date(),
      },
    });
    return res.json(user);
  } catch (error) {
    console.log(error);
    return res.json(error);
  }
});

app.get("/users/:id", async (req, res) => {
  const id = req.params.id;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { Score: true },
  });

  return res.json(user);
});

app.get("/", async (req, res) => {
  res.send(
    `
  <h1>Game scoreboard REST API</h1>
  <h2>Available Routes</h2>
  <pre>
    GET, POST /users
    GET, DELETE /users/:id
    GET, POST /users/:id/scores
  </pre>
  `.trim(),
  );
});

app.listen(Number(port), String(host), () => {
    console.log(`Game scoreboard api running at http://${host}:${port}`);
});
