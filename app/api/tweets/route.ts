import { NextResponse } from "next/server";

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const TWITTER_HANDLE = "piotrek_nowy";

export const revalidate = 300; // ISR: revalidate every 5 minutes

type TwitterUser = {
  id: string;
  name: string;
  username: string;
  profile_image_url: string;
};

type TwitterTweet = {
  id: string;
  text: string;
  created_at: string;
  public_metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
    bookmark_count: number;
    impression_count: number;
  };
};

type TwitterApiResponse = {
  data?: TwitterTweet[];
  includes?: { users?: TwitterUser[] };
  errors?: Array<{ message: string }>;
};

export async function GET() {
  if (!TWITTER_BEARER_TOKEN) {
    return NextResponse.json(
      { error: "Twitter bearer token not configured" },
      { status: 500 }
    );
  }

  try {
    const userRes = await fetch(
      `https://api.twitter.com/2/users/by/username/${TWITTER_HANDLE}?user.fields=profile_image_url`,
      {
        headers: { Authorization: `Bearer ${TWITTER_BEARER_TOKEN}` },
        next: { revalidate: 300 },
      }
    );

    if (!userRes.ok) {
      const errorBody = await userRes.text();
      console.error("Twitter user lookup failed:", userRes.status, errorBody);
      return NextResponse.json(
        { error: "Failed to fetch user info" },
        { status: userRes.status }
      );
    }

    const userData = await userRes.json();
    const userId = userData.data?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const tweetsRes = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?` +
        new URLSearchParams({
          max_results: "3",
          "tweet.fields": "created_at,public_metrics",
          "user.fields": "name,username,profile_image_url",
          expansions: "author_id",
          exclude: "retweets,replies",
        }),
      {
        headers: { Authorization: `Bearer ${TWITTER_BEARER_TOKEN}` },
        next: { revalidate: 300 },
      }
    );

    if (!tweetsRes.ok) {
      const errorBody = await tweetsRes.text();
      console.error("Twitter tweets fetch failed:", tweetsRes.status, errorBody);
      return NextResponse.json(
        { error: "Failed to fetch tweets" },
        { status: tweetsRes.status }
      );
    }

    const tweetsData: TwitterApiResponse = await tweetsRes.json();

    if (tweetsData.errors) {
      console.error("Twitter API errors:", tweetsData.errors);
      return NextResponse.json(
        { error: tweetsData.errors[0]?.message ?? "Unknown error" },
        { status: 502 }
      );
    }

    const user = tweetsData.includes?.users?.[0] ?? userData.data;
    const tweets = (tweetsData.data ?? []).map((tweet) => ({
      id: tweet.id,
      text: tweet.text,
      created_at: tweet.created_at,
      metrics: tweet.public_metrics,
      url: `https://x.com/${TWITTER_HANDLE}/status/${tweet.id}`,
    }));

    return NextResponse.json(
      {
        user: {
          name: user.name,
          username: user.username,
          profile_image_url: user.profile_image_url,
        },
        tweets,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (err) {
    console.error("Twitter API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
