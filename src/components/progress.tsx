
"use client"
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Flame, Trophy, CheckCircle, BookOpen, Clock, BrainCircuit } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import useLocalStorage from "@/hooks/use-local-storage";
import { tutorials } from "./tutorials";

type ActivityHistory = {
  date: string;
  count: number;
}[];

type SkillLevel = "Beginner" | "Intermediate" | "Advanced";

type AiTutorCourseData = {
  tutorialData: { chapters: any[] };
  completedChapters: boolean[];
};

type AiTutorStorage = {
  [key in SkillLevel]?: AiTutorCourseData;
};

type AiTutorProgress = {
  level: SkillLevel;
  completed: number;
  total: number;
  title: string;
}

const initialChartData = [
  { day: 'Mon', questions: 0 },
  { day: 'Tue', questions: 0 },
  { day: 'Wed', questions: 0 },
  { day: 'Thu', questions: 0 },
  { day: 'Fri', questions: 0 },
  { day: 'Sat', questions: 0 },
  { day: 'Sun', questions: 0 },
];

const chartConfig = {
  questions: {
    label: "Questions",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function Progress() {
  const [solvedCount] = useLocalStorage('challengesSolved', 0);
  const [completedTutorials] = useLocalStorage<string[]>('completedTutorials', []);
  const [activityHistory] = useLocalStorage<ActivityHistory>('activityHistory', []);
  const [chartData, setChartData] = useState(initialChartData);
  const [courses] = useLocalStorage<AiTutorStorage>('aiTutor_courses', {});
  const [learnedQuestions] = useLocalStorage<string[]>('interview-questions-learned', []);
  const [totalVideoTime, setTotalVideoTime] = useState(0);

  const aiTutorProgress: AiTutorProgress[] = Object.entries(courses).map(([level, data]) => {
    const completed = data.completedChapters.filter(Boolean).length;
    const total = data.tutorialData.chapters.length;
    return {
        level: level as SkillLevel,
        completed,
        total,
        title: `${level} Course`
    }
  });


  useEffect(() => {
    const time = completedTutorials.reduce((acc, title) => {
      const tutorial = tutorials.find(t => t.title === title);
      return acc + (tutorial?.duration || 0);
    }, 0);
    setTotalVideoTime(time);
  }, [completedTutorials]);

  const progressStats = [
    { title: "Tutorials Completed", value: completedTutorials.length, icon: CheckCircle },
    { title: "Challenges Solved", value: solvedCount, icon: Trophy },
    { title: "Interview Qs Learned", value: learnedQuestions.length, icon: BrainCircuit },
    { title: "Video Time Learned", value: `${totalVideoTime} min`, icon: Clock },
    { title: "Current Streak", value: "0 days", icon: Flame },
  ];

  useEffect(() => {
    const getWeekChartData = () => {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const weekData = days.map(day => ({ day, questions: 0 }));

      const today = new Date();
      const currentDay = today.getDay(); // Sun: 0, Mon: 1, ...
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
      startOfWeek.setHours(0, 0, 0, 0);

      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        const historyEntry = activityHistory.find(h => h.date === dateString);
        if (historyEntry) {
          const dayIndex = (date.getDay() + 6) % 7; // Mon: 0, Tue: 1, ... Sun: 6
          weekData[dayIndex].questions = historyEntry.count;
        }
      }
      return weekData;
    };
    
    setChartData(getWeekChartData());
  }, [activityHistory]);


  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Your Progress</CardTitle>
        <CardDescription>
          Track your learning journey here. All data is saved in your browser.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {progressStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>AI Tutor Progress</CardTitle>
            <CardDescription>Your chapter progress in AI-generated courses.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(['Beginner', 'Intermediate', 'Advanced'] as SkillLevel[]).map(level => {
              const progress = aiTutorProgress.find(p => p.level === level);
              return (
                <Card key={level}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{level} Course</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                        {progress ? `${progress.completed} / ${progress.total}` : '0 / 0'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {progress ? 'chapters completed' : 'No course started'}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Number of practice questions solved this week.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    allowDecimals={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar dataKey="questions" fill="var(--color-questions)" radius={8} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
