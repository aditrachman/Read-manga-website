import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return NextResponse.json(
        { error: "Missing url parameter" },
        { status: 400 }
      );
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return NextResponse.json({ error: "Invalid url" }, { status: 400 });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { error: "Only http/https URLs are allowed" },
        { status: 400 }
      );
    }

    const defaultHeaders = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    };

    // Some manga CDNs block hotlinking unless Referer/Origin matches their site.
    const headerVariants = [
      defaultHeaders,
      {
        ...defaultHeaders,
        Referer: "https://komiku.id/",
        Origin: "https://komiku.id",
      },
      {
        ...defaultHeaders,
        Referer: "https://komiku.org/",
        Origin: "https://komiku.org",
      },
    ];

    let upstream = null;
    let upstreamStatus = 502;

    for (const headers of headerVariants) {
      const response = await fetch(targetUrl, {
        headers,
        cache: "no-store",
      });

      if (response.ok) {
        upstream = response;
        break;
      }

      upstreamStatus = response.status;
    }

    if (!upstream) {
      return NextResponse.json(
        { error: `Upstream error: ${upstreamStatus}` },
        { status: upstreamStatus }
      );
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await upstream.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    console.error("image-proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 }
    );
  }
}

