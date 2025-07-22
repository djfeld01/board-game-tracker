import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

const BGG_BASE_URL = "https://api.geekdo.com/xmlapi2";

interface BGGGameDetails {
  id: string;
  name: string;
  yearPublished: string;
  image: string;
  thumbnail: string;
  description: string;
  minPlayers: string;
  maxPlayers: string;
  playingTime: string;
  minPlayTime: string;
  maxPlayTime: string;
  complexity: string;
  designers: string[];
  publishers: string[];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
  }

  try {
    // Step 1: Search for games
    const searchUrl = `${BGG_BASE_URL}/search?query=${encodeURIComponent(query)}&type=boardgame`;
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      throw new Error("Failed to search BGG");
    }

    const searchXml = await searchResponse.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
    });

    const searchData = parser.parse(searchXml);
    
    if (!searchData.items || !searchData.items.item) {
      return NextResponse.json([]);
    }

    // Ensure items.item is always an array
    const items = Array.isArray(searchData.items.item) 
      ? searchData.items.item 
      : [searchData.items.item];

    // Get first 5 results and fetch detailed info
    const gameIds = items
      .filter((item: any) => item.type === "boardgame") // eslint-disable-line @typescript-eslint/no-explicit-any
      .slice(0, 5)
      .map((item: any) => item.id); // eslint-disable-line @typescript-eslint/no-explicit-any

    if (gameIds.length === 0) {
      return NextResponse.json([]);
    }

    // Step 2: Get detailed info for games
    const detailsUrl = `${BGG_BASE_URL}/thing?id=${gameIds.join(",")}&stats=1`;
    const detailsResponse = await fetch(detailsUrl);
    
    if (!detailsResponse.ok) {
      throw new Error("Failed to get game details");
    }

    const detailsXml = await detailsResponse.text();
    const detailsData = parser.parse(detailsXml);

    if (!detailsData.items || !detailsData.items.item) {
      return NextResponse.json([]);
    }

    // Ensure items.item is always an array
    const detailItems = Array.isArray(detailsData.items.item) 
      ? detailsData.items.item 
      : [detailsData.items.item];

    // Transform data
    const games: BGGGameDetails[] = detailItems.map((item: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      // Handle primary name (can be array or object)
      let primaryName = "";
      if (Array.isArray(item.name)) {
        const primary = item.name.find((n: any) => n.type === "primary"); // eslint-disable-line @typescript-eslint/no-explicit-any
        primaryName = primary ? primary.value : item.name[0].value;
      } else if (item.name) {
        primaryName = item.name.value;
      }

      // Handle designers and publishers
      const designers = [];
      const publishers = [];

      if (item.link) {
        const links = Array.isArray(item.link) ? item.link : [item.link];
        
        for (const link of links) {
          if (link.type === "boardgamedesigner") {
            designers.push(link.value);
          } else if (link.type === "boardgamepublisher") {
            publishers.push(link.value);
          }
        }
      }

      // Get complexity (average rating)
      let complexity = "";
      if (item.statistics?.ratings?.averageweight?.value) {
        complexity = parseFloat(item.statistics.ratings.averageweight.value).toFixed(1);
      }

      return {
        id: item.id,
        name: primaryName,
        yearPublished: item.yearpublished?.value || "",
        image: item.image || "",
        thumbnail: item.thumbnail || "",
        description: item.description || "",
        minPlayers: item.minplayers?.value || "",
        maxPlayers: item.maxplayers?.value || "",
        playingTime: item.playingtime?.value || "",
        minPlayTime: item.minplaytime?.value || "",
        maxPlayTime: item.maxplaytime?.value || "",
        complexity,
        designers,
        publishers,
      };
    });

    return NextResponse.json(games);
  } catch (error) {
    console.error("BGG API error:", error);
    return NextResponse.json(
      { error: "Failed to search BoardGameGeek" },
      { status: 500 }
    );
  }
}
