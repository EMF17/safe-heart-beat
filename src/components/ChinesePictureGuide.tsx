import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import openPicture from "@/assets/guide/open-pulse.png.asset.json";
import checkInPicture from "@/assets/guide/check-in.png.asset.json";
import confirmationPicture from "@/assets/guide/confirmation.png.asset.json";

const pictures = [
  {
    title: "打開 Pulse",
    body: "用手機瀏覽器打開 pulse-checkin.app/zh-hk，按「立即免費設定」。已設定好？直接打開 pulse-checkin.app/app。",
    image: openPicture,
    alt: "Pulse 中文首頁：下方有綠色「立即免費設定」按鈕。",
    crop: true,
    note: "第一次使用時，可請信任的家人或朋友陪你加入聯絡人的名字和電郵。",
  },
  {
    title: "按一下「我平安」",
    body: "在 Home（主頁），按一下綠色大圓形按鈕「I’m OK」，意思是「我平安」。",
    image: checkInPicture,
    alt: "Pulse 報到畫面：中央有一個綠色大圓形 I’m OK 按鈕。",
    note: "完成首次設定後，每次報到只需按一下這個按鈕。",
  },
  {
    title: "看看是否已報到",
    body: "看到「Check-in recorded」（已記錄報到）和時間，就完成了。",
    image: confirmationPicture,
    alt: "按下按鈕後，畫面顯示 Check-in recorded、報到時間，以及 Next check-in 的下次報到時間。",
    note: "「Next check-in」是下次報到時間。圖片日期只作示範，請以你手機顯示的時間為準。",
  },
];

export function ChinesePictureGuide() {
  return (
    <section id="picture-guide" aria-labelledby="picture-guide-title" className="scroll-mt-20 border-t border-border bg-secondary/30" lang="zh-Hant-HK">
      <div className="mx-auto max-w-5xl px-5 py-12 md:py-16">
        <h2 id="picture-guide-title" className="text-center font-display text-3xl font-semibold tracking-normal">三張圖，學會平安報到</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-lg leading-relaxed text-muted-foreground">跟着圖片一步一步做。以下是實際手機畫面；報到頁目前顯示英文，中文說明在每張圖上方。</p>
        <ol className="mt-10 grid items-start gap-10 md:grid-cols-3 md:gap-6">
          {pictures.map((picture, index) => (
            <li key={picture.title} className="mx-auto w-full max-w-sm">
              <figure>
                <figcaption className="md:min-h-44">
                  <h3 className="flex items-center gap-3 text-xl font-semibold tracking-normal">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground" aria-hidden="true">{index + 1}</span>
                    <span>{picture.title}</span>
                  </h3>
                  <p className="mt-3 break-words text-lg leading-relaxed">{picture.body}</p>
                </figcaption>
                <img src={picture.image.url} alt={picture.alt} width={780} height={1440} loading="lazy" className={`mt-5 block w-full rounded-lg border border-border ${"crop" in picture ? "aspect-[13/20] object-cover object-top" : "aspect-[13/24] object-contain"} shadow-[var(--shadow-soft)]`} />
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">{picture.note}</p>
              </figure>
            </li>
          ))}
        </ol>
        <div className="mt-10 text-center">
          <Button asChild size="lg" className="h-12 text-base">
            <Link to="/app">打開 Pulse <ArrowRight aria-hidden="true" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}