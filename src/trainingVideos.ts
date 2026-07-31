export type PublishedTrainingVideo = {
  id: string;
  title: string;
  category: "呼吸训练" | "有氧运动" | "抗阻运动" | "柔韧性运动" | "中医运动";
  subtype: string;
  source: "bilibili" | "upload";
  url: string;
};

// 接口联调前的初始视频列表；正式环境由 GET /training-videos 替换。
export const initialPublishedTrainingVideos: PublishedTrainingVideo[] = [
  { id: "VIDEO-BDJ-001", title: "八段锦完整教学", category: "中医运动", subtype: "八段锦", source: "bilibili", url: "https://player.bilibili.com/player.html?bvid=BV1gT4y1m7ec&page=1&high_quality=1&danmaku=0" },
  { id: "VIDEO-BREATH-001", title: "腹式呼吸与正念呼吸跟练", category: "呼吸训练", subtype: "腹式呼吸", source: "bilibili", url: "https://player.bilibili.com/player.html?bvid=BV1Av4y1p7SL&page=1&high_quality=1&danmaku=0" },
  { id: "VIDEO-BREATH-002", title: "腹式呼吸与正念呼吸跟练", category: "呼吸训练", subtype: "正念呼吸", source: "bilibili", url: "https://player.bilibili.com/player.html?bvid=BV1Av4y1p7SL&page=1&high_quality=1&danmaku=0" }
];
