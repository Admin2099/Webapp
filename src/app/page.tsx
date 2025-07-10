import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DailyPractice } from "@/components/daily-practice"
import { Tutorials } from "@/components/tutorials"
import { Progress } from "@/components/progress"
import { Logo } from "@/components/logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AiTutor } from "@/components/ai-tutor"

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
        <Logo />
        <div className="ml-auto">
          <Avatar>
            <AvatarImage src="https://placehold.co/40x40.png" alt="Data Analyst" data-ai-hint="avatar user" />
            <AvatarFallback>DA</AvatarFallback>
          </Avatar>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8 lg:p-10">
        <Tabs defaultValue="practice" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-lg mx-auto mb-8">
            <TabsTrigger value="practice">Daily Practice</TabsTrigger>
            <TabsTrigger value="tutor">AI Tutor</TabsTrigger>
            <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>
          <TabsContent value="practice">
            <DailyPractice />
          </TabsContent>
           <TabsContent value="tutor">
            <AiTutor />
          </TabsContent>
          <TabsContent value="tutorials">
            <Tutorials />
          </TabsContent>
          <TabsContent value="progress">
            <Progress />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
