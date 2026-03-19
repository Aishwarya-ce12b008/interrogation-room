import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// ============================================================================
// Types
// ============================================================================

export interface McpServerConfig {
  transport: "stdio";
  command: string;
  args: string[];
  env?: Record<string, string>;
}

interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  serverName: string;
}

interface ConnectedServer {
  client: Client;
  tools: McpTool[];
  serverName: string;
}

// ============================================================================
// Tool name namespacing — MCP tools get prefixed so we can route calls back
// Format: mcp__{serverName}__{toolName}
// ============================================================================

function namespaceTool(serverName: string, toolName: string): string {
  return `mcp__${serverName}__${toolName}`;
}

function parseNamespacedTool(name: string): { serverName: string; toolName: string } | null {
  if (!name.startsWith("mcp__")) return null;
  const rest = name.slice(5);
  const sep = rest.indexOf("__");
  if (sep < 0) return null;
  return { serverName: rest.slice(0, sep), toolName: rest.slice(sep + 2) };
}

// Convert an MCP tool schema to OpenAI function-calling format
function mcpToolToOpenAI(tool: McpTool) {
  return {
    type: "function" as const,
    function: {
      name: namespaceTool(tool.serverName, tool.name),
      description: tool.description || tool.name,
      parameters: tool.inputSchema,
    },
  };
}

// ============================================================================
// McpClientManager — connects to servers, discovers tools, routes calls
// ============================================================================

export class McpClientManager {
  private servers = new Map<string, ConnectedServer>();
  private connecting = new Map<string, Promise<ConnectedServer | null>>();

  async connectServer(name: string, config: McpServerConfig): Promise<void> {
    if (this.servers.has(name)) return;
    if (this.connecting.has(name)) {
      await this.connecting.get(name);
      return;
    }

    const promise = this._doConnect(name, config);
    this.connecting.set(name, promise);
    try {
      await promise;
    } finally {
      this.connecting.delete(name);
    }
  }

  private async _doConnect(name: string, config: McpServerConfig): Promise<ConnectedServer | null> {
    try {
      const transport = new StdioClientTransport({
        command: config.command,
        args: config.args,
        env: { ...process.env, ...(config.env || {}) } as Record<string, string>,
      });

      const client = new Client(
        { name: "goodbadcop-chat", version: "1.0.0" },
        { capabilities: {} },
      );

      await client.connect(transport);
      const { tools: rawTools } = await client.listTools();

      const tools: McpTool[] = (rawTools || []).map((t) => ({
        name: t.name,
        description: t.description || t.name,
        inputSchema: t.inputSchema as Record<string, unknown>,
        serverName: name,
      }));

      const connected: ConnectedServer = { client, tools, serverName: name };
      this.servers.set(name, connected);
      console.log(`MCP: Connected to "${name}" — ${tools.length} tool(s): ${tools.map(t => t.name).join(", ")}`);
      return connected;
    } catch (error) {
      console.error(`MCP: Failed to connect to "${name}":`, error);
      return null;
    }
  }

  async connectAll(configs: Record<string, McpServerConfig>): Promise<void> {
    await Promise.all(
      Object.entries(configs).map(([name, config]) => this.connectServer(name, config)),
    );
  }

  // All MCP tools in OpenAI function-calling format
  getToolsAsOpenAI() {
    const tools: ReturnType<typeof mcpToolToOpenAI>[] = [];
    for (const server of this.servers.values()) {
      for (const tool of server.tools) {
        tools.push(mcpToolToOpenAI(tool));
      }
    }
    return tools;
  }

  // Friendly label for a namespaced tool name (uses the MCP tool description)
  getToolLabel(namespacedName: string): string | null {
    const parsed = parseNamespacedTool(namespacedName);
    if (!parsed) return null;
    const server = this.servers.get(parsed.serverName);
    if (!server) return null;
    const tool = server.tools.find((t) => t.name === parsed.toolName);
    return tool?.description || parsed.toolName;
  }

  isMcpTool(toolName: string): boolean {
    return parseNamespacedTool(toolName) !== null;
  }

  async callTool(namespacedName: string, args: Record<string, unknown>): Promise<string> {
    const parsed = parseNamespacedTool(namespacedName);
    if (!parsed) throw new Error(`Not an MCP tool: ${namespacedName}`);

    const server = this.servers.get(parsed.serverName);
    if (!server) throw new Error(`MCP server not connected: ${parsed.serverName}`);

    const result = await server.client.callTool({
      name: parsed.toolName,
      arguments: args,
    });

    // MCP returns content as an array of typed blocks
    const parts = (result.content as Array<{ type: string; text?: string }>)
      .filter((c) => c.type === "text" && c.text)
      .map((c) => c.text!);

    return parts.join("\n") || JSON.stringify(result.content);
  }

  async disconnectAll(): Promise<void> {
    const closeOps = Array.from(this.servers.entries()).map(async ([name, server]) => {
      try {
        await server.client.close();
      } catch (e) {
        console.error(`MCP: Error disconnecting "${name}":`, e);
      }
    });
    await Promise.all(closeOps);
    this.servers.clear();
  }

  get connectedCount(): number {
    return this.servers.size;
  }

  get toolCount(): number {
    let n = 0;
    for (const s of this.servers.values()) n += s.tools.length;
    return n;
  }
}

// Singleton — survives across requests in long-lived Node.js (local dev).
// In serverless (Vercel), each cold start creates a new instance.
let _instance: McpClientManager | null = null;

export function getMcpClientManager(): McpClientManager {
  if (!_instance) {
    _instance = new McpClientManager();
  }
  return _instance;
}
