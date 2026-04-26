import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Inbox, BookOpen, Sparkles } from "lucide-react";
import ConciergeInbox from "./concierge/ConciergeInbox";
import ConciergeKnowledge from "./concierge/ConciergeKnowledge";
import ConciergePlayground from "./concierge/ConciergePlayground";

const AdminConcierge = () => {
  const [tab, setTab] = useState("inbox");
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight">KiKi Concierge</h2>
        <p className="text-sm text-muted-foreground">AI-консьерж для клиентских диалогов в Telegram, Instagram и Facebook.</p>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="inbox" className="gap-1.5"><Inbox className="w-4 h-4"/>Inbox</TabsTrigger>
          <TabsTrigger value="kb" className="gap-1.5"><BookOpen className="w-4 h-4"/>База знаний</TabsTrigger>
          <TabsTrigger value="playground" className="gap-1.5"><Sparkles className="w-4 h-4"/>Песочница</TabsTrigger>
        </TabsList>
        <TabsContent value="inbox" className="mt-4"><ConciergeInbox/></TabsContent>
        <TabsContent value="kb" className="mt-4"><ConciergeKnowledge/></TabsContent>
        <TabsContent value="playground" className="mt-4"><ConciergePlayground/></TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminConcierge;