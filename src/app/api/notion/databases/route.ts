import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import type { DataSourceObjectResponse } from "@notionhq/client/build/src/api-endpoints/data-sources";

export interface NotionDatabase {
  id: string;
  title: string;
  icon: string | null;
}

function isFullDataSource(result: unknown): result is DataSourceObjectResponse {
  return (
    result !== null &&
    typeof result === "object" &&
    "object" in result &&
    (result as Record<string, unknown>).object === "data_source" &&
    "title" in result
  );
}

function extractTitle(ds: DataSourceObjectResponse): string {
  return ds.title.map((t) => t.plain_text).join("").trim();
}

function extractIcon(ds: DataSourceObjectResponse): string | null {
  const icon = ds.icon;
  if (!icon) return null;
  if (icon.type === "emoji") return icon.emoji;
  if (icon.type === "external") return icon.external.url;
  if (icon.type === "file") return icon.file.url;
  if (icon.type === "custom_emoji") return icon.custom_emoji.url;
  return null;
}

export async function GET() {
  const token = process.env.NOTION_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "NOTION_TOKEN not configured" },
      { status: 500 }
    );
  }

  const notion = new Client({ auth: token });

  try {
    const response = await notion.search({
      filter: { value: "data_source", property: "object" },
      page_size: 100,
    });

    const databases: NotionDatabase[] = response.results
      .filter(isFullDataSource)
      .map((ds) => ({
        id: ds.id,
        title: extractTitle(ds),
        icon: extractIcon(ds),
      }));

    return NextResponse.json(databases);
  } catch (error) {
    if (error !== null && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "unauthorized" || code === "restricted_resource") {
        return NextResponse.json(
          { error: "Notion authentication failed. Check your NOTION_TOKEN." },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch Notion databases" },
      { status: 500 }
    );
  }
}
