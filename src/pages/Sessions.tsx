import { ResizablePanelGroup, ResizablePanel } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import VoiceInteraction from "@/components/sessions/VoiceInteraction";
import SessionNotes from "@/components/sessions/SessionNotes";
import PastSessions from "@/components/sessions/PastSessions";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Sessions = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-4rem-16rem)]">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={20} minSize={15}>
              <ScrollArea className="h-full">
                <PastSessions />
              </ScrollArea>
            </ResizablePanel>
            <ResizablePanel defaultSize={40}>
              <VoiceInteraction />
            </ResizablePanel>
            <ResizablePanel defaultSize={40}>
              <SessionNotes />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Sessions;