const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');

function createPrismaClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error('缺少 TURSO_DATABASE_URL 或 TURSO_AUTH_TOKEN，請檢查 .env');
  }

  const libsql = createClient({ url, authToken });
  const adapter = new PrismaLibSQL(libsql);
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

const DEEP_TALK = {
  1: [
    '關於童年，你最難忘的記憶是什麼？',
    '如果能夠回到某個特定年齡，你會想回到幾歲？',
    '你覺得自己比較像外向還是內向的人？有沒有具體的例子？',
    '工作或學習之餘，你最常做的休閒活動是什麼？',
    '邀請大家說說對你的第一印象？（由所有玩家回應抽卡人）',
    '小時候最喜歡的一部卡通或動畫是什麼？',
    '分享一個最近讓你覺得好笑或開心的時刻。',
  ],
  2: [
    '你認為一段理想的關係，需要具備哪些特質？為什麼？',
    '什麼樣的行為最令你憤怒？你都如何表達憤怒？',
    '什麼事是你知道要改變，但總是告訴自己還有時間？',
    '你最近一次對父母撒謊是什麼時候？是什麼事件？',
    '大家認為跟你有哪些相似之處呢？特質、個性或是談吐。（由所有玩家回應抽卡人）',
    '對一位玩家說出你心中的感謝。記得給一個擁抱。',
    '大家會如何向陌生人介紹我呢？（由所有玩家回應抽卡人）',
    '你會如何表達關心或在乎？身邊的人都能收到嗎？',
    '描述一次你克服恐懼的經歷，當時發生了什麼？',
    '最近有沒有誰說過一句話，或做過一件事，讓你覺得「他真的懂我」？',
    '分享一次你覺得自己被照亮的時刻（精確地說出你的特質與優點）。',
    '你認為自己在哪些方面成長最多？它是否來自什麼關鍵事件？',
    '有沒有哪件事當時讓你感到心碎，但現在回想起來已經可以微笑面對？',
    '你會如何形容在家庭中你所扮演的角色？家庭成員也是這樣看待你嗎？',
    '你覺得自己身上最值得驕傲的特質是什麼？',
    '有沒有哪一次你覺得自己的感受與需求被重要的人忽視？當時你的反應是什麼？',
    '分享一個現在生活中最喜歡的部分？它滿足了你內心什麼樣的需求？',
    '嘉許在場某一人的行為、特質或是共同經歷的回憶。他對你產生了什麼影響？',
    '如果不會被嘲笑或反對，你最想完成什麼事情？',
    '最近有沒有什麼時刻紅了眼眶？',
  ],
  3: [
    '如果可以重塑與某人的關係，你最希望改變哪個部分？為什麼？',
    '分享一個你正在面對的人生難題，阻礙你的是什麼？你認為自己會怎麼突破？',
    '你曾經完成過的最有成就感的一件事是什麼？你是如何完成的？',
    '最近一次讓你感到內疚的事情是什麼？',
    '在人際關係中你最想被珍惜的是什麼？你也珍惜跟你有相同特點的人嗎？',
    '分享你與父母之間印象最深刻的一個回憶？',
    '分享生命中最讓你感到幸福的時刻？是什麼讓它如此特別？',
    '分享一個你印象深刻的失敗經歷，描述當初的感受，以及你現在如何看待它？',
    '分享一個你一直想做但至今都未完成的事情？如果選擇去完成它，該克服的挑戰是什麼？',
    '如果現在有機會對一個人說出你的歉意或感謝，你會選誰？',
    '如果可以回到過去刪除某一個記憶，那會是什麼樣的事件？重來一次的話，你會怎麼做？',
    '你曾經做過最勇敢的決定是什麼？分享一下當時的心境為何？',
    '你認為過去一年裡，你最大的成長是什麼？',
    '在家庭關係中你最想改變的是什麼？',
    '面對壓力與挑戰時，你如何給予自己力量與信心？',
    '你在關係中最自豪的特質是什麼？你是如何發現它的？',
  ],
};

const ICEBREAKERS = [
  '抽到卡的人，指定兩位玩家扮最醜的鬼臉！並且合影一張做記錄。',
  '所有玩家一起合照一張！並上傳打卡！',
  '所有玩家用十秒唱一首最喜歡的歌。',
  '所有玩家分享一句深刻影響你的話，並逐一分享！',
  '打開手機，挑一張照片並說說它的故事。',
  '所有玩家分享平常你都是如何表達「愛」？',
  '所有玩家分享你小時候的樣子給大家看！',
  '所有玩家分享兩件今日想感恩的事情。',
  '所有玩家想出三個代表自己的標籤，並順時針逐一分享選擇的原因！',
  '你認為你的形象是什麼？做過什麼與你形象不符的事？（所有玩家回答）',
];

async function main() {
  await prisma.card.deleteMany();
  await prisma.category.deleteMany();

  const deepTalk = await prisma.category.create({
    data: { name: '深度對話' },
  });

  const icebreaker = await prisma.category.create({
    data: { name: '破冰' },
  });

  const deepTalkCards = Object.entries(DEEP_TALK).flatMap(([stars, contents]) =>
    contents.map((content) => ({
      content,
      stars: Number(stars),
      categoryId: deepTalk.id,
    })),
  );

  const icebreakerCards = ICEBREAKERS.map((content) => ({
    content,
    stars: 0,
    categoryId: icebreaker.id,
  }));

  const result = await prisma.card.createMany({
    data: [...deepTalkCards, ...icebreakerCards],
  });

  console.log(
    `Seed complete：${result.count} 張卡片（深度對話 ${deepTalkCards.length}、破冰 ${icebreakerCards.length}）`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
