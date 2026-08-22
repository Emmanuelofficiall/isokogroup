import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

const app = express();

app.use(express.json());

function createMcpServer() {
  const server = new McpServer({
    name: "isokogroup",
    version: "1.0.0",
  });

  server.registerTool(
    "hello",
    {
      description: "Say hello to a user",
      inputSchema: {
        name: z.string(),
      },
    },
    async ({ name }) => ({
      content: [
        {
          type: "text",
          text: `Hello ${name}, welcome to Isoko Group!`,
        },
      ],
    })
  );

  return server;
}

// MCP endpoint
app.post("/mcp", async (req, res) => {
  const server = createMcpServer();

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  res.on("close", async () => {
    await transport.close();
    await server.close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("MCP request failed:", error);

    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal MCP server error",
      });
    }
  }
});

// Browser health check
app.get("/", (_req, res) => {
  res.json({
    name: "Isoko Group MCP Server",
    status: "running",
    mcpEndpoint: "/mcp",
  });
});

const PORT = Number(process.env.MCP_PORT ?? 3001);

app.listen(PORT, () => {
  console.log("MCP server running 🚀");
  console.log(`http://localhost:${PORT}/mcp`);
});       