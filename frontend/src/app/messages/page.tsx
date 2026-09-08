import { SiteHeader, SiteFooter } from "@/components/layout";
import { MessageCenter } from "@/components/message-center";

export default function MessagesPage() {
  return <><SiteHeader variant="minimal" /><main className="account-page"><MessageCenter /></main><SiteFooter /></>;
}
