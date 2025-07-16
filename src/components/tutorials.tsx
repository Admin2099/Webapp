
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress as ProgressBar } from "@/components/ui/progress";
import Image from "next/image";
import { Button } from "./ui/button";
import { Youtube, CheckCircle } from "lucide-react";
import useLocalStorage from "@/hooks/use-local-storage";


export const tutorials = [
  {
    title: "Introduction to SQL",
    description: "Master the basics of SQL for data querying and manipulation.",
    category: "SQL",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "database query",
    videoUrl: "https://www.youtube.com/watch?v=HXV3zeQKqGY",
    duration: 30, // in minutes
  },
  {
    title: "Python for Data Analysis",
    description: "Learn how to use Pandas, NumPy, and Matplotlib for data science.",
    category: "Python",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "python code",
    videoUrl: "https://www.youtube.com/watch?v=r-uOLxNrNk8",
    duration: 45,
  },
  {
    title: "Advanced Power BI",
    description: "Create stunning interactive dashboards and reports.",
    category: "Power BI",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "dashboard chart",
    videoUrl: "https://www.youtube.com/watch?v=3u7kQp-i564",
    duration: 60,
  },
  {
    title: "Excel for Beginners",
    description: "Get started with Excel from scratch. Learn formulas, charts, and more.",
    category: "Excel",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "spreadsheet software",
    videoUrl: "https://www.youtube.com/watch?v=Vl0H-qTclOg",
    duration: 25,
  },
    {
    title: "Statistics for Data Science",
    description: "Understand the fundamental concepts of statistics for data analysis.",
    category: "Statistics",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "statistics graph",
    videoUrl: "https://www.youtube.com/watch?v=xxpc-3sLdes",
    duration: 50,
  },
  {
    title: "Tableau for Beginners",
    description: "Learn to build powerful data visualizations and dashboards with Tableau.",
    category: "Tableau",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "tableau dashboard",
    videoUrl: "https://www.youtube.com/watch?v=aHnwS_Mxx_4",
    duration: 35,
  },
  {
    title: "SQL Joins and Subqueries",
    description: "Dive deeper into complex SQL queries with multiple tables.",
    category: "SQL",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "database schema",
    videoUrl: "https://www.youtube.com/watch?v=2HVMi26L54g",
    duration: 40,
  },
  {
    title: "Data Visualization in Python",
    description: "Tell stories with your data using Seaborn and Plotly.",
    category: "Python",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "data graph",
    videoUrl: "https://www.youtube.com/watch?v=a9UrKTVEeZA",
    duration: 55,
  },
];

export function Tutorials() {
  const [completedTutorials, setCompletedTutorials] = useLocalStorage<string[]>('completedTutorials', []);

  const handleToggleComplete = (title: string) => {
    setCompletedTutorials(prev => {
      const isCompleted = prev.includes(title);
      if (isCompleted) {
        return prev.filter(item => item !== title);
      } else {
        return [...prev, title];
      }
    });
  };

  return (
    <Card className="max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle>Learning Paths</CardTitle>
        <CardDescription>
          Follow our structured tutorials to master data analysis technologies.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tutorials.map((tutorial) => {
          const isCompleted = completedTutorials.includes(tutorial.title);
          const progress = isCompleted ? 100 : 0;

          return (
            <Card
              key={tutorial.title}
              className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="relative h-40 w-full">
                <Image
                  src={tutorial.image}
                  alt={tutorial.title}
                  fill
                  className="object-cover"
                  data-ai-hint={tutorial.dataAiHint}
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg leading-tight">
                    {tutorial.title}
                  </CardTitle>
                  <Badge variant="secondary">{tutorial.category}</Badge>
                </div>
                <CardDescription className="pt-2">
                  {tutorial.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow"></CardContent>
              <CardFooter className="flex-col items-start gap-4">
                <div className="w-full">
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <ProgressBar value={progress} aria-label={`${progress}% complete`} />
                </div>
                <div className="w-full flex flex-col sm:flex-row gap-2">
                  <Button asChild className="w-full">
                    <a href={tutorial.videoUrl} target="_blank" rel="noopener noreferrer">
                      <Youtube />
                      Watch
                    </a>
                  </Button>
                  <Button
                    variant={isCompleted ? "secondary" : "default"}
                    onClick={() => handleToggleComplete(tutorial.title)}
                    className="w-full"
                  >
                    <CheckCircle />
                    {isCompleted ? "Completed" : "Mark Complete"}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </CardContent>
    </Card>
  );
}
