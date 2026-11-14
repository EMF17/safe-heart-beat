import { createFileRoute, Link } from "@tanstack/react-router";
import { Hand, Mail, ShieldCheck, ChevronRight, Lock, Phone, Users } from "lucide-react";

const TITLE = "Pulse 平安打卡 — 免費獨居人士平安報到工具";
const DESC =
  "每 48 小時按一下「我平安」。如連續兩次沒有報到，Pulse 會以電郵通知你信任的聯絡人。免費、無需註冊、不追蹤位置。";

export const Route = createFileRoute("/zh-hk")({
  component: ZhHkPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:locale", content: "zh_HK" },
      { property: "og:url", content: "https://pulse-checkin.app/zh-hk" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://pulse-checkin.app/zh-hk" },
      { rel: "alternate", hrefLang: "zh-Hant-HK", href: "https://pulse-checkin.app/zh-hk" },
      { rel: "alternate", hrefLang: "en", href: "https://pulse-checkin.app/" },
    ],
  }),
});

const steps = [
  { icon: Mail, title: "加入一位信任的聯絡人", body: "子女、朋友、鄰居或親戚都可以。只需名字和電郵地址。" },
  { icon: Hand, title: "每 48 小時按一下", body: "按「我平安」就完成。亦可選擇每 24 或 72 小時報到一次。" },
  { icon: ShieldCheck, title: "有需要時才通知", body: "如連續兩次沒有報到，聯絡人會收到一封電郵，附上本地緊急電話（香港：999）。" },
];

const faqs = [
  { q: "Pulse 會自動報警或召救護車嗎？", a: "不會。Pulse 只會電郵通知你選擇的聯絡人，並不是緊急服務。如有緊急情況，請立即致電 999。" },
  { q: "需要註冊帳戶或下載 App 嗎？", a: "不需要。用手機或電腦瀏覽器打開即可，不用密碼、不用電話號碼。" },
  { q: "收費嗎？", a: "完全免費。" },
  { q: "我的資料安全嗎？", a: "我們不追蹤位置，也不使用 Cookie 追蹤你；網站只以不記名方式統計訪客人次。伺服器只保存聯絡人的名字和電郵，以及你最近一次報到的時間，用來在需要時發出通知。只有你選擇開啟同步碼（Sync Code）備份時，報到紀錄才會以不記名方式儲存，方便你換機時還原。" },
  { q: "長者不太懂用手機，可以嗎？", a: "可以。每次只需按一個大按鈕。子女可以先幫父母設定好，並把網頁加到手機主畫面。" },
];

function ZhHkPage() {
  return (
    <div lang="zh-Hant-HK" className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/zh-hk" className="font-display font-semibold">Pulse 平安打卡</Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">English</Link>
        </div>
      </header>
      <main>
        <section className="max-w-5xl mx-auto px-5 pt-16 pb-20 text-center">
          <span className="inline-flex rounded-full border border-border/60 bg-card/70 px-4 py-1.5 text-xs text-muted-foreground">
            免費 · 無需註冊 · 不追蹤位置
          </span>
          <h1 className="mt-6 font-display text-4xl md:text-6xl font-semibold leading-tight tracking-tight">
            獨居也不孤單，
            <span className="block text-primary">有事有人知。</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Pulse 是為獨居人士和獨居長者而設的平安報到工具。每 48 小時按一下「我平安」，如連續兩次沒有報到，我們會以電郵通知你信任的人。
          </p>
          <Link
            to="/app"
            className="mt-9 inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-medium shadow-[var(--shadow-pulse)] hover:bg-primary/90 transition"
          >
            立即免費設定 <ChevronRight className="w-4 h-4" />
          </Link>
          <p className="mt-4 text-xs text-muted-foreground">設定約需一分鐘。應用程式介面目前為英文。</p>
        </section>

        <section className="border-t border-border/50 bg-card/40">
          <div className="max-w-5xl mx-auto px-5 py-20">
            <h2 className="text-center font-display text-3xl font-semibold">三個步驟，之後就不用再擔心</h2>
            <ol className="mt-12 grid gap-5 md:grid-cols-3">
              {steps.map((s) => (
                <li key={s.title} className="rounded-3xl border border-border/60 bg-card p-6">
                  <s.icon className="w-6 h-6 text-primary" />
                  <h3 className="mt-4 font-semibold text-lg">{s.title}</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-5 py-20 grid gap-5 md:grid-cols-3">
          {[
            { icon: Users, t: "適合子女為父母設定", b: "幫父母設定好，自己做聯絡人，安心又不打擾。" },
            { icon: Lock, t: "私隱優先", b: "沒有帳戶、沒有廣告、不追蹤位置。訪客人次以不記名方式統計，不使用 Cookie。" },
            { icon: Phone, t: "附上本地緊急電話", b: "通知電郵會列出所在地的緊急電話，香港為 999。" },
          ].map((f) => (
            <div key={f.t} className="rounded-3xl border border-border/60 bg-card p-6">
              <f.icon className="w-6 h-6 text-primary" />
              <h3 className="mt-4 font-semibold">{f.t}</h3>
              <p className="mt-2 text-muted-foreground">{f.b}</p>
            </div>
          ))}
        </section>

        <section className="border-t border-border/50 bg-card/40">
          <div className="max-w-3xl mx-auto px-5 py-20">
            <h2 className="font-display text-3xl font-semibold text-center">常見問題</h2>
            <dl className="mt-10 space-y-4">
              {faqs.map((f) => (
                <div key={f.q} className="rounded-2xl border border-border/60 bg-card p-5">
                  <dt className="font-semibold">{f.q}</dt>
                  <dd className="mt-2 text-muted-foreground leading-relaxed">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>
      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        <Link to="/privacy-policy" className="hover:text-foreground">私隱政策（英文）</Link>
      </footer>
    </div>
  );
}
