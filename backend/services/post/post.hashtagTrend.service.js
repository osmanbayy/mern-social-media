import Post from "../../models/post_model.js";
import { ok, fail } from "../../lib/httpResult.js";

const DEFAULT_LIMIT = 10;
const DEFAULT_SINCE_DAYS = 7;
const MAX_LIMIT = 15;

/**
 * Son N gün içindeki gönderilerde geçen etiketleri sayıya göre döndürür (basit gündem).
 */
export async function getTrendingHashtags({ limit: limitRaw, sinceDays: sinceDaysRaw }) {
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(String(limitRaw ?? DEFAULT_LIMIT), 10) || DEFAULT_LIMIT)
  );
  const sinceDays = Math.min(
    30,
    Math.max(1, parseInt(String(sinceDaysRaw ?? DEFAULT_SINCE_DAYS), 10) || DEFAULT_SINCE_DAYS)
  );

  const since = new Date();
  since.setDate(since.getDate() - sinceDays);

  try {
    const trends = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: since },
          hashtags: { $exists: true, $type: "array", $ne: [] },
        },
      },
      { $unwind: "$hashtags" },
      { $group: { _id: "$hashtags", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          tag: "$_id",
          count: 1,
        },
      },
    ]);

    return ok(200, { trends, sinceDays, limit });
  } catch (e) {
    console.error("hashtagTrend:", e.message);
    return fail(503, "Gündem yüklenemedi.");
  }
}
