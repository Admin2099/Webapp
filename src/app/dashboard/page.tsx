
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DailyPractice } from "@/components/daily-practice"
import { Tutorials } from "@/components/tutorials"
import { Progress } from "@/components/progress"
import { Logo } from "@/components/logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AiTutor } from "@/components/ai-tutor"
import { InterviewPrep } from "@/components/interview-prep"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const userInitial = user.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
        <Logo />
        <div className="ml-auto flex items-center gap-4">
          <Avatar>
            <AvatarImage src="https://placehold.co/40x40.png" alt="Data Analyst" data-ai-hint="avatar user" />
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
           <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8 lg:p-10">
        <Tabs defaultValue="practice" className="w-full">
          <div className="flex justify-center mb-8">
            <ScrollArea className="w-full max-w-sm sm:max-w-xl md:max-w-2xl whitespace-nowrap rounded-lg">
                <TabsList className="inline-grid w-max grid-cols-5">
                    <TabsTrigger value="practice">Daily Practice</TabsTrigger>
                    <TabsTrigger value="tutor">AI Tutor</TabsTrigger>
                    <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
                    <TabsTrigger value="interview">Interview Prep</TabsTrigger>
                    <TabsTrigger value="progress">Progress</TabsTrigger>
                </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
          <TabsContent value="practice">
            <DailyPractice />
          </TabsContent>
           <TabsContent value="tutor">
            <AiTutor />
          </TabsContent>
          <TabsContent value="tutorials">
            <Tutorials />
          </TabsContent>
          <TabsContent value="interview">
            <InterviewPrep />
          </TabsContent>
          <TabsContent value="progress">
            <Progress />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
